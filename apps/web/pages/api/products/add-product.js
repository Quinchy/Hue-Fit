import prisma, { getSessionShopNo, uploadFileToSupabase, parseFormData } from '@/utils/helpers';
import { v4 as uuidv4 } from 'uuid';

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
    console.log('1. POST request received');
    // Setups
    const shopNo = await getSessionShopNo(req, res);
    const productNo = uuidv4();
    console.log('2. ProductNo: ', productNo);
    // Parse form data to be used in the multiple datas of tables
    const { fields, files } = await parseFormData(req);

    // Start of Database Logic of Adding Product and its variants
    // Part 1: Insert Product Data
    const name = fields.name[0];
    const description = fields.description[0];
    const typeId = parseInt(fields.type[0], 10);
    const category = fields.category[0];
    const tagId = parseInt(fields.tags[0], 10);
    const categoryId = await getCategoryIdByName(category, shopNo);
    const thumbnailURL = await uploadFileToSupabase(
      files.thumbnail[0],
      files.thumbnail[0].filepath,
      files.thumbnail[0].originalFilename,
      productNo,
      'products/product-thumbnails'
    );
    const totalQuantity = null;
    // Insert product data into the database
    await prisma.products.create({
      data: {
        productNo,
        name,
        description,
        typeId,
        categoryId,
        tagId,
        thumbnailURL,
        totalQuantity,
        shopNo,
      },
    });
    console.log('Product inserted successfully...');

    // Part 2: Insert Product Variants, Sizes, Specific Measurement and Images
    const variantCount = countVariants(fields);
    // Arrays to hold bulk insert data
    const productVariantsData = [];
    const productVariantSizesData = [];
    const productVariantMeasurementsData = [];
    const productVariantImagesData = [];
    const imageUploadPromises = [];

    for (let i = 0; i < variantCount; i++) {
      const productVariantNo = uuidv4();
      console.log('ProductVariantNo:', productVariantNo);
      const colorName = fields[`variants[${i}][color]`]?.[0];
      const price = Number(parseFloat(fields[`variants[${i}][price]`]).toFixed(2));
      let totalVariantQuantity = 0;

      // Get all sizes and quantities for the current variant
      const sizeKeys = Object.keys(fields).filter((key) =>
        key.startsWith(`variants[${i}][sizes]`)
      );
      const quantityKeys = Object.keys(fields).filter((key) =>
        key.startsWith(`variants[${i}][quantities]`)
      );

      const colorId = await getColorIdByName(colorName, shopNo);
      console.log('ColorId:', colorId);

      // Prepare productVariants data
      const productVariant = {
        productVariantNo,
        productNo,
        colorId,
        price,
        totalQuantity: 0, // Will update later
      };

      // Process sizes and quantities
      for (let index = 0; index < sizeKeys.length; index++) {
        const sizeKey = sizeKeys[index];
        const sizeAbbreviation = String(fields[sizeKey][0]); // Example: "S"
        const sizeId = await getSizeIdByAbbreviation(sizeAbbreviation, shopNo);
        const quantityKey = quantityKeys[index];
        const quantity = parseInt(fields[quantityKey], 10);
        const productVariantSizesNo = uuidv4();

        totalVariantQuantity += quantity;

        console.log('SizeId:', sizeId, 'Quantity:', quantity, 'SizeAbbreviation:', sizeAbbreviation);

        // Prepare productVariantSizes data
        productVariantSizesData.push({
          productVariantSizesNo,
          productVariantNo,
          sizeId,
          quantity,
        });

        // Insert specific measurements for the product variant
        try {
          // Parse measurementsBySize JSON string (if not already parsed)
          const parsedMeasurements = fields.measurementsBySize && Array.isArray(fields.measurementsBySize)
            ? JSON.parse(fields.measurementsBySize[0])
            : {};

          const measurementsForSize = parsedMeasurements[sizeAbbreviation]; // Access "S" or "M"

          if (measurementsForSize && measurementsForSize.measurements) {
            for (const measurement of measurementsForSize.measurements) {
              const { measurementName, value, unitName } = measurement;
              console.log('MeasurementName:', measurementName, 'Value:', value, 'UnitName:', unitName);

              const measurementId = await getMeasurementIdByName(measurementName, shopNo);
              const unitId = await getUnitIdByName(unitName, shopNo);
              console.log('MeasurementId:', measurementId);

              // Prepare productVariantMeasurements data
              productVariantMeasurementsData.push({
                productVariantNo,
                productVariantSizesNo,
                measurementId,
                value: parseFloat(value),
                unitId,
              });
            }
            console.log('Specific measurements prepared...');
          } else {
            console.log(`No measurements found for size: ${sizeAbbreviation}`);
          }
        } catch (error) {
          console.error(`Error processing measurements for size: ${sizeAbbreviation}`, error);
        }
      }

      // Update totalVariantQuantity in productVariant
      productVariant.totalQuantity = totalVariantQuantity;

      // Add to productVariantsData array
      productVariantsData.push(productVariant);

      console.log('Sizes and quantities + specific measurements prepared...');

      // Process images for the product variant
      const imageKeys = Object.keys(files).filter((key) =>
        key.startsWith(`variants[${i}][images]`)
      );
      for (const imageKey of imageKeys) {
        const imageFile = files[imageKey][0];
        const uploadPromise = uploadFileToSupabase(
          imageFile,
          imageFile.filepath,
          imageFile.originalFilename,
          productVariantNo,
          'products/product-variant-thumbnails'
        ).then((imageUrl) => {
          if (imageUrl) {
            productVariantImagesData.push({
              productVariantNo,
              imageUrl,
            });
            console.log('Product variant image prepared...');
          }
        });
        imageUploadPromises.push(uploadPromise);
      }
    }

    // Wait for all image uploads to finish
    await Promise.all(imageUploadPromises);
    console.log('All images uploaded successfully...');

    // Bulk insert productVariants
    await prisma.productVariants.createMany({
      data: productVariantsData,
    });
    console.log('Product variants inserted successfully...');

    // Bulk insert productVariantSizes
    await prisma.productVariantSizes.createMany({
      data: productVariantSizesData,
    });
    console.log('Product variant sizes inserted successfully...');

    // Bulk insert productVariantMeasurements
    if (productVariantMeasurementsData.length > 0) {
      await prisma.productVariantMeasurements.createMany({
        data: productVariantMeasurementsData,
      });
      console.log('Product variant measurements inserted successfully...');
    }

    // Bulk insert productVariantImages
    if (productVariantImagesData.length > 0) {
      await prisma.productVariantImages.createMany({
        data: productVariantImagesData,
      });
      console.log('Product variant images inserted successfully...');
    }

    // Update the total quantity of the product
    // Calculate total quantity
    const productTotalQuantity = productVariantsData.reduce(
      (sum, variant) => sum + variant.totalQuantity,
      0
    );
    // Update the product's total quantity
    await prisma.products.update({
      where: { productNo },
      data: { totalQuantity: productTotalQuantity },
    });
    console.log('Product total quantity updated successfully...');
    console.log('Done. Product and its variants inserted successfully...');
    res.status(200).json({ message: 'Product inserted successfully.' });
  } catch (error) {
    console.error('Error inserting product:', error);
    res.status(500).json({ error: 'Error inserting product' });
  }
}

// Helper functions remain the same

// Helper function to get the type ID by type name
async function getTypeIdByName(typeName, shopNo) {
  try {
    const typeRecord = await prisma.type.findFirst({
      where: {
        name: typeName,
        shopNo: shopNo,
      },
    });

    return typeRecord?.id || null;
  } catch (error) {
    console.error(`Error fetching type ID for type: ${typeName}, shopNo: ${shopNo}`, error);
    return null;
  }
}

// Helper function to get the category ID by category name
async function getCategoryIdByName(categoryName, shopNo) {
  try {
    const categoryRecord = await prisma.category.findFirst({
      where: {
        name: categoryName,
        shopNo: shopNo,
      },
    });

    return categoryRecord?.id || null;
  } catch (error) {
    console.error(`Error fetching category ID for category: ${categoryName}, shopNo: ${shopNo}`, error);
    return null;
  }
}

// Helper function to get the tag ID by tag name
async function getTagIdByName(tagName, shopNo) {
  try {
    const tagRecord = await prisma.tags.findFirst({
      where: {
        name: tagName,
        shopNo: shopNo,
      },
    });

    return tagRecord?.id || null;
  } catch (error) {
    console.error(`Error fetching tag ID for tag: ${tagName}, shopNo: ${shopNo}`, error);
    return null;
  }
}

// Helper function to count the number of variants in the parse form data
function countVariants(fields) {
  let maxVariantIndex = -1;

  for (const key in fields) {
    const match = key.match(/^variants\[(\d+)\]/);
    if (match) {
      const index = parseInt(match[1], 10);
      if (index > maxVariantIndex) {
        maxVariantIndex = index;
      }
    }
  }

  return maxVariantIndex + 1;
}

// Helper function to get the color ID by color name
async function getColorIdByName(colorName, shopNo) {
  const color = await prisma.colors.findFirst({
    where: { name: colorName, shopNo },
    select: { id: true },
  });
  return color?.id || null;
}

// Helper function to get the size ID by size abbreviation
async function getSizeIdByAbbreviation(abbreviation, shopNo) {
  const size = await prisma.sizes.findFirst({
    where: { abbreviation, shopNo },
    select: { id: true },
  });
  return size?.id || null;
}

async function getMeasurementIdByName(measurementName, shopNo) {
  const measurement = await prisma.measurements.findFirst({
    where: { name: measurementName, shopNo },
    select: { id: true },
  });
  return measurement?.id || null;
}

async function getUnitIdByName(unitName, shopNo) {
  const unit = await prisma.units.findFirst({
    where: { name: unitName, shopNo },
    select: { id: true },
  });
  return unit?.id || null;
}
