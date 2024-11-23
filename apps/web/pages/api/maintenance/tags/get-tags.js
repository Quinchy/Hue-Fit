// pages/api/maintenance/tags/get-tags.js
import prisma, { getSessionShopNo } from "@/utils/helpers";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const shopNo = await getSessionShopNo(req, res);
    if (!shopNo) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { page = 1 } = req.query; // Default to page 1 if no query param
    const PAGE_SIZE = 8;

    const tags = await prisma.tags.findMany({
      where: { shopNo },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
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

    const totalCount = await prisma.tags.count({ where: { shopNo } });
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    return res.status(200).json({ success: true, tags: formattedTags, totalPages });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
}
