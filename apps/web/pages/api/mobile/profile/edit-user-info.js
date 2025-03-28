// pages/api/mobile/profile/edit-user-info.js
import prisma, { disconnectPrisma } from "@/utils/helpers";
import formidable from "formidable";
import { uploadFileToSupabase } from "@/utils/helpers";

export const config = {
  api: {
    bodyParser: false, // Disable default body parsing to handle file uploads
    externalResolver: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  try {
    // Parse form-data including files using formidable
    const { fields, files } = await new Promise((resolve, reject) => {
      const form = formidable({ multiples: true });
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    // Helper function to normalize fields that are returned as arrays
    const normalize = (value) => (Array.isArray(value) ? value[0] : value);

    // Normalize all fields
    const userId = normalize(fields.userId);
    const username = normalize(fields.username);
    const email = normalize(fields.email);
    const firstName = normalize(fields.firstName);
    const lastName = normalize(fields.lastName);
    const height = normalize(fields.height);
    const weight = normalize(fields.weight);
    const age = normalize(fields.age);
    const skintone = normalize(fields.skintone);
    const bodyShape = normalize(fields.bodyShape);
    const buildingNo = normalize(fields.buildingNo);
    const street = normalize(fields.street);
    const barangay = normalize(fields.barangay);
    const municipality = normalize(fields.municipality);
    const province = normalize(fields.province);
    const postalCode = normalize(fields.postalCode);
    let profilePictureField = normalize(fields.profilePicture);

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Check if a new profile picture file was uploaded
    let profilePictureUrl = profilePictureField; // default: existing URL from field
    if (files.profilePicture) {
      let fileData = files.profilePicture;
      // If it's an array, take the first element
      if (Array.isArray(fileData)) {
        fileData = fileData[0];
      }
      // Validate file parameters before calling the helper
      if (!fileData || !fileData.filepath || !fileData.originalFilename) {
        console.error("Invalid file or parameters provided");
        return res
          .status(400)
          .json({ message: "Invalid file or parameters provided" });
      }
      const uniqueId = "customer"; // or use another unique identifier as needed
      const bucketPath = "profile-pictures/customer";
      const publicUrl = await uploadFileToSupabase(
        fileData,
        fileData.filepath,
        fileData.originalFilename,
        uniqueId,
        bucketPath
      );
      if (!publicUrl) {
        return res
          .status(500)
          .json({ message: "Failed to upload file to Supabase" });
      }
      profilePictureUrl = publicUrl;
    }

    // Find the user by ID
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

    // Update the user and related profiles using Prisma
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        username,
        CustomerProfile: {
          update: {
            profilePicture: profilePictureUrl,
            email,
            firstName,
            lastName,
          },
        },
        CustomerFeature: {
          upsert: {
            where: { userId: user.id },
            update: {
              height: parseFloat(height),
              weight: parseFloat(weight),
              age: parseInt(age, 10),
              skintone,
              bodyShape,
            },
            create: {
              height: parseFloat(height),
              weight: parseFloat(weight),
              age: parseInt(age, 10),
              skintone,
              bodyShape,
            },
          },
        },
        CustomerAddress: {
          upsert: {
            where: { userId: user.id },
            update: {
              buildingNo,
              street,
              barangay,
              municipality,
              province,
              postalCode,
            },
            create: {
              buildingNo,
              street,
              barangay,
              municipality,
              province,
              postalCode,
            },
          },
        },
      },
    });

    // Exclude sensitive fields (e.g., password) before responding
    const { password, ...userData } = updatedUser;
    res.status(200).json(userData);
  } catch (error) {
    console.error("Error in edit-user-info API:", error);
    res
      .status(500)
      .json({ message: "Failed to update profile", error: error.message });
  } finally {
    await disconnectPrisma();
  }
}
