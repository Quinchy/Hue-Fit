// /pages/api/shops/get-shops.js
import prisma, { disconnectPrisma } from "@/utils/helpers";

export default async function handler(req, res) {
  const { page = 1, limit = 7 } = req.query; // Default to page 1 and 7 items per page

  try {
    const offset = (page - 1) * limit;
    const activeShops = await prisma.shops.findMany({
      where: { status: "ACTIVE" },
      skip: offset,
      take: parseInt(limit),
      select: {
        shopNo: true,
        name: true,
        Address: {
          select: {
            buildingNo: true,
            street: true,
            barangay: true,
            municipality: true,
            province: true,
            postalCode: true,
          },
        },
        status: true,
      },
      orderBy: { created_at: "desc" },
    });

    const totalShops = await prisma.shops.count({
      where: { status: "ACTIVE" },
    });

    res.status(200).json({
      shops: activeShops,
      totalPages: Math.ceil(totalShops / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error fetching active shops:", error);
    res.status(500).json({ error: "Failed to fetch active shops" });
  } finally {
    await disconnectPrisma();
  }
}
