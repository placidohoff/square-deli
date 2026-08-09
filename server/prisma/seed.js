// Seed script: populates the database with a starting dataset so there's
// something to query once the schema exists. Run it with `npm run prisma:seed`
// (or automatically after `prisma migrate dev` — Prisma calls the `prisma.seed`
// script from package.json whenever you run migrate dev on a fresh DB).
//
// seed-data.json was pulled once from the live ASP.NET API's
// GET /api/MenuItems/grouped endpoint and flattened into a single array, so
// the new Postgres DB starts with the real current menu instead of fake data.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedItems = JSON.parse(
  readFileSync(path.join(__dirname, 'seed-data.json'), 'utf-8')
);

async function main() {
  for (const item of seedItems) {
    await prisma.menuItem.create({
      data: {
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
        basePrice: item.basePrice,
        category: item.category,
        // Nested create: Prisma inserts the MenuItem row and its related
        // Price rows in a single call, wiring up the foreign key for us.
        prices: {
          create: item.prices,
        },
      },
    });
  }

  console.log(`Seeded ${seedItems.length} menu items.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
