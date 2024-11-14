import prisma from '@/utils/helpers';

export default async function handler(req, res) {
  const { page = 1, perPage = 10, status = "PENDING" } = req.query;

  try {
    // Step 1: Calculate total requests and pages
    console.log("Fetching total requests count...");
    const totalRequests = await prisma.partnershipRequests.count();
    const totalPages = Math.ceil(totalRequests / perPage);

    console.log(`Total requests: ${totalRequests}, Total pages: ${totalPages}`);

    // Step 2: Fetch the requests with the associated shop and address data
    console.log("Fetching partnership requests with associated Shop and Address...");
    const requests = await prisma.partnershipRequests.findMany({
      skip: (page - 1) * perPage, // Pagination offset
      take: perPage, // Pagination limit
      where: { status },
      include: {
        Shop: {
          select: {
            shopNo: true,
            name: true,
            contactNo: true,
            addressId: true, // Fetch the related addressId
            Address: {
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

    console.log(`Fetched ${requests.length} requests`);

    // Step 3: Format the data for the table
    console.log("Formatting the requests data...");
    const formattedRequests = requests.map((request) => {
      console.log("Request:", request);

      // Safely access the Address properties, ensuring they exist
      const address = request.Shop.Address
        ? `${request.Shop.Address.buildingNo} ${request.Shop.Address.street}, ${request.Shop.Address.barangay}, ${request.Shop.Address.municipality}, ${request.Shop.Address.province}`
        : "No Address Provided"; // Fallback in case Address is not present

      return {
        requestNo: request.requestNo,
        shopName: request.Shop.name,
        shopContactNo: request.Shop.contactNo,
        address: address,
        status: request.status,
      };
    });

    console.log("Formatted requests data:", formattedRequests);

    // Step 4: Send response with formatted data
    console.log("Sending the formatted response...");
    res.status(200).json({
      requests: formattedRequests,
      totalPages: totalPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error fetching shop requests:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
