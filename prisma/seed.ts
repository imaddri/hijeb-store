import "dotenv/config";

import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

// ======================================================
// MAIN
// ======================================================

async function main() {
  console.log("🌱 Starting database seed...");

  // ====================================================
  // CATEGORIES
  // ====================================================

  const hijabs = await prisma.category.upsert({
    where: {
      slug: "hijabs",
    },

    update: {
      name: "حجابات",
      code: "H",
    },

    create: {
      name: "حجابات",
      slug: "hijabs",
      code: "H",
    },
  });

  const abayas = await prisma.category.upsert({
    where: {
      slug: "abayas",
    },

    update: {
      name: "عبايات",
      code: "A",
    },

    create: {
      name: "عبايات",
      slug: "abayas",
      code: "A",
    },
  });

  const khimars = await prisma.category.upsert({
    where: {
      slug: "khimars",
    },

    update: {
      name: "خمارات",
      code: "K",
    },

    create: {
      name: "خمارات",
      slug: "khimars",
      code: "K",
    },
  });

  console.log("✅ Categories created");

  // ====================================================
  // PRODUCTS
  // ====================================================

  const products = [
    // --------------------------------------------------
    // HIJABS
    // --------------------------------------------------

    {
      productCode: "H1",

      name: "حجاب حريري فاخر",

      slug: "luxury-silk-hijab",

      description:
        "حجاب حريري فاخر بتصميم أنيق وخامة ناعمة تمنحك إطلالة راقية ومريحة.",

      price: 1800,

      oldPrice: null,

      stock: 20,

      image: "/images/products/hijab-1.jpg",

      isActive: true,

      isFeatured: true,

      isNew: true,

      discountPercent: null,

      categoryId: hijabs.id,
    },

    {
      productCode: "H2",

      name: "حجاب كريب فاخر",

      slug: "luxury-crepe-hijab",

      description:
        "حجاب كريب فاخر بخامة أنيقة ومظهر راقٍ يناسب الإطلالات اليومية.",

      price: 2200,

      oldPrice: null,

      stock: 25,

      image: "/images/products/hijab-2.jpg",

      isActive: true,

      isFeatured: false,

      isNew: false,

      discountPercent: null,

      categoryId: hijabs.id,
    },

    // --------------------------------------------------
    // ABAYAS
    // --------------------------------------------------

    {
      productCode: "A1",

      name: "عباية سوداء كلاسيكية",

      slug: "classic-black-abaya",

      description:
        "عباية سوداء كلاسيكية بتصميم أنيق يناسب مختلف المناسبات.",

      price: 8500,

      oldPrice: 10000,

      stock: 15,

      image: "/images/products/abaya-1.jpg",

      isActive: true,

      isFeatured: true,

      isNew: false,

      discountPercent: 15,

      categoryId: abayas.id,
    },

    {
      productCode: "A2",

      name: "عباية مطرزة",

      slug: "embroidered-abaya",

      description:
        "عباية مطرزة بتفاصيل فاخرة وتصميم مميز لإطلالة أنيقة.",

      price: 12000,

      oldPrice: 14500,

      stock: 10,

      image: "/images/products/abaya-2.jpg",

      isActive: true,

      isFeatured: true,

      isNew: false,

      discountPercent: 17,

      categoryId: abayas.id,
    },

    // --------------------------------------------------
    // KHIMARS
    // --------------------------------------------------

    {
      productCode: "K1",

      name: "خمار شرعي أنيق",

      slug: "elegant-sharia-khimar",

      description:
        "خمار شرعي أنيق بخامة مريحة وتصميم عملي للاستخدام اليومي.",

      price: 3200,

      oldPrice: null,

      stock: 18,

      image: "/images/products/khimar-1.jpg",

      isActive: true,

      isFeatured: true,

      isNew: true,

      discountPercent: null,

      categoryId: khimars.id,
    },

    {
      productCode: "K2",

      name: "خمار واسع Premium",

      slug: "premium-wide-khimar",

      description:
        "خمار واسع Premium بخامة فاخرة وتصميم يوفر الراحة والاحتشام.",

      price: 3500,

      oldPrice: null,

      stock: 12,

      image: "/images/products/khimar-2.jpg",

      isActive: true,

      isFeatured: false,

      isNew: false,

      discountPercent: null,

      categoryId: khimars.id,
    },
  ];

  // ====================================================
  // UPSERT PRODUCTS
  // ====================================================

  for (const product of products) {
    await prisma.product.upsert({
      where: {
        productCode: product.productCode,
      },

      update: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        oldPrice: product.oldPrice,
        stock: product.stock,
        image: product.image,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        isNew: product.isNew,
        discountPercent: product.discountPercent,
        categoryId: product.categoryId,
      },

      create: product,
    });
  }

  console.log("✅ Products created");

  // ====================================================
  // SHOW CATEGORIES
  // ====================================================

  const allCategories = await prisma.category.findMany({
    select: {
      code: true,
      name: true,
      slug: true,
    },

    orderBy: {
      code: "asc",
    },
  });

  console.log("\n📂 Categories:");

  for (const category of allCategories) {
    console.log(
      `${category.code} → ${category.name} (${category.slug})`
    );
  }

  // ====================================================
  // SHOW PRODUCTS
  // ====================================================

  const allProducts = await prisma.product.findMany({
    select: {
      productCode: true,
      name: true,

      category: {
        select: {
          name: true,
          code: true,
        },
      },
    },

    orderBy: {
      productCode: "asc",
    },
  });

  console.log("\n📦 Products:");

  for (const product of allProducts) {
    console.log(
      `${product.productCode} → ${product.name} (${product.category.code} - ${product.category.name})`
    );
  }

  console.log("\n🎉 Database seed completed successfully!");
}

// ======================================================
// EXECUTE
// ======================================================

main()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);

    process.exit(1);
  })

  .finally(async () => {
    await prisma.$disconnect();
  });