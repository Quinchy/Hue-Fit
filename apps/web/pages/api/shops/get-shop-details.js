import prisma from '@/utils/helpers';

export default async function handler(req, res) {
  const { shopNo } = req.query;

  if (!shopNo) {
    return res.status(400).json({ message: "Shop number (shopNo) is required." });
  }

  try {
    // Fetch the shop's details including its address, licenses, and owner details.
    const shop = await prisma.shop.findUnique({
      where: { shopNo },
      include: {
        ShopAddress: {
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
                name: true, // Use 'name' as defined in the schema
              },
            },
          },
        },
        BusinessLicense: { // Relation defined in the schema as ShopBusinessLicense[]
          select: {
            licenseUrl: true,
          },
        },
        Owner: {
          select: {
            userNo: true,
            username: true,
            VendorProfile: {
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

    // Format the response data for the frontend.
    const formattedShop = {
      shopNo: shop.shopNo,
      name: shop.name,
      contactNo: shop.contactNo,
      status: shop.status,
      description: shop.description,
      logo: shop.logo, // Include logo for image rendering
      address: shop.ShopAddress
        ? `${shop.ShopAddress.buildingNo || ''} ${shop.ShopAddress.street || ''}, ${shop.ShopAddress.barangay || ''}, ${shop.ShopAddress.municipality || ''}, ${shop.ShopAddress.province || ''}, ${shop.ShopAddress.postalCode || ''}`
        : "No Address Provided",
      latitude: shop.ShopAddress?.GoogleMapLocation?.latitude ?? 'N/A',
      longitude: shop.ShopAddress?.GoogleMapLocation?.longitude ?? 'N/A',
      googleMapPlaceName: shop.ShopAddress?.GoogleMapLocation?.name ?? 'N/A', // Correct field name
      businessLicenses: shop.BusinessLicense.map((license) => license.licenseUrl), // Plural to match client code
      contactPerson: shop.Owner?.VendorProfile
        ? {
            firstName: shop.Owner.VendorProfile.firstName,
            lastName: shop.Owner.VendorProfile.lastName,
            contactNo: shop.Owner.VendorProfile.contactNo,
            email: shop.Owner.VendorProfile.email,
            position: shop.Owner.VendorProfile.position,
          }
        : null,
    };

    res.status(200).json(formattedShop);
  } catch (error) {
    console.error("Error fetching shop details:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
