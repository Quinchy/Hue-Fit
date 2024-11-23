// pages/api/maintenance/measurements/get-measurements.js
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

    // Fetch measurements with pagination
    const measurements = await prisma.measurements.findMany({
      where: { shopNo },
      select: { id: true, name: true, created_at: true },
      skip: (pageNumber - 1) * 8,
      take: 8,
    });

    const totalMeasurements = await prisma.measurements.count({ where: { shopNo } });
    const totalPages = Math.ceil(totalMeasurements / 8);

    return res.status(200).json({
      measurements,
      currentPage: pageNumber,
      totalPages,
      totalMeasurements,
    });
  } catch (error) {
    console.error("Error fetching measurements:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
}
