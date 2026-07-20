import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { products } from "../lib/products";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding products...");

  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (existing) {
      await prisma.productColor.deleteMany({ where: { productId: existing.id } });
      await prisma.productSize.deleteMany({ where: { productId: existing.id } });
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          name: p.name,
          tagline: p.tagline,
          category: p.category,
          price: p.price,
          drop: p.drop,
          description: p.description,
          details: JSON.stringify(p.details),
          printArea: JSON.stringify(p.printArea),
          customizable: p.customizable,
          active: true,
          colors: {
            create: p.colors.map((c, i) => ({
              name: c.name,
              hex: c.hex,
              fabric: c.fabric,
              printDefault: c.printDefault,
              sortOrder: i
            }))
          },
          sizes: {
            create: p.sizes.map((label, i) => ({ label, sortOrder: i }))
          }
        }
      });
    } else {
      await prisma.product.create({
        data: {
          slug: p.slug,
          name: p.name,
          tagline: p.tagline,
          category: p.category,
          price: p.price,
          drop: p.drop,
          description: p.description,
          details: JSON.stringify(p.details),
          printArea: JSON.stringify(p.printArea),
          customizable: p.customizable,
          active: true,
          colors: {
            create: p.colors.map((c, i) => ({
              name: c.name,
              hex: c.hex,
              fabric: c.fabric,
              printDefault: c.printDefault,
              sortOrder: i
            }))
          },
          sizes: {
            create: p.sizes.map((label, i) => ({ label, sortOrder: i }))
          }
        }
      });
    }
    console.log(`  ✓ ${p.slug}`);
  }

  const email = process.env.ADMIN_EMAIL || "admin@thewearco.local";
  const password = process.env.ADMIN_PASSWORD || "change-me";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.admin.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash }
  });
  console.log(`Admin seeded: ${email}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
