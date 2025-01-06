// pages/api/maintenance/categories/get-categories.js
import prisma, { getSessionShopId } from "@/utils/helpers";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const shopId = await getSessionShopId(req, res);

    if (!shopId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { page = 1, search = "" } = req.query;
    const pageNumber = parseInt(page, 10);

    // Fetch categories with pagination and search
    const categories = await prisma.category.findMany({
      where: {
        shopId,
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      select: { id: true, name: true },
      skip: (pageNumber - 1) * 9,
      take: 9,
      orderBy: { id: "asc" },
    });

    const totalCategories = await prisma.category.count({
      where: {
        shopId,
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
    });
    const totalPages = Math.ceil(totalCategories / 9);

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
