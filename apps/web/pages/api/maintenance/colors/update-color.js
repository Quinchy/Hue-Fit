// pages/api/maintenance/colors/update-color.js
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

    let { id, name, hexCode } = req.body;

    if (!id || !name || !hexCode) {
      return res.status(400).json({ error: "ID, Name, and Hex Code are required fields." });
    }

    name = name.toUpperCase();
    hexCode = hexCode.toUpperCase();

    // Check if the color exists and belongs to the shop
    const existingColor = await prisma.color.findUnique({
      where: { id },
      select: { shopId: true },
    });

    if (!existingColor || existingColor.shopId !== shopId) {
      return res.status(404).json({ error: "Color not found." });
    }

    // Check for duplicate hexCode within the same shop, excluding the current color
    const duplicateColor = await prisma.color.findFirst({
      where: {
        shopId,
        hexcode: hexCode,
        NOT: { id },
      },
    });

    if (duplicateColor) {
      return res.status(400).json({ error: "Another color with this hex code already exists." });
    }

    // Update the color and set updated_at to current date
    const updatedColor = await prisma.color.update({
      where: { id },
      data: {
        name,
        hexcode: hexCode,
        updated_at: new Date(),
      },
    });

    // Respond with the updated color data
    return res.status(200).json({ success: true, color: updatedColor });
  } catch (error) {
    console.error("Error updating color:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
}
