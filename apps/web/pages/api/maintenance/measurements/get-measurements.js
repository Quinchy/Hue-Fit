// pages/api/maintenance/measurements/get-measurements.js

import prisma, { getSessionShopId } from "@/utils/helpers";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const shopId = await getSessionShopId(req, res);
    if (!shopId) {
      return res.status(401).json({ error: "Unauthorized: Shop ID missing in session." });
    }

    const { page = 1, search = "" } = req.query;
    const pageNumber = parseInt(page, 10);
    if (isNaN(pageNumber) || pageNumber < 1) {
      return res.status(400).json({ error: "Invalid page number." });
    }

    // Fetch measurements with pagination and search, including the related "Type" data
    const measurements = await prisma.measurement.findMany({
      where: {
        shopId,
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        created_at: true,
        Type: {
          select: {
            name: true,
          },
        },
      },
      skip: (pageNumber - 1) * 13,
      take: 13,
      orderBy: {
        created_at: "desc",
      },
    });

    const totalMeasurements = await prisma.measurement.count({
      where: {
        shopId,
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
    });
    const totalPages = Math.ceil(totalMeasurements / 13);

    return res.status(200).json({
      measurements: measurements,
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
