// pages/api/products/get-product.js
import { getSessionShopId } from '@/utils/helpers';
import prisma from '@/utils/helpers';

export default async function handler(req, res) {
  try {
    const shopId = await getSessionShopId(req, res);
    if (!shopId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { page = 1, search = '', type = '' } = req.query;
    const pageNumber = parseInt(page, 10);
    const ITEMS_PER_PAGE = 10;

    const baseWhere = {
      shopId,
      ...(type && { Type: { name: type } }),
    };

    const searchWhere = search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              productNo: {
                contains: search,
                mode: 'insensitive',
              },
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
        ProductVariant: {
          include: {
            ProductVariantSize: true,
          },
        },
      },
    });

    const totalCount = await prisma.product.count({
      where: combinedWhere,
    });

    const types = await prisma.type.findMany({
      where: { shopId },
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
    console.error('Error fetching products:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
