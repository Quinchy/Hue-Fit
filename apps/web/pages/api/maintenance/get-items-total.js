// pages/api/maintenance/get-items-total.js
import prisma, { getSessionShopNo } from "@/utils/helpers";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  try {
    const shopNo = await getSessionShopNo(req, res);
    if (!shopNo) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const types = await prisma.type.count({ where: { shopNo } });
    const categories = await prisma.category.count({ where: { shopNo } });
    const tags = await prisma.tags.count({ where: { shopNo } });
    const colors = await prisma.colors.count({ where: { shopNo } });
    const sizes = await prisma.sizes.count({ where: { shopNo } });
    const measurements = await prisma.measurements.count({ where: { shopNo } });
    const units = await prisma.units.count({ where: { shopNo } });

    res.status(200).json({
      types,
      categories,
      tags,
      colors,
      sizes,
      measurements,
      units,
    });
  } catch (error) {
    console.error("Error fetching totals:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
