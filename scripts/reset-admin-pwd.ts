import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email1 = 'davidroujet@gmail.com';
  const email2 = 'sdavidroujet@gmail.com';
  const newPassword = 'Passe123!';
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  let found = false;
  for (const email of [email1, email2]) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword, role: 'ADMIN', status: 'APPROVED' }
      });
      console.log(`✅ Mot de passe réinitialisé pour l'utilisateur : ${email}`);
      console.log(`Nouveau mot de passe : ${newPassword}`);
      found = true;
    }
  }

  if (!found) {
    console.log(`❌ Aucun utilisateur trouvé avec ces adresses emails.`);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
