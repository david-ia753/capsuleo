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
  console.log("=== NETTOYAGE DU MODULE DE TEST ===");
  
  try {
    const deleted = await prisma.module.deleteMany({
      where: {
        title: "Module de Test (Script Manuel)"
      }
    });
    console.log(`✅ ${deleted.count} module(s) de test supprimé(s).`);
  } catch (err) {
    console.error("Erreur lors du nettoyage:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
