import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import ProductActions from "@/components/ProductActions";
import ProductGallery from "@/components/ProductGallery";

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
// PAGE
// ============================================================

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { id } = await params;

  // ==========================================================
  // GET PRODUCT
  // ==========================================================

  const product = await prisma.product.findUnique({
    where: {
      id,
    },

    include: {
      category: true,

      variants: {
        orderBy: [
          {
            color: "asc",
          },
          {
            size: "asc",
          },
        ],
      },

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
  });

  if (!product) {
    notFound();
  }

  // ==========================================================
  // IMAGES
  // ==========================================================

  const productImages =
    product.images.length > 0
      ? product.images.map((image) => image.url)
      : [product.image];

  // ==========================================================
  // ACTIVE OFFER
  // ==========================================================

  const activeOffer = product.offers[0];

  const currentPrice =
    activeOffer?.newPrice ??
    product.price;

  const currentOldPrice =
    activeOffer?.oldPrice ??
    product.oldPrice;

  // ==========================================================
  // TOTAL STOCK
  // ==========================================================

  const variantStock = product.variants.reduce(
    (total, variant) => total + variant.stock,
    0
  );

  const totalStock =
    product.variants.length > 0
      ? variantStock
      : product.stock;

  // ==========================================================
  // RELATED PRODUCTS
  // ==========================================================

  const relatedProducts =
    await prisma.product.findMany({
      where: {
        isActive: true,
        categoryId: product.categoryId,
        id: {
          not: product.id,
        },
      },

      include: {
        category: true,

        images: {
          orderBy: {
            sortOrder: "asc",
          },
          take: 1,
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 3,
    });

  // ==========================================================
  // RELATED IMAGE
  // ==========================================================

  const getRelatedImage = (
    relatedProduct: (typeof relatedProducts)[number]
  ) => {
    if (relatedProduct.image) {
      return relatedProduct.image;
    }

    if (relatedProduct.images.length > 0) {
      return relatedProduct.images[0].url;
    }

    return "/images/product-placeholder.jpg";
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main className="bg-[#f3eadc] px-6 pb-24">

      {/* ==================================================== */}
      {/* PRODUCT */}
      {/* ==================================================== */}

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-4 sm:pt-8">

        {/* ================================================== */}
        {/* TOP */}
        {/* ================================================== */}

        <div
          className="mb-8 flex items-center justify-between gap-6"
          dir="rtl"
        >

          {/* Breadcrumb */}

          <div className="flex flex-wrap items-center gap-2 text-sm text-black/50">

            <Link
              href="/"
              className="transition hover:text-[#a3834d]"
            >
              الرئيسية
            </Link>

            <span>/</span>

            <span>
              {product.category.name}
            </span>

            <span>/</span>

            <span className="text-black/70">
              {product.name}
            </span>

          </div>

          {/* Back */}

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
              font-medium
              text-[#8b7350]
              transition
              hover:border-[#a3834d]
              hover:bg-[#a3834d]
              hover:text-white
            "
          >
            ← العودة للمتجر
          </Link>

        </div>

        {/* ================================================== */}
        {/* PRODUCT GRID */}
        {/* ================================================== */}

        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">

          {/* ================================================= */}
          {/* IMAGES */}
          {/* ================================================= */}

          <ProductGallery
            images={productImages}
            productName={product.name}
            activeOffer={
              activeOffer
                ? {
                    discountPercent:
                      activeOffer.discountPercent,
                  }
                : null
            }
            isNew={product.isNew}
          />

          {/* ================================================= */}
          {/* INFORMATION */}
          {/* ================================================= */}

          <div
            className="flex flex-col justify-start lg:pt-1"
            dir="rtl"
          >

            {/* CATEGORY */}

            <p
              className="
                text-base
                font-semibold
                tracking-[0.15em]
                text-[#a3834d]
              "
            >
              {product.category.name}
            </p>

            {/* NAME */}

            <h1
              className="
                mt-4
                text-4xl
                font-semibold
                leading-tight
                tracking-tight
                text-[#1f1f1f]
                sm:text-5xl
              "
            >
              {product.name}
            </h1>

            {/* PRODUCT CODE */}

            <p className="mt-3 text-xs text-black/35">
              كود المنتج: {product.productCode}
            </p>

            {/* RATING */}

            <div className="mt-5 flex items-center gap-3">

              <div className="text-[#b18b4f]">
                ★★★★★
              </div>

              

            </div>

            {/* PRICE */}

            <div className="mt-8 flex items-center gap-4">

              <span className="text-3xl font-semibold text-[#1f1f1f]">
                {currentPrice.toLocaleString("ar-DZ")} دج
              </span>

              {currentOldPrice &&
                currentOldPrice > currentPrice && (
                  <span className="text-lg text-black/30 line-through">
                    {currentOldPrice.toLocaleString("ar-DZ")} دج
                  </span>
                )}

            </div>

            <div className="my-8 h-px bg-black/10" />

            {/* DESCRIPTION */}

            <div>

              <h2 className="text-base font-semibold text-[#1f1f1f]">
                وصف المنتج
              </h2>

              <p className="mt-4 text-base leading-8 text-black/55">
                {product.description ??
                  "قطعة أنيقة مصممة بعناية لتمنحكِ إطلالة راقية ومحتشمة. تم اختيار الخامة والتفاصيل بعناية لتناسب الاستخدام اليومي والمناسبات المختلفة."}
              </p>

            </div>

            {/* ================================================= */}
            {/* PRODUCT ACTIONS */}
            {/* ================================================= */}

            <ProductActions
              product={{
                id: product.id,
                name: product.name,
                price: currentPrice,
                image: productImages[0],
              }}
              variants={product.variants.map(
                (variant) => ({
                  id: variant.id,
                  sizeType: variant.sizeType,
                  size: variant.size,
                  color: variant.color,
                  stock: variant.stock,
                })
              )}
              fallbackStock={product.stock}
            />

            {/* FEATURES */}

            <div
              className="
                mt-10
                grid
                grid-cols-3
                gap-4
                border-t
                border-black/10
                pt-8
              "
            >

              <div className="text-center">

                <div className="text-xl text-[#a3834d]">
                  ◇
                </div>

                <p className="mt-2 text-xs text-black/50">
                  جودة عالية
                </p>

              </div>

              <div className="text-center">

                <div className="text-xl text-[#a3834d]">
                  ♧
                </div>

                <p className="mt-2 text-xs text-black/50">
                  شحن سريع
                </p>

              </div>

              <div className="text-center">

                <div className="text-xl text-[#a3834d]">
                  ♡
                </div>

                <p className="mt-2 text-xs text-black/50">
                  خدمة مميزة
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ==================================================== */}
      {/* RELATED PRODUCTS */}
      {/* ==================================================== */}

      {relatedProducts.length > 0 && (
        <section className="border-t border-black/10 bg-white py-20">

          <div className="mx-auto max-w-7xl px-6">

            <div
              className="mb-10"
              dir="rtl"
            >

              <p className="text-xs font-medium tracking-[0.3em] text-[#a3834d]">
                YOU MAY ALSO LIKE
              </p>

              <h2 className="mt-3 text-3xl font-semibold text-[#1f1f1f]">
                منتجات قد تعجبك
              </h2>

            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {relatedProducts.map((item) => (

                <Link
                  key={item.id}
                  href={`/products/${item.id}`}
                  className="
                    group
                    overflow-hidden
                    rounded-3xl
                    border
                    border-black/5
                    bg-[#f8f5ef]
                  "
                >

                  <div className="aspect-[4/5] overflow-hidden bg-[#e8dfd2]">

                    <img
                      src={getRelatedImage(item)}
                      alt={item.name}
                      className="
                        h-full
                        w-full
                        object-cover
                        transition
                        duration-700
                        group-hover:scale-105
                      "
                    />

                  </div>

                  <div
                    className="p-5"
                    dir="rtl"
                  >

                    <p className="text-xs text-[#a3834d]">
                      {item.category.name}
                    </p>

                    <h3 className="mt-2 text-lg font-semibold text-[#1f1f1f]">
                      {item.name}
                    </h3>

                    <p className="mt-3 font-semibold text-[#1f1f1f]">
                      {item.price.toLocaleString("ar-DZ")} دج
                    </p>

                  </div>

                </Link>

              ))}

            </div>

          </div>

        </section>
      )}

    </main>
  );
}