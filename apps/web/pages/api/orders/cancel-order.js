// pages/api/orders/cancel-order.js
import prisma from "@/utils/helpers";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ message: "Method not allowed. Use POST instead." });
  }

  const { orderId, reason } = req.body;

  if (!orderId || !reason) {
    return res
      .status(400)
      .json({ message: "orderId and reason are required." });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { OrderItems: true },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

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
      data: { status: "CANCELLED" },
    });

    await prisma.notification.create({
      data: {
        title: "Order Cancelled by Shop",
        message: `Your order: ${order.orderNo} has been accepted. Reason: ${reason}`,
        userId: order.userId,
        shopId: order.shopId,
        read: false,
      },
    });

    await prisma.notification.create({
      data: {
        title: "Order Cancellation Processed",
        message: `The order: ${order.orderNo} has been cancelled successfully.`,
        userId: null,
        shopId: order.shopId,
        read: false,
      },
    });

    return res
      .status(200)
      .json({ message: "Order cancellation processed successfully." });
  } catch (error) {
    console.error("Error processing order cancellation:", error);
    return res.status(500).json({ message: "Internal server error." });
  } finally {
    await prisma.$disconnect();
  }
}
