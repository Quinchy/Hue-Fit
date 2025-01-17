import prisma from "@/utils/helpers"; // Import your Prisma client

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderNo } = req.query;

  if (!orderNo) {
    return res.status(400).json({ error: "Order number is required" });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { orderNo: String(orderNo) },
      include: {
        User: {
          select: {
            CustomerProfile: {
              select: { firstName: true, lastName: true },
            },
            AdminProfile: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        Shop: {
          select: { name: true },
        },
        OrderItems: {
          select: {
            id: true,
            quantity: true,
            Product: { select: { name: true } },
            ProductVariant: {
              select: {
                price: true,
                Color: { select: { name: true } },
                Product: { select: { name: true } },
                ProductVariantImage: {
                  take: 1,
                  select: { imageURL: true },
                },
              },
            },
            ProductVariantSize: {
              select: {
                Size: { select: { name: true } },
              },
            },
          },
        },
        OrderHistory: {
          orderBy: { changed_at: "asc" },
          select: { status: true, changed_at: true },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    let userName = "Unknown User";
    if (order.User.CustomerProfile) {
      userName = `${order.User.CustomerProfile.firstName} ${order.User.CustomerProfile.lastName}`;
    } else if (order.User.AdminProfile) {
      userName = `${order.User.AdminProfile.firstName} ${order.User.AdminProfile.lastName}`;
    }

    const responseData = {
      ...order,
      User: {
        ...order.User,
        name: userName,
      },
    };

    return res.status(200).json({ order: responseData });
  } catch (error) {
    console.error("Error fetching order details:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching the order details" });
  }
}
