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

    let { name, abbreviation } = req.body;
    name = name.toUpperCase();
    abbreviation = abbreviation.toUpperCase();
    if (!name || !abbreviation) {
      return res.status(400).json({ error: "Name and Abbreviation are required fields." });
    }

    const existingUnit = await prisma.units.findFirst({
      where: { name, shopNo },
    });

    if (existingUnit) {
      return res.status(400).json({ error: "Unit with this name already exists." });
    }

    const newUnit = await prisma.units.create({
      data: {
        shopNo,
        name,
        abbreviation,
      },
    });

    return res.status(201).json({ success: true, unit: newUnit });
  } catch (error) {
    console.error("Error adding unit:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
}
