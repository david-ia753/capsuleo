import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const adminEmail = 'davidroujet@gmail.com';
  const password = 'capsuléo8045214521Dr!';
  
  console.log(`Setting password for ${adminEmail}...`);
  const hashedPassword = await bcrypt.hash(password, 10);

  // 1. Update/Create main admin
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      firstName: 'David',
      lastName: 'Roujet',
      name: 'David Roujet'
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      firstName: 'David',
      lastName: 'Roujet',
      name: 'David Roujet'
    }
  });

  console.log(`✅ Admin ${admin.email} updated with new password.`);

  // 2. Remove other admins
  const otherAdmins = await prisma.user.findMany({
    where: {
      role: 'ADMIN',
      NOT: { email: adminEmail }
    }
  });

  if (otherAdmins.length > 0) {
    console.log(`Found ${otherAdmins.length} other admins. Removing them...`);
    for (const other of otherAdmins) {
      try {
        await prisma.user.delete({ where: { id: other.id } });
        console.log(`- Deleted admin: ${other.email}`);
      } catch (e) {
        console.warn(`- Could not delete ${other.email} due to existing relations. Changing role to STUDENT instead.`);
        await prisma.user.update({
          where: { id: other.id },
          data: { role: 'STUDENT' }
        });
      }
    }
  } else {
    console.log('No other admins found.');
  }

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
