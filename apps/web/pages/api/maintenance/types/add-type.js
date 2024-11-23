// pages/api/maintenance/types/add-type.js
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
      return res.status(400).json({ error: "Name is required." });
    }

    const existingType = await prisma.type.findFirst({
      where: {
        name,
        shopNo,
      },
    });

    if (existingType) {
      return res.status(400).json({ error: "Type with this name already exists." });
    }

    const newType = await prisma.type.create({
      data: {
        shopNo,
        name,
      },
    });

    return res.status(201).json({ success: true, type: newType });
  } catch (error) {
    console.error("Error adding type:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
}
