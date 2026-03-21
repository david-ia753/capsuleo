const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
require("dotenv").config();

async function listGroups() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  try {
    const groups = await prisma.group.findMany();
    console.log("All Groups in Neon:");
    groups.forEach(g => console.log(`- ${g.id}: ${g.name}`));
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

listGroups();
