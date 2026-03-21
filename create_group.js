const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
require("dotenv").config();

async function createGroup() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  const adapter = new PrismaPg(pool);
  
  const prisma = new PrismaClient({ adapter });

  try {
    const group = await prisma.group.upsert({
      where: { name: "Général" },
      update: {},
      create: {
        name: "Général",
        description: "Groupe par défaut"
      }
    });
    console.log("Group Ready:", group.id);
  } catch (err) {
    console.error("Error creating group:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

createGroup();
