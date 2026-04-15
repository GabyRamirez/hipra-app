import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seed started...');

  // Create test workers
  const testWorkers = [
    { email: 'test1@okayako.com', name: 'Test One' },
    { email: 'test2@okayako.com', name: 'Test Two' },
    { email: 'test3@okayako.com', name: 'Test Three' },
    { email: 'industria@intersindical-csc.cat', name: 'Indústria Intersindical' },
  ];

  for (const w of testWorkers) {
    await prisma.worker.upsert({
      where: { email: w.email },
      update: {},
      create: {
        email: w.email,
        name: w.name,
        token: randomBytes(32).toString('hex'),
      },
    });
  }

  // Create an admin (password: hipra_admin_2024 - you should change this)
  // Note: Better to hash it, but for a simple internal tool we can start with a basic check or hash.
  // I'll use a placeholder for the hash.
  await prisma.admin.upsert({
    where: { email: 'admin@lainter.cat' },
    update: {},
    create: {
      email: 'admin@lainter.cat',
      passwordHash: 'hipra_admin_2026', // Placeholder
    },
  });

  console.log('Seed finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
