import prisma from '@/utils/helpers';

const createOrder = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, selectedItemsToCheckout, paymentMethod } = req.body;

    const userIdInt = typeof userId === 'string' ? parseInt(userId, 10) : userId;

    // We'll keep track of items that couldn't proceed (due to low stock)
    const notEnoughStock = [];
    const createdOrders = [];

    for (const shopGroup of selectedItemsToCheckout) {
      const shopIdInt = parseInt(shopGroup.shopId, 10);
      const orderItemsData = [];
      const cartItemsToRemove = [];
      const isReserveMode = paymentMethod === 'RESERVED';

      // Prepare all items within this shop group
      for (const cartItemId of shopGroup.items) {
        const cartItemIdInt = parseInt(cartItemId, 10);
        const cartItem = await prisma.cartItem.findUnique({
          where: { id: cartItemIdInt },
        });

        if (!cartItem) {
          continue;
        }

        // Check the productVariantSize stocks
        const sizeData = await prisma.productVariantSize.findUnique({
          where: { id: cartItem.productVariantSizeId },
          select: { quantity: true },
        });

        if (!sizeData) {
          // If no size data, skip
          continue;
        }

        const availableStock = sizeData.quantity;
        if (!isReserveMode) {
          // Standard order logic
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
          // If paymentMethod === 'RESERVED', we skip the stock decrement
          // and always proceed with "Reserved" status
          orderItemsData.push({
            productId: cartItem.productId,
            productVariantId: cartItem.productVariantId,
            productVariantSizeId: cartItem.productVariantSizeId,
            quantity: cartItem.quantity,
          });
          cartItemsToRemove.push(cartItemIdInt);
        }
      }

      // If no items to create, skip this shop group
      if (!orderItemsData.length) {
        continue;
      }

      // Generate an order number
      const orderNo = `ORD-${Date.now()}-${shopIdInt}`;

      // Determine status based on reserve mode
      const status = isReserveMode ? 'RESERVED' : 'PENDING';

      // Create the order + order items
      const newOrder = await prisma.order.create({
        data: {
          orderNo,
          userId: userIdInt,
          shopId: shopIdInt,
          paymentMethod: isReserveMode ? 'COD' : paymentMethod,
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
        include: {
          OrderItems: true,
        },
      });

      // If not reserved, decrement stock for the items that proceeded
      if (!isReserveMode) {
        for (const item of newOrder.OrderItems) {
          // Decrement the quantity on ProductVariantSize
          await prisma.productVariantSize.update({
            where: { id: item.productVariantSizeId },
            data: {
              quantity: { decrement: item.quantity },
            },
          });

          // Decrement the totalQuantity on the ProductVariant
          await prisma.productVariant.update({
            where: { id: item.productVariantId },
            data: {
              totalQuantity: { decrement: item.quantity },
            },
          });

          // Decrement the totalQuantity on the Product
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              totalQuantity: { decrement: item.quantity },
            },
          });
        }
      }

      // Remove cart items for those that succeeded
      for (const cid of cartItemsToRemove) {
        await prisma.cartItem.delete({ where: { id: cid } });
      }

      // Create notifications for each item in this order
      for (const item of newOrder.OrderItems) {
        const productVariant = await prisma.productVariant.findUnique({
          where: { id: item.productVariantId },
          select: {
            price: true,
            pngClotheURL: true,
            Color: { select: { name: true } },
            Product: { select: { name: true } },
          },
        });

        if (productVariant) {
          const colorName = productVariant.Color?.name || 'Unknown Color';
          const productName = productVariant.Product?.name || 'Unknown Product';
          await prisma.notification.create({
            data: {
              title: isReserveMode ? 'Product Reserve' : 'Product Order',
              message: `${colorName} ${productName} has been ${
                isReserveMode ? 'reserved' : 'ordered'
              } with a quantity of ${item.quantity}.`,
              shopId: shopIdInt,
            },
          });
        }
      }

      createdOrders.push(newOrder);
    }

    return res.status(200).json({
      message: 'Order(s) processed successfully',
      orders: createdOrders,
      notEnoughStock,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default createOrder;
