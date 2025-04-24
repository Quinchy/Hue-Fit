// pages/api/mobile/auth/login.js
import bcrypt from "bcrypt";
import prisma from "@/utils/helpers";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:8100");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
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
        CustomerProfile: true,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Invalid credentials: User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Invalid credentials: Wrong password" });
    }

    if (!user.CustomerProfile) {
      return res.status(500).json({ message: "Customer profile not found" });
    }

    return res.status(200).json({
      id: user.id,
      username: user.username,
      firstName: user.CustomerProfile.firstName,
      lastName: user.CustomerProfile.lastName,
      profilePicture: user.CustomerProfile.profilePicture || "",
      roleId: user.roleId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
