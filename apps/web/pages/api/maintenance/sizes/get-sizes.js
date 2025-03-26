// pages/api/maintenance/sizes/get-sizes.js

import prisma, { getSessionShopId } from '@/utils/helpers';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const shopId = await getSessionShopId(req, res);

    if (!shopId) {
      return res.status(400).json({ error: "Shop number is missing in the session." });
    }

    const { page = 1, search = "" } = req.query;
    const pageNumber = parseInt(page, 10);

    // Validate page number
    if (isNaN(pageNumber) || pageNumber < 1) {
      return res.status(400).json({ error: "Invalid page number." });
    }

    // Fetch sizes with pagination and search
    const sizes = await prisma.size.findMany({
      where: {
        shopId,
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      select: { id: true, name: true, abbreviation: true, nextId: true },
      skip: (pageNumber - 1) * 13,
      take: 13,
    });

    const totalSizes = await prisma.size.count({
      where: {
        shopId,
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
    });
    const totalPages = Math.ceil(totalSizes / 13);

    // Apply ordering by nextId
    const orderedSizes = orderSizesByNextId(sizes);

    return res.status(200).json({
      sizes: orderedSizes,
      currentPage: pageNumber,
      totalPages,
      totalSizes,
    });
  } catch (error) {
    console.error("Error fetching sizes by shopId:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
}

function orderSizesByNextId(sizes) {
  const idMap = new Map(sizes.map(size => [size.id, size]));
  const nextIdMap = new Map(sizes.map(size => [size.nextId, size]));
  const orderedSizes = [];

  let current = sizes.find(size => !nextIdMap.has(size.id));

  while (current) {
    orderedSizes.push(current);
    current = idMap.get(current.nextId);
  }

  return orderedSizes;
}
