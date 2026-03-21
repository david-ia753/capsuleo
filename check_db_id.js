const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
require("dotenv").config();

async function checkId() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  try {
    const u = await prisma.user.findFirst({ where: { email: "davidroujet@gmail.com" } });
    console.log("Neon User:", JSON.stringify(u, null, 2));
    const g = await prisma.group.findFirst({ where: { name: "Général" } });
    console.log("Neon Group:", JSON.stringify(g, null, 2));
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

checkId();
