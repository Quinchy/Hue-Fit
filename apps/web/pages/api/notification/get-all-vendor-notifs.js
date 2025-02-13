// File: pages/api/notification/get-all-vendor-notification.js
import prisma from "@/utils/helpers";
import { getSessionShopId } from "@/utils/helpers";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const shopId = await getSessionShopId(req, res);
  if (!shopId) {
    return res.status(400).json({ error: "No shopId associated with this user" });
  }

  const parsedShopId = parseInt(shopId, 10);
  if (isNaN(parsedShopId)) {
    return res.status(400).json({ error: "Invalid shopId" });
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = 6;
  const skip = (page - 1) * limit;

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        shopId: parsedShopId,
        userId: null,
      },
      orderBy: {
        created_at: "desc",
      },
      skip,
      take: limit,
    });

    const totalCount = await prisma.notification.count({
      where: {
        shopId: parsedShopId,
        userId: null,
      },
    });
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({ notifications, totalPages });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Server error" });
  }
}