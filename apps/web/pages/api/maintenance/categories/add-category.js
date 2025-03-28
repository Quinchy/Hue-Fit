// pages/api/maintenance/categories/add-categories.js
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

    let { name } = req.body;
    name = name.toUpperCase();
    
    if (!name) {
      return res.status(400).json({ error: "Name is required." });
    }

    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        shopId,
      },
    });

    if (existingCategory) {
      return res.status(400).json({ error: "Category with this name already exists." });
    }

    const newCategory = await prisma.category.create({
      data: {
        shopId,
        name,
      },
    });

    return res.status(201).json({ success: true, category: newCategory });
  } catch (error) {
    console.error("Error adding category:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
}
