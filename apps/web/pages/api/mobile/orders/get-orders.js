// pages/api/mobile/orders/get-orders.js
import prisma from "@/utils/helpers";

export const config = {
  api: {
    bodyParser: true,
    externalResolver: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { userId } = req.body;
  console.log("userId", userId);
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId: Number(userId) },
      include: {
        OrderItems: {
          include: {
            Product: true,
            ProductVariant: {
              include: {
                Color: true,
              },
            },
            ProductVariantSize: {
              include: {
                Size: true,
              },
            },
          },
        },
        // Include Shop and its DeliveryFee and basic info.
        Shop: {
          include: {
            DeliveryFee: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // Group orders by status.
    const groupedOrders = orders.reduce((acc, order) => {
      const status = order.status; // e.g., "PENDING", "PROCESSING", etc.
      if (!acc[status]) {
        acc[status] = [];
      }

      // Compute order total from each order item.
      let orderTotal = 0;
      const formattedOrderItems = order.OrderItems.map((item) => {
        const price = parseFloat(item.ProductVariant.price.toString());
        const itemTotal = price * item.quantity;
        orderTotal += itemTotal;
        return {
          productName: item.Product.name,
          productVariantColorName: item.ProductVariant.Color.name,
          productVariantPrice: price.toFixed(2),
          productVariantSizeName: item.ProductVariantSize.Size.name,
          quantity: item.quantity,
        };
      });

      // Determine the delivery fee from the shop's DeliveryFee array.
      let deliveryFee = 0;
      if (order.Shop && order.Shop.DeliveryFee && order.Shop.DeliveryFee.length > 0) {
        const fee = order.Shop.DeliveryFee[0]; // Use the first fee (only one per shop)
        if (fee.feeType === "FIXED") {
          deliveryFee = parseFloat(fee.feeAmount.toString());
        } else if (fee.feeType === "PERCENTAGE") {
          deliveryFee = orderTotal * (parseFloat(fee.feeAmount.toString()) / 100);
        }
      }
      const finalTotal = orderTotal + deliveryFee;

      acc[status].push({
        id: order.id,
        orderNo: order.orderNo,
        status: order.status,
        // Include shop info
        shopName: order.Shop ? order.Shop.name : "Unknown Shop",
        shopLogo: order.Shop ? order.Shop.logo : null,
        orderItems: formattedOrderItems,
        orderTotal: orderTotal.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        finalTotal: finalTotal.toFixed(2),
      });
      return acc;
    }, {});

    return res.status(200).json({ orders: groupedOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
}
