// /api/products/add-product.js
import prisma, { getSessionShopId } from "@/utils/helpers";
import { v4 as uuidv4 } from "uuid";
import { Prisma } from "@prisma/client";

export const config = {
  api: {
    bodyParser: true, // Now using the default JSON body parser
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const shopId = await getSessionShopId(req, res);
    const productNo = uuidv4();
    const {
      thumbnail,
      name,
      description,
      type,
      category,
      tag,
      sizes,
      variants,
      measurements,
    } = req.body;

    console.log("Received product data:", req.body);

    const typeId = parseInt(type, 10);
    const tagId = parseInt(tag, 10);
    const categoryId = await getCategoryIdByName(prisma, category, shopId);

    // Ensure the thumbnail URL is provided
    if (!thumbnail) {
      return res.status(415).json({
        error: "Thumbnail upload failed",
        message: "Thumbnail URL is missing",
      });
    }

    // Create the product record
    const product = await prisma.product.create({
      data: {
        productNo,
        name,
        description,
        thumbnailURL: thumbnail,
        totalQuantity: 0,
        shopId,
        typeId,
        categoryId,
        tagId,
      },
    });

    // Process measurements (assumed to be an array of objects)
    const measurementsData = Array.isArray(measurements) ? measurements : [];
    const uniqueSizes = [...new Set(measurementsData.map((m) => m.size))];
    const uniqueMeasurementNames = [
      ...new Set(measurementsData.map((m) => m.measurementName)),
    ];

    const sizesFromDB = await prisma.size.findMany({
      where: { shopId, abbreviation: { in: uniqueSizes } },
      select: { id: true, abbreviation: true },
    });

    const measurementsFromDB = await prisma.measurement.findMany({
      where: { shopId, name: { in: uniqueMeasurementNames } },
      select: { id: true, name: true },
    });

    const sizeMap = {};
    sizesFromDB.forEach((s) => {
      sizeMap[s.abbreviation] = s.id;
    });

    const measurementMap = {};
    measurementsFromDB.forEach((m) => {
      measurementMap[m.name] = m.id;
    });

    const productMeasurements = measurementsData.map((m) => ({
      productId: product.id,
      sizeId: sizeMap[m.size],
      measurementId: measurementMap[m.measurementName],
      value: Number(m.value),
      unit: "CM",
    }));

    if (productMeasurements.length > 0) {
      await prisma.productMeasurement.createMany({
        data: productMeasurements,
      });
    }

    // Process variants (each variant already includes URLs instead of file objects)
    let totalProductQuantity = 0;

    for (const variant of variants) {
      const colorName = variant.color || "";
      const priceVal = variant.price || "0";
      const productVariantNo = uuidv4();
      const colorId = await getColorIdByName(prisma, shopId, colorName);

      const productVariant = await prisma.productVariant.create({
        data: {
          productVariantNo,
          productId: product.id,
          colorId,
          price: new Prisma.Decimal(priceVal),
          totalQuantity: 0,
        },
      });

      let variantTotalQty = 0;
      if (Array.isArray(variant.quantities)) {
        for (const q of variant.quantities) {
          variantTotalQty += parseInt(q.quantity, 10);
          const sizeId = await getSizeIdByAbbreviation(prisma, shopId, q.size);
          await prisma.productVariantSize.create({
            data: {
              productVariantId: productVariant.id,
              sizeId,
              quantity: parseInt(q.quantity, 10),
            },
          });
        }
      }

      await prisma.productVariant.update({
        where: { id: productVariant.id },
        data: { totalQuantity: variantTotalQty },
      });

      totalProductQuantity += variantTotalQty;

      // Process variant image URLs
      if (variant.imagesUrls && Array.isArray(variant.imagesUrls)) {
        for (const imageURL of variant.imagesUrls) {
          await prisma.productVariantImage.create({
            data: {
              productVariantId: productVariant.id,
              imageURL,
            },
          });
        }
      }

      // Process PNG clothe URL if available
      if (variant.pngClotheUrl) {
        await prisma.productVariant.update({
          where: { id: productVariant.id },
          data: { pngClotheURL: variant.pngClotheUrl },
        });
      }
    }

    // Update the product total quantity
    await prisma.product.update({
      where: { id: product.id },
      data: { totalQuantity: totalProductQuantity },
    });

    res.status(200).json({ message: "Product inserted successfully." });
  } catch (err) {
    console.error("Error inserting product:", err);
    res.status(500).json({ error: "Error inserting product" });
  }
}

// Helper functions (same as before)
async function getCategoryIdByName(prisma, categoryName, shopId) {
  try {
    const categoryRecord = await prisma.category.findFirst({
      where: { name: categoryName, shopId },
      select: { id: true },
    });
    return categoryRecord?.id || null;
  } catch (error) {
    console.error("Error getting category ID:", error);
    return null;
  }
}

async function getColorIdByName(prisma, shopId, colorName) {
  try {
    if (!colorName) return null;
    const color = await prisma.color.findFirst({
      where: { name: colorName, shopId },
      select: { id: true },
    });
    if (!color) {
      throw new Error(
        `Color not found for shopId: ${shopId}, colorName: ${colorName}`
      );
    }
    return color.id;
  } catch (error) {
    console.error("Error getting color ID:", error);
    throw error;
  }
}

async function getSizeIdByAbbreviation(prisma, shopId, sizeAbbreviation) {
  try {
    const sizeRecord = await prisma.size.findFirst({
      where: { abbreviation: sizeAbbreviation, shopId },
      select: { id: true },
    });
    if (!sizeRecord) {
      throw new Error(
        `Size not found for shopId: ${shopId}, abbreviation: ${sizeAbbreviation}`
      );
    }
    return sizeRecord.id;
  } catch (error) {
    console.error("Error getting size ID:", error);
    throw error;
  }
}
