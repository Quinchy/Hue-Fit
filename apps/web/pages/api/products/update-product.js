import prisma, { getSessionShopId } from "@/utils/helpers";
import { Prisma } from "@prisma/client";

export const config = {
  api: {
    bodyParser: true, // Using the built-in JSON parser
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get shopId if needed (for validation or multi-tenancy)
    const shopId = await getSessionShopId(req, res);
    const {
      productId,
      name,
      description,
      thumbnailUrl,
      measurements,
      variants,
    } = req.body;

    console.log("Received update-product request with payload:", req.body);

    // --- 1. Update Product Record ---
    await prisma.product.update({
      where: { id: productId },
      data: { name, description, thumbnailURL: thumbnailUrl },
    });

    // --- 2. Update ProductMeasurements ---
    // Assume measurements is an array with each having productMeasurementId and values.
    for (const m of measurements) {
      const productMeasurementId = m.productMeasurementId;
      if (m.values && m.values.length > 0) {
        await prisma.productMeasurement.update({
          where: { id: productMeasurementId },
          data: { value: parseFloat(m.values[0].value) },
        });
      }
    }

    // --- 3. Update ProductVariants ---
    // For each variant, update the price and pngClotheURL, and process variant images.
    for (const variant of variants) {
      const variantId = variant.productVariantId;
      const price = parseFloat(variant.price);
      const pngClotheURL = variant.pngClotheUrl || "";
      await prisma.productVariant.update({
        where: { id: variantId },
        data: { price, pngClotheURL },
      });

      // Process new variant images (assume imageUrls is an array)
      if (
        variant.imageUrls &&
        Array.isArray(variant.imageUrls) &&
        variant.imageUrls.length > 0
      ) {
        for (const imageURL of variant.imageUrls) {
          // Optionally, check if imageURL already exists before creating.
          await prisma.productVariantImage.create({
            data: { productVariantId: variantId, imageURL },
          });
        }
      }
    }

    return res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ error: "Error updating product" });
  }
}
