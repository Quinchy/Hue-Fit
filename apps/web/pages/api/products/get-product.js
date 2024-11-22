// pages/api/products/get-product.js
import { getSessionShopNo } from "/utils/helpers";
import prisma from "/utils/helpers";

export default async function handler(req, res) {
  try {
    const shopNo = await getSessionShopNo(req, res);
    if (!shopNo) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { page = 1, search = "", type = "" } = req.query;
    const pageNumber = parseInt(page);

    // Fetch products for this shopNo with pagination, search filter, and type filter
    const products = await prisma.products.findMany({
      where: {
        shopNo: shopNo,
        name: {
          contains: search,
          mode: 'insensitive',
        },
        ...(type && { Type: { name: type } }),
      },
      skip: (pageNumber - 1) * 8,
      take: 8,
      orderBy: {
        created_at: "desc",
      },
      include: {
        Type: true,
        Category: true,
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
        ...(type && { Type: { name: type } }),
      },
    });

    // Fetch all types for the dropdown
    const types = await prisma.type.findMany({
      where: {
        shopNo: shopNo,
      },
      select: {
        name: true,
      },
    });

    const totalPages = Math.ceil(totalCount / 8);

    return res.status(200).json({
      products,
      currentPage: pageNumber,
      totalPages,
      totalCount,
      types,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
