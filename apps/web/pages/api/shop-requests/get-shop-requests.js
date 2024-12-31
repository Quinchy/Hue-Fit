import prisma from '@/utils/helpers';

export default async function handler(req, res) {
  const { page = 1, perPage = 7, status = "PENDING" } = req.query;

  try {
    // Step 1: Calculate total requests matching the status
    const totalRequests = await prisma.partnershipRequest.count({
      where: { status },
    });

    // Step 2: Calculate total pages
    const totalPages = totalRequests === 0 ? 1 : Math.ceil(totalRequests / perPage);

    // Step 3: Ensure the page number is within valid bounds
    const currentPage = Math.max(1, Math.min(page, totalPages)); // Clamp page to valid range

    // Step 4: Fetch the requests with pagination and related data
    const requests = await prisma.partnershipRequest.findMany({
      skip: (currentPage - 1) * perPage, // Pagination offset
      take: perPage, // Pagination limit
      where: { status },
      include: {
        Shop: {
          select: {
            shopNo: true,
            name: true,
            contactNo: true,
            addressId: true, // Fetch the related addressId
            ShopAddress: {
              select: {
                buildingNo: true,
                street: true,
                barangay: true,
                municipality: true,
                province: true,
              },
            },
          },
        },
      },
    });

    // Step 5: Format the data for the response
    const formattedRequests = requests.map((request) => {
      const address = request.Shop?.ShopAddress
        ? `${request.Shop.ShopAddress.buildingNo || ''} ${request.Shop.ShopAddress.street || ''}, ${request.Shop.ShopAddress.barangay || ''}, ${request.Shop.ShopAddress.municipality || ''}, ${request.Shop.ShopAddress.province || ''}`
        : "No Address Provided";

      return {
        requestNo: request.requestNo,
        shopName: request.Shop?.name || "Unknown Shop",
        shopContactNo: request.Shop?.contactNo || "No Contact Info",
        address: address,
        status: request.status,
      };
    });

    // Step 6: Send the response
    res.status(200).json({
      requests: formattedRequests,
      totalPages: totalPages,
      currentPage: currentPage,
    });
  } catch (error) {
    console.error("Error fetching shop requests:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
