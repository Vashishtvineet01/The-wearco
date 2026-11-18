/**
 * Seed script — plain CommonJS so it runs with `node` on Vercel (no tsx).
 * Product catalog mirrors lib/products.ts
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const baseColors = {
  obsidian: { name: "Obsidian", hex: "#0a0a0a", fabric: "#0e0e10", printDefault: "#f7f7f7" },
  bone: { name: "Bone", hex: "#ece7dd", fabric: "#ece7dd", printDefault: "#0a0a0a" },
  graphite: { name: "Graphite", hex: "#2a2a2d", fabric: "#2a2a2d", printDefault: "#f7f7f7" },
  lime: { name: "Signal Lime", hex: "#d8ff36", fabric: "#d8ff36", printDefault: "#0a0a0a" }
};

const products = [
  {
    slug: "building-tee",
    name: "Building… Oversized Tee",
    tagline: "For the ones still shipping at 2:14 AM.",
    category: "tee",
    price: 1299,
    drop: "Drop 01 — Late Night",
    printArea: { x: 30, y: 28, w: 40, h: 30 },
    colors: [baseColors.obsidian, baseColors.bone, baseColors.graphite],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description:
      "Heavyweight 240 GSM cotton, drop-shoulder cut. Built for back-to-back demos and red-eye flights.",
    details: [
      "240 GSM combed cotton",
      "Drop-shoulder oversized fit",
      "Pre-shrunk, bio-washed",
      "Screen printed in India"
    ],
    customizable: true
  },
  {
    slug: "v1-hoodie",
    name: "v1.0 Premium Hoodie",
    tagline: "The first version is the bravest version.",
    category: "hoodie",
    price: 2499,
    drop: "Drop 01 — Late Night",
    printArea: { x: 32, y: 32, w: 36, h: 28 },
    colors: [baseColors.obsidian, baseColors.graphite, baseColors.bone],
    sizes: ["S", "M", "L", "XL"],
    description:
      "400 GSM brushed-fleece hoodie with kangaroo pocket and metal-tipped drawcords. Premium everyday wear.",
    details: [
      "400 GSM brushed fleece",
      "Boxy oversized fit",
      "Metal-tipped drawcords",
      "Embroidered ‘v1.0’ chest mark"
    ],
    customizable: true
  },
  {
    slug: "offline-mode-tee",
    name: "Offline Mode Tee",
    tagline: "Notifications off. Build mode on.",
    category: "tee",
    price: 1199,
    drop: "Drop 02 — Essentials",
    printArea: { x: 30, y: 30, w: 40, h: 28 },
    colors: [baseColors.bone, baseColors.obsidian],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description:
      "Soft-hand print on 220 GSM single jersey. Looks like default, feels like flow state.",
    details: ["220 GSM single jersey", "Relaxed boxy fit", "Soft-hand water-based print"],
    customizable: true
  },
  {
    slug: "late-night-shipping-cap",
    name: "Late Night Shipping Cap",
    tagline: "For the 1AM commits.",
    category: "cap",
    price: 899,
    drop: "Drop 02 — Essentials",
    printArea: { x: 30, y: 35, w: 40, h: 18 },
    colors: [baseColors.obsidian, baseColors.graphite, baseColors.lime],
    sizes: ["One Size"],
    description:
      "Unstructured 6-panel dad cap with brass buckle closure. Embroidered or printed — your call.",
    details: ["Unstructured 6-panel", "Brass buckle closure", "100% cotton twill"],
    customizable: true
  },
  {
    slug: "founder-energy-tee",
    name: "Signal Mark Tee",
    tagline: "A clean chest mark for everyday wear.",
    category: "tee",
    price: 1299,
    drop: "Drop 01 — Late Night",
    printArea: { x: 28, y: 28, w: 44, h: 32 },
    colors: [baseColors.obsidian, baseColors.bone, baseColors.lime],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Oversized statement tee with a screen-printed chest typeline.",
    details: ["240 GSM combed cotton", "Drop-shoulder oversized", "Limited run of 300 units"],
    customizable: true
  },
  {
    slug: "qr-secret-hoodie",
    name: "QR Secret Drop Hoodie",
    tagline: "Scan the sleeve. Unlock extras.",
    category: "hoodie",
    price: 2799,
    drop: "Drop 03 — QR Layer",
    printArea: { x: 32, y: 30, w: 36, h: 30 },
    colors: [baseColors.obsidian, baseColors.graphite],
    sizes: ["S", "M", "L", "XL"],
    description:
      "Each hoodie ships with a hidden QR on the sleeve. Scan it to unlock member extras on select pieces.",
    details: ["400 GSM brushed fleece", "Sleeve QR (silicone print)", "Members extras on unlock"],
    customizable: true
  },
  {
    slug: "no-days-off-tee",
    name: "No Days Off Tee",
    tagline: "Calm on the outside. Cron job on the inside.",
    category: "tee",
    price: 1199,
    drop: "Drop 02 — Essentials",
    printArea: { x: 30, y: 30, w: 40, h: 28 },
    colors: [baseColors.graphite, baseColors.obsidian, baseColors.bone],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Minimal back hit, tiny chest mark. Easy everyday tee.",
    details: ["220 GSM single jersey", "Front + back print", "Pre-shrunk"],
    customizable: true
  },
  {
    slug: "blank-canvas-tee",
    name: "Blank Canvas Tee — Print Yours",
    tagline: "Bring your art. We’ll print it.",
    category: "tee",
    price: 999,
    drop: "Studio — Made by You",
    printArea: { x: 25, y: 25, w: 50, h: 40 },
    colors: [baseColors.bone, baseColors.obsidian, baseColors.graphite],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description:
      "The canvas. Open the Design Studio, drop your artwork or type your own line, and we’ll print it on a premium 240 GSM tee.",
    details: ["240 GSM combed cotton", "DTG + screen print options", "Ships in 5–7 days"],
    customizable: true
  },

  /* --- Sweatshirts --------------------------------------------------- */
  {
    slug: "ship-mode-sweatshirt",
    name: "Ship Mode Crew Sweatshirt",
    tagline: "Heavyweight. Head-down. Hands moving.",
    category: "sweatshirt",
    price: 2199,
    drop: "Drop 02 — Essentials",
    printArea: { x: 30, y: 32, w: 40, h: 28 },
    printShape: "rect",
    colors: [baseColors.obsidian, baseColors.graphite, baseColors.bone],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description:
      "380 GSM brushed-fleece crew with ribbed cuffs and hem. Pairs with everything in your drawer.",
    details: ["380 GSM brushed fleece", "Ribbed cuffs + hem", "Boxy relaxed fit"],
    customizable: true
  },

  /* --- Mugs ---------------------------------------------------------- */
  {
    slug: "deploy-mug",
    name: "Deploy Mug — 330ml",
    tagline: "Fuel for the next commit.",
    category: "mug",
    price: 499,
    drop: "Studio — Made by You",
    printArea: { x: 25, y: 38, w: 44, h: 28 },
    printShape: "cylinder",
    colors: [baseColors.bone, baseColors.obsidian],
    sizes: ["330ml"],
    description:
      "Ceramic 330ml mug with wrap-around print. Dishwasher-safe. Microwave-safe. Red-eye-safe.",
    details: ["Ceramic, 330ml", "Full-wrap print", "Dishwasher + microwave safe"],
    customizable: true
  },

  /* --- Badges / Pins ------------------------------------------------- */
  {
    slug: "v1-badge",
    name: "v1.0 Enamel Pin",
    tagline: "Small. Loud. Worn by shippers.",
    category: "badge",
    price: 299,
    drop: "Drop 01 — Late Night",
    printArea: { x: 28, y: 28, w: 44, h: 44 },
    printShape: "circle",
    colors: [baseColors.lime, baseColors.obsidian, baseColors.bone],
    sizes: ["38mm", "58mm"],
    description:
      "Hard enamel pin with butterfly clutch. The quiet brag on your laptop bag.",
    details: ["Hard enamel", "Butterfly clutch", "Nickel plating"],
    customizable: true
  },

  /* --- Posters ------------------------------------------------------- */
  {
    slug: "founder-poster",
    name: "Studio Wall Poster",
    tagline: "Print it. Pin it. Hang it.",
    category: "poster",
    price: 699,
    drop: "Studio — Made by You",
    printArea: { x: 14, y: 14, w: 72, h: 72 },
    printShape: "full",
    colors: [baseColors.bone, baseColors.obsidian],
    sizes: ["A4", "A3", "A2"],
    description:
      "Giclée print on 200 GSM matte paper. Ship your own artwork or pick a drop poster — ships flat in a rigid mailer.",
    details: ["200 GSM matte paper", "Giclée print", "Ships flat in rigid mailer"],
    customizable: true
  }
];

async function upsertProduct(p) {
  const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
  const data = {
    name: p.name,
    tagline: p.tagline,
    category: p.category,
    price: p.price,
    drop: p.drop,
    description: p.description,
    details: JSON.stringify(p.details),
    printArea: JSON.stringify(p.printArea),
    printShape: p.printShape || "rect",
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
  };

  if (existing) {
    await prisma.productColor.deleteMany({ where: { productId: existing.id } });
    await prisma.productSize.deleteMany({ where: { productId: existing.id } });
    await prisma.product.update({ where: { id: existing.id }, data });
  } else {
    await prisma.product.create({ data: { slug: p.slug, ...data } });
  }
  console.log("  ✓", p.slug);
}

async function main() {
  console.log("Seeding products...");
  for (const p of products) {
    await upsertProduct(p);
  }

  const email = process.env.ADMIN_EMAIL || "admin@thewearco.local";
  const password = process.env.ADMIN_PASSWORD || "change-me";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.admin.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash }
  });
  console.log("Admin seeded:", email);
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
