// pages/api/orders/update-order.js
import prisma from "@/utils/helpers"; // Ensure this imports your Prisma client instance

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderNo, status } = req.body;
  if (!orderNo || !status) {
    return res.status(400).json({ error: "Order number and status are required." });
  }

  try {
    // Uppercase the status for consistency
    const upperStatus = status.toUpperCase();

    // Update the order status and include related Shop (with DeliveryFee) and OrderItems
    const updatedOrder = await prisma.order.update({
      where: { orderNo },
      data: { status: upperStatus },
      include: {
        User: true,
        OrderItems: {
          include: {
            ProductVariant: true,
          },
        },
        Shop: {
          include: {
            DeliveryFee: true,
          },
        },
      },
    });

    // Create a notification for the user about the status update
    await prisma.notification.create({
      data: {
        title: "Order Status Updated",
        message: `Your order ${orderNo} status changed to ${upperStatus}.`,
        userId: updatedOrder.userId,
        shopId: updatedOrder.shopId,
      },
    });

    // If the order is completed, record the payment.
    // Here, apply the delivery fee (if available) to the order total.
    if (upperStatus === "COMPLETED") {
      // Calculate the base amount from order items
      const baseAmount = updatedOrder.OrderItems.reduce((sum, item) => {
        const price = Number(item.ProductVariant?.price || 0);
        return sum + price * (item.quantity || 0);
      }, 0);

      // Calculate the delivery fee from the shop's global fee (if exists)
      let deliveryFee = 0;
      if (updatedOrder.Shop?.DeliveryFee && updatedOrder.Shop.DeliveryFee.length > 0) {
        const feeRecord = updatedOrder.Shop.DeliveryFee[0];
        if (feeRecord.feeType.toUpperCase() === "FIXED") {
          deliveryFee = Number(feeRecord.feeAmount);
        } else if (feeRecord.feeType.toUpperCase() === "PERCENTAGE") {
          deliveryFee = baseAmount * (Number(feeRecord.feeAmount) / 100);
        }
      }

      const totalPayment = baseAmount + deliveryFee;

      // Record payment using the Payment model including shopId.
      await prisma.payment.create({
        data: {
          orderId: updatedOrder.id,
          amount: totalPayment,
          shopId: updatedOrder.shopId,
        },
      });
    }

    return res.status(200).json({ message: "Order status updated", order: updatedOrder });
  } catch (error) {
    console.error("Error updating order:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
