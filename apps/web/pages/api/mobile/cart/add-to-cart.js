import prisma from "@/utils/helpers";

const addToCart = async (req, res) => {
  // Allow calls from your Ionic app origin
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:8100");
  // Allow POST and preflight OPTIONS
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const {
    productId,
    productVariantId,
    productVariantSizeId,
    quantity,
    shopId,
    userId,
  } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const sizeExists = await prisma.productVariantSize.findUnique({
      where: { id: productVariantSizeId },
    });
    if (!sizeExists) {
      return res
        .status(400)
        .json({ message: "Invalid product variant size ID." });
    }

    let cart = await prisma.cart.findFirst({
      where: { userId },
      include: { CartItems: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { CartItems: true },
      });
    }

    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        productVariantId,
        productVariantSizeId,
      },
    });

    if (existingCartItem) {
      const updated = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
      });
      return res
        .status(200)
        .json({ message: "Cart item updated", cartItem: updated });
    } else {
      const created = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          shopId,
          productId,
          productVariantId,
          productVariantSizeId,
          quantity,
        },
      });
      return res
        .status(200)
        .json({ message: "Cart item added", cartItem: created });
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default addToCart;
