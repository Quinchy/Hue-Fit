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

    const { name, hexCode } = req.body;

    if (!name || !hexCode) {
      return res.status(400).json({ error: "Name and Hex Code are required fields." });
    }

    const existingColor = await prisma.colors.findFirst({
      where: {
        hexcode: hexCode,
        shopNo,
      },
    });

    if (existingColor) {
      return res.status(400).json({ error: "Color with this hex code already exists." });
    }

    const newColor = await prisma.colors.create({
      data: {
        shopNo,
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
