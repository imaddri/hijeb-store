import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/layout/Navbar";

import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { notFound } from "next/navigation";

// ============================================================
// DATABASE CLIENT
// ============================================================

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// ============================================================
// DYNAMIC PAGE
// ============================================================

export const dynamic = "force-dynamic";

// ============================================================
// TYPES
// ============================================================

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

// ============================================================
// CATEGORY PAGE
// ============================================================

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { slug } = await params;

  // ==========================================================
  // ALLOWED CATEGORIES
  // ==========================================================

  const allowedCategories = [
    "hijabs",
    "abayas",
    "khimars",
  ];

  // إذا كان التصنيف غير موجود
  if (!allowedCategories.includes(slug)) {
    notFound();
  }

  // ==========================================================
  // GET CATEGORY
  // ==========================================================

  const category = await prisma.category.findUnique({
    where: {
      slug,
    },
  });

  // إذا لم نجد التصنيف في قاعدة البيانات
  if (!category) {
    notFound();
  }

  // ==========================================================
  // GET PRODUCTS
  // ==========================================================

  const products = await prisma.product.findMany({
    where: {
      isActive: true,

      category: {
        slug,
      },
    },

    include: {
      category: true,

      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },

      offers: {
        where: {
          startDate: {
            lte: new Date(),
          },

          endDate: {
            gte: new Date(),
          },
        },

        orderBy: {
          createdAt: "desc",
        },

        take: 1,
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  // ==========================================================
  // PRODUCT IMAGE
  // ==========================================================

  const getProductImage = (
    product: (typeof products)[number]
  ) => {
    // الصورة الرئيسية الموجودة في Product
    if (product.image) {
      return product.image;
    }

    // أول صورة من ProductImage
    if (product.images.length > 0) {
      return product.images[0].url;
    }

    // صورة افتراضية
    return "/images/product-placeholder.jpg";
  };

  // ==========================================================
  // CATEGORY NAME
  // ==========================================================

  const categoryNames: Record<string, string> = {
    hijabs: "الحجابات",
    abayas: "العبايات",
    khimars: "الخمارات",
  };

  const categoryName =
    categoryNames[slug] ?? category.name;

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <>
      {/* ==================================================== */}
      {/* NAVBAR */}
      {/* ==================================================== */}

      <Navbar />

      <main className="min-h-screen bg-[#f8f5ef]">

        {/* ==================================================== */}
        {/* HEADER */}
        {/* ==================================================== */}

        <section className="border-b border-black/10 bg-white">

          <div className="mx-auto max-w-7xl px-6 py-12 sm:py-5">

            {/* ================================================= */}
            {/* TOP ROW */}
            {/* ================================================= */}

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

              {/* ================================================= */}
              {/* TITLE */}
              {/* ================================================= */}

              <div>

                <p className="mb-3 text-xs font-medium tracking-[0.3em] text-[#a3834d]">
                  COLLECTION
                </p>

                <h1 className="text-4xl font-semibold tracking-tight text-[#1f1f1f] sm:text-5xl">
                  {categoryName}
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-7 text-black/50">
                  اكتشفي مجموعتنا المختارة من  {categoryName} 

                   بتصاميم  أنيقة تجمع بين الجودة والراحة والجمال .
                </p>

              </div>

              {/* ================================================= */}
              {/* BACK BUTTON */}
              {/* ================================================= */}

              <Link
                href="/"
                className="
                  shrink-0
                  rounded-xl
                  border
                  border-[#a3834d]/30
                  bg-[#f8f5ef]
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-[#a3834d]
                  shadow-sm
                  transition
                  hover:border-[#a3834d]
                  hover:bg-[#a3834d]
                  hover:text-white
                "
              >
                ← العودة للمتجر
              </Link>

            </div>

          </div>

        </section>

        {/* ==================================================== */}
        {/* PRODUCTS */}
        {/* ==================================================== */}

        <section className="py-4">

          <div className="mx-auto max-w-7xl px-6">

            {/* ================================================= */}
            {/* PRODUCTS HEADER */}
            {/* ================================================= */}

            <div className="mb-10 flex items-center justify-between">

              

              {/* ================================================= */}
              {/* COUNT */}
              {/* ================================================= */}

              <p className="text-sm text-black/50">
                {products.length} منتج
              </p>

            </div>

            {/* ================================================= */}
            {/* PRODUCTS GRID */}
            {/* ================================================= */}

            {products.length > 0 ? (

              <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">

                {products.map((product) => (

                  <ProductCard
                    key={product.id}
                    product={{
                      id: product.id,
                      name: product.name,
                      slug: product.slug,
                      price: product.price,
                      oldPrice: product.oldPrice,
                      image: getProductImage(product),

                      category: {
                        name: product.category.name,
                      },
                    }}
                  />

                ))}

              </div>

            ) : (

              /* ================================================= */
              /* EMPTY STATE */
              /* ================================================= */

              <div className="rounded-3xl border border-black/5 bg-white p-12 text-center">

                <p className="text-lg font-medium text-[#1f1f1f]">
                  لا توجد منتجات في هذا التصنيف حاليًا
                </p>

                <p className="mt-2 text-sm text-black/40">
                  سيتم إضافة المنتجات قريبًا.
                </p>

              </div>

            )}

          </div>

        </section>

      </main>
    </>
  );
}