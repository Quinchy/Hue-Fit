// pages/api/maintenance/colors/get-colors.js
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
    const pageNumber = parseInt(page);
    const searchTerm = search.trim().toLowerCase();

    // Build the where clause
    const whereClause = {
      shopId,
      ...(searchTerm && {
        name: {
          contains: searchTerm,
          mode: "insensitive",
        },
      }),
    };

    // Always order by the latest update (updated_at descending)
    const orderByClause = { updated_at: "desc" };

    // Fetch colors with pagination, search, and sorting
    const colors = await prisma.color.findMany({
      where: whereClause,
      select: { id: true, name: true, hexcode: true },
      skip: (pageNumber - 1) * 13,
      take: 13,
      orderBy: orderByClause,
    });

    const totalColors = await prisma.color.count({ where: whereClause });
    const totalPages = Math.ceil(totalColors / 13);

    return res.status(200).json({
      colors,
      currentPage: pageNumber,
      totalPages,
      totalColors,
    });
  } catch (error) {
    console.error("Error fetching colors by shopId:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
}
