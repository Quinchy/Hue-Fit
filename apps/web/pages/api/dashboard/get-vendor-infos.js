// File: pages/api/dashboard/get-vendor-infos.js
import prisma from '@/utils/helpers';
import { getSessionShopId } from "@/utils/helpers";

export default async function handler(req, res) {
  console.log("Starting handler for get-vendor-infos");

  if (req.method !== 'GET') {
    console.log("Method not allowed:", req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const shopId = await getSessionShopId(req, res);
  console.log("Shop ID from session:", shopId);

  if (!shopId) {
    console.log("No shopId associated with this user");
    return res.status(400).json({ error: 'No shopId associated with this user' });
  }

  const parsedShopId = parseInt(shopId, 10);
  console.log("Parsed shopId:", parsedShopId);

  if (isNaN(parsedShopId)) {
    console.log("Invalid shopId:", shopId);
    return res.status(400).json({ error: 'Invalid shopId' });
  }

  try {
    const productCount = await prisma.product.count({
      where: { shopId: parsedShopId },
    });
    console.log("Product count:", productCount);

    const productVariantCount = await prisma.productVariant.count({
      where: { Product: { shopId: parsedShopId } },
    });
    console.log("Product variant count:", productVariantCount);

    const orderCount = await prisma.order.count({
      where: { shopId: parsedShopId },
    });
    console.log("Order count:", orderCount);

    const orderItemCount = await prisma.orderItem.count({
      where: { Order: { shopId: parsedShopId } },
    });
    console.log("Order item count:", orderItemCount);

    const notifications = await prisma.notification.findMany({
      where: {
        shopId: parsedShopId,
        userId: null,
      },
    });
    console.log("Notifications:", notifications);

    const types = await prisma.type.findMany({
      where: { shopId: parsedShopId },
    });
    console.log("Types:", types);

    const typeCountsRaw = await prisma.product.groupBy({
      by: ['typeId'],
      where: { shopId: parsedShopId },
      _count: { id: true },
    });
    console.log("Raw type counts:", typeCountsRaw);

    const typeMap = {};
    types.forEach((type) => {
      typeMap[type.id] = type.name;
    });
    console.log("Type map:", typeMap);

    const typeCounts = typeCountsRaw.map((group) => ({
      typeId: group.typeId,
      typeName: typeMap[group.typeId] || 'Unknown',
      count: group._count.id,
    }));
    console.log("Type counts:", typeCounts);

    res.status(200).json({
      productCount,
      productVariantCount,
      orderCount,
      orderItemCount,
      notifications,
      typeCounts,
    });
    console.log("Response sent successfully");

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: 'Server error' });
  }

  console.log("Handler finished");
}