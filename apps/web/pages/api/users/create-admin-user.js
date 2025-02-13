// File: pages/api/users/create-admin-user.js
import prisma, { parseFormData, uploadFileToSupabase } from "@/utils/helpers";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

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
    const { fields, files } = await parseFormData(req);

    // Ensure fields are parsed as strings, not arrays
    const firstName = Array.isArray(fields.firstName) ? fields.firstName[0] : fields.firstName;
    const lastName = Array.isArray(fields.lastName) ? fields.lastName[0] : fields.lastName;
    const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
    const contact = Array.isArray(fields.contact) ? fields.contact[0] : fields.contact;
    const username = Array.isArray(fields.username) ? fields.username[0] : fields.username;
    const password = Array.isArray(fields.password) ? fields.password[0] : fields.password;

    // Use roleId 1 for admin regardless of input.
    const roleId = 1;

    // Check if username already exists for any role (even if roleId is 2, etc.)
    const existingUser = await prisma.user.findFirst({
      where: {
        username: username,
      },
    });
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" });
    }
    
    let profilePictureUrl = null;
    if (files.profilePicture) {
      const fileData = Array.isArray(files.profilePicture)
        ? files.profilePicture[0]
        : files.profilePicture;
      const uniqueId = uuidv4();
      profilePictureUrl = await uploadFileToSupabase(
        fileData,
        fileData.filepath || fileData.path,
        fileData.originalFilename || fileData.name,
        uniqueId,
        "profile-pictures/admin"
      );
    }

    const newUser = await prisma.user.create({
      data: {
        userNo: uuidv4(),
        roleId: roleId,
        username: username,
        password: password,
        status: "ACTIVE",
        AdminProfile: {
          create: {
            firstName: firstName,
            lastName: lastName,
            email: email || null,
            contactNo: contact || null,
            profilePicture: profilePictureUrl,
          },
        },
      },
    });

    return res.status(200).json({ message: "Admin created successfully", user: newUser });
  } catch (error) {
    console.error("Error creating admin user:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
