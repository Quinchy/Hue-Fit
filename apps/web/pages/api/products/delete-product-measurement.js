// File: /api/products/delete-product-measurement.js
import prisma from "@/utils/helpers";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No measurement IDs provided" });
    }

    await prisma.productMeasurement.deleteMany({
      where: { id: { in: ids } },
    });

    return res
      .status(200)
      .json({ message: "Product measurements deleted successfully" });
  } catch (error) {
    console.error("Error deleting product measurements:", error);
    return res
      .status(500)
      .json({ error: "Error deleting product measurements" });
  }
}
