import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function purgeUsers() {
  const emails = ["davidroujet@hotmail.fr", "davidroujet@gmail.com"];
  
  try {
    console.log("--- PURGE DES UTILISATEURS DE TEST ---");
    const result = await prisma.user.deleteMany({
      where: {
        email: {
          in: emails
        }
      }
    });
    console.log(`Nombre d'utilisateurs supprimés: ${result.count}`);
    
    // On remet aussi les invitations correspondante en PENDING pour retester
    const invResult = await prisma.invitation.updateMany({
      where: {
        email: {
          in: emails
        }
      },
      data: {
        status: "PENDING"
      }
    });
    console.log(`Invitations remises en PENDING: ${invResult.count}`);
    
  } catch (error) {
    console.error("Erreur lors de la purge:", error);
  } finally {
    await prisma.$disconnect();
  }
}

purgeUsers();
