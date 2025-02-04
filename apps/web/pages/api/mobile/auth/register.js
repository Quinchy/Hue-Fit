import prisma from '@/utils/helpers';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Extract registration fields.
  // Note: For the CUSTOMER role, the client sends "bodyshape" (all lowercase)
  const {
    username,
    password,
    firstName,
    lastName,
    role,
    height,
    weight,
    age,
    skintone,
    bodyshape
  } = req.body;

  // Basic validation for user credentials.
  if (
    !username?.trim() ||
    !password ||
    !firstName?.trim() ||
    !lastName?.trim() ||
    !role?.trim()
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // If role is CUSTOMER, ensure additional customer feature fields are provided.
  if (role.toUpperCase() === "CUSTOMER") {
    if (
      height === undefined || height === '' ||
      weight === undefined || weight === '' ||
      age === undefined || age === '' ||
      !skintone?.trim() ||
      !bodyshape?.trim()
    ) {
      return res.status(400).json({ message: "All customer feature fields are required." });
    }
  }

  // Ensure role is valid.
  const allowedRoles = ["CUSTOMER", "VENDOR", "ADMIN"];
  if (!allowedRoles.includes(role.toUpperCase())) {
    return res.status(400).json({ message: "Invalid role specified." });
  }

  try {
    // Find the CUSTOMER role to check for duplicate users.
    const customerRole = await prisma.role.findFirst({
      where: { name: "CUSTOMER" },
    });

    const existingUser = await prisma.user.findFirst({
      where: { 
        username,
        roleId: customerRole ? customerRole.id : undefined,
      },
    });

    if (existingUser) {
      return res.status(409).json({ message: "Username is already taken." });
    }

    // Hash the password.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a unique userNo.
    const userNo = uuidv4().replace(/-/g, '').slice(0, 8);

    // Fetch role ID based on the role name.
    const userRole = await prisma.role.findFirst({
      where: { name: role.toUpperCase() },
    });

    if (!userRole) {
      return res.status(400).json({ message: "Role not found." });
    }

    // Create the user.
    const newUser = await prisma.user.create({
      data: {
        userNo, // Generated userNo.
        username,
        password: hashedPassword,
        roleId: userRole.id,
        status: 'ACTIVE', // Set status to ACTIVE.
      },
    });

    // If the role is CUSTOMER, create the customer feature record and the profile.
    if (role.toUpperCase() === "CUSTOMER") {
      // Create the CustomerFeature record.
      const newCustomerFeature = await prisma.customerFeature.create({
        data: {
          userId: newUser.id,
          height: parseFloat(height),
          weight: parseFloat(weight),
          age: parseInt(age, 10),
          skintone,
          bodyShape: bodyshape, // Use the destructured field "bodyshape"
        },
      });

      // Create the CustomerProfile record, linking to the new CustomerFeature.
      await prisma.customerProfile.create({
        data: {
          userId: newUser.id,
          firstName,
          lastName,
          customerFeaturesId: newCustomerFeature.id,
        },
      });
    }

    return res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}
