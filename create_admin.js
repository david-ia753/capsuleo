const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
require("dotenv").config();

async function createAdmin() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  const adapter = new PrismaPg(pool);
  
  const prisma = new PrismaClient({ adapter });

  try {
    const adminEmail = "davidroujet@gmail.com";
    console.log("Upserting admin user:", adminEmail);
    const user = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: "ADMIN", name: "David Roujet" },
      create: {
        email: adminEmail,
        name: "David Roujet",
        role: "ADMIN"
      }
    });
    console.log("Admin User Ready:", user.id);
  } catch (err) {
    console.error("Error creating admin:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

createAdmin();
