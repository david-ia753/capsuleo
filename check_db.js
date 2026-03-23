const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, role: true, name: true }
  });
  const modules = await prisma.module.findMany({
    select: { id: true, title: true }
  });
  console.log('USERS:', JSON.stringify(users, null, 2));
  console.log('MODULES:', JSON.stringify(modules, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
