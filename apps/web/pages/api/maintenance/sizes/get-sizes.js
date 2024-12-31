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

    const { page = 1 } = req.query;
    const pageNumber = parseInt(page);

    // Fetch sizes with pagination and ordering by nextId
    const sizes = await prisma.size.findMany({
      where: { shopId },
      select: { id: true, name: true, abbreviation: true, nextId: true },
      skip: (pageNumber - 1) * 8,
      take: 8,
    });

    const totalSizes = await prisma.size.count({ where: { shopId } });
    const totalPages = Math.ceil(totalSizes / 8);

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