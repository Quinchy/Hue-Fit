import prisma from "@/utils/helpers";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    console.log("Method not allowed, only POST accepted.");
    return res
      .status(405)
      .json({ message: "Method not allowed. Use POST instead." });
  }

  const { productVariantId, increments } = req.body;
  console.log("Received increments:", increments);

  if (
    typeof productVariantId !== "number" ||
    typeof increments !== "object" ||
    increments === null
  ) {
    console.log("Invalid request data:", { productVariantId, increments });
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
    console.log("Found productVariant:", productVariant);

    if (!productVariant) {
      console.log("Product variant not found for id:", productVariantId);
      return res.status(404).json({ message: "Product variant not found." });
    }

    // Loop through each size update
    for (const [sizeAbbr, enteredIncrement] of Object.entries(increments)) {
      console.log(
        `Processing size: ${sizeAbbr}, entered increment: ${enteredIncrement}`
      );
      if (enteredIncrement > 0) {
        const pvs = productVariant.ProductVariantSize.find(
          (p) => p.Size.abbreviation === sizeAbbr
        );

        if (pvs) {
          const reservedQuantity = pvs.reservedQuantity || 0;
          // Calculate effective increment: extra stock beyond reserved.
          const effectiveIncrement = Math.max(
            0,
            enteredIncrement - reservedQuantity
          );
          console.log(
            `For size ${sizeAbbr}: reservedQuantity=${reservedQuantity}, effectiveIncrement=${effectiveIncrement}`
          );

          if (effectiveIncrement > 0) {
            console.log(
              `Updating ProductVariantSize (id: ${pvs.id}) with effective increment: ${effectiveIncrement}`
            );
            await prisma.productVariantSize.update({
              where: { id: pvs.id },
              data: {
                quantity: {
                  increment: effectiveIncrement,
                },
              },
            });
          } else {
            console.log(
              `Effective increment is 0 for size ${sizeAbbr} (entered equals reserved)`
            );
          }
        } else {
          console.log(
            `No ProductVariantSize record found for size abbreviation: ${sizeAbbr}`
          );
          if (enteredIncrement > 0) {
            const size = await prisma.size.findUnique({
              where: { abbreviation: sizeAbbr },
            });

            if (size) {
              console.log(
                `Creating new ProductVariantSize for size ${sizeAbbr} with quantity: ${enteredIncrement}`
              );
              await prisma.productVariantSize.create({
                data: {
                  productVariantId: productVariantId,
                  sizeId: size.id,
                  quantity: enteredIncrement,
                },
              });
            } else {
              console.log(
                `Size abbreviation "${sizeAbbr}" not found in sizes table.`
              );
              return res.status(400).json({
                message: `Size abbreviation "${sizeAbbr}" not found.`,
              });
            }
          }
        }
      }
    }

    // Recalculate totalQuantity for ProductVariant
    const updatedProductVariantSizes = await prisma.productVariantSize.findMany(
      {
        where: { productVariantId },
        select: { quantity: true },
      }
    );
    console.log("Updated ProductVariantSizes:", updatedProductVariantSizes);

    const newTotalQuantity = updatedProductVariantSizes.reduce(
      (acc, pvs) => acc + pvs.quantity,
      0
    );
    console.log("New total quantity for productVariant:", newTotalQuantity);

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
    console.log("All product variants for product:", allProductVariants);

    const newProductTotalQuantity = allProductVariants.reduce(
      (acc, pv) => acc + pv.totalQuantity,
      0
    );
    console.log("New total quantity for product:", newProductTotalQuantity);

    // Update Product's totalQuantity
    await prisma.product.update({
      where: { id: productVariant.productId },
      data: {
        totalQuantity: newProductTotalQuantity,
      },
    });

    // Build updatedSizes array for order update.
    // Update orders if a ProductVariantSize exists and either:
    // - The seller entered a positive increment, or
    // - The reserved quantity is greater than 0.
    const updatedSizes = [];
    for (const [sizeAbbr, enteredIncrement] of Object.entries(increments)) {
      const pvs = productVariant.ProductVariantSize.find(
        (p) => p.Size.abbreviation === sizeAbbr
      );
      if (pvs) {
        const reservedQuantity = pvs.reservedQuantity || 0;
        // Even if enteredIncrement is 0, if reservedQuantity > 0, we add this size for update.
        if (enteredIncrement > 0 || reservedQuantity > 0) {
          updatedSizes.push(pvs.id);
          console.log(
            `Size ${sizeAbbr} (id: ${pvs.id}) added for order status update (reservedQuantity: ${reservedQuantity}, enteredIncrement: ${enteredIncrement})`
          );
        }
      }
    }
    console.log("Final updatedSizes array:", updatedSizes);

    if (updatedSizes.length > 0) {
      const orderUpdateResult = await prisma.order.updateMany({
        where: {
          status: "RESERVED",
          OrderItems: {
            some: {
              productVariantSizeId: { in: updatedSizes },
            },
          },
        },
        data: {
          status: "PENDING",
        },
      });
      console.log("Order update result:", orderUpdateResult);
    }

    return res.status(200).json({ message: "Stock updated successfully." });
  } catch (error) {
    console.error("Error updating stock:", error);
    return res.status(500).json({ message: "Internal server error." });
  } finally {
    await prisma.$disconnect();
  }
}
