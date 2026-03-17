import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 DEBUT DU NETTOYAGE RADICAL...')

  // 1. Progressions
  const progress = await prisma.fileProgress.deleteMany({})
  console.log(`✅ ${progress.count} progressions supprimées.`)

  // 2. Invitations
  const invitations = await prisma.invitation.deleteMany({})
  console.log(`✅ ${invitations.count} invitations supprimées.`)

  // 3. Stagiaires et Formateurs (Users avec role != ADMIN)
  // On garde les admins
  const users = await prisma.user.deleteMany({
    where: {
      role: {
        in: ['STUDENT', 'TRAINER']
      }
    }
  })
  console.log(`✅ ${users.count} utilisateurs (Stagiaires/Formateurs) supprimés.`)

  // 4. On peut aussi vider les groupes si besoin, mais le user a dit "groupes ne doivent pas être supprimés" 
  // dans sa demande de suppression de formateur individuelle. 
  // Mais ici il dit "VIDE TOUTE LA BASE (Stagiaires, Formateurs, Invitations, Progressions)".
  // Je vais garder les Groupes et Modules car ils sont précieux, mais vides de membres.
  
  // En fait, pour repartir de zéro, je vais vider les relations dans les groupes.
  await prisma.group.updateMany({
    data: {
      trainerId: null
    }
  })
  console.log(`✅ Relations de groupes réinitialisées.`)

  console.log('✨ NETTOYAGE TERMINÉ. Base prête pour une nouvelle invitation.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
