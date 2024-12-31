// pages/api/maintenance/get-items-total.js
import prisma, { getSessionShopId } from "@/utils/helpers";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  try {
    const shopId = await getSessionShopId(req, res);
    if (!shopId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const types = await prisma.type.count({ where: { shopId } });
    const categories = await prisma.category.count({ where: { shopId } });
    const tags = await prisma.tag.count({ where: { shopId } });
    const colors = await prisma.color.count({ where: { shopId } });
    const sizes = await prisma.size.count({ where: { shopId } });
    const measurements = await prisma.measurement.count({ where: { shopId } });

    res.status(200).json({
      types,
      categories,
      tags,
      colors,
      sizes,
      measurements,
    });
  } catch (error) {
    console.error("Error fetching totals:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
