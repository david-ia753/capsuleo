import { prisma } from "./src/lib/prisma";

async function main() {
  console.log("Prisma keys:", Object.keys(prisma));
  console.log("GroupModule model exists:", !!(prisma as any).groupModule);
}

main().catch(console.error);
