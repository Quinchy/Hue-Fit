// pages/api/maintenance/measurements/add-measurement.js
import prisma, { getSessionShopNo } from "@/utils/helpers";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const shopNo = await getSessionShopNo(req, res);

    if (!shopNo) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is a required field." });
    }

    const existingMeasurement = await prisma.measurements.findFirst({
      where: {
        name,
        shopNo,
      },
    });

    if (existingMeasurement) {
      return res.status(400).json({ error: "Measurement with this name already exists." });
    }

    const newMeasurement = await prisma.measurements.create({
      data: {
        shopNo,
        name,
      },
    });

    return res.status(201).json({ success: true, measurement: newMeasurement });
  } catch (error) {
    console.error("Error adding measurement:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
}
