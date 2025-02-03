// File: pages/api/dashboard/get-vendor-infos.js
import prisma from '@/utils/helpers';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Retrieve and validate the shopId from the query parameters
  const { shopId } = req.query;
  if (!shopId) {
    res.status(400).json({ error: 'shopId is required' });
    return;
  }

  const parsedShopId = parseInt(shopId, 10);
  if (isNaN(parsedShopId)) {
    res.status(400).json({ error: 'Invalid shopId' });
    return;
  }

  try {
    // Execute all the queries concurrently
    const [
      productCount,
      productVariantCount,
      orderCount,
      orderItemCount,
      notifications,
      types,
      typeCountsRaw,
    ] = await Promise.all([
      // Count products filtered by shop id
      prisma.product.count({
        where: { shopId: parsedShopId },
      }),
      // Count product variants by filtering on the related product's shop id
      prisma.productVariant.count({
        where: { Product: { shopId: parsedShopId } },
      }),
      // Count orders filtered by shop id
      prisma.order.count({
        where: { shopId: parsedShopId },
      }),
      // Count order items by filtering on the related order's shop id
      prisma.orderItem.count({
        where: { Order: { shopId: parsedShopId } },
      }),
      // Fetch notifications where shopId matches and userId is null
      prisma.notification.findMany({
        where: {
          shopId: parsedShopId,
          userId: null,
        },
      }),
      // Fetch all product types for this shop
      prisma.type.findMany({
        where: { shopId: parsedShopId },
      }),
      // Group products by typeId to get the count of products per type
      prisma.product.groupBy({
        by: ['typeId'],
        where: { shopId: parsedShopId },
        _count: { id: true },
      }),
    ]);

    // Create a map for type id to type name
    const typeMap = {};
    types.forEach((type) => {
      typeMap[type.id] = type.name;
    });

    // Format the grouped product counts to include the type name
    const typeCounts = typeCountsRaw.map((group) => ({
      typeId: group.typeId,
      typeName: typeMap[group.typeId] || 'Unknown',
      count: group._count.id,
    }));

    // Return the aggregated counts and notification data
    res.status(200).json({
      productCount,
      productVariantCount,
      orderCount,
      orderItemCount,
      notifications,
      typeCounts,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}
