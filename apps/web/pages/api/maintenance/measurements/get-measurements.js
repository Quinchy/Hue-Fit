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

    // Fetch measurements with pagination, including the "Assign To" data
    const measurements = await prisma.measurements.findMany({
      where: { shopNo },
      select: {
        id: true,
        name: true,
        created_at: true,
        TypeMeasurements: {
          select: {
            Type: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      skip: (pageNumber - 1) * 8,
      take: 8,
    });

    // Map to include the assigned type name
    const formattedMeasurements = measurements.map((measurement) => ({
      id: measurement.id,
      name: measurement.name,
      createdAt: measurement.created_at,
      assignedTo:
        measurement.TypeMeasurements.length > 0
          ? measurement.TypeMeasurements.map((tm) => tm.Type.name).join(", ")
          : null,
    }));

    const totalMeasurements = await prisma.measurements.count({ where: { shopNo } });
    const totalPages = Math.ceil(totalMeasurements / 8);

    return res.status(200).json({
      measurements: formattedMeasurements,
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
