// Updated API: /api/shop-requests/get-manage-shop-request.js
import prisma from '@/utils/helpers';

export default async function handler(req, res) {
  const { requestNo } = req.query;

  try {
    const request = await prisma.partnershipRequest.findUnique({
      where: { requestNo },
      include: {
        Shop: {
          select: {
            shopNo: true,
            name: true,
            contactNo: true,
            status: true,
            addressId: true,
            openingTime: true,
            closingTime: true,
            logo: true,
            email: true,
            ShopAddress: {
              select: {
                buildingNo: true,
                street: true,
                barangay: true,
                municipality: true,
                province: true,
                postalCode: true,
                googleMapId: true,
                GoogleMapLocation: {
                  select: {
                    latitude: true,
                    longitude: true,
                    name: true,
                  },
                },
              },
            },
            BusinessLicense: {
              select: {
                licenseUrl: true,
              },
            },
            Owner: {
              select: {
                id: true,
                userNo: true,
                username: true,
              },
            },
          },
        },
      },
    });

    const ownerProfile = request.Shop.Owner ? await prisma.vendorProfile.findUnique({
      where: { userId: request.Shop.Owner.id },
      select: {
        firstName: true,
        lastName: true,
        contactNo: true,
        email: true,
        position: true,
      },
    }) : null;

    const formattedRequest = {
      ...request,
      shopName: request.Shop.name,
      shopContactNo: request.Shop.contactNo,
      shopStatus: request.Shop.status,
      buildingNo: request.Shop.ShopAddress.buildingNo,
      street: request.Shop.ShopAddress.street,
      barangay: request.Shop.ShopAddress.barangay,
      municipality: request.Shop.ShopAddress.municipality,
      province: request.Shop.ShopAddress.province,
      postalNumber: request.Shop.ShopAddress.postalCode,
      latitude: request.Shop.ShopAddress.GoogleMapLocation ? request.Shop.ShopAddress.GoogleMapLocation.latitude : 'N/A',
      longitude: request.Shop.ShopAddress.GoogleMapLocation ? request.Shop.ShopAddress.GoogleMapLocation.longitude : 'N/A',
      googleMapPlaceName: request.Shop.ShopAddress.GoogleMapLocation ? request.Shop.ShopAddress.GoogleMapLocation.name : 'N/A',
      businessLicense: request.Shop.BusinessLicense ? request.Shop.BusinessLicense.map((license) => license.licenseUrl) : [],
      openingTime: request.Shop.openingTime,
      closingTime: request.Shop.closingTime,
      shopLogo: request.Shop.logo,
      shopEmail: request.Shop.email,
      contactPerson: ownerProfile ? {
        firstName: ownerProfile.firstName,
        lastName: ownerProfile.lastName,
        contactNo: ownerProfile.contactNo,
        email: ownerProfile.email,
        position: ownerProfile.position,
      } : null,
    };

    res.status(200).json(formattedRequest);
  } 
  catch (error) {
    console.error("Error fetching shop request:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
