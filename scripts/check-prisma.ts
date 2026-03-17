import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log("Checking for fileProgress model...")
    // @ts-ignore
    const count = await prisma.fileProgress.count()
    console.log("Success! fileProgress count:", count)
  } catch (e: any) {
    console.error("Failed to access fileProgress:", e.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
