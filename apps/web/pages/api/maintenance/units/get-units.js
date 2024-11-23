import prisma, { getSessionShopNo } from "@/utils/helpers";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const shopNo = await getSessionShopNo(req, res);

    if (!shopNo) {
      return res.status(400).json({ error: "Shop number is missing in the session." });
    }

    const { page = 1 } = req.query;
    const pageNumber = parseInt(page, 10);

    // Fetch units with pagination
    const units = await prisma.units.findMany({
      where: { shopNo },
      select: {
        id: true,
        name: true,
        abbreviation: true,
      },
      skip: (pageNumber - 1) * 8,
      take: 8,
    });

    const totalUnits = await prisma.units.count({ where: { shopNo } });
    const totalPages = Math.ceil(totalUnits / 8);

    return res.status(200).json({
      units,
      currentPage: pageNumber,
      totalPages,
      totalUnits,
    });
  } catch (error) {
    console.error("Error fetching units:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
}
