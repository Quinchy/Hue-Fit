// File: /api/products/manage-archival-product.js
import prisma from "@/utils/helpers";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { variantId, archive } = req.body;

    if (!variantId || typeof archive !== "boolean") {
      return res.status(400).json({ error: "Invalid payload" });
    }

    console.log(`Updating variant ${variantId} archived status to ${archive}`);

    const updatedVariant = await prisma.productVariant.update({
      where: { id: Number(variantId) },
      data: { isArchived: archive },
    });

    return res.status(200).json({
      message: archive
        ? "Product Variant Archived successfully"
        : "Product Variant Unarchived successfully",
      variant: updatedVariant,
    });
  } catch (error) {
    console.error("Error managing archival status:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
