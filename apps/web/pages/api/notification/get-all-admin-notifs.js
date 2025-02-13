// File: pages/api/notification/get-all-admin-notifs.js
import prisma from "@/utils/helpers";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = 6;
  const skip = (page - 1) * limit;

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: null,
        shopId: null,
      },
      orderBy: {
        created_at: "desc",
      },
      skip,
      take: limit,
    });

    const totalCount = await prisma.notification.count({
      where: {
        userId: null,
        shopId: null,
      },
    });
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({ notifications, totalPages });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Server error" });
  }
}
