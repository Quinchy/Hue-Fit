// pages/api/products/update-product-stocks.js

import prisma from '@/utils/helpers';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ message: "Method not allowed. Use POST instead." });
  }

  const { productVariantId, increments } = req.body;

  if (
    typeof productVariantId !== "number" ||
    typeof increments !== "object" ||
    increments === null
  ) {
    return res.status(400).json({ message: "Invalid request data." });
  }

  try {
    // Find the ProductVariant with related ProductVariantSize and Product
    const productVariant = await prisma.productVariant.findUnique({
      where: { id: productVariantId },
      include: {
        ProductVariantSize: {
          include: { Size: true },
        },
        Product: true,
      },
    });

    if (!productVariant) {
      return res.status(404).json({ message: "Product variant not found." });
    }

    // Update or create ProductVariantSize entries
    for (const [sizeAbbr, increment] of Object.entries(increments)) {
      if (increment > 0) {
        // Find the ProductVariantSize by size abbreviation
        const pvs = productVariant.ProductVariantSize.find(
          (p) => p.Size.abbreviation === sizeAbbr
        );

        if (pvs) {
          // Update existing ProductVariantSize
          await prisma.productVariantSize.update({
            where: { id: pvs.id },
            data: {
              quantity: {
                increment: increment,
              },
            },
          });
        } else {
          // Find Size by abbreviation
          const size = await prisma.size.findUnique({
            where: { abbreviation: sizeAbbr },
          });

          if (size) {
            // Create new ProductVariantSize
            await prisma.productVariantSize.create({
              data: {
                productVariantId: productVariantId,
                sizeId: size.id,
                quantity: increment,
              },
            });
          } else {
            return res.status(400).json({ message: `Size abbreviation "${sizeAbbr}" not found.` });
          }
        }
      }
    }

    // Recalculate totalQuantity for ProductVariant
    const updatedProductVariantSizes = await prisma.productVariantSize.findMany({
      where: { productVariantId },
      select: { quantity: true },
    });

    const newTotalQuantity = updatedProductVariantSizes.reduce(
      (acc, pvs) => acc + pvs.quantity,
      0
    );

    // Update ProductVariant's totalQuantity
    await prisma.productVariant.update({
      where: { id: productVariantId },
      data: {
        totalQuantity: newTotalQuantity,
      },
    });

    // Recalculate totalQuantity for Product
    const allProductVariants = await prisma.productVariant.findMany({
      where: { productId: productVariant.productId },
      select: { totalQuantity: true },
    });

    const newProductTotalQuantity = allProductVariants.reduce(
      (acc, pv) => acc + pv.totalQuantity,
      0
    );

    // Update Product's totalQuantity
    await prisma.product.update({
      where: { id: productVariant.productId },
      data: {
        totalQuantity: newProductTotalQuantity,
      },
    });

    return res.status(200).json({ message: "Stock updated successfully." });
  } catch (error) {
    console.error("Error updating stock:", error);
    return res.status(500).json({ message: "Internal server error." });
  } finally {
    await prisma.$disconnect();
  }
}
