// getProductDetails.js

import prisma from '@/utils/helpers';

function orderSizes(sizes) {
  if (!Array.isArray(sizes)) return [];
  const sizeMap = new Map();
  const nextIds = new Set();
  sizes.forEach((size) => {
    sizeMap.set(size.id, size);
    if (size.nextId !== null) {
      nextIds.add(size.nextId);
    }
  });
  const startIds = sizes
    .map((size) => size.id)
    .filter((id) => !nextIds.has(id));
  const orderedSizes = [];
  startIds.forEach((startId) => {
    let currentSize = sizeMap.get(startId);
    const visited = new Set();
    while (currentSize && !visited.has(currentSize.id)) {
      orderedSizes.push(currentSize);
      visited.add(currentSize.id);
      currentSize = sizeMap.get(currentSize.nextId);
    }
  });
  return orderedSizes;
}

const getProductDetails = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:8100");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required.' });
  }

  try {
    const parentProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        Shop: {
          select: { name: true, logo: true, id: true },
        },
        Type: {
          select: {
            id: true,
            name: true,
          },
        },
        Tag: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });    

    if (!parentProduct) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const allVariants = await prisma.productVariant.findMany({
      where: {
        productId,
        isArchived: false,
      },
      include: {
        Color: { select: { name: true, hexcode: true } },
        ProductVariantImage: { select: { imageURL: true } },
        ProductVariantSize: {
          include: {
            Size: {
              select: {
                id: true,
                name: true,
                abbreviation: true,
                nextId: true,
              },
            },
          },
        },
      },
      orderBy: { id: "asc" },
    });

    const measurements = await prisma.productMeasurement.findMany({
      where: { productId },
      include: {
        Measurement: { select: { name: true } },
        Size: { select: { name: true } },
      },
    });

    const measurementChart = measurements.reduce((acc, measurement) => {
      if (!acc[measurement.Size.name]) {
        acc[measurement.Size.name] = {};
      }
      acc[measurement.Size.name][measurement.Measurement.name] = `${measurement.value} ${measurement.unit}`;
      return acc;
    }, {});

    const sortedVariants = allVariants.map((variant) => {
      const unsortedSizes = variant.ProductVariantSize.map((sizeRelation) => ({
        productVariantSizeId: sizeRelation.id,
        id: sizeRelation.Size.id,
        name: sizeRelation.Size.name,
        abbreviation: sizeRelation.Size.abbreviation,
        quantity: sizeRelation.quantity,
        nextId: sizeRelation.Size.nextId,
      }));
      return {
        ...variant,
        sizes: orderSizes(unsortedSizes),
      };
    });

    const response = {
      parentProduct: {
        id: parentProduct.id,
        name: parentProduct.name,
        description: parentProduct.description,
        thumbnailURL: parentProduct.thumbnailURL,
        shop: {
          id: parentProduct.Shop.id,
          name: parentProduct.Shop.name,
          logo: parentProduct.Shop.logo,
        },
        typeName: parentProduct.Type?.name || null,
        tagName: parentProduct.Tag?.name || null,
      },
      measurementChart,
      allVariants: sortedVariants.map((variant) => ({
        id: variant.id,
        productVariantNo: variant.productVariantNo,
        color: {
          name: variant.Color?.name || 'Unknown Color',
          hexcode: variant.Color?.hexcode || '#000000',
        },
        price: variant.price,
        totalQuantity: variant.totalQuantity,
        pngClotheURL: variant.pngClotheURL,
        sizes: variant.sizes.map(size => ({
          productVariantSizeId: size.productVariantSizeId,
          id: size.id,
          name: size.name,
          abbreviation: size.abbreviation,
          quantity: size.quantity,
          nextId: size.nextId,
        })),
        images: variant.ProductVariantImage.map((img) => img.imageURL),
      })),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export default getProductDetails;
