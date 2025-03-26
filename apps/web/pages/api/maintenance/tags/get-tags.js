// pages/api/maintenance/tags/get-tags.js
import prisma, { getSessionShopId } from "@/utils/helpers";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const shopId = await getSessionShopId(req, res);
    if (!shopId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { page = 1, search = "" } = req.query; // Add search query param
    const PAGE_SIZE = 13;

    const searchTerm = search.trim().toLowerCase();

    // Build the where clause with search functionality
    const whereClause = {
      shopId,
      ...(searchTerm && {
        name: {
          contains: searchTerm,
          mode: "insensitive",
        },
      }),
    };

    // Add orderBy clause for latest updates
    const orderByClause = { updated_at: "desc" };

    const tags = await prisma.tag.findMany({
      where: whereClause,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: orderByClause,
      select: {
        id: true,
        name: true,
        typeId: true,
        Type: { select: { name: true } }, // Include the related Type's name
      },
    });

    // Format the tags to include the typeName
    const formattedTags = tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      typeName: tag.Type ? tag.Type.name : "Unassigned", // Resolve the type name
    }));

    const totalCount = await prisma.tag.count({ where: whereClause });
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    return res.status(200).json({
      success: true,
      tags: formattedTags,
      totalPages,
      totalCount,
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
}
