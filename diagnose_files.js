const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const files = await prisma.uploadedFile.findMany({
    take: 10,
    select: {
      id: true,
      filename: true,
      originalName: true,
      path: true
    }
  });
  
  console.log(JSON.stringify(files, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
