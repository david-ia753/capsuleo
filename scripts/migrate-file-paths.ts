import { PrismaClient } from "@prisma/client";

async function migratePaths() {
  const prisma = new PrismaClient();
  try {
    const files = await prisma.uploadedFile.findMany({
      where: {
        path: {
          startsWith: "/uploads/"
        }
      }
    });

    console.log(`Trouvé ${files.length} fichiers à migrer.`);

    for (const file of files) {
      const newPath = file.path.replace("/uploads/", "/api/files/");
      await prisma.uploadedFile.update({
        where: { id: file.id },
        data: { path: newPath }
      });
      console.log(`Migré: ${file.path} -> ${newPath}`);
    }

    console.log("Migration terminée avec succès.");
  } catch (err) {
    console.error("Erreur migration:", err);
  } finally {
    await prisma.$disconnect();
  }
}

migratePaths();
