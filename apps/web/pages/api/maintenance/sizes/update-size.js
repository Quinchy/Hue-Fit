// pages/api/maintenance/sizes/update-size.js

import prisma, { getSessionShopId } from '@/utils/helpers';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { id, name, abbreviation } = req.body;

    if (!id || !name || !abbreviation) {
      return res.status(400).json({ error: "Missing required fields: id, name, abbreviation." });
    }

    const shopId = await getSessionShopId(req, res);

    if (!shopId) {
      return res.status(401).json({ error: "Unauthorized: Shop ID missing in session." });
    }

    // Verify that the size exists and belongs to the shop
    const existingSize = await prisma.size.findFirst({
      where: {
        id: id,
        shopId: shopId,
      },
    });

    if (!existingSize) {
      return res.status(404).json({ error: "Size not found." });
    }

    // Update the size's name and abbreviation
    const updatedSize = await prisma.size.update({
      where: { id: id },
      data: {
        name: name,
        abbreviation: abbreviation,
      },
      select: {
        id: true,
        name: true,
        abbreviation: true,
        nextId: true,
      },
    });

    return res.status(200).json({
      message: "Size updated successfully.",
      type: "success",
      size: updatedSize,
    });
  } catch (error) {
    console.error("Error updating size:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
}
