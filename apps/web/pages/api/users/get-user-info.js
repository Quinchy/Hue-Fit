// File: pages/api/users/get-user-info.js
import prisma, { disconnectPrisma } from "@/utils/helpers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let userNo = req.query.userNo;
    if (!userNo) {
      const session = await getServerSession(req, res, authOptions);
      if (!session || !session.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      userNo = session.user.userNo;
    }

    const user = await prisma.user.findUnique({
      where: { userNo },
      include: {
        Role: true,
        AdminProfile: true,
        VendorProfile: {
          include: {
            Shop: {
              select: {
                shopNo: true,
                name: true,
                status: true,
                contactNo: true,
                email: true,
              },
            },
          },
        },
        CustomerProfile: true,
        CustomerFeature: true,
        CustomerAddress: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Base response with general information always returned
    const baseResponse = {
      userNo: user.userNo,
      username: user.username,
      role: user.Role?.name || "UNKNOWN",
    };

    // Return role-specific data without overriding empty or falsey values
    if (user.Role?.name === "ADMIN") {
      return res.status(200).json({
        ...baseResponse,
        profilePicture: user.AdminProfile?.profilePicture,
        firstName: user.AdminProfile?.firstName,
        lastName: user.AdminProfile?.lastName,
        email: user.AdminProfile?.email,
        contactNo: user.AdminProfile?.contactNo,
      });
    } else if (user.Role?.name === "VENDOR") {
      return res.status(200).json({
        ...baseResponse,
        firstName: user.VendorProfile?.firstName,
        lastName: user.VendorProfile?.lastName,
        profilePicture: user.VendorProfile?.profilePicture,
        contactNo: user.VendorProfile?.contactNo,
        email: user.VendorProfile?.email,
        position: user.VendorProfile?.position,
        shop: user.VendorProfile?.Shop
          ? {
              shopNo: user.VendorProfile.Shop.shopNo,
              name: user.VendorProfile.Shop.name,
              status: user.VendorProfile.Shop.status,
              contactNo: user.VendorProfile.Shop.contactNo,
              email: user.VendorProfile.Shop.email,
            }
          : undefined,
      });
    } else if (user.Role?.name === "CUSTOMER") {
      return res.status(200).json({
        ...baseResponse,
        firstName: user.CustomerProfile?.firstName,
        lastName: user.CustomerProfile?.lastName,
        profilePicture: user.CustomerProfile?.profilePicture,
        email: user.CustomerProfile?.email,
        addresses: user.CustomerAddress.map((addr) => ({
          buildingNo: addr.buildingNo,
          street: addr.street,
          barangay: addr.barangay,
          municipality: addr.municipality,
          province: addr.province,
          postalCode: addr.postalCode,
        })),
        features: user.CustomerFeature.map((feat) => ({
          height: feat.height,
          weight: feat.weight,
          age: feat.age,
          skintone: feat.skintone,
          bodyShape: feat.bodyShape,
        })),
      });
    } else {
      return res.status(200).json(baseResponse);
    }
  } catch (error) {
    console.error("Error fetching user info:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await disconnectPrisma();
  }
}
