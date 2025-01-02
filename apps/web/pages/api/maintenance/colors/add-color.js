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

    let { name, hexCode } = req.body;
    name = name.toUpperCase();
    hexCode = hexCode.toUpperCase();
    
    if (!name || !hexCode) {
      return res.status(400).json({ error: "Name and Hex Code are required fields." });
    }

    const existingColor = await prisma.color.findFirst({
      where: {
        hexcode: hexCode,
        shopId,
      },
    });

    if (existingColor) {
      return res.status(400).json({ error: "Color with this hex code already exists." });
    }

    const newColor = await prisma.color.create({
      data: {
        shopId,
        name,
        hexcode: hexCode,
      },
    });

    // Respond with success and the new color data
    return res.status(201).json({ success: true, color: newColor });
  } catch (error) {
    console.error("Error adding color:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
}
