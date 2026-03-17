import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Créer le compte administrateur
  const admin = await prisma.user.upsert({
    where: { email: "davidroujet@gmail.com" },
    update: {
      role: "ADMIN",
      name: "David Roujet",
    },
    create: {
      email: "davidroujet@gmail.com",
      name: "David Roujet",
      role: "ADMIN",
    },
  });

  console.log(`✅ Admin créé : ${admin.email} (rôle: ${admin.role})`);

  // Créer un groupe par défaut
  const defaultGroup = await prisma.group.upsert({
    where: { name: "Groupe par défaut" },
    update: {},
    create: {
      name: "Groupe par défaut",
      description: "Groupe de stagiaires par défaut",
    },
  });

  console.log(`✅ Groupe créé : ${defaultGroup.name}`);

  console.log("\n🎉 Seed terminé avec succès !");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Erreur seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
