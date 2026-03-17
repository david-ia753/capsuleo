import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🛠️  Verification and 'Éducation Populaire' module creation...");

  // 1. Create default admin and group (re-seeding essentials)
  const admin = await prisma.user.upsert({
    where: { email: "davidroujet@gmail.com" },
    update: { role: "ADMIN" },
    create: {
      email: "davidroujet@gmail.com",
      name: "David Roujet",
      role: "ADMIN",
    },
  });
  console.log("✅ Admin verified.");

  const group = await prisma.group.upsert({
    where: { name: "Groupe par défaut" },
    update: {},
    create: { name: "Groupe par défaut" },
  });
  console.log("✅ Group verified.");

  // 2. Create 'Éducation Populaire' module
  const module = await prisma.module.create({
    data: {
      title: "Éducation Populaire",
      description: "Module de test pour vérifier la nouvelle structure.",
      objective: "Comprendre les bases de l'éducation populaire.",
      contentType: "TEXT",
      groups: {
        connect: { id: group.id }
      },
      creatorId: admin.id
    },
  });

  console.log(`🚀 Module '${module.title}' créé avec succès (ID: ${module.id}, Type: ${module.contentType})`);
  
  // 3. Verify relations (Self-relation test)
  const trainer = await prisma.user.create({
    data: {
      email: "trainer@example.com",
      name: "Formateur Test",
      role: "TRAINER",
    }
  });

  const student = await prisma.user.create({
    data: {
      email: "student@example.com",
      name: "Stagiaire Test",
      role: "STUDENT",
      trainerId: trainer.id,
    }
  });

  console.log(`🔗 Relation test : Stagiaire '${student.name}' lié au formateur '${trainer.name}'`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
