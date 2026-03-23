const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const email = "david.roujet@mucominisport.fr";
  try {
    // Also delete any invitations to avoid conflict if any
    await prisma.invitation.deleteMany({
      where: { email: email.toLowerCase() }
    });
    
    const user = await prisma.user.delete({
      where: { email: email.toLowerCase() }
    });
    console.log(`Deleted user: ${user.email}`);
  } catch (error) {
    if (error.code === 'P2025') {
      console.log(`User ${email} not found.`);
    } else {
      console.error("Error deleting user:", error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
