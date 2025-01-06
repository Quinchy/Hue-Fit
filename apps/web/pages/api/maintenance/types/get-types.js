// pages/api/maintenance/types/get-types.js
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

    // Fetch types with pagination and search
    const types = await prisma.type.findMany({
      where: {
        shopId,
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      select: { id: true, name: true },
      skip: (pageNumber - 1) * 8,
      take: 8,
      orderBy: { id: "asc" },
    });

    const totalTypes = await prisma.type.count({
      where: {
        shopId,
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
    });
    const totalPages = Math.ceil(totalTypes / 8);

    return res.status(200).json({
      types,
      currentPage: pageNumber,
      totalPages,
      totalTypes,
    });
  } catch (error) {
    console.error("Error fetching types:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
}
