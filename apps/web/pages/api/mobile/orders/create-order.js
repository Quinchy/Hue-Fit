import prisma from "@/utils/helpers";

const createOrder = async (req, res) => {
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

  try {
    const { userId, selectedItemsToCheckout, paymentMethod } = req.body;
    const userIdInt =
      typeof userId === "string" ? parseInt(userId, 10) : userId;

    const notEnoughStock = [];
    const createdOrders = [];

    for (const shopGroup of selectedItemsToCheckout) {
      const shopIdInt = parseInt(shopGroup.shopId, 10);
      const orderItemsData = [];
      const cartItemsToRemove = [];
      const isReserveMode = paymentMethod === "RESERVED";

      for (const cartItemId of shopGroup.items) {
        const cartItemIdInt = parseInt(cartItemId, 10);
        const cartItem = await prisma.cartItem.findUnique({
          where: { id: cartItemIdInt },
        });
        if (!cartItem) continue;

        const sizeData = await prisma.productVariantSize.findUnique({
          where: { id: cartItem.productVariantSizeId },
          select: { quantity: true },
        });
        if (!sizeData) continue;

        const availableStock = sizeData.quantity;
        if (!isReserveMode) {
          if (availableStock > 5 && availableStock >= cartItem.quantity) {
            orderItemsData.push({
              productId: cartItem.productId,
              productVariantId: cartItem.productVariantId,
              productVariantSizeId: cartItem.productVariantSizeId,
              quantity: cartItem.quantity,
            });
            cartItemsToRemove.push(cartItemIdInt);
          } else {
            notEnoughStock.push(cartItemIdInt);
          }
        } else {
          orderItemsData.push({
            productId: cartItem.productId,
            productVariantId: cartItem.productVariantId,
            productVariantSizeId: cartItem.productVariantSizeId,
            quantity: cartItem.quantity,
          });
          cartItemsToRemove.push(cartItemIdInt);
        }
      }

      if (!orderItemsData.length) continue;

      const orderNo = `ORD-${Date.now()}-${shopIdInt}`;
      const status = isReserveMode ? "RESERVED" : "PENDING";

      const newOrder = await prisma.order.create({
        data: {
          orderNo,
          userId: userIdInt,
          shopId: shopIdInt,
          paymentMethod: isReserveMode ? "COD" : paymentMethod,
          status,
          OrderItems: {
            create: orderItemsData.map((item) => ({
              productId: item.productId,
              productVariantId: item.productVariantId,
              productVariantSizeId: item.productVariantSizeId,
              quantity: item.quantity,
            })),
          },
        },
        include: { OrderItems: true },
      });

      if (!isReserveMode) {
        for (const item of newOrder.OrderItems) {
          await prisma.productVariantSize.update({
            where: { id: item.productVariantSizeId },
            data: { quantity: { decrement: item.quantity } },
          });
          await prisma.productVariant.update({
            where: { id: item.productVariantId },
            data: { totalQuantity: { decrement: item.quantity } },
          });
          await prisma.product.update({
            where: { id: item.productId },
            data: { totalQuantity: { decrement: item.quantity } },
          });
        }
      }

      for (const cid of cartItemsToRemove) {
        await prisma.cartItem.delete({ where: { id: cid } });
      }

      for (const item of newOrder.OrderItems) {
        const pv = await prisma.productVariant.findUnique({
          where: { id: item.productVariantId },
          select: {
            price: true,
            pngClotheURL: true,
            Color: { select: { name: true } },
            Product: { select: { name: true } },
          },
        });
        if (pv) {
          const colorName = pv.Color?.name || "Unknown Color";
          const productName = pv.Product?.name || "Unknown Product";
          await prisma.notification.create({
            data: {
              title: isReserveMode ? "Product Reserve" : "Product Order",
              message: `${colorName} ${productName} has been ${
                isReserveMode ? "reserved" : "ordered"
              } with a quantity of ${item.quantity}.`,
              shopId: shopIdInt,
            },
          });
        }
      }

      createdOrders.push(newOrder);
    }

    return res.status(200).json({
      message: "Order(s) processed successfully",
      orders: createdOrders,
      notEnoughStock,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default createOrder;
