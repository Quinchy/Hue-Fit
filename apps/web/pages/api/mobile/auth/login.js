import bcrypt from 'bcrypt';
import prisma from '@/utils/helpers'; // Assume this imports Prisma client

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { username, password } = req.body;

  try {
    const customerRole = await prisma.roles.findFirst({
      where: { name: "CUSTOMER" },
    });
    const user = await prisma.users.findFirst({
      where: {
        username,
        roleId: customerRole.id,
      },
    });

    // If user not found, send invalid credentials error
    if (!user) {
      return res.status(404).json({ message: "Invalid credentials: User not found" });
    }

    // Check if the provided password matches the stored password hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials: Wrong password" });
    }

    // Respond with user data (select only relevant fields)
    res.status(200).json({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.roleId,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
