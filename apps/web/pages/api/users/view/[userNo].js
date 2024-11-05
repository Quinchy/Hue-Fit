import { PrismaClient } from "@prisma/client";
import { getUserNoFromSession } from "@/utils/helpers";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Retrieve the userNo from the session
  const sessionUserNo = await getUserNoFromSession(req, res);

  if (!sessionUserNo) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Extract the target userNo from the request URL
  const { userNo } = req.query;

  try {
    // Fetch the user's data by userNo
    const user = await prisma.users.findFirst({
      where: { userNo }, // Now `userNo` can be used directly
      include: {
        Role: true,
        AdminProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user is an admin
    if (user.Role.name === "ADMIN") {
      return res.status(200).json({
        userNo: user.userNo,
        username: user.username,
        role: user.Role.name,
        firstName: user.AdminProfile?.firstName || null,
        lastName: user.AdminProfile?.lastName || null,
        profilePicture: user.AdminProfile?.profilePicture || null,
      });
    } else {
      return res.status(200).json({
        userNo: user.userNo,
        username: user.username,
        role: user.Role.name,
      });
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "An error occurred while fetching user data" });
  } finally {
    await prisma.$disconnect();
  }
}
