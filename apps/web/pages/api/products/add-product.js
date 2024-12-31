// /api/products/add-product
import prisma, {
  getSessionShopId,
  uploadFileToSupabase,
  parseFormData
} from '@/utils/helpers';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const shopId = await getSessionShopId(req, res);
      const productNo = uuidv4();
      const { fields, files } = await parseFormData(req);

      const name = fields.name?.[0] || '';
      const description = fields.description?.[0] || '';
      const typeId = parseInt(fields.type?.[0] || '0', 10);
      const categoryName = fields.category?.[0] || '';
      const tagId = parseInt(fields.tags?.[0] || '0', 10);

      const categoryId = await getCategoryIdByName(tx, categoryName, shopId);

      const thumbnailURL = await uploadFileToSupabase(
        files.thumbnail?.[0],
        files.thumbnail?.[0]?.filepath,
        files.thumbnail?.[0]?.originalFilename,
        productNo,
        'products/product-thumbnails'
      );

      const product = await tx.product.create({
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

      const measurementsData = JSON.parse(fields.measurements?.[0] || '[]');
      const uniqueSizes = [...new Set(measurementsData.map((m) => m.size))];
      const uniqueMeasurementNames = [
        ...new Set(measurementsData.map((m) => m.measurementName)),
      ];

      const sizesFromDB = await tx.size.findMany({
        where: { shopId, abbreviation: { in: uniqueSizes } },
        select: { id: true, abbreviation: true },
      });

      const measurementsFromDB = await tx.measurement.findMany({
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
        unit: 'CM',
      }));

      if (productMeasurements.length > 0) {
        await tx.productMeasurement.createMany({
          data: productMeasurements,
        });
      }

      const variantEntries = Object.keys(fields).filter((key) =>
        key.startsWith('variants[')
      );
      const variants = {};
      const variantQuantities = {};

      variantEntries.forEach((key) => {
        const quantityMatch = key.match(/^variants\[(\d+)\]\[quantities\]\[(.+)\]$/);
        if (quantityMatch) {
          const index = parseInt(quantityMatch[1], 10);
          const sizeAbbr = quantityMatch[2];
          if (!variantQuantities[index]) {
            variantQuantities[index] = {};
          }
          variantQuantities[index][sizeAbbr] = parseInt(fields[key][0] || '0', 10);
        } else {
          const match = key.match(/^variants\[(\d+)\]\[(.+)\]$/);
          if (match) {
            const index = parseInt(match[1], 10);
            const property = match[2];
            if (!variants[index]) {
              variants[index] = {};
            }
            variants[index][property] = fields[key][0];
          }
        }
      });

      let totalProductQuantity = 0;

      for (const idx of Object.keys(variants)) {
        try {
          const colorName = variants[idx].color || '';
          const priceVal = variants[idx].price || '0';
          const productVariantNo = uuidv4();
          const colorId = await getColorIdByName(tx, shopId, colorName);

          const productVariant = await tx.productVariant.create({
            data: {
              productVariantNo,
              productId: product.id,
              colorId,
              price: new Prisma.Decimal(priceVal),
              totalQuantity: 0,
              isTryOnAvailable: false,
            },
          });

          let variantTotalQty = 0;

          if (variantQuantities[idx]) {
            for (const abbr of Object.keys(variantQuantities[idx])) {
              const qty = variantQuantities[idx][abbr];
              variantTotalQty += qty;
              const sizeId = await getSizeIdByAbbreviation(tx, shopId, abbr);
              await tx.productVariantSize.create({
                data: {
                  productVariantId: productVariant.id,
                  sizeId,
                  quantity: qty,
                },
              });
            }
          }

          await tx.productVariant.update({
            where: { id: productVariant.id },
            data: { totalQuantity: variantTotalQty },
          });

          totalProductQuantity += variantTotalQty;

          const variantImages = files[`productVariant[${idx}][images]`];
          if (Array.isArray(variantImages) && variantImages.length > 0) {
            for (const fileObj of variantImages) {
              try {
                const imageURL = await uploadFileToSupabase(
                  fileObj,
                  fileObj.filepath,
                  fileObj.originalFilename,
                  productVariantNo,
                  'products/product-variant-pictures'
                );
                if (imageURL) {
                  await tx.productVariantImage.create({
                    data: {
                      productVariantId: productVariant.id,
                      imageURL,
                    },
                  });
                }
              } catch (imgError) {
                console.error('Error uploading product variant image:', imgError);
                throw imgError;
              }
            }
          }
        } catch (variantError) {
          console.error('Error creating product variant:', variantError);
          throw variantError;
        }
      }

      await tx.product.update({
        where: { id: product.id },
        data: { totalQuantity: totalProductQuantity },
      });
    });

    res.status(200).json({ message: 'Product inserted successfully.' });
  } catch (err) {
    console.error('Error inserting product:', err);
    res.status(500).json({ error: 'Error inserting product' });
  }
}

async function getCategoryIdByName(tx, categoryName, shopId) {
  try {
    const categoryRecord = await tx.category.findFirst({
      where: { name: categoryName, shopId },
      select: { id: true },
    });
    return categoryRecord?.id || null;
  } catch (error) {
    console.error('Error getting category ID:', error);
    return null;
  }
}

async function getColorIdByName(tx, shopId, colorName) {
  try {
    if (!colorName) return null;
    const color = await tx.color.findFirst({
      where: { name: colorName, shopId },
      select: { id: true },
    });
    if (!color) {
      throw new Error(`Color not found for shopId: ${shopId}, colorName: ${colorName}`);
    }
    return color.id;
  } catch (error) {
    console.error('Error getting color ID:', error);
    throw error;
  }
}

async function getSizeIdByAbbreviation(tx, shopId, sizeAbbreviation) {
  try {
    const sizeRecord = await tx.size.findFirst({
      where: { abbreviation: sizeAbbreviation, shopId },
      select: { id: true },
    });
    if (!sizeRecord) {
      throw new Error(`Size not found for shopId: ${shopId}, abbreviation: ${sizeAbbreviation}`);
    }
    return sizeRecord.id;
  } catch (error) {
    console.error('Error getting size ID:', error);
    throw error;
  }
}
