// pages/api/maintenance/categories/update-category.js
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

    const { id, name } = req.body;

    if (!id || !name) {
      return res.status(400).json({ error: "Category ID and name are required." });
    }

    const upperCaseName = name.toUpperCase();

    // Check if the category exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
        shopId,
      },
    });

    if (!existingCategory) {
      return res.status(404).json({ error: "Category not found." });
    }

    // Check if another category with the same name already exists
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        name: upperCaseName,
        shopId,
        NOT: { id }, // Exclude the current category from the check
      },
    });

    if (duplicateCategory) {
      return res.status(400).json({ error: "Category with this name already exists." });
    }

    // Update the category
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: upperCaseName,
      },
    });

    return res.status(200).json({ success: true, category: updatedCategory });
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
}
