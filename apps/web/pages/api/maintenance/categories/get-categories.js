// pages/api/maintenance/categories/get-categories.js
import prisma, { getSessionShopNo } from "@/utils/helpers";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const shopNo = await getSessionShopNo(req, res);

    if (!shopNo) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { page = 1 } = req.query;
    const pageNumber = parseInt(page, 10);

    // Fetch categories with pagination (8 records per page)
    const categories = await prisma.category.findMany({
      where: { shopNo },
      select: { id: true, name: true },
      skip: (pageNumber - 1) * 8,
      take: 8,
      orderBy: { id: "asc" },
    });

    const totalCategories = await prisma.category.count({ where: { shopNo } });
    const totalPages = Math.ceil(totalCategories / 8);

    return res.status(200).json({
      categories,
      currentPage: pageNumber,
      totalPages,
      totalCategories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
}
