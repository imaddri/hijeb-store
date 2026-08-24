import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/layout/Navbar";

import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

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
// OFFERS PAGE
// ============================================================

export default async function OffersPage() {
  // ==========================================================
  // CURRENT DATE
  // ==========================================================

  const now = new Date();

  // ==========================================================
  // GET ACTIVE PRODUCTS
  // ==========================================================

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
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
            lte: now,
          },

          endDate: {
            gte: now,
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
  // FILTER PRODUCTS WITH OFFERS
  // ==========================================================

  const offerProducts = products.filter((product) => {
    // ========================================================
    // OFFER FROM OFFER TABLE
    // ========================================================

    const activeOffer = product.offers[0];

    const offerDiscount =
      activeOffer !== undefined &&
      activeOffer.oldPrice !== null &&
      activeOffer.newPrice !== null &&
      activeOffer.oldPrice > activeOffer.newPrice;

    // ========================================================
    // DIRECT PRODUCT DISCOUNT
    // ========================================================

    const productDiscount =
      product.oldPrice !== null &&
      product.oldPrice > product.price;

    // ========================================================
    // PRODUCT HAS DISCOUNT
    // ========================================================

    return productDiscount || offerDiscount;
  });

  // ==========================================================
  // PRODUCT IMAGE
  // ==========================================================

  const getProductImage = (
    product: (typeof products)[number]
  ) => {
    // الصورة الرئيسية
    if (product.image) {
      return product.image;
    }

    // أول صورة إضافية
    if (product.images.length > 0) {
      return product.images[0].url;
    }

    // صورة افتراضية
    return "/images/product-placeholder.jpg";
  };

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <>
      {/* ==================================================== */}
      {/* NAVBAR */}
      {/* ==================================================== */}

      <Navbar />

      <main
        dir="rtl"
        className="min-h-screen bg-[#f8f5ef]"
      >
        {/* ==================================================== */}
        {/* HEADER */}
        {/* ==================================================== */}

        <section className="border-b border-black/10 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-4 sm:py-3">

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

              {/* ================================================= */}
              {/* TITLE */}
              {/* ================================================= */}

              <div>

                <p className="mb-3 text-xs font-medium tracking-[0.3em] text-[#a3834d]">
                  SPECIAL OFFERS
                </p>

                <h1 className="text-4xl font-semibold tracking-tight text-[#1f1f1f] sm:text-5xl">
                  العروض المميزة
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-7 text-black/50">
                  اكتشفي أحدث عروضنا واستفيدي من الخصومات
                  المميزة على مجموعة مختارة من منتجاتنا.
                </p>

              </div>

              {/* ================================================= */}
              {/* BACK TO STORE */}
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

        <section className="py-8 sm:py-4">
          <div className="mx-auto max-w-7xl px-6">

            {/* ================================================= */}
            {/* PRODUCTS HEADER */}
            {/* ================================================= */}

            <div className="mb-8 flex items-center justify-between">

              <p className="text-sm text-black/50">
                {offerProducts.length} منتج في العروض
              </p>

            </div>

            {/* ================================================= */}
            {/* PRODUCTS GRID */}
            {/* ================================================= */}

            {offerProducts.length > 0 ? (

              <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">

                {offerProducts.map((product) => (

                  <div
                    key={product.id}
                    className="min-w-0"
                  >

                    <ProductCard
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

                  </div>

                ))}

              </div>

            ) : (

              /* ================================================= */
              /* EMPTY STATE */
              /* ================================================= */

              <div className="rounded-3xl border border-black/5 bg-white p-12 text-center">

                <p className="text-lg font-medium text-[#1f1f1f]">
                  لا توجد عروض متاحة حاليًا
                </p>

                <p className="mt-2 text-sm text-black/40">
                  ترقبي عروضنا القادمة قريبًا.
                </p>

                <Link
                  href="/"
                  className="
                    mt-6
                    inline-flex
                    rounded-full
                    bg-[#1f1f1f]
                    px-6
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-[#a3834d]
                  "
                >
                  العودة إلى المتجر
                </Link>

              </div>

            )}

          </div>
        </section>

      </main>
    </>
  );
}