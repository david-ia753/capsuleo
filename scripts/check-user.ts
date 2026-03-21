import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'davidroujet@gmail.com' },
    select: { id: true, email: true, role: true, password: true, firstName: true }
  });
  
  console.log('User found:', JSON.stringify(user, null, 2));
  if (user && user.password) {
    console.log('Password is set (length):', user.password.length);
  } else {
    console.log('Password is NOT set or user not found.');
  }

  const allAdmins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { email: true }
  });
  console.log('All Admins:', allAdmins.map(a => a.email));
}

main()
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
