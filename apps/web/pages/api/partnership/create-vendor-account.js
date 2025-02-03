// pages/api/partnership/create-vendor-account.js
import { v4 as uuidv4 } from 'uuid';
import prisma from '@/utils/helpers';
import bcrypt from 'bcrypt';
import { parseFormData } from '@/utils/helpers';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method not allowed" });
  }
  try {
    const { fields } = await parseFormData(req);
    const firstName = fields.firstName[0];
    const lastName = fields.lastName[0];
    const contactNo = fields.contactNo[0];
    const email = fields.email[0];
    const position = fields.position[0];
    const username = fields.username[0];
    const password = fields.password[0];

    const userNo = uuidv4();
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const newUser = await prisma.user.create({
      data: {
        userNo,
        username,
        password: hashedPassword,
        status: "PENDING",
        roleId: 2,
      },
    });

    await prisma.vendorProfile.create({
      data: {
        firstName,
        lastName,
        contactNo,
        email,
        position,
        User: { connect: { id: newUser.id } },
      },
    });

    res.status(201).json({ success: true, message: "Vendor account created successfully" });
  } catch (error) {
    console.error("Error creating vendor account:", error);
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      let errorMessage;
      if (field === 'username') {
        errorMessage = "The username is already taken. Please choose another.";
      } else {
        errorMessage = `Duplicate value detected for the field '${field}'.`;
      }
      return res.status(409).json({ message: errorMessage });
    }
    res.status(500).json({ message: "Internal server error" });
  }
}
