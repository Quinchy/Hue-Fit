import prisma from '@/utils/helpers';

export default async function handler(req, res) {
  const { shopNo } = req.query;

  if (!shopNo) {
    return res.status(400).json({ message: "Shop number (shopNo) is required." });
  }

  try {
    // Fetch the shop's details based on shopNo, including address, owner, and licenses
    const shop = await prisma.shops.findUnique({
      where: { shopNo },
      include: {
        Address: {
          select: {
            buildingNo: true,
            street: true,
            barangay: true,
            municipality: true,
            province: true,
            postalCode: true,
            GoogleMapLocation: {
              select: {
                latitude: true,
                longitude: true,
                placeName: true,
              },
            },
          },
        },
        BusinessLicenses: {
          select: {
            licenseUrl: true,
          },
        },
        Owner: {
          select: {
            userNo: true,
            username: true,
            VendorProfiles: {
              select: {
                firstName: true,
                lastName: true,
                contactNo: true,
                email: true,
                position: true,
              },
            },
          },
        },
      },
    });

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    // Format the response data for frontend use
    const formattedShop = {
      shopNo: shop.shopNo,
      name: shop.name,
      contactNo: shop.contactNo,
      status: shop.status,
      description: shop.description,
      address: shop.Address
        ? `${shop.Address.buildingNo || ''} ${shop.Address.street || ''}, ${shop.Address.barangay || ''}, ${shop.Address.municipality || ''}, ${shop.Address.province || ''}, ${shop.Address.postalCode || ''}`
        : "No Address Provided",
      latitude: shop.Address?.GoogleMapLocation?.latitude || 'N/A',
      longitude: shop.Address?.GoogleMapLocation?.longitude || 'N/A',
      googleMapPlaceName: shop.Address?.GoogleMapLocation?.placeName || 'N/A',
      businessLicenses: shop.BusinessLicenses.map((license) => license.licenseUrl),
      contactPerson: shop.Owner?.VendorProfiles
        ? {
            firstName: shop.Owner.VendorProfiles.firstName,
            lastName: shop.Owner.VendorProfiles.lastName,
            contactNo: shop.Owner.VendorProfiles.contactNo,
            email: shop.Owner.VendorProfiles.email,
            position: shop.Owner.VendorProfiles.position,
          }
        : null,
    };

    res.status(200).json(formattedShop);
  } catch (error) {
    console.error("Error fetching shop details:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
