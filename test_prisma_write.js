const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
require("dotenv").config();

async function testPrismaWrite() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  const adapter = new PrismaPg(pool);
  
  const prisma = new PrismaClient({
    adapter,
  });

  try {
    console.log("Connecting...");
    await prisma.$connect();
    console.log("Connected. Creating dummy module...");
    const mod = await prisma.module.create({
      data: {
        title: "Test Antigravity",
        objective: "Tester si on peut écrire dans la base."
      }
    });
    console.log("Successfully created module with ID:", mod.id);
    await prisma.module.delete({ where: { id: mod.id } });
    console.log("Cleaned up dummy module.");
  } catch (err) {
    console.error("Prisma Write Test Error:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

testPrismaWrite();
