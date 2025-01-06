// pages/api/maintenance/measurements/update-measurement.js

import prisma, { getSessionShopId } from "@/utils/helpers";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const shopId = await getSessionShopId(req, res);
    if (!shopId) {
      return res.status(401).json({ error: "Unauthorized: Shop ID missing in session." });
    }

    const { id, name } = req.body;

    if (!id || !name) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const upperName = name.toUpperCase();

    // Find the Measurement
    const measurement = await prisma.measurement.findFirst({
      where: { id: id, shopId: shopId },
      select: { typeId: true },
    });

    if (!measurement) {
      return res.status(404).json({ error: "Measurement not found." });
    }

    // Update the Measurement's name
    const updatedMeasurement = await prisma.measurement.update({
      where: { id: id },
      data: {
        name: upperName,
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
    });

    return res.status(200).json({
      measurement: {
        id: updatedMeasurement.id,
        name: updatedMeasurement.name,
        createdAt: updatedMeasurement.created_at,
        assignTo: updatedMeasurement.Type.name,
      },
    });
  } catch (error) {
    console.error("Error editing measurement:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
}
