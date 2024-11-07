// pages/api/auth/register.js
import prisma from '@/utils/helpers';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { username, password, firstName, lastName, role } = req.body;

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
      return res.status(409).json({ message: "Username already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

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
        username,
        password: hashedPassword,
        roleId: userRole.id,
        status: 'ACTIVE',
      },
    });

    // Create associated profile based on role
    if (role.toUpperCase() === "CUSTOMER") {
      await prisma.customerProfiles.create({
        data: {
          userId: newUser.userNo, // Assuming userNo uniquely identifies users in CustomerProfiles
          firstName,
          lastName,
        },
      });
    }

    return res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}
