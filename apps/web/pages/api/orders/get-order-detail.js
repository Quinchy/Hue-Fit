// pages/api/orders/get-order-detail.js

import prisma from "@/utils/helpers"; // Ensure this imports your Prisma client instance

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
              select: {
                firstName: true,
                lastName: true,
                profilePicture: true,
              },
            },
            AdminProfile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            // Include customer addresses (an array)
            CustomerAddress: true,
          },
        },
        Shop: {
          select: {
            name: true,
            // Retrieve the global delivery fee (should be 1 record)
            DeliveryFee: { take: 1 },
          },
        },
        OrderItems: {
          select: {
            id: true,
            quantity: true,
            Product: {
              select: {
                name: true,
              },
            },
            ProductVariant: {
              select: {
                price: true,
                Color: { select: { name: true } },
                Product: { select: { name: true } },
                ProductVariantImage: { take: 1, select: { imageURL: true } },
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

    // Compute user name from CustomerProfile or AdminProfile.
    let userName = "Unknown User";
    if (order.User?.CustomerProfile) {
      userName = `${order.User.CustomerProfile.firstName} ${order.User.CustomerProfile.lastName}`;
    } else if (order.User?.AdminProfile) {
      userName = `${order.User.AdminProfile.firstName} ${order.User.AdminProfile.lastName}`;
    }

    // Determine the profile picture.
    let userProfilePicture = "/images/profile-picture.png";
    if (order.User?.CustomerProfile && order.User.CustomerProfile.profilePicture) {
      userProfilePicture = order.User.CustomerProfile.profilePicture;
    }

    // Get the primary customer address (if available)
    const primaryAddress =
      order.User.CustomerAddress && order.User.CustomerAddress.length > 0
        ? order.User.CustomerAddress[0]
        : null;

    // Modify the response to include the computed name, profile picture, and primary address.
    const responseData = {
      ...order,
      User: {
        ...order.User,
        name: userName,
        profilePicture: userProfilePicture,
        address: primaryAddress, // Add the primary address here
      },
    };

    return res.status(200).json({ order: responseData });
  } catch (error) {
    console.error("Error fetching order details:", error);
    return res.status(500).json({ error: "An error occurred while fetching the order details" });
  }
}
