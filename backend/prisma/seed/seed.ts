// Use the already-generated Prisma client to avoid requiring `prisma generate` here.
// The generated client lives at backend/generated/prisma and exports PrismaClient.
const { PrismaClient } = require('../../generated/prisma');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const gameData = [
    { name: 'Aim Trainer', description: 'Practice your aiming skills.' },
    { name: 'Reaction Time', description: 'Test how fast you can react.' },
    { name: 'Tracking', description: 'Improve your ability to follow targets.' },
  ];

  for (const game of gameData) {
    const upsertGame = await prisma.games.upsert({
      where: { name: game.name }, // Use 'name' as a unique identifier for upserting
      update: {}, // No specific update needed if the record exists
      create: {
        name: game.name,
        description: game.description,
      },
    });
    console.log(`Upserted game with id: ${upsertGame.id} and name: ${upsertGame.name}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });