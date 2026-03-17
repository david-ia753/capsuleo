const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Trouver ou créer le groupe "Général"
    let group = await prisma.group.findFirst({
      where: { name: 'Général' }
    });
    
    if (!group) {
        group = await prisma.group.findFirst();
    }

    if (!group) {
      console.log("Création du groupe Général...");
      group = await prisma.group.create({
        data: { name: 'Général' }
      });
    }

    console.log(`Groupe ciblé : ${group.name} (ID: ${group.id})`);

    // 2. Assigner l'utilisateur
    const userEmail = 'davidroujet@gmail.com';
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (user) {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { groupId: group.id }
      });
      console.log(`✅ Utilisateur ${updatedUser.email} assigné au groupe ${group.name}.`);
    } else {
      console.log(`❌ Utilisateur ${userEmail} introuvable !`);
    }

    // 3. Vérifier les modules
    const modules = await prisma.module.findMany({
      where: { groupId: group.id }
    });
    
    console.log(`\nModules liés à ce groupe (${modules.length}) :`);
    modules.forEach((m: any) => console.log(`- ${m.title}`));

    // Optionnel : lier les modules orphelins
    const orphanModules = await prisma.module.findMany({
      where: { groupId: null }
    });

    if (orphanModules.length > 0) {
        console.log(`\nLiaison de ${orphanModules.length} modules orphelins au groupe ${group.name}...`);
        await prisma.module.updateMany({
            where: { groupId: null },
            data: { groupId: group.id }
        });
        console.log("✅ Modules orphelins réassignés.");
    }

  } catch (err) {
    console.error("Erreur durant l'exécution :", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
