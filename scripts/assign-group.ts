const { PrismaClient } = require('@prisma/client');
const assignPrisma = new PrismaClient();

async function main() {
  try {
    // 1. Trouver ou créer le groupe "Général"
    let group = await assignPrisma.group.findFirst({
      where: { name: 'Général' }
    });
    
    if (!group) {
        group = await assignPrisma.group.findFirst();
    }

    if (!group) {
      console.log("Création du groupe Général...");
      group = await assignPrisma.group.create({
        data: { name: 'Général' }
      });
    }

    console.log(`Groupe ciblé : ${group.name} (ID: ${group.id})`);

    // 2. Assigner l'utilisateur
    const userEmail = 'davidroujet@gmail.com';
    const user = await assignPrisma.user.findUnique({
      where: { email: userEmail }
    });

    if (user) {
      const updatedUser = await assignPrisma.user.update({
        where: { id: user.id },
        data: { groupId: group.id }
      });
      console.log(`✅ Utilisateur ${updatedUser.email} assigné au groupe ${group.name}.`);
    } else {
      console.log(`❌ Utilisateur ${userEmail} introuvable !`);
    }

    // 3. Vérifier les modules
    const groupModules = await assignPrisma.groupModule.findMany({
      where: { groupId: group.id },
      include: { module: true }
    });
    
    console.log(`\nModules liés à ce groupe (${groupModules.length}) :`);
    groupModules.forEach((gm: any) => console.log(`- ${gm.module.title}`));

    // Optionnel : lier les modules orphelins (ceux qui ne sont dans aucun groupe)
    const allModules = await assignPrisma.module.findMany({
      include: { groupModules: true }
    });
    
    const orphanModules = allModules.filter((m: any) => m.groupModules.length === 0);

    if (orphanModules.length > 0) {
        console.log(`\nLiaison de ${orphanModules.length} modules orphelins au groupe ${group.name}...`);
        for (const m of orphanModules) {
          await assignPrisma.groupModule.create({
            data: {
              groupId: group.id,
              moduleId: m.id,
              order: 0
            }
          });
        }
        console.log("✅ Modules orphelins réassignés.");
    }

  } catch (err) {
    console.error("Erreur durant l'exécution :", err);
  } finally {
    await assignPrisma.$disconnect();
  }
}

main();
