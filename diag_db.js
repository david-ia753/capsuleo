const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const invitations = await prisma.invitation.findMany();
  console.log('Invitations:', JSON.stringify(invitations, null, 2));
  const users = await prisma.user.findMany({ where: { role: 'TRAINER' } });
  console.log('Trainers:', JSON.stringify(users, null, 2));
}
main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
