// pages/api/mobile/profile/get-user.js
import prisma, { disconnectPrisma } from "@/utils/helpers";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { userId } = req.body;
    console.log("Received userId:", userId); // Debugging log
    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }

    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const user = await prisma.user.findFirst({
      where: {
        id: parsedUserId,
        roleId: 3, // Ensure the user has the CUSTOMER role
      },
      include: {
        CustomerProfile: true,
      },
    });

    if (!user || !user.CustomerProfile) {
      return res
        .status(404)
        .json({ message: "User not found or not a customer" });
    }

    const { username } = user;
    const { profilePicture, firstName, lastName } = user.CustomerProfile;

    res.status(200).json({
      username,
      profilePicture,
      firstName,
      lastName,
    });
  } catch (error) {
    console.error("Error in get-customer-info API:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  } finally {
    await disconnectPrisma();
  }
}
