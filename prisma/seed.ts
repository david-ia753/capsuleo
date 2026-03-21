import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("🌱 Seeding Neon database...");

  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  const adapter = new PrismaPg(pool as any);
  const prisma = new PrismaClient({ adapter } as any);

  try {
    // Créer le compte administrateur
    const adminEmail = "davidroujet@gmail.com";
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        role: "ADMIN",
        name: "David Roujet",
        firstName: "David",
        lastName: "Roujet",
      },
      create: {
        email: adminEmail,
        name: "David Roujet",
        firstName: "David",
        lastName: "Roujet",
        role: "ADMIN",
      },
    });

    console.log(`✅ Admin créé/mis à jour : ${admin.email} (rôle: ${admin.role})`);

    // Créer un groupe par défaut
    const defaultGroup = await prisma.group.upsert({
      where: { name: "Groupe par défaut" },
      update: {},
      create: {
        name: "Groupe par défaut",
        description: "Groupe de stagiaires par défaut",
      },
    });

    console.log(`✅ Groupe créé/mis à jour : ${defaultGroup.name}`);

    console.log("\n🎉 Seed terminé avec succès !");
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed:", e);
    process.exit(1);
  });
