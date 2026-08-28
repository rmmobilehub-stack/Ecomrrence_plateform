/* eslint-disable no-console */
const { runMigrations } = require('./migrate');
const { seedDatabase } = require('./seed');

async function main() {
  const command = process.argv[2];
  if (!['dev', 'build', 'start'].includes(command)) {
    throw new Error('Usage: node scripts/next-production.js <dev|build|start> [...next options]');
  }

  process.env.NODE_ENV = command === 'dev' ? 'development' : 'production';

  // Builds must stay deterministic and should never mutate a live database.
  // Runtime starts apply pending migrations before accepting requests.
  if (command !== 'build') {
    await runMigrations();
    await seedDatabase();
  }

  process.argv = [
    process.argv[0],
    require.resolve('next/dist/bin/next'),
    command,
    ...process.argv.slice(3),
  ];
  require('next/dist/bin/next');
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
