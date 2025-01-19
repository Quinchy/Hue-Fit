import prisma from "@/utils/helpers";

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

    // Update the order status
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

    // If the order is completed, record the payment
    if (upperStatus === "COMPLETED") {
      // Calculate the total amount from order items
      const amount = updatedOrder.OrderItems.reduce((sum, item) => {
        const price = Number(item.ProductVariant.price || 0);
        return sum + price * (item.quantity || 0);
      }, 0);

      // Record payment using the Payment model
      await prisma.payment.create({
        data: {
          orderId: updatedOrder.id,
          amount,
        },
      });
    }

    return res.status(200).json({ message: "Order status updated", order: updatedOrder });
  } catch (error) {
    console.error("Error updating order:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
