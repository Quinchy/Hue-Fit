// pages/api/maintenance/measurements/add-measurement.js
import prisma, { getSessionShopId } from "@/utils/helpers";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const shopId = await getSessionShopId(req, res);

    if (!shopId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let { name, assignTo } = req.body;
    name = name.toUpperCase();
    console.log("name", name);
    console.log("assignTo", assignTo);
    if (!name) {
      return res.status(400).json({ error: "Name is a required field." });
    }

    if (!assignTo) {
      return res.status(400).json({ error: "Assign To is a required field." });
    }

    const type = await prisma.type.findFirst({
      where: {
        name: assignTo,
        shopId,
      },
    });
    console.log("type", type);
    if (!type) {
      return res.status(400).json({ error: "Invalid type specified in Assign To." });
    }

    const typeId = type.id;
    
    const newMeasurement = await prisma.measurement.create({
      data: {
        shopId,
        name,
      },
    });
    console.log("newMeasurement", newMeasurement);
    return res.status(201).json({ success: true, measurement: newMeasurement });
  } catch (error) {
    console.error("Error adding measurement:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
}
