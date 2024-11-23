// pages/api/maintenance/types/get-types.js
import prisma, { getSessionShopNo } from "@/utils/helpers";

export default async function handler(req, res) {
  try {
    const shopNo = await getSessionShopNo(req, res);
    if (!shopNo) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const types = await prisma.type.findMany({
      where: { shopNo },
      select: {
        id: true,
        name: true,
      },
    });

    res.status(200).json({ types });
  } catch (error) {
    console.error("Error fetching types:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
}
