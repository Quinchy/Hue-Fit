// api/users/get-user-shop-info.js
import prisma, { getSessionUser, disconnectPrisma } from "@/utils/helpers";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const sessionUser = await getSessionUser(req, res);

    const shop = await prisma.shop.findFirst({
      where: { ownerUserId: sessionUser.id },
      include: {
        ShopAddress: true,
        ShopAddress: { include: { GoogleMapLocation: true } },
      },
    });

    if (!shop) {
      return res.status(404).json({ error: "Shop not found for the user." });
    }

    return res.status(200).json({
      shopNo: shop.shopNo,
      name: shop.name,
      logo: shop.logo,
      description: shop.description,
      contactNo: shop.contactNo,
      email: shop.email,
      status: shop.status,
      openingTime: shop.openingTime,
      closingTime: shop.closingTime,
      address: {
        buildingNo: shop.ShopAddress?.buildingNo || null,
        street: shop.ShopAddress?.street || null,
        barangay: shop.ShopAddress?.barangay,
        municipality: shop.ShopAddress?.municipality,
        province: shop.ShopAddress?.province,
        postalCode: shop.ShopAddress?.postalCode,
        googleMapLocation: {
          name: shop.ShopAddress?.GoogleMapLocation?.name || null,
          latitude: shop.ShopAddress?.GoogleMapLocation?.latitude || null,
          longitude: shop.ShopAddress?.GoogleMapLocation?.longitude || null,
        },
      },
    });
  } catch (err) {
    console.error("Error fetching shop information:", err);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await disconnectPrisma();
  }
}
