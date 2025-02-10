// pages/api/mobile/profile/get-user-info.js
import prisma, { disconnectPrisma } from "@/utils/helpers";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }

    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const user = await prisma.user.findUnique({
      where: { id: parsedUserId },
      include: {
        CustomerProfile: true,
        CustomerFeature: true,
        CustomerAddress: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Exclude sensitive fields (e.g., password)
    const { password, ...userData } = user;

    // For CustomerAddress, return the first address if exists
    if (userData.CustomerAddress && userData.CustomerAddress.length > 0) {
      userData.CustomerAddress = userData.CustomerAddress[0];
    } else {
      userData.CustomerAddress = null;
    }

    // For CustomerFeature, return the first feature if exists
    if (userData.CustomerFeature && userData.CustomerFeature.length > 0) {
      userData.CustomerFeature = userData.CustomerFeature[0];
    } else {
      userData.CustomerFeature = null;
    }

    res.status(200).json(userData);
  } catch (error) {
    console.error("Error in get-user-info API:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  } finally {
    await disconnectPrisma();
  }
}
