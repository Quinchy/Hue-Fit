// prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Define the password to be hashed
  const rawPassword = 'admin'; // Replace with the desired password
  const hashedPassword = await bcrypt.hash(rawPassword, 10); // Hash the password with a salt round of 10

  // Upsert the user to update the password
  await prisma.users.upsert({
    where: { username: 'admin' }, // Identify user to update by username or userNo
    update: {
      password: hashedPassword, // Update the password with the hashed version
    },
    create: {
      userNo: '797a951b-c0df-4193-bcf2-393ccd152d67', // Use the same userNo or generate a new one if needed
      username: 'admin',
      password: hashedPassword,
      status: 'ACTIVE',
      roleId: 1,
    },
  });

  console.log('Admin user seeded with updated password.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
