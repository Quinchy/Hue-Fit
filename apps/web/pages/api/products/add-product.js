import prisma, { getSessionShopNo, uploadFileToSupabase, parseFormData } from '@/utils/helpers'; // Import the helper function
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
    // Get shopNo from session, will be used for multiple table
    const shopNo = await getSessionShopNo(req, res); 
    const productNo = uuidv4();
    console.log('2. ProductNo: ', productNo);
    // Parse form data to be used in the multiple datas of tables
    const { fields, files } = await parseFormData(req);

    // Start of Database Logic of Adding Product and its variants
    // Part 1: Insert Product Data
    const name = fields.name[0];
    const description = fields.description[0];
    const type = fields.type[0];
    const category = fields.category[0];
    const typeId = await getTypeIdByName(type, shopNo);
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
        thumbnailURL,
        totalQuantity,
        shopNo,
      },
    });
    console.log('Product inserted successfully...');

    // Part 2: Insert Product Variants, Sizes, Specific Measurement and Images
    const variantCount = countVariants(fields);
    // Insert the product variant into the database
    for (let i = 0; i < variantCount; i++) {
      const productVariantNo = uuidv4();
      console.log('ProductVariantNo:', productVariantNo);
      const colorName = fields[`variants[${i}][color]`]?.[0];
      const price = Number(parseFloat(fields[`variants[${i}][price]`]).toFixed(2));
      let totalVariantQuantity = 0;

      // Get all sizes for the current variant
      const sizeKeys = Object.keys(fields).filter((key) =>
        key.startsWith(`variants[${i}][sizes]`)
      );
      // Get all quantities for the current variant
      const quantityKeys = Object.keys(fields).filter((key) =>
        key.startsWith(`variants[${i}][quantities]`)
      );

      sizeKeys.forEach((sizeKey, index) => {
        const quantityKey = quantityKeys[index];
        const quantity = parseInt(fields[quantityKey], 10);
        totalVariantQuantity += quantity;
      });
      const colorId = await getColorIdByName(colorName, shopNo);
      console.log('ColorId:', colorId);

      await prisma.productVariants.create({
        data: {
          productVariantNo,
          productNo,
          colorId,
          price,
          totalQuantity: totalVariantQuantity,
        },
      });
      console.log('Product variant inserted successfully...');

      // Insert sizes and quantities for the product variant
      for (let index = 0; index < sizeKeys.length; index++) {
        const sizeKey = sizeKeys[index];
        const sizeAbbreviation = String(fields[sizeKey][0]);
        const sizeId = await getSizeIdByAbbreviation(sizeAbbreviation, shopNo);
        const quantityKey = quantityKeys[index];
        const quantity = parseInt(fields[quantityKey], 10);
        const productVariantSizesNo = uuidv4();

        await prisma.productVariantSizes.create({
          data: {
            productVariantSizesNo,
            productVariantNo,
            sizeId,
            quantity,
          },
        });
        console.log('Sizes and quantities inserted successfully...');

        // Insert specific measurements for the product variant
        const measurementsForSize = fields.measurementsBySize[sizeAbbreviation];

        if (measurementsForSize && measurementsForSize.measurements) {
          for (const measurement of measurementsForSize.measurements) {
            const { measurementName, value, unitName } = measurement;

            const measurementId = await getMeasurementIdByName(measurementName, shopNo);
            const unitId = await getUnitIdByName(unitName, shopNo);

            await prisma.productVariantMeasurements.create({
              data: {
                productVariantNo,
                productVariantSizesNo,
                measurementId,
                value: parseFloat(value),
                unitId,
              },
            });
          }
          console.log('Specific measurements inserted successfully...');
        }
      }
      console.log('Sizes and quantities + specific measurements inserted successfully...');

      // Insert images for the product variant
      const imageKeys = Object.keys(files).filter((key) =>
        key.startsWith(`variants[${i}][images]`)
      );
      for (const imageKey of imageKeys) {
        const imageFile = files[imageKey][0];
        const imageUrl = await uploadFileToSupabase(
          imageFile,
          imageFile.filepath,
          imageFile.originalFilename,
          productVariantNo,
          'products/product-variant-thumbnails'
        );

        if (imageUrl) {
          await prisma.productVariantImages.create({
            data: {
              productVariantNo,
              imageUrl,
            },
          });
          console.log('Product variants images inserted successfully...');
        }
      }
    }
    // Update the total quantity of the product
    // Fetch all product variants via productNo
    const productVariants = await prisma.productVariants.findMany({
      where: { productNo },
      select: { totalQuantity: true },
    });
    // Calculate total quantity
    const productTotalQuantity = productVariants.reduce(
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
  } 
  catch (error) {
    console.error('Error inserting product:', error);
    res.status(500).json({ error: 'Error inserting product' });
  }
}

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
    select: { id: true }
  });
  return size?.id || null;
}

async function getMeasurementIdByName(measurementName, shopNo) {
  const measurement = await prisma.measurements.findFirst({ 
    where: { name: measurementName, shopNo }, 
    select: { id: true }
  });
  return measurement?.id || null;
}

async function getUnitIdByName(unitName, shopNo) {
  const unit = await prisma.units.findFirst({ 
    where: { name: unitName, shopNo }, 
    select: { id: true }
  });
  return unit?.id || null;
}