// pages/api/products/add-product.js
import prisma, { getSessionShopId } from "@/utils/helpers";
import { v4 as uuidv4 } from "uuid";
import { Prisma } from "@prisma/client";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const shopId = await getSessionShopId(req, res);
    const productNo = uuidv4();
    const {
      thumbnailURL,
      name,
      description,
      type,
      category,
      tags,
      sizes,
      measurements,
      variants,
    } = req.body;

    const typeId = parseInt(type, 10) || 0;
    const tagId = parseInt(tags, 10) || 0;
    const categoryId = await getCategoryIdByName(prisma, category, shopId);

    const product = await prisma.product.create({
      data: {
        productNo,
        name,
        description,
        thumbnailURL,
        totalQuantity: 0,
        shopId,
        typeId,
        categoryId,
        tagId,
      },
    });

    const uniqueSizes = [...new Set(measurements.map((m) => m.size))];
    const uniqueMeasurementNames = [
      ...new Set(measurements.map((m) => m.measurementName)),
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

    const productMeasurements = measurements.map((m) => ({
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
      if (variant.quantities) {
        for (const [sizeAbbr, quantity] of Object.entries(variant.quantities)) {
          variantTotalQty += Number(quantity);
          const sizeId = await getSizeIdByAbbreviation(
            prisma,
            shopId,
            sizeAbbr
          );
          await prisma.productVariantSize.create({
            data: {
              productVariantId: productVariant.id,
              sizeId,
              quantity: Number(quantity),
            },
          });
        }
      }

      await prisma.productVariant.update({
        where: { id: productVariant.id },
        data: { totalQuantity: variantTotalQty },
      });
      totalProductQuantity += variantTotalQty;

      if (variant.imagesURLs && Array.isArray(variant.imagesURLs)) {
        for (const imageURL of variant.imagesURLs) {
          await prisma.productVariantImage.create({
            data: {
              productVariantId: productVariant.id,
              imageURL,
            },
          });
        }
      }

      if (variant.pngClotheURL) {
        await prisma.productVariant.update({
          where: { id: productVariant.id },
          data: { pngClotheURL: variant.pngClotheURL },
        });
      }
    }

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
