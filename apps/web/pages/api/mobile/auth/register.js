// pages/api/mobile/auth/register.js
import prisma from '@/utils/helpers';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method not allowed" });
  }

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
    bodyshape,
    buildingNo,
    street,
    barangay,
    municipality,
    province,
    postalCode,
  } = req.body;

  if (
    !username?.trim() ||
    !password ||
    !firstName?.trim() ||
    !lastName?.trim() ||
    !role?.trim()
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (role.toUpperCase() === "CUSTOMER") {
    if (
      height === undefined || height === '' ||
      weight === undefined || weight === '' ||
      age === undefined || age === '' ||
      !skintone?.trim() ||
      !bodyshape?.trim() ||
      !barangay?.trim() ||
      !municipality?.trim() ||
      !province?.trim() ||
      !postalCode?.trim()
    ) {
      return res.status(400).json({ message: "All customer feature and address fields are required." });
    }
  }

  const allowedRoles = ["CUSTOMER", "VENDOR", "ADMIN"];
  if (!allowedRoles.includes(role.toUpperCase())) {
    return res.status(400).json({ message: "Invalid role specified." });
  }

  try {
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

    const hashedPassword = await bcrypt.hash(password, 10);
    const userNo = uuidv4();

    const userRole = await prisma.role.findFirst({
      where: { name: role.toUpperCase() },
    });

    if (!userRole) {
      return res.status(400).json({ message: "Role not found." });
    }

    const newUser = await prisma.user.create({
      data: {
        userNo,
        username,
        password: hashedPassword,
        roleId: userRole.id,
        status: 'ACTIVE',
      },
    });

    if (role.toUpperCase() === "CUSTOMER") {
      const newCustomerFeature = await prisma.customerFeature.create({
        data: {
          userId: newUser.id,
          height: parseFloat(height),
          weight: parseFloat(weight),
          age: parseInt(age, 10),
          skintone,
          bodyShape: bodyshape,
        },
      });

      await prisma.customerProfile.create({
        data: {
          userId: newUser.id,
          firstName,
          lastName,
          customerFeaturesId: newCustomerFeature.id,
        },
      });

      await prisma.customerAddress.create({
        data: {
          userId: newUser.id,
          buildingNo: buildingNo ? buildingNo.trim() : null,
          street: street ? street.trim() : null,
          barangay: barangay.trim(),
          municipality: municipality.trim(),
          province: province.trim(),
          postalCode: postalCode.trim(),
        },
      });
    }

    return res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}
