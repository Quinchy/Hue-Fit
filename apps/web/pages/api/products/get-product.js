import { getSessionShopNo } from "/utils/helpers";
import prisma from "/utils/helpers";

export default async function handler(req, res) {
  try {
    const shopNo = await getSessionShopNo(req, res);
    console.log("Session ShopNo:", shopNo);
    if (!shopNo) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { page = 1, search = "" } = req.query;
    const pageNumber = parseInt(page);

    // Fetch products for this shopNo with pagination and search filter
    const products = await prisma.products.findMany({
      where: {
        shopNo: shopNo,
        name: {
          contains: search,   // Filter products by name (case-insensitive)
          mode: 'insensitive' // Case-insensitive search
        },
      },
      skip: (pageNumber - 1) * 7,  // Skip products based on the current page
      take: 7,                      // Limit to 7 products per page
      orderBy: {
        created_at: "desc",          // Ordering products by creation date (can be customized)
      },
      include: {
        Type: true,                  // Include product type
        Category: true,              // Include category data
      },
    });

    // Fetch total product count for pagination
    const totalCount = await prisma.products.count({
      where: {
        shopNo: shopNo,
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
    });

    const totalPages = Math.ceil(totalCount / 7);

    return res.status(200).json({
      products,
      currentPage: pageNumber,
      totalPages,
      totalCount,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
