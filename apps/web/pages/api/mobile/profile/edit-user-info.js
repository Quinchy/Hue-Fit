// pages/api/mobile/profile/edit-user-info.js
import prisma, { disconnectPrisma } from '@/utils/helpers';

export const config = {
  api: {
    bodyParser: true,
    externalResolver: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  console.log("userId", req.body.userId);
  try {
    const {
      userId, // now using userId from the UI (retrieved from AsyncStorage)
      username,
      profilePicture,
      email,
      firstName,
      lastName,
      height,
      weight,
      age,
      skintone,
      bodyShape,
      buildingNo,
      street,
      barangay,
      municipality,
      province,
      postalCode,
    } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    // Find the user by their id.
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
    
    // Update the user and related profiles using update where needed.
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        username,
        CustomerProfile: {
          update: {
            profilePicture,
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
    
    // Exclude sensitive fields (like password)
    const { password, ...userData } = updatedUser;
    res.status(200).json(userData);
  } catch (error) {
    console.error("Error in edit-user-info API:", error);
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  } finally {
    await disconnectPrisma();
  }
}
