import prisma from "@/utils/helpers";

export default async function handler(req, res) {
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
      where: { id: orderId },
      include: { OrderItems: true },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (order.status === "PENDING") {
      // For each OrderItem, update inventory:
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

      // Update the Order status to CANCELLED.
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });

      // Create notification for customer.
      await prisma.notification.create({
        data: {
          title: "Order Cancellation",
          message: `Your order: ${order.orderNo} has been cancelled.`,
          userId: order.userId,
          shopId: order.shopId,
          read: false,
        },
      });

      // Create notification for vendor.
      await prisma.notification.create({
        data: {
          title: "Order Cancelled",
          message: `The order: ${order.orderNo} has been cancelled by the customer.`,
          userId: null,
          shopId: order.shopId,
          read: false,
        },
      });

      return res
        .status(200)
        .json({ message: "Order cancelled successfully." });
    } else if (order.status === "PROCESSING") {
      // For Processing orders, mark the cancellation request.
      await prisma.order.update({
        where: { id: orderId },
        data: {
          askingForCancel: true,
          cancelReason: cancellationMessage,
        },
      });

      // Create notification for customer.
      await prisma.notification.create({
        data: {
          title: "Order Cancellation Request",
          message: `Your order cancellation for ${order.orderNo} has been send.`,
          userId: order.userId,
          shopId: order.shopId,
          read: false,
        },
      });

      // Create notification for vendor.
      await prisma.notification.create({
        data: {
          title: "Request for Order Cancellation",
          message: `A cancellation request was made for ${order.orderNo}.`,
          userId: null,
          shopId: order.shopId,
          read: false,
        },
      });

      return res.status(200).json({
        message: "Cancellation request submitted successfully.",
      });
    } else {
      return res.status(400).json({ message: "Order cannot be cancelled." });
    }
  } catch (error) {
    console.error("Error cancelling order:", error);
    return res.status(500).json({ message: "Internal server error." });
  } finally {
    await prisma.$disconnect();
  }
}
