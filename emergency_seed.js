const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const hashedPassword = await bcrypt.hash('Passe123!', 10);
    
    // 1. Admin
    const admin = await prisma.user.upsert({
      where: { email: 'davidroujet@gmail.com' },
      update: { role: 'ADMIN' },
      create: {
        email: 'davidroujet@gmail.com',
        name: 'David Roujet',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    // 2. Formateur
    const trainer = await prisma.user.upsert({
      where: { email: 'formateur@capsuleo.com' },
      update: { role: 'TRAINER' },
      create: {
        email: 'formateur@capsuleo.com',
        name: 'Formateur Test',
        password: hashedPassword,
        role: 'TRAINER'
      }
    });

    // 3. Quelques modules de test
    await prisma.module.upsert({
      where: { id: 'test-module-1' },
      update: {},
      create: {
        id: 'test-module-1',
        title: 'Introduction à la Vente',
        description: 'Bases de la vente',
        creatorId: admin.id
      }
    });

    await prisma.module.upsert({
      where: { id: 'test-module-2' },
      update: {},
      create: {
        id: 'test-module-2',
        title: 'Négociation Avancée',
        description: 'Techniques de négociation',
        creatorId: trainer.id
      }
    });

    // 4. Un groupe
    await prisma.group.upsert({
      where: { name: 'Promo Alpha' },
      update: {},
      create: {
        name: 'Promo Alpha',
        description: 'Première promotion de test',
        trainerId: trainer.id
      }
    });

    console.log('✅ Seed de secours terminé !');
  } catch (e) {
    console.error('❌ Erreur seed:', e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

seed();
