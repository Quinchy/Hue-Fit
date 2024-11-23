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

    const { typeName } = req.body;
    let { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Tag Name is required." });
    }

    if (!typeName) {
      return res.status(400).json({ error: "Type Name is required." });
    }
    name = name.toUpperCase();
    // Find the type ID using typeName and shopNo
    const type = await prisma.type.findFirst({
      where: {
        name: typeName,
        shopNo,
      },
    });

    if (!type) {
      return res.status(404).json({ error: "Type not found for the given name and shop." });
    }

    const typeId = type.id;

    // Check if the tag already exists
    const existingTag = await prisma.tags.findFirst({
      where: { name, shopNo },
    });

    if (existingTag) {
      return res.status(400).json({ error: "Tag with this name already exists." });
    }

    // Create the new tag
    const newTag = await prisma.tags.create({
      data: {
        shopNo,
        name,
        typeId,
      },
    });

    return res.status(201).json({ success: true, tag: newTag });
  } catch (error) {
    console.error("Error adding tag:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
}
