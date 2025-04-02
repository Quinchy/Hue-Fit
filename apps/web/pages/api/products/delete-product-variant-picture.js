// File: /api/products/delete-product-variant-picture.js
import prisma from "@/utils/helpers";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.body; // Here, id represents the unique URL of the product variant picture.
    if (!id) {
      return res
        .status(400)
        .json({ error: "No product variant picture URL provided" });
    }
    console.log("Product Variant Image URL:", id);

    // Retrieve the record based on the imageURL for debugging purposes.
    const picture = await prisma.productVariantImage.findFirst({
      where: { imageURL: id },
    });

    if (picture) {
      await prisma.productVariantImage.delete({
        where: { id: picture.id },
      });
    }

    return res.status(200).json({
      message: "Product variant picture found for deletion",
      picture,
    });
  } catch (error) {
    console.error("Error deleting product variant picture:", error);
    return res
      .status(500)
      .json({ error: "Error deleting product variant picture" });
  }
}
