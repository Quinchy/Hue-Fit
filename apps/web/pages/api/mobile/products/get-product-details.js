// File: src/pages/api/mobile/products/get-product-details.js
import prisma from "@/utils/helpers";

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

export default async function handler(req, res) {
  // 1) Always set CORS headers first
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:8100");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  // 2) Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // 3) Only accept POST from here
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ message: "Product ID is required." });
  }

  try {
    const parentProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        Shop: { select: { id: true, name: true, logo: true } },
        Type: { select: { id: true, name: true } },
        Tag: { select: { id: true, name: true } },
      },
    });

    if (!parentProduct) {
      return res.status(404).json({ message: "Product not found." });
    }

    const allVariants = await prisma.productVariant.findMany({
      where: { productId, isArchived: false },
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

    const measurementChart = measurements.reduce((acc, m) => {
      acc[m.Size.name] = acc[m.Size.name] || {};
      acc[m.Size.name][m.Measurement.name] = `${m.value} ${m.unit}`;
      return acc;
    }, {});

    const sortedVariants = allVariants.map((variant) => {
      const unsorted = variant.ProductVariantSize.map((rel) => ({
        productVariantSizeId: rel.id,
        id: rel.Size.id,
        name: rel.Size.name,
        abbreviation: rel.Size.abbreviation,
        quantity: rel.quantity,
        nextId: rel.Size.nextId,
      }));
      return {
        ...variant,
        sizes: orderSizes(unsorted),
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
      allVariants: sortedVariants.map((v) => ({
        id: v.id,
        productVariantNo: v.productVariantNo,
        color: {
          name: v.Color?.name || "Unknown Color",
          hexcode: v.Color?.hexcode || "#000000",
        },
        price: v.price,
        totalQuantity: v.totalQuantity,
        pngClotheURL: v.pngClotheURL,
        sizes: v.sizes.map((s) => ({
          productVariantSizeId: s.productVariantSizeId,
          id: s.id,
          name: s.name,
          abbreviation: s.abbreviation,
          quantity: s.quantity,
          nextId: s.nextId,
        })),
        images: v.ProductVariantImage.map((img) => img.imageURL),
      })),
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching product details:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}
