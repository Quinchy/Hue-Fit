// 4) pages/api/shop-requests/get-shop-requests.js
import prisma, { disconnectPrisma } from "@/utils/helpers";

export default async function handler(req, res) {
  const { page = 1, perPage = 7, status = "PENDING", search = "" } = req.query;

  try {
    const whereClause = { status };
    if (status === "ALL") {
      delete whereClause.status;
    }

    if (search) {
      whereClause.OR = [
        { requestNo: { contains: search, mode: "insensitive" } },
        {
          Shop: {
            name: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    const totalRequests = await prisma.partnershipRequest.count({
      where: whereClause,
    });

    const totalPages = totalRequests === 0 ? 1 : Math.ceil(totalRequests / perPage);
    const currentPage = Math.max(1, Math.min(page, totalPages));

    const requestsData = await prisma.partnershipRequest.findMany({
      skip: (currentPage - 1) * perPage,
      take: parseInt(perPage),
      where: whereClause,
      include: {
        Shop: {
          select: {
            name: true,
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

    const formattedRequests = requestsData.map((req) => {
      const address = req.Shop?.ShopAddress
        ? `${req.Shop.ShopAddress.buildingNo || ""} ${req.Shop.ShopAddress.street || ""}, ${req.Shop.ShopAddress.barangay || ""}, ${req.Shop.ShopAddress.municipality || ""}, ${req.Shop.ShopAddress.province || ""}`
        : "No Address Provided";

      return {
        requestNo: req.requestNo,
        shopName: req.Shop?.name || "Unknown Shop",
        address: address.trim(),
        status: req.status,
      };
    });

    res.status(200).json({
      requests: formattedRequests,
      totalPages,
      currentPage,
    });
  } catch (error) {
    console.error("Error fetching shop requests:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await disconnectPrisma();
  }
}
