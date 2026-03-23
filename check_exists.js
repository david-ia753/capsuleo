const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function main() {
  const files = await prisma.uploadedFile.findMany();
  const report = [];
  
  const publicDir = path.join(process.cwd(), 'public', 'uploads');
  const storageDir = path.join(process.cwd(), 'storage', 'uploads');
  
  for (const file of files) {
    const pubExists = fs.existsSync(path.join(publicDir, file.filename));
    const stoExists = fs.existsSync(path.join(storageDir, file.filename));
    
    report.push({
      id: file.id,
      filename: file.filename,
      originalName: file.originalName,
      path: file.path,
      existsInPublic: pubExists,
      existsInStorage: stoExists
    });
  }
  
  console.log(JSON.stringify(report, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
