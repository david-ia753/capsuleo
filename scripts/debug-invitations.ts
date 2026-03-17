import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function debugAndGenerate() {
  console.log("--- INSPECTION DES INVITATIONS EXISTANTES ---");
  const all = await prisma.invitation.findMany();
  console.log("Nombre d'invitations:", all.length);
  all.forEach(inv => {
    console.log(`- ${inv.email} [${inv.status}] token: ${inv.token} expire: ${inv.expiresAt}`);
  });

  console.log("\n--- GÉNÉRATION TOKEN TEST POUR DAVID ---");
  const email = "davidroujet@gmail.com"; // On utilise l'email principal pour le test
  const token = "david-special-" + Math.random().toString(36).substring(7);
  
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
  console.log("TOKEN DE TEST GÉNÉRÉ");
  console.log("Email:", email);
  console.log("Token:", token);
  console.log("Lien complet: http://localhost:3000/register?token=" + token);
  console.log("=========================================");
  
  await prisma.$disconnect();
}

debugAndGenerate().catch(console.error);
