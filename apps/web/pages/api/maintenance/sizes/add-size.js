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

    const { name, abbreviation, nextTo} = req.body;

    if (!name || !abbreviation) {
      return res.status(400).json({ error: "Name and Abbreviation are required fields." });
    }

    const newSize = await prisma.sizes.create({
      data: {
        shopNo,
        name,
        abbreviation,
        nextId: nextTo,
      },
    });

    return res.status(201).json({ success: true, size: newSize });
  } catch (error) {
    console.error("Error adding size:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
}
