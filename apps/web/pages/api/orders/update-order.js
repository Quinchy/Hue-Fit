// pages/api/orders/update-order.js
import prisma from "@/utils/helpers"; // Import Prisma client

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderNo, status } = req.body;
  
  if (!orderNo || !status) {
    return res.status(400).json({ error: "Order number and status are required" });
  }

  if (!["PROCESSING", "PREPARING", "PACKAGING", "DELIVERING"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    // Update the order status
    const updatedOrder = await prisma.orders.update({
      where: { orderNo: String(orderNo) },
      data: { status },
    });

    // Add new entry to the OrderHistories table
    await prisma.orderHistories.create({
      data: {
        orderId: updatedOrder.id,
        status,
      },
    });

    res.status(200).json({ message: "Order status updated successfully" });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "An error occurred while updating the order status" });
  }
}
