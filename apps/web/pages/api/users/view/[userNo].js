// [userNo].js
import prisma, { getUserNoFromSession, disconnectPrisma } from '@/utils/helpers';

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sessionUserNo = await getUserNoFromSession(req, res);

  if (!sessionUserNo) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { userNo } = req.query;

  try {
    const user = await prisma.users.findFirst({
      where: { userNo },
      include: { Role: true, AdminProfile: true, VendorProfiles: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.Role.name === "ADMIN") {
      return res.status(200).json({
        userNo: user.userNo,
        username: user.username,
        role: user.Role.name,
        firstName: user.AdminProfile?.firstName || null,
        lastName: user.AdminProfile?.lastName || null,
        profilePicture: user.AdminProfile?.profilePicture || null,
      });
    } else if (user.Role.name === "VENDOR") {
      return res.status(200).json({
        userNo: user.userNo,
        username: user.username,
        role: user.Role.name,
        firstName: user.VendorProfiles?.firstName || null,
        lastName: user.VendorProfiles?.lastName || null,
        profilePicture: user.VendorProfiles?.profilePicture || null,
        contactNo: user.VendorProfiles?.contactNo || null,
        email: user.VendorProfiles?.email || null,
        position: user.VendorProfiles?.position || null,
      });
    } else {
      return res.status(200).json({
        userNo: user.userNo,
        username: user.username,
        role: user.Role.name,
      });
    }
  } finally {
    await disconnectPrisma();
  }
}
