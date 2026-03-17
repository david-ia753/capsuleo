const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const groups = await prisma.group.findMany();
  if (groups.length === 0) {
    console.log('Aucun groupe trouvé, création de Général...');
    await prisma.group.create({ data: { name: 'Général' } });
    console.log('Groupe créé.');
  } else {
    console.log('Groupes existants :', groups.map(g => g.name).join(', '));
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
