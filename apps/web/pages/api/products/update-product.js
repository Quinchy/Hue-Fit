// pages/api/products/update-product.js
import prisma, {
  getSessionShopId,
  uploadFileToSupabase,
  parseFormData,
} from "@/utils/helpers";
import { v4 as uuidv4 } from "uuid";
import { Prisma } from "@prisma/client";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get shopId if needed (e.g., for validation)
    const shopId = await getSessionShopId(req, res);
    const { fields, files } = await parseFormData(req);
    console.log("Received update-product request:");
    console.log("Fields:", fields);
    console.log("Files:", files);

    // --- 1. Update Product Record ---
    const productId = Number(fields.productId[0]);
    const name = fields.name[0];
    const description = fields.description[0];

    // Process product thumbnail:
    // If a new file is provided, upload it; otherwise, keep the existing URL.
    let thumbnailURL = fields.thumbnailURL ? fields.thumbnailURL[0] : null;
    if (files.thumbnail && files.thumbnail.length > 0) {
      const fileObj = files.thumbnail[0];
      thumbnailURL = await uploadFileToSupabase(
        fileObj,
        fileObj.filepath,
        fileObj.originalFilename,
        productId.toString(),
        "products/product-thumbnails"
      );
      if (!thumbnailURL) {
        return res.status(415).json({
          error: "Thumbnail upload failed",
          message: "Invalid mime type or unsupported file",
        });
      }
    }

    // Update the Product (name, description, thumbnailURL)
    await prisma.product.update({
      where: { id: productId },
      data: { name, description, thumbnailURL },
    });

    // --- 2. Update ProductMeasurements ---
    // fields.measurements should be a JSON string.
    const measurementsData = JSON.parse(fields.measurements?.[0] || "[]");
    for (const m of measurementsData) {
      const productMeasurementId = m.productMeasurementId;
      if (m.values && m.values.length > 0) {
        // Update the measurement record with the first value in the array.
        await prisma.productMeasurement.update({
          where: { id: productMeasurementId },
          data: { value: parseFloat(m.values[0].value) },
        });
      }
    }

    // --- 3. Update ProductVariants & Process Files ---
    let i = 0;
    while (fields[`variants[${i}][productVariantId]`]) {
      const variantId = Number(fields[`variants[${i}][productVariantId]`][0]);
      const price = parseFloat(fields[`variants[${i}][price]`][0]);

      // Process pngClothe file:
      // Use the provided file if available; otherwise, retain the current pngClotheURL.
      let pngClotheURL = fields[`variants[${i}][pngClotheURL]`]
        ? fields[`variants[${i}][pngClotheURL]`][0]
        : null;
      if (
        files[`variants[${i}][pngClothe]`] &&
        files[`variants[${i}][pngClothe]`].length > 0
      ) {
        const fileObj = files[`variants[${i}][pngClothe]`][0];
        pngClotheURL = await uploadFileToSupabase(
          fileObj,
          fileObj.filepath,
          fileObj.originalFilename,
          variantId.toString(),
          "products/product-virtual-fitting"
        );
      }

      // Update the ProductVariant with the new price and pngClotheURL.
      await prisma.productVariant.update({
        where: { id: variantId },
        data: { price, pngClotheURL },
      });

      // Process any new variant images:
      if (
        files[`variants[${i}][images]`] &&
        files[`variants[${i}][images]`].length > 0
      ) {
        for (const fileObj of files[`variants[${i}][images]`]) {
          const imageURL = await uploadFileToSupabase(
            fileObj,
            fileObj.filepath,
            fileObj.originalFilename,
            variantId.toString(),
            "products/product-variant-pictures"
          );
          if (imageURL) {
            await prisma.productVariantImage.create({
              data: { productVariantId: variantId, imageURL },
            });
          }
        }
      }
      i++;
    }

    return res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ error: "Error updating product" });
  }
}
