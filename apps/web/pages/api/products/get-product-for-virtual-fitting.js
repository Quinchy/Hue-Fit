// pages/api/products/get-product-for-virtual-fitting.js
import { getSessionShopId } from '@/utils/helpers';
import prisma from '@/utils/helpers';

export default async function handler(req, res) {
  try {
    const shopId = await getSessionShopId(req, res);
    if (!shopId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const allowedTypes = ["UPPERWEAR", "OUTERWEAR", "LOWERWEAR"];
    const { page = 1, search = '', type = '' } = req.query;
    const pageNumber = parseInt(page, 10);
    const ITEMS_PER_PAGE = 7;

    // Ensure type filter is within allowed types if provided
    const typeFilter = (type && allowedTypes.includes(type)) ? type : undefined;

    const baseWhere = {
      shopId: shopId,
      Type: { name: { in: allowedTypes } },
      ...(typeFilter && { Type: { name: typeFilter } }),
    };

    const searchWhere = search
      ? {
          OR: [
            {
              name: { contains: search, mode: 'insensitive' },
            },
            {
              productNo: { contains: search, mode: 'insensitive' },
            },
          ],
        }
      : {};

    const combinedWhere = {
      ...baseWhere,
      ...searchWhere,
    };

    const products = await prisma.product.findMany({
      where: combinedWhere,
      skip: (pageNumber - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      orderBy: { created_at: 'desc' },
      include: {
        Type: true,
        Category: true,
        // Include the Tag to access product.Tag.name
        Tag: true,
      },
    });

    const totalCount = await prisma.product.count({
      where: combinedWhere,
    });

    const types = await prisma.type.findMany({
      where: {
        shopId: shopId,
        name: { in: allowedTypes },
      },
      select: { name: true },
    });

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return res.status(200).json({
      products,
      currentPage: pageNumber,
      totalPages,
      totalCount,
      types,
    });
  } catch (error) {
    console.error('Error fetching products for virtual fitting:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
