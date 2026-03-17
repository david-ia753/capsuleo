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
  console.log("=== ALIGNEMENT DES DONNÉES ===");

  // 1. Renommer le groupe 'Groupe par défaut' en 'Général'
  const group = await prisma.group.findFirst({
    where: { name: 'Groupe par défaut' }
  });

  if (group) {
    await prisma.group.update({
      where: { id: group.id },
      data: { name: 'Général' }
    });
    console.log(`✅ Groupe '${group.name}' renommé en 'Général' (ID: ${group.id})`);
  } else {
    console.log("ℹ️ Aucun groupe nommé 'Groupe par défaut' trouvé.");
    // Vérifier si un groupe 'Général' existe déjà
    const generalGroup = await prisma.group.findFirst({ where: { name: 'Général' } });
    if (generalGroup) {
        console.log(`✅ Groupe 'Général' déjà présent (ID: ${generalGroup.id}).`);
    } else {
        // Créer le groupe s'il n'existe pas du tout
        const newGroup = await prisma.group.create({ data: { name: 'Général' } });
        console.log(`✅ Groupe 'Général' créé (ID: ${newGroup.id}).`);
    }
  }

  // Récupérer l'ID final du groupe 'Général'
  const finalGroup = await prisma.group.findFirst({ where: { name: 'Général' } });
  
  if (finalGroup) {
    // 2. Assigner l'utilisateur davidroujet@gmail.com au groupe 'Général'
    const user = await prisma.user.findUnique({
      where: { email: 'davidroujet@gmail.com' }
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { groupId: finalGroup.id }
      });
      console.log(`✅ Utilisateur davidroujet@gmail.com rattaché au groupe 'Général'.`);
    } else {
      console.log("❌ Utilisateur davidroujet@gmail.com non trouvé.");
    }

    // 3. Vérifier les modules
    const modules = await prisma.module.findMany();
    for (const mod of modules) {
      if (mod.groupId !== finalGroup.id) {
        await prisma.module.update({
          where: { id: mod.id },
          data: { groupId: finalGroup.id }
        });
        console.log(`✅ Module '${mod.title}' (Rattaché à 'Général').`);
      } else {
        console.log(`ℹ️ Module '${mod.title}' déjà bien rattaché.`);
      }
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);
