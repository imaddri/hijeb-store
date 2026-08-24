import Image from "next/image";

import ProductCard from "@/components/ProductCard";
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
// HOME
// ============================================================

export default async function Home() {

  // ==========================================================
  // GET PRODUCTS FROM DATABASE
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
  // PRODUCTS WITH DISCOUNTS
  // ==========================================================

  const offerProducts = products.filter(
    (product) => {

      // العرض الموجود في جدول Offer
      const activeOffer = product.offers[0];

      // الخصم الموجود مباشرة في Product
      const productDiscount =
        product.oldPrice !== null &&
        product.oldPrice > product.price;

      // إذا كان هناك Offer فعال
      const offerDiscount =
        activeOffer !== undefined &&
        activeOffer.oldPrice !== null &&
        activeOffer.newPrice !== null &&
        activeOffer.oldPrice > activeOffer.newPrice;

      return productDiscount || offerDiscount;
    }
  );


  // ==========================================================
  // EMPTY IMAGE FALLBACK
  // ==========================================================

  const getProductImage = (
    product: (typeof products)[number]
  ) => {

    // الصورة الرئيسية الموجودة في Product
    if (product.image) {
      return product.image;
    }

    // إذا لم توجد صورة رئيسية نأخذ أول صورة
    // من ProductImage
    if (product.images.length > 0) {
      return product.images[0].url;
    }

    // fallback
    return "/images/product-placeholder.jpg";
  };


  return (
    
    <main className="overflow-x-hidden">

      {/* ===================================================== */}
      {/* ==================== HERO =========================== */}
      {/* ===================================================== */}

      <section className="bg-[#faf9f7]">

        <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-12 px-6 py-8 sm:py-10 lg:grid-cols-2 lg:gap-16 lg:py-10">

          {/* ================================================= */}
          {/* HERO CONTENT */}
          {/* ================================================= */}

          <div className="max-w-xl lg:-translate-y-6">

            <div className="mb-5 inline-block rounded-xl bg-[#f3f0ea] px-4 py-2">

              <p className="text-xl font-medium tracking-[0.5em] text-[#a3834d]">
                أزياء مرام
              </p>

            </div>


            <h2 className="text-5xl font-semibold leading-[1.1] tracking-tight text-[#1f1f1f] sm:text-6xl lg:text-7xl">

              أناقة

              <br />

              <span className="text-[#a3834d]">
                تليق بكِ
              </span>

            </h2>


            <p className="mt-6 max-w-lg text-base leading-8 text-black/60 sm:text-lg">

              اكتشفي تشكيلتنا المختارة من الحجابات والعبايات والخمارات
              المصممة بعناية لتمنحكِ إطلالة راقية تجمع بين الاحتشام والأناقة.

            </p>


            {/* BUTTONS */}

            <div className="mt-8 flex flex-wrap gap-4">

              <a
                href="#products"
                className="rounded-full bg-[#1f1f1f] px-8 py-4 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-[#a3834d]"
              >
                اكتشفي المجموعة
              </a>


              <a
                href="#categories"
                className="rounded-full border border-[#1f1f1f]/20 px-8 py-4 text-sm font-medium text-[#1f1f1f] transition hover:bg-[#1f1f1f] hover:text-white"
              >
                تصفحي الفئات
              </a>

            </div>


            {/* ================================================= */}
            {/* HERO STATS */}
            {/* ================================================= */}

            <div className="mt-9 grid grid-cols-3 gap-6 border-t border-black/10 pt-6">

              <div className="text-center">

                <h3 className="text-3xl font-bold text-[#a3834d]">
                  100%
                </h3>

                <p className="text-sm text-zinc-500">
                  جودة مختارة
                </p>

              </div>


              <div className="text-center">

                <h3 className="text-3xl font-bold text-[#a3834d]">
                  +{products.length}
                </h3>

                <p className="text-sm text-zinc-500">
                  منتجًا
                </p>

              </div>


              <div className="text-center">

                <h3 className="text-3xl font-bold text-[#a3834d]">
                  24/7
                </h3>

                <p className="text-sm text-zinc-500">
                  خدمة العملاء
                </p>

              </div>

            </div>

          </div>


          {/* ================================================= */}
          {/* HERO VISUAL */}
          {/* ================================================= */}

          <div className="relative mx-auto w-full max-w-[560px] lg:-translate-y-2">

            <div className="relative mx-auto w-fit rounded-[2.5rem] bg-white p-4 shadow-[0_25px_60px_rgba(31,31,31,0.16)] sm:p-5">

              <Image
                src="/hero/hero.png"
                alt="مجموعة الحجابات والعبايات"
                width={600}
                height={450}
                className="h-auto w-[290px] rounded-[2rem] object-cover sm:w-[380px] lg:w-[500px]"
                priority
              />


              {/* Decorative Circle */}

              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full border border-[#a3834d]/20" />

              <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full border border-[#a3834d]/15" />

            </div>


            {/* ABAYA CARD */}

            <div className="absolute right-0 top-8 z-20 rounded-2xl border border-black/5 bg-white px-5 py-4 shadow-xl sm:-right-2">

              <Image
                src="/icons/person.svg"
                alt="عبايات أنيقة"
                width={100}
                height={100}
                className="mx-auto h-9 w-9 object-contain"
              />

              <p className="mt-2 text-center text-sm font-semibold text-[#1f1f1f]">
                عبايات أنيقة
              </p>

              <p className="mt-1 text-center text-xs text-black/40">
                تصاميم عصرية
              </p>

            </div>


            {/* KHIMAR CARD */}

            <div className="absolute bottom-10 left-0 z-20 rounded-2xl border border-black/5 bg-white px-5 py-4 shadow-xl sm:-left-2">

              <Image
                src="/icons/khimar-gold.png"
                alt="خمارات راقية"
                width={32}
                height={32}
                className="mx-auto h-8 w-8 object-contain"
              />

              <p className="mt-2 text-center text-sm font-semibold text-[#1f1f1f]">
                خمارات راقية
              </p>

              <p className="mt-1 text-center text-xs text-black/40">
                خامات فاخرة
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ===================================================== */}
      {/* ==================== CATEGORIES ===================== */}
      {/* ===================================================== */}

      <section
        id="categories"
        className="border-t border-black/10 bg-white py-20"
      >

        <div className="mx-auto max-w-7xl px-6">

          <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>

              <p className="mb-3 text-xs font-medium tracking-[0.3em] text-[#a3834d]">
                SHOP BY CATEGORY
              </p>

              <h3 className="text-3xl font-semibold tracking-tight text-[#1f1f1f] sm:text-4xl">
                اكتشفي مجموعتنا
              </h3>

            </div>


            <p className="max-w-md text-sm leading-7 text-black/50">

              اختاري ما يناسب ذوقك من تشكيلتنا المختارة بعناية من الأزياء
              المحتشمة والأنيقة.

            </p>

          </div>


          {/* CATEGORY CARDS */}

          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">

            {/* HIJABS */}

            <a
              href="/categories/hijabs"
              className="group relative min-h-[360px] overflow-hidden rounded-3xl bg-[#e8dfd2] transition duration-500 hover:-translate-y-1 hover:shadow-2xl"
            >
<Image
    src="/categories/hijabs.jpg"
    alt="الحجابات"
    fill
    className="object-cover transition duration-700 group-hover:scale-105"
  />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              <div className="absolute left-6 top-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 text-white">
                01
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-7 text-white">

                <p className="mb-2 text-xs tracking-[0.25em] text-white/70">
                  COLLECTION 01
                </p>

                <h4 className="text-2xl font-semibold">
                  الحجابات
                </h4>

                <span className="mt-4 inline-flex text-sm text-white/80 transition group-hover:translate-x-1">
                  اكتشفي المجموعة ←
                </span>

              </div>

            </a>


            {/* ABAYAS */}

            <a
              href="/categories/abayas"
              className="group relative min-h-[360px] overflow-hidden rounded-3xl bg-[#d9d0c4] transition duration-500 hover:-translate-y-1 hover:shadow-2xl"
            >
<Image
    src="/categories/abayas.jpg"
    alt="العبايات"
    fill
    className="object-cover transition duration-700 group-hover:scale-105"
  />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              <div className="absolute left-6 top-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 text-white">
                02
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-7 text-white">

                <p className="mb-2 text-xs tracking-[0.25em] text-white/70">
                  COLLECTION 02
                </p>

                <h4 className="text-2xl font-semibold">
                  العبايات
                </h4>

                <span className="mt-4 inline-flex text-sm text-white/80 transition group-hover:translate-x-1">
                  اكتشفي المجموعة ←
                </span>

              </div>

            </a>


            {/* KHIMARS */}

            <a
              href="/categories/khimars"
              className="group relative min-h-[360px] overflow-hidden rounded-3xl bg-[#c9c0b3] transition duration-500 hover:-translate-y-1 hover:shadow-2xl"
            >
<Image
    src="/categories/khimars.svg"
    alt="الخمارات"
    fill
    className="object-cover transition duration-700 group-hover:scale-105"
  />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              <div className="absolute left-6 top-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 text-white">
                03
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-7 text-white">

                <p className="mb-2 text-xs tracking-[0.25em] text-white/70">
                  COLLECTION 03
                </p>

                <h4 className="text-2xl font-semibold">
                  الخمارات
                </h4>

                <span className="mt-4 inline-flex text-sm text-white/80 transition group-hover:translate-x-1">
                  اكتشفي المجموعة ←
                </span>

              </div>

            </a>


            {/* MORE */}

            <a
              href="#products"
              className="group relative min-h-[360px] overflow-hidden rounded-3xl bg-[#b8aa98] transition duration-500 hover:-translate-y-1 hover:shadow-2xl"
            >

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              <div className="absolute left-6 top-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 text-white">
                04
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-7 text-white">

                <p className="mb-2 text-xs tracking-[0.25em] text-white/70">
                  COLLECTION 04
                </p>

                <h4 className="text-2xl font-semibold">
                  المزيد
                </h4>

                <span className="mt-4 inline-flex text-sm text-white/80 transition group-hover:translate-x-1">
                  اكتشفي المجموعة ←
                </span>

              </div>

            </a>

          </div>

        </div>

      </section>


      {/* ===================================================== */}
      {/* ==================== SPECIAL OFFERS ================= */}
      {/* ===================================================== */}

      <section
        id="offers"
        className="bg-[#1f1f1f] py-4 text-white sm:py-6"
      >

        <div className="mx-auto max-w-7xl px-6">

          <div className="relative isolate overflow-x-clip overflow-y-hidden rounded-[2rem] border border-white/10 bg-[#272727] px-4 py-4 sm:px-10 sm:py-4 lg:px-10">

            {/* Decorative circles */}

            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-[#d6b46a]/20" />

            <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full border border-[#d6b46a]/10" />


            <div className="relative">

              {/* OFFER HEADER */}

              <div className="max-w-2xl">

                <p className="text-xs font-medium tracking-[0.3em] text-[#d6b46a]">
                  LIMITED TIME OFFERS
                </p>

                <h3 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl">

                  أناقتكِ تستحق

                  <br />

                  <span className="text-[#d6b46a]">
                    عرضًا مميزًا
                  </span>

                </h3>

                <p className="mt-1 max-w-xl text-sm leading-8 text-white/60">

                  اكتشفي تشكيلتنا المختارة واستفيدي من الخصومات
                  المتاحة على مجموعة من منتجاتنا.

                </p>

              </div>


              {/* ================================================= */}
              {/* OFFER SLIDER */}
              {/* ================================================= */}

              {offerProducts.length > 0 ? (

                <div className="mt-5">

                  <div
                    className="
                      flex
                      snap-x
                      snap-mandatory
                      gap-5
                      overflow-x-auto
                      pb-6
                      [-ms-overflow-style:none]
                      [scrollbar-width:none]
                      [&::-webkit-scrollbar]:hidden
                    "
                    dir="rtl"
                  >

                    {offerProducts.map((product) => (

                      <div
                        key={product.id}
                        className="
                          w-[58%]
                          shrink-0
                          snap-start
                          sm:w-[41%]
                          lg:w-[27%]
                        "
                      >

                        <ProductCard
                          product={{
                            id: product.id,
                            name: product.name,
                            slug: product.slug,
                            price: product.price,
                            oldPrice:
                              product.oldPrice,
                            image: getProductImage(product),
                            category: {
                              name: product.category.name,
                            },
                          }}
                        />

                      </div>

                    ))}

                  </div>


                  {/* SLIDER HINT */}

                  <div className="mt-2 flex items-center justify-between">

                    <p className="text-xs text-white/30">
                      اسحبي لاكتشاف المزيد من العروض
                    </p>

                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <span>←</span>
                      <span>→</span>
                    </div>

                  </div>

                </div>

              ) : (

                <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">

                  <p className="text-sm text-white/50">
                    ترقبي عروضنا القادمة قريبًا
                  </p>

                </div>

              )}


              {/* CTA */}

              <div className="mt-4">

                <a
                  href="/offers"
                  className="
                    inline-flex
                    rounded-full
                    bg-white
                    px-8
                    py-4
                    text-sm
                    font-medium
                    text-[#1f1f1f]
                    transition
                    hover:-translate-y-0.5
                    hover:bg-[#d6b46a]
                  "
                >
                  اكتشفي العروض
                </a>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ===================================================== */}
      {/* ==================== PRODUCTS ======================= */}
      {/* ===================================================== */}

      <section
        id="products"
        className="bg-[#f8f5ef] py-24"
      >

        <div className="mx-auto max-w-7xl px-6">

          {/* PRODUCTS HEADER */}

          <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">

            <div>

              <p className="mb-3 text-xs font-medium tracking-[0.3em] text-[#a3834d]">
                OUR COLLECTION
              </p>

              <h3 className="text-3xl font-semibold tracking-tight text-[#1f1f1f] sm:text-4xl">
                منتجاتنا المختارة
              </h3>

              <p className="mt-3 max-w-lg text-sm leading-7 text-black/50">

                مجموعة مختارة من أحدث التصاميم التي تجمع بين الأناقة
                والاحتشام والجودة.

              </p>

            </div>


            <a
              href="#products"
              className="group inline-flex items-center gap-2 text-sm font-medium text-[#1f1f1f]"
            >

              <span className="underline underline-offset-8 transition group-hover:text-[#a3834d]">
                عرض جميع المنتجات
              </span>

              <span className="transition group-hover:-translate-x-1">
                ←
              </span>

            </a>

          </div>


          {/* ================================================= */}
          {/* PRODUCTS GRID */}
          {/* ================================================= */}

          {products.length > 0 ? (

            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">

              {products.map((product) => (

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

            <div className="rounded-3xl border border-black/5 bg-white p-12 text-center">

              <p className="text-lg font-medium text-[#1f1f1f]">
                لا توجد منتجات متاحة حاليًا
              </p>

              <p className="mt-2 text-sm text-black/40">
                سيتم إضافة المنتجات قريبًا.
              </p>

            </div>

          )}

        </div>

      </section>


      {/* ===================================================== */}
      {/* ==================== CONTACT CTA ==================== */}
      {/* ===================================================== */}

      {/* ===================================================== */}
{/* ==================== CONTACT CTA ==================== */}
{/* ===================================================== */}

<section className="bg-[#f8f5ef] px-6 pb-24">

  <div className="mx-auto max-w-7xl">

    <div className="relative overflow-hidden rounded-[2.5rem] bg-[#1f1f1f] px-7 py-14 text-center sm:px-12 sm:py-20">

      {/* Decorative circles */}

      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-[#d6b46a]/20" />

      <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full border border-[#d6b46a]/10" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />


      <div className="relative z-10 mx-auto max-w-5xl">

        <p className="text-xs font-medium tracking-[0.35em] text-[#d6b46a]">
          STAY CONNECTED
        </p>


        <h3 className="mt-5 text-3xl font-semibold leading-tight text-white sm:text-5xl">

          أناقتكِ تبدأ

          <br />

          <span className="text-[#d6b46a]">
            من اختياركِ
          </span>

        </h3>


        {/* ================================================= */}
        {/* SERVICE CARDS */}
        {/* ================================================= */}

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">


          {/* ================================================= */}
          {/* DELIVERY */}
          {/* ================================================= */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center transition duration-300 hover:-translate-y-1 hover:border-[#d6b46a]/40 hover:bg-white/[0.06]">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#d6b46a]/30 bg-[#d6b46a]/10">

              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-6 w-6 text-[#d6b46a]"
              >

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 18.75a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM18.75 18.75a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM3 5.25h11.25v11.25H3V5.25ZM14.25 8.25h3.386a1.5 1.5 0 0 1 1.06.44l2.114 2.114c.281.281.44.663.44 1.06v4.636h-3"
                />

              </svg>

            </div>


            <h4 className="mt-5 text-base font-semibold text-white">
              توصيل إلى جميع الولايات
            </h4>


            <p className="mt-2 text-sm leading-6 text-white/45">
              نوصّل طلبك حتى باب منزلك
            </p>

          </div>


          {/* ================================================= */}
          {/* EASY EXCHANGE */}
          {/* ================================================= */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center transition duration-300 hover:-translate-y-1 hover:border-[#d6b46a]/40 hover:bg-white/[0.06]">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#d6b46a]/30 bg-[#d6b46a]/10">

              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-6 w-6 text-[#d6b46a]"
              >

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992V4.356M20.015 9.348a8.25 8.25 0 0 0-14.005-3.59L4.5 7.268M7.977 14.652H2.985v4.992M3.985 14.652a8.25 8.25 0 0 0 14.005 3.59l1.51-1.51"
                />

              </svg>

            </div>


            <h4 className="mt-5 text-base font-semibold text-white">
              استبدال سهل
            </h4>


            <p className="mt-2 text-sm leading-6 text-white/45">
              إمكانية الاستبدال وفق سياسة المتجر
            </p>

          </div>


          {/* ================================================= */}
          {/* CASH ON DELIVERY */}
          {/* ================================================= */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center transition duration-300 hover:-translate-y-1 hover:border-[#d6b46a]/40 hover:bg-white/[0.06]">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#d6b46a]/30 bg-[#d6b46a]/10">

              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-6 w-6 text-[#d6b46a]"
              >

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 8.25h19.5M2.25 9.75h19.5m-16.5 6h4.5m-4.5 3h12.75a2.25 2.25 0 0 0 2.25-2.25V7.5a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                />

              </svg>

            </div>


            <h4 className="mt-5 text-base font-semibold text-white">
              دفع آمن عند الاستلام
            </h4>


            <p className="mt-2 text-sm leading-6 text-white/45">
              اطلبي الآن وادفعي عند استلام طلبك
            </p>

          </div>


          {/* ================================================= */}
          {/* SUPPORT */}
          {/* ================================================= */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center transition duration-300 hover:-translate-y-1 hover:border-[#d6b46a]/40 hover:bg-white/[0.06]">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#d6b46a]/30 bg-[#d6b46a]/10">

              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-6 w-6 text-[#d6b46a]"
              >

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m3.75 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m3.75 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.25 21L4.5 17.25A8.25 8.25 0 1 1 21 12Z"
                />

              </svg>

            </div>


            <h4 className="mt-5 text-base font-semibold text-white">
              دعم سريع
            </h4>


            <p className="mt-2 text-sm leading-6 text-white/45">
              نحن هنا لمساعدتكِ قبل وبعد الطلب
            </p>

          </div>


        </div>

      </div>

    </div>

  </div>

</section>


      {/* ===================================================== */}
      {/* ==================== PREMIUM FOOTER ================= */}
      {/* ===================================================== */}

      <footer className="relative overflow-hidden bg-[#171717] text-white">

        {/* GOLD TOP LINE */}

        <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d6b46a]/60 to-transparent" />


        {/* DECORATIVE GLOW */}

        <div className="pointer-events-none absolute -right-40 top-20 h-96 w-96 rounded-full border border-[#d6b46a]/10" />


        <div className="mx-auto max-w-7xl px-6">

          {/* TOP FOOTER */}

          <div className="grid gap-14 py-20 md:grid-cols-12">

            {/* BRAND */}

            <div className="md:col-span-5">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#d6b46a]/40 bg-[#202020] text-xl font-semibold text-[#d6b46a] shadow-[0_0_30px_rgba(214,180,106,0.08)]">
                  BM
                </div>

                <div>

                  <h3 className="text-xl font-semibold tracking-[0.12em] text-white">
                    BOUTIQUE MARAM
                  </h3>

                  <p className="mt-1 text-[10px] tracking-[0.4em] text-[#d6b46a]">
                    MODEST ELEGANCE
                  </p>

                </div>

              </div>


              <p className="mt-7 max-w-md text-sm leading-8 text-white/45">

                متجر متخصص في الأزياء المحتشمة، نقدم لكِ مجموعة مختارة
                من الحجابات والعبايات والخمارات بتصاميم عصرية وأنيقة،
                تجمع بين الجودة والراحة والجمال.

              </p>


              {/* SOCIAL */}

              <div className="mt-8 flex items-center gap-3">

                {/* INSTAGRAM */}

                <a
                  href="https://www.instagram.com/boutique_maram_39/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-sm text-white/60 transition hover:border-[#d6b46a]/50 hover:bg-[#d6b46a] hover:text-[#171717]"
                >
                  IG
                </a>


                {/* FACEBOOK */}

                <a
                  href="https://www.facebook.com/profile.php?id=100090690127793&utm_source=ig&utm_medium=social&utm_content=link_in_bio#"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-sm text-white/60 transition hover:border-[#d6b46a]/50 hover:bg-[#d6b46a] hover:text-[#171717]"
                >
                  FB
                </a>


                {/* WHATSAPP */}

                <a
                  href="https://wa.me/213699733131"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-sm text-white/60 transition hover:border-[#d6b46a]/50 hover:bg-[#d6b46a] hover:text-[#171717]"
                >
                  WA
                </a>

              </div>

            </div>


            {/* QUICK LINKS */}

            <div className="md:col-span-2">

              <h4 className="text-sm font-semibold tracking-wide text-white">
                روابط سريعة
              </h4>

              <div className="mt-7 flex flex-col gap-4 text-sm text-white/45">

                <a
                  href="/"
                  className="group flex items-center gap-2 transition hover:text-[#d6b46a]"
                >
                  <span className="h-px w-0 bg-[#d6b46a] transition-all group-hover:w-4" />
                  الرئيسية
                </a>


                <a
                  href="#categories"
                  className="group flex items-center gap-2 transition hover:text-[#d6b46a]"
                >
                  <span className="h-px w-0 bg-[#d6b46a] transition-all group-hover:w-4" />
                  الفئات
                </a>


                <a
                  href="#offers"
                  className="group flex items-center gap-2 transition hover:text-[#d6b46a]"
                >
                  <span className="h-px w-0 bg-[#d6b46a] transition-all group-hover:w-4" />
                  العروض
                </a>


                <a
                  href="#products"
                  className="group flex items-center gap-2 transition hover:text-[#d6b46a]"
                >
                  <span className="h-px w-0 bg-[#d6b46a] transition-all group-hover:w-4" />
                  المنتجات
                </a>

              </div>

            </div>


            {/* CUSTOMER SERVICE */}

            <div className="md:col-span-2">

              <h4 className="text-sm font-semibold tracking-wide text-white">
                خدمة العملاء
              </h4>

              <div className="mt-7 flex flex-col gap-4 text-sm text-white/45">

                <a
                  href="#"
                  className="transition hover:text-[#d6b46a]"
                >
                  تواصل معنا
                </a>

                <a
                  href="#"
                  className="transition hover:text-[#d6b46a]"
                >
                  سياسة الشحن
                </a>

                <a
                  href="#"
                  className="transition hover:text-[#d6b46a]"
                >
                  سياسة الاستبدال
                </a>

                <a
                  href="#"
                  className="transition hover:text-[#d6b46a]"
                >
                  الأسئلة الشائعة
                </a>

              </div>

            </div>


            {/* CONTACT */}

            <div className="md:col-span-3">

              <h4 className="text-sm font-semibold tracking-wide text-white">
                معلومات الاتصال
              </h4>

              <div className="mt-7 space-y-5">

                {/* PHONE */}

                <a
                  href="tel:+213000000000"
                  className="group flex items-start gap-4"
                >

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[#d6b46a] transition group-hover:border-[#d6b46a]/40">
                    ☎
                  </div>

                  <div>

                    <p className="text-xs text-white/30">
                      الهاتف
                    </p>

                    <p className="mt-1 text-sm text-white/70 transition group-hover:text-[#d6b46a]">
                      0699733131
                    </p>

                  </div>

                </a>


                {/* EMAIL */}

                <a
                  href="mailto:contact@hijabstore.com"
                  className="group flex items-start gap-4"
                >

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[#d6b46a] transition group-hover:border-[#d6b46a]/40">
                    @
                  </div>

                  <div>

                    <p className="text-xs text-white/30">
                      البريد الإلكتروني
                    </p>

                    <p className="mt-1 break-all text-sm text-white/70 transition group-hover:text-[#d6b46a]">
                      contact@hijabstore.com
                    </p>

                  </div>

                </a>


                {/* WHATSAPP */}

                <a
                  href="https://wa.me/213699733131"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4"
                >

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[#d6b46a] transition group-hover:border-[#d6b46a]/40">
                    WA
                  </div>

                  <div>

                    <p className="text-xs text-white/30">
                      واتساب
                    </p>

                    <p className="mt-1 text-sm text-white/70 transition group-hover:text-[#d6b46a]">
                      0699733131
                    </p>

                  </div>

                </a>


                {/* FACEBOOK */}

                <a
                  href="https://www.facebook.com/profile.php?id=100090690127793&utm_source=ig&utm_medium=social&utm_content=link_in_bio#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4"
                >

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[#d6b46a] transition group-hover:border-[#d6b46a]/40">
                    FB
                  </div>

                  <div>

                    <p className="text-xs text-white/30">
                      فيسبوك
                    </p>

                    <p className="mt-1 text-sm text-white/70 transition group-hover:text-[#d6b46a]">
                      Boutique Maram
                    </p>

                  </div>

                </a>


                {/* INSTAGRAM */}

                <a
                  href="https://www.instagram.com/boutique_maram_39/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4"
                >

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[#d6b46a] transition group-hover:border-[#d6b46a]/40">
                    IG
                  </div>

                  <div>

                    <p className="text-xs text-white/30">
                      إنستغرام
                    </p>

                    <p className="mt-1 text-sm text-white/70 transition group-hover:text-[#d6b46a]">
                      @boutique_maram_39
                    </p>

                  </div>

                </a>


                {/* LOCATION */}

                <div className="flex items-start gap-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[#d6b46a]">
                    ⌖
                  </div>

                  <div>

                    <p className="text-xs text-white/30">
                      الموقع
                    </p>

                    <p className="mt-1 text-sm leading-6 text-white/70">
                      الفرع الأول الشط بجانب مخبر المجد لتحاليل
                      الفرع الثاني الرمال بجانب قاطو شيك
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* ================================================= */}
          {/* NEWSLETTER */}
          {/* ================================================= */}

          <div className="border-t border-white/10 py-10">

            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

              <div>

                <p className="text-sm font-medium text-white">
                  كوني أول من يعرف عروضنا الجديدة
                </p>

                <p className="mt-2 text-xs text-white/35">
                  اشتركي للحصول على آخر التحديثات والعروض الخاصة.
                </p>

              </div>


              <div className="flex w-full max-w-md">

                <input
                  type="email"
                  placeholder="بريدك الإلكتروني"
                  className="min-w-0 flex-1 rounded-r-full border border-white/10 bg-white/[0.04] px-5 py-3.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#d6b46a]/50"
                />

                <button
                  type="button"
                  className="rounded-l-full bg-[#d6b46a] px-6 py-3.5 text-sm font-semibold text-[#171717] transition hover:bg-white"
                >
                  اشتراك
                </button>

              </div>

            </div>

          </div>


          {/* ================================================= */}
          {/* BOTTOM FOOTER */}
          {/* ================================================= */}

          <div className="flex flex-col justify-between gap-4 border-t border-white/10 py-7 text-xs text-white/30 sm:flex-row sm:items-center">

            <p>
              © {new Date().getFullYear()} BOUTIQUE MARAM.
              جميع الحقوق محفوظة.
            </p>


            <div className="flex gap-6">

              <a
                href="#"
                className="transition hover:text-[#d6b46a]"
              >
                الخصوصية
              </a>


              <a
                href="#"
                className="transition hover:text-[#d6b46a]"
              >
                الشروط والأحكام
              </a>

            </div>

          </div>

        </div>

      </footer>
{/* ===================================================== */}
{/* ================= FLOATING CHAT ===================== */}
{/* ===================================================== */}

<a
  href="https://wa.me/213699733131"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="تواصلي معنا عبر واتساب"
  className="
    group
    fixed
    bottom-6
    left-6
    z-[9999]
    flex
    h-14
    w-14
    items-center
    justify-center
    rounded-full
    border
    border-[#d6b46a]/40
    bg-[#1f1f1f]
    text-[#d6b46a]
    shadow-[0_8px_30px_rgba(31,31,31,0.25)]
    transition-all
    duration-500
    hover:-translate-y-1
    hover:scale-105
    hover:border-[#d6b46a]
    hover:bg-[#d6b46a]
    hover:text-[#1f1f1f]
    animate-[float_3s_ease-in-out_infinite]
    sm:bottom-8
    sm:left-8
  "
>
  {/* CHAT ICON */}

  <svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="none"
  className="h-7 w-7 transition-transform duration-300 group-hover:scale-110"
>
  <path
    d="M20 11.5C20 15.642 16.418 19 12 19C10.846 19 9.756 18.77 8.783 18.36L4 20L5.574 15.57C4.58 14.43 4 13.03 4 11.5C4 7.358 7.582 4 12 4C16.418 4 20 7.358 20 11.5Z"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  />

  <path
    d="M8.5 11.5H8.51M12 11.5H12.01M15.5 11.5H15.51"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
  />
</svg>


  {/* TOOLTIP */}

  <span
    className="
      pointer-events-none
      absolute
      left-full
      ml-3
      whitespace-nowrap
      rounded-full
      bg-[#1f1f1f]
      px-4
      py-2
      text-xs
      font-medium
      text-white
      opacity-0
      translate-x-2
      shadow-lg
      transition-all
      duration-300
      group-hover:translate-x-0
      group-hover:opacity-100
    "
  >
    تواصلي معنا
  </span>

</a>
    </main>
  );
}