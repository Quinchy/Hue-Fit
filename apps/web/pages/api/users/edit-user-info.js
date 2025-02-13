// File: pages/api/users/edit-user-info.js
import prisma, { disconnectPrisma, parseFormData, uploadFileToSupabase } from "@/utils/helpers";
import { v4 as uuidv4 } from "uuid";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    console.log("Request method not allowed:", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("Parsing form data...");
    const { fields, files } = await parseFormData(req);
    console.log("Fields received:", JSON.stringify(fields, null, 2));
    console.log("Files received:", JSON.stringify(files, null, 2));

    const userId = fields.userId?.[0] || fields.userId;
    console.log("Extracted userId:", userId);
    if (!userId || userId === "undefined") {
      console.error("User ID not provided. Fields:", fields);
      return res.status(400).json({ error: "User ID not provided" });
    }
    const username = fields.username?.[0] || fields.username || "";
    const email = fields.email?.[0] || fields.email || "";
    const firstName = fields.firstName?.[0] || fields.firstName || "";
    const lastName = fields.lastName?.[0] || fields.lastName || "";
    const contactNo = fields.contactNo?.[0] || fields.contactNo || "";

    let address = null;
    let features = null;
    if (fields.address?.[0]) {
      try {
        address = JSON.parse(fields.address[0]);
        console.log("Parsed address:", address);
      } catch (e) {
        console.error("Error parsing address:", fields.address[0]);
        address = null;
      }
    }
    if (fields.features?.[0]) {
      try {
        features = JSON.parse(fields.features[0]);
        console.log("Parsed features:", features);
      } catch (e) {
        console.error("Error parsing features:", fields.features[0]);
        features = null;
      }
    }

    console.log("Querying user with id:", userId);
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      include: { Role: true, AdminProfile: true, VendorProfile: true, CustomerProfile: true },
    });
    console.log("User fetched:", JSON.stringify(user, null, 2));

    if (!user) {
      console.error("User not found with id:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    let newProfilePic = null;
    if (files.profilePicture?.[0]?.filepath) {
      console.log("Profile picture file found:", files.profilePicture[0]);
      const roleName =
        user.Role.name === "ADMIN"
          ? "admin"
          : user.Role.name === "VENDOR"
          ? "vendor"
          : "customer";
      const bucketPath = `profile-pictures/${roleName}`;
      const originalFilename = files.profilePicture[0].originalFilename || "profile.jpg";
      const uniqueId = user.userNo || uuidv4();

      console.log("Uploading profile picture with uniqueId:", uniqueId);
      newProfilePic = await uploadFileToSupabase(
        files.profilePicture[0],
        files.profilePicture[0].filepath,
        originalFilename,
        uniqueId,
        bucketPath
      );
      console.log("Uploaded profile picture URL:", newProfilePic);
    }

    if (user.Role.name === "ADMIN") {
      console.log("Updating admin profile...");
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
      console.log("Updating vendor profile...");
      await prisma.vendorProfile.update({
        where: { userId: user.id },
        data: {
          firstName,
          lastName,
          contactNo,
          email,
          position: fields.position?.[0] || fields.position || "",
          profilePicture: newProfilePic || user.VendorProfile?.profilePicture || null,
          shopId: fields.shop?.[0] || fields.shop || null,
        },
      });
      await prisma.user.update({
        where: { id: user.id },
        data: { username },
      });
    } else if (user.Role.name === "CUSTOMER") {
      console.log("Updating customer profile...");
      await prisma.customerProfile.update({
        where: { userId: user.id },
        data: {
          firstName,
          lastName,
          email,
          profilePicture: newProfilePic || user.CustomerProfile?.profilePicture || null,
        },
      });
      if (address) {
        console.log("Upserting customer address...");
        await prisma.customerAddress.upsert({
          where: { userId: user.id },
          update: {
            buildingNo: address.buildingNo || "",
            street: address.street || "",
            barangay: address.barangay,
            municipality: address.municipality,
            province: address.province,
            postalCode: address.postalCode,
          },
          create: {
            userId: user.id,
            buildingNo: address.buildingNo || "",
            street: address.street || "",
            barangay: address.barangay,
            municipality: address.municipality,
            province: address.province,
            postalCode: address.postalCode,
          },
        });
      }
      if (features) {
        console.log("Upserting customer features...");
        await prisma.customerFeature.upsert({
          where: { userId: user.id },
          update: {
            height: parseFloat(features.height) || 0,
            weight: parseFloat(features.weight) || 0,
            age: parseInt(features.age) || 0,
            skintone: features.skintone,
            bodyShape: features.bodyShape,
          },
          create: {
            userId: user.id,
            height: parseFloat(features.height) || 0,
            weight: parseFloat(features.weight) || 0,
            age: parseInt(features.age) || 0,
            skintone: features.skintone,
            bodyShape: features.bodyShape,
          },
        });
      }
      await prisma.user.update({
        where: { id: user.id },
        data: { username },
      });
    } else {
      console.log("Updating user record for unhandled role...");
      await prisma.user.update({
        where: { id: user.id },
        data: { username },
      });
    }

    console.log("User update successful.");
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating user info:", error);
    return res.status(500).json({ error: "Failed to update user info" });
  } finally {
    await disconnectPrisma();
  }
}
