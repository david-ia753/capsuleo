const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'davidroujet@hotmail.fr';
  const hashedPassword = await bcrypt.hash('Password123!', 10);
  
  const user = await prisma.user.update({
    where: { email },
    data: { password: hashedPassword, status: 'APPROVED' }
  });
  
  console.log('User updated:', user.email);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
