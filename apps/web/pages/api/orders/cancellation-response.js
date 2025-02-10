// pages/api/orders/cancellation-response.js
import prisma from "@/utils/helpers";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ message: "Method not allowed. Use POST instead." });
  }

  const { orderId, action, rejectionReason } = req.body;

  if (!orderId || !action) {
    return res
      .status(400)
      .json({ message: "orderId and action are required." });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { OrderItems: true },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (action === "REJECT") {
      await prisma.notification.create({
        data: {
          title: "Order Cancellation Rejected",
          message: `The shop rejected your request for cancellation with a reason: ${rejectionReason}.`,
          userId: order.userId,
          shopId: order.shopId,
          read: false,
        },
      });
      return res
        .status(200)
        .json({ message: "Cancellation rejection processed." });
    } 
    else if (action === "ACCEPT") {
      for (const orderItem of order.OrderItems) {
        await prisma.productVariantSize.update({
          where: { id: orderItem.productVariantSizeId },
          data: {
            quantity: { increment: orderItem.quantity },
          },
        });
        await prisma.productVariant.update({
          where: { id: orderItem.productVariantId },
          data: {
            totalQuantity: { increment: orderItem.quantity },
          },
        });
        await prisma.product.update({
          where: { id: orderItem.productId },
          data: {
            totalQuantity: { increment: orderItem.quantity },
          },
        });
      }
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          askingForCancel: false,
          cancelReason: null,
        },
      });
      await prisma.notification.create({
        data: {
          title: "Order Cancellation Accepted",
          message: `Your order: ${order.orderNo} has been accepted.`,
          userId: order.userId,
          shopId: order.shopId,
          read: false,
        },
      });
      await prisma.notification.create({
        data: {
          title: "Order Cancellation Request Accepted",
          message: `The order: ${order.orderNo} has been accepted successfully.`,
          userId: null,
          shopId: order.shopId,
          read: false,
        },
      });
      return res
        .status(200)
        .json({ message: "Order cancellation processed successfully." });
    } else {
      return res.status(400).json({ message: "Invalid action." });
    }
  } catch (error) {
    console.error("Error processing cancellation response:", error);
    return res.status(500).json({ message: "Internal server error." });
  } finally {
    await prisma.$disconnect();
  }
}
