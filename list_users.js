const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
require("dotenv").config();

async function listUsers() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  const adapter = new PrismaPg(pool);
  
  const prisma = new PrismaClient({ adapter });

  try {
    const users = await prisma.user.findMany();
    console.log("Database Users:");
    users.forEach(u => console.log(`- ${u.id}: ${u.email} (${u.role})`));
  } catch (err) {
    console.error("Error listing users:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

listUsers();
