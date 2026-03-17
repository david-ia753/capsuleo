const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generateTestToken() {
  const email = "davidroujet+test@gmail.com";
  const token = "test-token-" + Math.random().toString(36).substring(7);
  
  try {
    const invitation = await prisma.invitation.upsert({
      where: { email },
      update: {
        token,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      create: {
        email,
        firstName: "David",
        lastName: "Roujet",
        token,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    console.log("=========================================");
    console.log("TOKEN DE TEST GÉNÉRÉ AVEC SUCCÈS");
    console.log("Email:", email);
    console.log("Token:", token);
    console.log("URL de test: http://localhost:3000/register?token=" + token);
    console.log("=========================================");
  } catch (error) {
    console.error("Erreur lors de la génération du token:", error);
  } finally {
    await prisma.$disconnect();
  }
}

generateTestToken();
