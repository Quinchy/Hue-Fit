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
    const pageNumber = parseInt(page);

    // Fetch colors with pagination
    const colors = await prisma.colors.findMany({
      where: { shopNo },
      select: { id: true, name: true, hexcode: true },
      skip: (pageNumber - 1) * 8,
      take: 8,
    });

    const totalColors = await prisma.colors.count({ where: { shopNo } });
    const totalPages = Math.ceil(totalColors / 8);

    return res.status(200).json({
      colors,
      currentPage: pageNumber,
      totalPages,
      totalColors,
    });
  } catch (error) {
    console.error("Error fetching colors by shopNo:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
}
