const { PrismaClient } = require('../src/generated/prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../dev.db');
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

console.log('Available models on prisma client:');
console.log(Object.keys(prisma));

async function main() {
  try {
    console.log('Type of prisma.lead:', typeof prisma.lead);
    console.log('Type of prisma.product:', typeof prisma.product);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
