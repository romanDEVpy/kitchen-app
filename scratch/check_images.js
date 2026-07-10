const { PrismaClient } = require('../src/generated/prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../dev.db');
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function check() {
  const products = await prisma.product.findMany();
  console.log(`Checking ${products.length} products for missing images...`);
  
  const publicDir = path.resolve(__dirname, '../public');
  let missingCount = 0;
  
  products.forEach(p => {
    const images = p.imageUrl ? p.imageUrl.split(',').filter(Boolean) : [];
    images.forEach(img => {
      // Resolve path
      const fullPath = path.join(publicDir, img);
      if (!fs.existsSync(fullPath)) {
        console.log(`[MISSING] Product "${p.title}" (slug: ${p.slug}) references missing file: ${img}`);
        missingCount++;
      } else {
        console.log(`[OK] Product "${p.title}" references: ${img}`);
      }
    });
  });
  
  console.log(`Check complete. Found ${missingCount} missing images.`);
  await prisma.$disconnect();
}

check();
