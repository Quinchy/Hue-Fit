import prisma from '@/utils/helpers';

export default async function handler(req, res) {
  const { requestNo } = req.query;

  try {
    // Fetch the partnership request with related shop, address, google map data, business licenses, and shop owner (via Users)
    const request = await prisma.partnershipRequests.findUnique({
      where: { requestNo },
      include: {
        Shop: {
          select: {
            shopNo: true,
            name: true,
            contactNo: true,
            status: true,
            addressId: true,
            Address: {
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
                    placeName: true,
                  },
                },
              },
            },
            BusinessLicenses: {
              select: {
                licenseUrl: true, // Select the license URLs associated with the shop
              },
            },
            Owner: {  // Fetch the owner from Users
              select: {
                id: true, // Get the userId to query VendorProfile
                userNo: true,  // Use the userNo to link the shop with the owner
                username: true,
              },
            },
          },
        },
      },
    });
    // Fetch the VendorProfile details using the userId from the Owner relation
    const ownerProfile = request.Shop.Owner ? await prisma.vendorProfile.findUnique({
      where: { userId: request.Shop.Owner.id }, // Use the userId from Shop's Owner to query VendorProfile
      select: {
        firstName: true,
        lastName: true,
        contactNo: true,
        email: true,
        position: true,
      },
    }) : null;

    // Format the response data
    const formattedRequest = {
      ...request,
      shopName: request.Shop.name,
      shopContactNo: request.Shop.contactNo,
      shopStatus: request.Shop.status,
      buildingNo: request.Shop.Address.buildingNo,
      street: request.Shop.Address.street,
      barangay: request.Shop.Address.barangay,
      municipality: request.Shop.Address.municipality,
      province: request.Shop.Address.province,
      postalNumber: request.Shop.Address.postalCode,
      latitude: request.Shop.Address.GoogleMapLocation ? request.Shop.Address.GoogleMapLocation.latitude : 'N/A',
      longitude: request.Shop.Address.GoogleMapLocation ? request.Shop.Address.GoogleMapLocation.longitude : 'N/A',
      googleMapPlaceName: request.Shop.Address.GoogleMapLocation ? request.Shop.Address.GoogleMapLocation.placeName : 'N/A',
      // Include business licenses as an array of URLs
      businessLicense: request.Shop.BusinessLicenses ? request.Shop.BusinessLicenses.map((license) => license.licenseUrl) : [],
      // Add owner details from VendorProfile
      contactPerson: ownerProfile ? {
        firstName: ownerProfile.firstName,
        lastName: ownerProfile.lastName,
        contactNo: ownerProfile.contactNo,
        email: ownerProfile.email,
        position: ownerProfile.position,
      } : null,
    };
    // Send the response
    res.status(200).json(formattedRequest);

  } 
  catch (error) {
    console.error("Error fetching shop request:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
