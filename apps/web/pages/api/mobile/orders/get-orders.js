import prisma from "@/utils/helpers";

// Disable any automatic authentication middleware from Next‑Auth
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
      },
      orderBy: { created_at: "desc" },
    });

    // Group orders by status. Valid statuses are:
    // "PROCESSING", "PACKAGING", "DELIVERING", "RESERVED"
    const groupedOrders = orders.reduce((acc, order) => {
      const status = order.status; // e.g., "PROCESSING", "PACKAGING", "DELIVERING", "RESERVED"
      if (!acc[status]) {
        acc[status] = [];
      }
      const formattedOrderItems = order.OrderItems.map((item) => ({
        productName: item.Product.name,
        productVariantColorName: item.ProductVariant.Color.name,
        // Convert price to string if needed (or adjust formatting as desired)
        productVariantPrice: item.ProductVariant.price.toString(),
        productVariantSizeName: item.ProductVariantSize.Size.name,
        quantity: item.quantity,
      }));
      acc[status].push({
        id: order.id,
        orderNo: order.orderNo,
        status: order.status,
        orderItems: formattedOrderItems,
      });
      return acc;
    }, {});

    return res.status(200).json({ orders: groupedOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
}
