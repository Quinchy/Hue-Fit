// [userNo].js
import prisma, { getSessionUser, disconnectPrisma } from '@/utils/helpers';

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const sessionUser = await getSessionUser(req, res);

    const user = await prisma.user.findFirst({
      where: { id: sessionUser.id },
      include: { Role: true, AdminProfile: true, VendorProfile: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.Role.name === "ADMIN") {
      return res.status(200).json({
        userNo: user.userNo,
        username: user.username,
        role: user.Role.name,
        profilePicture: user.AdminProfile?.profilePicture || null,
        firstName: user.AdminProfile?.firstName || null,
        lastName: user.AdminProfile?.lastName || null,
        profilePicture: user.AdminProfile?.profilePicture || null,
      });
    } 
    else if (user.Role.name === "VENDOR") {
      return res.status(200).json({
        userNo: user.userNo,
        username: user.username,
        role: user.Role.name,
        firstName: user.VendorProfile?.firstName || null,
        lastName: user.VendorProfile?.lastName || null,
        profilePicture: user.VendorProfile?.profilePicture || null,
        contactNo: user.VendorProfile?.contactNo || null,
        email: user.VendorProfile?.email || null,
        position: user.VendorProfile?.position || null,
      });
    } 
    else {
      return res.status(200).json({
        userNo: user.userNo,
        username: user.username,
        role: user.Role.name,
      });
    }
  } 
  finally {
    await disconnectPrisma();
  }
}
