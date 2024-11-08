import prisma from '@/utils/helpers';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { username, password, firstName, lastName, role, customerFeaturesId = 0 } = req.body;

  // Basic validation
  if (!username || !password || !firstName || !lastName || !role) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Ensure role is valid
  const allowedRoles = ["CUSTOMER", "VENDOR", "ADMIN"];
  if (!allowedRoles.includes(role.toUpperCase())) {
    return res.status(400).json({ message: "Invalid role specified." });
  }

  try {
    // Check if the username already exists
    const existingUser = await prisma.users.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(409).json({ message: "Username is already taken." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a unique userNo
    const userNo = uuidv4();

    // Fetch role ID based on the role name (assumes Roles table is pre-populated)
    const userRole = await prisma.roles.findFirst({
      where: { name: role.toUpperCase() },
    });

    if (!userRole) {
      return res.status(400).json({ message: "Role not found." });
    }

    // Create the user
    const newUser = await prisma.users.create({
      data: {
        userNo,               // Set generated userNo
        username,
        password: hashedPassword,
        roleId: userRole.id,
        status: 'ACTIVE',     // Set status to ACTIVE
      },
    });

    // Create associated profile based on role
    if (role.toUpperCase() === "CUSTOMER") {
      await prisma.customerProfiles.create({
        data: {
          userId: newUser.id,          // Use id (PK) of the created user
          firstName,
          lastName,
          customerFeaturesId,         // Add customerFeaturesId, with a default if not provided
        },
      });
    }

    return res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}
