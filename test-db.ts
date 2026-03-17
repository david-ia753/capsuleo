import { prisma } from './src/lib/prisma';

async function main() {
  const moduleData = await prisma.module.findFirst({
    where: { title: { contains: 'Fondamentaux' } },
    include: { files: true }
  });
  console.log(JSON.stringify(moduleData, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
