const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const files = await prisma.uploadedFile.findMany({
    select: { id: true, filename: true, path: true }
  });
  console.log(JSON.stringify(files, null, 2));
}

main().finally(() => prisma.$disconnect());
