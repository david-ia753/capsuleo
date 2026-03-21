const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'davidroujet@gmail.com';
  const password = 'capsuléo8045214521Dr!';
  
  console.log(`Setting password for ${adminEmail}...`);
  const hashedPassword = await bcrypt.hash(password, 10);

  // 1. Update/Create main admin
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      firstName: 'David',
      lastName: 'Roujet',
      name: 'David Roujet'
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      firstName: 'David',
      lastName: 'Roujet',
      name: 'David Roujet'
    }
  });

  console.log(`✅ Admin ${admin.email} updated with new password.`);

  // 2. Remove other admins
  const otherAdmins = await prisma.user.findMany({
    where: {
      role: 'ADMIN',
      NOT: { email: adminEmail }
    }
  });

  if (otherAdmins.length > 0) {
    console.log(`Found ${otherAdmins.length} other admins. Removing them...`);
    for (const other of otherAdmins) {
      // Pour éviter de casser des relations, on peut soit supprimer soit changer le rôle
      // Ici l'utilisateur demande "Supprime l'autre administrateur"
      // Si on veut être sûr de ne rien casser on pourrait juste changer le rôle, 
      // mais on va essayer la suppression simple d'abord.
      try {
        await prisma.user.delete({ where: { id: other.id } });
        console.log(`- Deleted admin: ${other.email}`);
      } catch (e) {
        console.warn(`- Could not delete ${other.email} due to existing relations. Changing role to STUDENT instead.`);
        await prisma.user.update({
          where: { id: other.id },
          data: { role: 'STUDENT' }
        });
      }
    }
  } else {
    console.log('No other admins found.');
  }

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
