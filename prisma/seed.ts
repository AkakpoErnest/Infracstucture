// tsx runs this script outside Next.js's request lifecycle, so .env.local
// isn't loaded automatically the way it is for the app itself. @next/env is
// the officially recommended way to load the same .env stack Next.js uses,
// in a standalone script — it ships as part of the `next` package, so it
// resolves without adding a separate dependency.
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { PrismaClient } from "@prisma/client";
import { seedBrands, seedProducts } from "./seed-data";

const prisma = new PrismaClient();

async function main() {
  const brandIdByName = new Map<string, string>();

  for (const brand of seedBrands) {
    const created = await prisma.brand.upsert({
      where: { name: brand.name },
      update: {},
      create: { name: brand.name, logoUrl: brand.logoUrl },
    });
    brandIdByName.set(brand.name, created.id);
  }

  for (const product of seedProducts) {
    const brandId = brandIdByName.get(product.brandName);
    if (!brandId) {
      throw new Error(`Unknown brand "${product.brandName}" for product "${product.name}"`);
    }
    const existing = await prisma.product.findFirst({ where: { name: product.name } });
    if (existing) continue;
    await prisma.product.create({
      data: {
        name: product.name,
        brandId,
        category: product.category,
        styleTags: product.styleTags.join(","),
        color: product.color,
        material: product.material,
        price: product.price,
        dimensions: product.dimensions,
        imageUrl: product.imageUrl,
      },
    });
  }

  console.log(`Seeded ${seedBrands.length} brands and ${seedProducts.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
