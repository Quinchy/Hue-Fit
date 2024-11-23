// pages/api/maintenance/tags/add-tag.js
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

    const { name, typeId } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Tag Name is required." });
    }

    if (!typeId) {
      return res.status(400).json({ error: "Type ID is required." });
    }

    const existingTag = await prisma.tags.findFirst({
      where: { name, shopNo },
    });

    if (existingTag) {
      return res.status(400).json({ error: "Tag with this name already exists." });
    }

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
