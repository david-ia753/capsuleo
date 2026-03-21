const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
require("dotenv").config();

async function checkData() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  try {
    const mods = await prisma.module.findMany();
    console.log("Modules in Neon:");
    mods.forEach(m => console.log(`- ${m.id}: ${m.title}`));
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

checkData();
