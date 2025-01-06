// pages/api/maintenance/types/update-type.js
import prisma, { getSessionShopId } from "@/utils/helpers";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const shopId = await getSessionShopId(req, res);

    if (!shopId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id, name } = req.body;

    if (!id || !name) {
      return res.status(400).json({ error: "ID and name are required." });
    }

    const existingType = await prisma.type.findFirst({
      where: { id, shopId },
    });

    if (!existingType) {
      return res.status(404).json({ error: "Type not found." });
    }

    const updatedType = await prisma.type.update({
      where: { id },
      data: { name: name.trim() },
    });

    return res.status(200).json({
      success: true,
      type: updatedType,
    });
  } catch (error) {
    console.error("Error updating type:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
}
