import bcrypt from 'bcrypt';
import prisma from '@/utils/helpers'; // Assume this imports Prisma client

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { username, password } = req.body;

  try {
    const customerRole = await prisma.role.findFirst({
      where: { name: "CUSTOMER" },
    });

    if (!customerRole) {
      return res.status(500).json({ message: "Customer role not found" });
    }

    const user = await prisma.user.findFirst({
      where: {
        username,
        roleId: customerRole.id,
      },
      include: {
        CustomerProfile: true, // Include CustomerProfile to access firstName, lastName, and profilePicture
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Invalid credentials: User not found" });
    }

    // Check if the provided password matches the stored password hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials: Wrong password" });
    }

    // Ensure CustomerProfile exists
    if (!user.CustomerProfile) {
      return res.status(500).json({ message: "Customer profile not found" });
    }

    // Respond with user data (select only relevant fields)
    res.status(200).json({
      id: user.id,
      username: user.username,
      firstName: user.CustomerProfile.firstName,
      lastName: user.CustomerProfile.lastName,
      profilePicture: user.CustomerProfile.profilePicture || '',
      roleId: user.roleId,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
