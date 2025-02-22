import { getSessionShopId } from "@/utils/helpers";
import prisma from "/utils/helpers";

export default async function handler(req, res) {
  try {
    const shopId = await getSessionShopId(req, res);
    if (!shopId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { page = 1, perPage = 8, search = "", status = "" } = req.query;
    const pageNumber = parseInt(page);
    const perPageNumber = parseInt(perPage);
    const skip = (pageNumber - 1) * perPageNumber;

    const whereConditions = {
      shopId: shopId,
      status: {
        not: "RESERVED",
      },
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

    // Fetch orders with OrderItems
    let orders = await prisma.order.findMany({
      where: whereConditions,
      skip,
      take: perPageNumber,
      orderBy: {
        // This ordering is a fallback (e.g. by created date)
        created_at: "desc",
      },
      select: {
        id: true,
        orderNo: true,
        status: true,
        created_at: true,
        updated_at: true,
        OrderItems: {
          select: {
            id: true,
            quantity: true,
            ProductVariant: {
              select: {
                price: true,
                Color: {
                  select: { name: true },
                },
                Product: {
                  select: { name: true },
                },
              },
            },
            ProductVariantSize: {
              select: {
                Size: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });

    // Apply custom sorting based on status
    const orderPriority = {
      PENDING: 1,
      PROCESSING: 2,
      DELIVERING: 3,
      COMPLETED: 4,
      CANCELLED: 5,
    };

    orders.sort((a, b) => {
      const aPriority = orderPriority[a.status.toUpperCase()] || 99;
      const bPriority = orderPriority[b.status.toUpperCase()] || 99;
      return aPriority - bPriority;
    });

    const totalCount = await prisma.order.count({
      where: whereConditions,
    });
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
