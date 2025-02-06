// File: pages/api/dashboard/get-vendor-infos.js
import prisma from '@/utils/helpers';
import { getSessionShopId } from "@/utils/helpers";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const shopId = await getSessionShopId(req, res);

  if (!shopId) {
    return res.status(400).json({ error: 'No shopId associated with this user' });
  }

  const parsedShopId = parseInt(shopId, 10);

  if (isNaN(parsedShopId)) {
    console.log("Invalid shopId:", shopId);
    return res.status(400).json({ error: 'Invalid shopId' });
  }

  try {
    const productCount = await prisma.product.count({
      where: { shopId: parsedShopId },
    });

    const productVariantCount = await prisma.productVariant.count({
      where: { Product: { shopId: parsedShopId } },
    });

    const orderCount = await prisma.order.count({
      where: { shopId: parsedShopId },
    });

    const orderItemCount = await prisma.orderItem.count({
      where: { Order: { shopId: parsedShopId } },
    });

    const notifications = await prisma.notification.findMany({
      where: {
        shopId: parsedShopId,
        userId: null,
      },
      orderBy: {
        created_at: "desc",
      },
    });
    
    const types = await prisma.type.findMany({
      where: { shopId: parsedShopId },
    });
    const typeCountsRaw = await prisma.product.groupBy({
      by: ['typeId'],
      where: { shopId: parsedShopId },
      _count: { id: true },
    });

    const typeMap = {};
    types.forEach((type) => {
      typeMap[type.id] = type.name;
    });

    const typeCounts = typeCountsRaw.map((group) => ({
      typeId: group.typeId,
      typeName: typeMap[group.typeId] || 'Unknown',
      count: group._count.id,
    }));

    res.status(200).json({
      productCount,
      productVariantCount,
      orderCount,
      orderItemCount,
      notifications,
      typeCounts,
    });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: 'Server error' });
  }

  console.log("Handler finished");
}