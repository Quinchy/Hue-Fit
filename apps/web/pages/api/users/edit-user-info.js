// File: /pages/api/users/edit-user-info.js
import prisma, {
  getSessionUser,
  disconnectPrisma,
  parseFormData,
  uploadFileToSupabase,
} from "@/utils/helpers";
import { v4 as uuidv4 } from "uuid";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const sessionUser = await getSessionUser(req, res);
    if (!sessionUser?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { fields, files } = await parseFormData(req);
    // Each field in 'fields' is an array if multiple were submitted. 
    // Convert them to strings
    const username = fields.username?.[0] || fields.username || "";
    const email = fields.email?.[0] || fields.email || "";
    const firstName = fields.firstName?.[0] || fields.firstName || "";
    const lastName = fields.lastName?.[0] || fields.lastName || "";
    const contactNo = fields.contactNo?.[0] || fields.contactNo || "";

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      include: { Role: true, AdminProfile: true, VendorProfile: true },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let newProfilePic = null;
    if (files.profilePicture && files.profilePicture.filepath) {
      const role = user.Role.name === "ADMIN" ? "admin" : "vendor";
      const bucketPath = `profile-pictures/${role}`;
      const originalFilename = files.profilePicture.originalFilename || "profile.jpg";
      const uniqueId = user.userNo || uuidv4();

      newProfilePic = await uploadFileToSupabase(
        files.profilePicture,
        files.profilePicture.filepath,
        originalFilename,
        uniqueId,
        bucketPath
      );
    }

    if (user.Role.name === "ADMIN") {
      await prisma.adminProfile.update({
        where: { userId: user.id },
        data: {
          firstName,
          lastName,
          profilePicture: newProfilePic || user.AdminProfile?.profilePicture || null,
        },
      });
      await prisma.user.update({
        where: { id: user.id },
        data: { username },
      });
    } else if (user.Role.name === "VENDOR") {
      await prisma.vendorProfile.update({
        where: { userId: user.id },
        data: {
          firstName,
          lastName,
          contactNo,
          email,
          profilePicture: newProfilePic || user.VendorProfile?.profilePicture || null,
        },
      });
      await prisma.user.update({
        where: { id: user.id },
        data: { username },
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { username },
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating user info:", error);
    return res.status(500).json({ error: "Failed to update user info" });
  } finally {
    await disconnectPrisma();
  }
}
