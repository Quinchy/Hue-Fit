// pages/api/maintenance/types/get-types.js
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
    const pageNumber = parseInt(page);

    const types = await prisma.type.findMany({
      where: { shopNo },
      select: { id: true, name: true },
      skip: (pageNumber - 1) * 8,
      take: 8,
    });

    const totalTypes = await prisma.type.count({ where: { shopNo } });
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
