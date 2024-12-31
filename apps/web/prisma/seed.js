// prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123', 10);

  const updatedUser = await prisma.user.update({
    where: {
      username: 'quinch',
    },
    data: {
      password: hashedPassword,
    },
  });

  console.log('Password updated for user:', updatedUser.username);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
