import prisma from "@/utils/helpers";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:8100");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ message: "Method not allowed. Use POST instead." });
  }

  const { orderId, askingForCancellation, cancellationMessage } = req.body;
  if (!orderId) {
    return res.status(400).json({ message: "orderId is required." });
  }

  try {
    // Retrieve the order along with its OrderItems.
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: { OrderItems: true },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (order.status === "PENDING") {
      // Restock each OrderItem
      for (const item of order.OrderItems) {
        await prisma.productVariantSize.update({
          where: { id: item.productVariantSizeId },
          data: { quantity: { increment: item.quantity } },
        });
        await prisma.productVariant.update({
          where: { id: item.productVariantId },
          data: { totalQuantity: { increment: item.quantity } },
        });
        await prisma.product.update({
          where: { id: item.productId },
          data: { totalQuantity: { increment: item.quantity } },
        });
      }

      // Cancel the order
      await prisma.order.update({
        where: { id: Number(orderId) },
        data: { status: "CANCELLED" },
      });

      // Notify customer
      await prisma.notification.create({
        data: {
          title: "Order Cancellation",
          message: `Your order ${order.orderNo} has been cancelled.`,
          userId: order.userId,
          shopId: order.shopId,
          read: false,
        },
      });

      // Notify vendor
      await prisma.notification.create({
        data: {
          title: "Order Cancelled",
          message: `Order ${order.orderNo} was cancelled by the customer.`,
          userId: null,
          shopId: order.shopId,
          read: false,
        },
      });

      return res.status(200).json({ message: "Order cancelled successfully." });
    }

    if (order.status === "PROCESSING") {
      // Mark cancellation request
      await prisma.order.update({
        where: { id: Number(orderId) },
        data: {
          askingForCancel: true,
          cancelReason: cancellationMessage ?? "",
        },
      });

      // Notify customer
      await prisma.notification.create({
        data: {
          title: "Order Cancellation Request",
          message: `Your cancellation request for ${order.orderNo} has been submitted.`,
          userId: order.userId,
          shopId: order.shopId,
          read: false,
        },
      });

      // Notify vendor
      await prisma.notification.create({
        data: {
          title: "Request for Order Cancellation",
          message: `A cancellation request was made for ${order.orderNo}.`,
          userId: null,
          shopId: order.shopId,
          read: false,
        },
      });

      return res
        .status(200)
        .json({ message: "Cancellation request submitted successfully." });
    }

    return res.status(400).json({ message: "Order cannot be cancelled." });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return res.status(500).json({ message: "Internal server error." });
  } finally {
    await prisma.$disconnect();
  }
}
