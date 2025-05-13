// File: /pages/api/mobile/cart/update-cart-item-quantity.js
import prisma from "@/utils/helpers";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:8100");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { cartItemId, quantity } = req.body;
  if (!cartItemId || quantity < 1) {
    return res
      .status(400)
      .json({ message: "Invalid cart item ID or quantity" });
  }

  try {
    // 1. Fetch the cart item to get its productVariantSizeId
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: Number(cartItemId) },
      select: { productVariantSizeId: true },
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    // 2. Fetch the current stock for that variant size
    const variantSize = await prisma.productVariantSize.findUnique({
      where: { id: cartItem.productVariantSizeId },
      select: { quantity: true },
    });

    if (!variantSize) {
      return res
        .status(404)
        .json({ message: "Product variant size not found" });
    }

    // 3. Compute remaining stock if we apply the new cart quantity
    const remainingStock = variantSize.quantity - Number(quantity);
    if (remainingStock < 5) {
      return res
        .status(400)
        .json({ message: "Amount exceeded to current stock!" });
    }

    // 4. Safe to update
    const updatedItem = await prisma.cartItem.update({
      where: { id: Number(cartItemId) },
      data: { quantity: Number(quantity) },
    });

    return res.status(200).json({ success: true, item: updatedItem });
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    return res
      .status(500)
      .json({ message: "Failed to update cart item quantity" });
  }
}
