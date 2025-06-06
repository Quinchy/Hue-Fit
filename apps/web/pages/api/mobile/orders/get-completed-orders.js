import prisma from "@/utils/helpers";

export const config = {
  api: {
    bodyParser: true,
    externalResolver: true,
  },
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:8100");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ message: "Method not allowed. Use POST instead." });
  }

  const { userId } = req.body;
  console.log("userId", userId);
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: Number(userId),
        status: { in: ["COMPLETED", "CANCELLED"] },
      },
      include: {
        OrderItems: {
          include: {
            Product: true,
            ProductVariant: { include: { Color: true } },
            ProductVariantSize: { include: { Size: true } },
          },
        },
        Shop: { include: { DeliveryFee: true } },
      },
      orderBy: { created_at: "desc" },
    });

    const formattedOrders = orders.map((order) => {
      let orderTotal = 0;
      const formattedOrderItems = order.OrderItems.map((item) => {
        const price = parseFloat(item.ProductVariant.price.toString());
        const itemTotal = price * item.quantity;
        orderTotal += itemTotal;
        return {
          productName: item.Product.name,
          thumbnailURL: item.Product.thumbnailURL,
          productVariantColorName: item.ProductVariant.Color.name,
          productVariantPrice: price.toFixed(2),
          productVariantSizeName: item.ProductVariantSize.Size.name,
          quantity: item.quantity,
        };
      });

      let deliveryFee = 0;
      const fee = order.Shop?.DeliveryFee?.[0];
      if (fee) {
        if (fee.feeType === "FIXED") {
          deliveryFee = parseFloat(fee.feeAmount.toString());
        } else {
          deliveryFee =
            orderTotal * (parseFloat(fee.feeAmount.toString()) / 100);
        }
      }
      const finalTotal = orderTotal + deliveryFee;

      return {
        id: order.id,
        orderNo: order.orderNo,
        status: order.status,
        askingForCancel: order.askingForCancel,
        shopName: order.Shop?.name ?? "Unknown Shop",
        shopLogo: order.Shop?.logo ?? null,
        orderItems: formattedOrderItems,
        orderTotal: orderTotal.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        finalTotal: finalTotal.toFixed(2),
      };
    });

    return res.status(200).json({ orders: formattedOrders });
  } catch (error) {
    console.error("Error fetching completed orders:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch completed orders" });
  } finally {
    await prisma.$disconnect();
  }
}
