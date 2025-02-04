// pages/api/mobile/notification/get-notification.js
import prisma from "@/utils/helpers"; // Adjust the import to match your project structure

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: Number(userId) },
      orderBy: { created_at: "desc" },
    });

    // Iterate over notifications and log their IDs
    notifications.forEach((notification) => {
      console.log("Notification ID:", notification.id);
    });

    return res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ message: "Failed to fetch notifications" });
  }
}
