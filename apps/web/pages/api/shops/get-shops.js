// 2) pages/api/shops/get-shops.js
import prisma, { disconnectPrisma } from "@/utils/helpers";

export default async function handler(req, res) {
  const { page = 1, limit = 12, status = "ALL", search = "" } = req.query;
  const offset = (page - 1) * limit;

  try {
    let whereClause = {};

    if (status === "ALL") {
      whereClause.status = { in: ["ACTIVE", "INACTIVE"] };
    } else {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { shopNo: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    const shops = await prisma.shop.findMany({
      where: whereClause,
      skip: offset,
      take: parseInt(limit),
      select: {
        shopNo: true,
        name: true,
        ShopAddress: {
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
      orderBy: [{ status: "asc" }, { created_at: "desc" }],
    });

    const totalShops = await prisma.shop.count({ where: whereClause });

    res.status(200).json({
      shops,
      totalPages: Math.ceil(totalShops / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error fetching shops:", error);
    res.status(500).json({ error: "Failed to fetch shops" });
  } finally {
    await disconnectPrisma();
  }
}
