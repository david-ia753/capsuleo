const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), "dev.db");

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

async function main() {
  console.log("=== INSPECTION DE LA BASE (SQLite) ===");
  
  const groups = await prisma.group.findMany();
  console.log("\nGroupes trouvés :");
  groups.forEach(g => console.log(`- ID: ${g.id} | NOM: ${g.name}`));

  const users = await prisma.user.findMany({
    where: { email: 'davidroujet@gmail.com' }
  });
  console.log("\nUtilisateur davidroujet@gmail.com :");
  users.forEach(u => console.log(`- ID: ${u.id} | EMAIL: ${u.email} | GroupID: ${u.groupId}`));

  const modules = await prisma.module.findMany();
  console.log("\nModules trouvés :");
  modules.forEach(m => console.log(`- ID: ${m.id} | TITRE: ${m.title} | GroupID: ${m.groupId}`));

  await prisma.$disconnect();
}

main().catch(console.error);
