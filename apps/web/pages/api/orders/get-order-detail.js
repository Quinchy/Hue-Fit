// pages/api/orders/get-order-detail.js
import prisma from "@/utils/helpers"; // Import Prisma client

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderNo } = req.query;

  if (!orderNo) {
    return res.status(400).json({ error: "Order number is required" });
  }

  try {
    // Fetch the order details with related data (Product, Size, User, OrderHistories, and Image)
    const order = await prisma.orders.findUnique({
      where: { orderNo: String(orderNo) },
      include: {
        User: {
          select: {
            // Assuming the user's name is stored in CustomerProfiles or AdminProfiles
            CustomerProfile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            AdminProfile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        Shop: {
          select: {
            name: true,
          },
        },
        ProductVariant: {
          select: {
            price: true,
            Color: {
              select: {
                name: true,
              },
            },
            Product: {
              select: {
                name: true,
              },
            },
            ProductVariantImages: {
              take: 1, // Get only the first image for the product variant
              select: {
                imageUrl: true, // Assuming 'imageUrl' is the field for the image
              },
            },
          },
        },
        Size: {
          select: {
            name: true,
          },
        },
        OrderHistories: {
          orderBy: {
            changed_at: "asc",
          },
          select: {
            status: true,
            changed_at: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Combine the first and last name (either from CustomerProfile or AdminProfile)
    const userName = order.User.CustomerProfile
      ? `${order.User.CustomerProfile.firstName} ${order.User.CustomerProfile.lastName}`
      : order.User.AdminProfile
      ? `${order.User.AdminProfile.firstName} ${order.User.AdminProfile.lastName}`
      : "Unknown User";

    // Prepare the response with product variant image
    const productVariantImage = order.ProductVariant.ProductVariantImages[0]?.imageUrl || null;

    res.status(200).json({
      order: {
        ...order,
        User: {
          ...order.User,
          name: userName, // Adding the combined name to the response
        },
        ProductVariant: {
          ...order.ProductVariant,
          imageUrl: productVariantImage, // Add the image URL to the response
        },
      },
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ error: "An error occurred while fetching the order details" });
  }
}
