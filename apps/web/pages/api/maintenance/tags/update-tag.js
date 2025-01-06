// api/maintenance/tags/update-tag.js
import prisma, { getSessionShopId } from "@/utils/helpers";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id, name } = req.body;

  if (!id || !name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const shopId = await getSessionShopId(req, res);
    if (!shopId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify that the tag belongs to the shop
    const existingTag = await prisma.tag.findFirst({
      where: {
        id,
        shopId,
      },
    });

    if (!existingTag) {
      return res.status(404).json({ error: "Tag not found" });
    }

    const updatedTag = await prisma.tag.update({
      where: { id },
      data: {
        name,
      },
    });

    res.status(200).json({ updatedTag });
  } catch (error) {
    console.error("Error updating tag:", error);
    res.status(500).json({ error: "Failed to update tag" });
  } finally {
    await prisma.$disconnect();
  }
}
