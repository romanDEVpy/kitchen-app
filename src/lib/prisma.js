import { PrismaClient } from '../generated/prisma/index.js';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

function resolveDatabasePath() {
  const configured = process.env.TEST_DATABASE_FILE || process.env.DATABASE_FILE || 'dev.db';
  return path.isAbsolute(configured) ? configured : path.resolve(/* turbopackIgnore: true */ process.cwd(), configured);
}

const globalForPrisma = globalThis;

function createPrismaClient() {
  const dbPath = resolveDatabasePath();
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
  return new PrismaClient({
    adapter,
    log: ['error', 'warn']
  });
}

export const prisma = globalForPrisma.__kitchenPrismaClient || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__kitchenPrismaClient = prisma;
}
