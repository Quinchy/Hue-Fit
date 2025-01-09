import { getSessionShopId } from "@/utils/helpers";
import prisma from "/utils/helpers";

export default async function handler(req, res) {
  try {
    // Retrieve the shop number from the session
    const shopId = await getSessionShopId(req, res);
    if (!shopId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Extract query parameters with default values
    const { page = 1, perPage = 8, search = "", status = "" } = req.query;
    const pageNumber = parseInt(page);
    const perPageNumber = parseInt(perPage);
    const skip = (pageNumber - 1) * perPageNumber;

    // Define filters based on search and status
    const whereConditions = {
      shopId: shopId,
      ...(search && {
        orderNo: {
          contains: search,
          mode: "insensitive",
        },
      }),
      ...(status && {
        status: {
          equals: status,
        },
      }),
    };

    // Fetch orders with pagination and filtering
    const orders = await prisma.order.findMany({
      where: whereConditions,
      skip: skip,
      take: perPageNumber,
      orderBy: {
        created_at: "desc", // Sort by the creation date in descending order
      },
      select: {
        id: true,
        orderNo: true,
        quantity: true,
        status: true,
        created_at: true,
        updated_at: true,
        ProductVariant: {
          select: {
            productVariantNo: true,
            Product: {
              select: {
                name: true,
              },
            },
            price: true,
          },
        },
        Size: {
          select: {
            name: true,
          },
        },
      },
    });

    // Fetch total order count for pagination
    const totalCount = await prisma.order.count({
      where: whereConditions,
    });

    // Calculate total pages based on perPage
    const totalPages = Math.ceil(totalCount / perPageNumber);

    return res.status(200).json({
      orders,
      currentPage: pageNumber,
      totalPages,
      totalCount,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}