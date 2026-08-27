const command = process.argv[2];

if (command !== 'build' && command !== 'start') {
  throw new Error('Usage: node scripts/next-production.js <build|start> [...next options]');
}

process.env.NODE_ENV = 'production';
process.argv = [process.argv[0], require.resolve('next/dist/bin/next'), command, ...process.argv.slice(3)];

require('next/dist/bin/next');
