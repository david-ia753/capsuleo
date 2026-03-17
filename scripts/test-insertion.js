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
  console.log("=== VÉRIFICATION MANUELLE ===");
  
  const group = await prisma.group.findFirst({
    where: { name: 'Général' }
  });

  if (!group) {
    console.log("ERREUR: Groupe 'Général' introuvable.");
    return;
  }

  console.log(`Groupe 'Général' trouvé (ID: ${group.id})`);

  try {
    const newModule = await prisma.module.create({
      data: {
        title: "Module de Test (Script Manuel)",
        objective: "Vérifier l'insertion en base de données",
        shortDescription: "Créé manuellement par script",
        groupId: group.id,
        fiches: {
          create: [
            {
              title: "Fiche Test",
              content: "Contenu de test pour vérifier la persistence.",
              order: 0,
              part: 1
            }
          ]
        }
      }
    });
    console.log(`OK: Module créé avec l'ID ${newModule.id}`);
  } catch (err) {
    console.error("ERREUR lors de la création du module:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
