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
  console.log("=== NETTOYAGE DES MODULES MOCK ===");
  
  const deletedModules = await prisma.module.deleteMany({
    where: {
      OR: [
        { title: { contains: "(Mock)" } },
        { title: "Nouveau Module" },
        { title: "Module de Secours (Erreur DB ou IA)" }
      ]
    }
  });

  console.log(`✅ ${deletedModules.count} modules de test supprimés.`);
  
  // Supprimer aussi les fichiers associés si nécessaire (optionnel)
  const deletedFiles = await prisma.uploadedFile.deleteMany({
    where: { moduleId: null }
  });
  console.log(`✅ ${deletedFiles.count} fichiers orphelins supprimés.`);

  await prisma.$disconnect();
}

main().catch(console.error);
