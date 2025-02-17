// File: prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const prisma = new PrismaClient();

async function main() {
  // Create roles
  const roles = [
    { id: 1, name: "ADMIN" },
    { id: 2, name: "VENDOR" },
    { id: 3, name: "CUSTOMER" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }
  console.log("Roles seeded.");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin", 10);
  const adminUser = await prisma.user.create({
    data: {
      userNo: uuidv4(),
      roleId: 1, // ADMIN role
      username: "admin",
      password: hashedPassword,
      status: "ACTIVE",
      AdminProfile: {
        create: {
          // No profilePicture
          firstName: "Carl Andrei",
          lastName: "Tallorin",
          email: "carl.tallorin@gmail.com",
          contactNo: "09696006969",
        },
      },
    },
    include: { AdminProfile: true },
  });
  console.log("Admin user created:", adminUser.username);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
