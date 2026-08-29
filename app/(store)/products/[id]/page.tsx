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
    <main
      className="
        bg-[#f3eadc]
        px-4
        pb-24
        sm:px-6
      "
      dir="rtl"
    >

      {/* ==================================================== */}
      {/* PRODUCT */}
      {/* ==================================================== */}

      <section
        className="
          mx-auto
          max-w-7xl
          px-0
          pb-20
          pt-3
          sm:px-2
          sm:pt-6
        "
      >

        {/* ================================================== */}
        {/* TOP */}
        {/* ================================================== */}

        <div
          className="
            mb-5
            flex
            items-center
            justify-between
            gap-4
            sm:mb-7
          "
          dir="rtl"
        >

          {/* Breadcrumb */}

          <div
            className="
              flex
              min-w-0
              flex-wrap
              items-center
              gap-1.5
              text-[11px]
              font-medium
              text-black/40
              sm:gap-2
              sm:text-xs
            "
          >

            <Link
              href="/"
              className="
                transition
                duration-300
                hover:text-[#a3834d]
              "
            >
              الرئيسية
            </Link>

            <span className="text-black/20">
              /
            </span>

            <span>
              {product.category.name}
            </span>

            <span className="text-black/20">
              /
            </span>

            <span className="truncate text-black/60">
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
              px-3
              py-2
              text-[11px]
              font-bold
              text-[#8b7350]
              shadow-[0_5px_18px_rgba(0,0,0,0.035)]
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:border-[#a3834d]
              hover:bg-[#a3834d]
              hover:text-white
              hover:shadow-[0_10px_25px_rgba(163,131,77,0.20)]
              sm:px-4
              sm:py-2.5
              sm:text-xs
            "
          >
            ← العودة للمتجر
          </Link>

        </div>

        {/* ================================================== */}
        {/* PRODUCT GRID */}
        {/* ================================================== */}

        <div
          className="
            grid
            items-start
            gap-9
            lg:grid-cols-2
            lg:gap-16
            xl:gap-20
          "
        >

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
            className="
              flex
              flex-col
              justify-start
              lg:pt-0
            "
            dir="rtl"
          >

            {/* ================================================= */}
            {/* PREMIUM INFORMATION CARD */}
            {/* ================================================= */}

            <div
              className="
                group
                relative
                overflow-hidden
                rounded-[30px]
                border
                border-black/[0.055]
                bg-white/80
                px-5
                py-6
                shadow-[0_18px_55px_rgba(70,52,30,0.08)]
                backdrop-blur-xl
                transition-all
                duration-700
                hover:-translate-y-1
                hover:shadow-[0_25px_70px_rgba(70,52,30,0.12)]
                sm:px-7
                sm:py-8
              "
            >

              {/* MAGIC LIGHT */}

              <span
                className="
                  pointer-events-none
                  absolute
                  -right-20
                  -top-24
                  h-56
                  w-56
                  rounded-full
                  bg-[#c7a76b]/10
                  blur-3xl
                  transition-all
                  duration-1000
                  group-hover:bg-[#c7a76b]/20
                "
              />

              <span
                className="
                  pointer-events-none
                  absolute
                  -bottom-24
                  -left-20
                  h-52
                  w-52
                  rounded-full
                  bg-[#ead9bc]/30
                  blur-3xl
                  transition-all
                  duration-1000
                  group-hover:scale-125
                "
              />

              {/* SHIMMER */}

              <span
                className="
                  pointer-events-none
                  absolute
                  -left-32
                  top-[-30%]
                  h-[180%]
                  w-16
                  rotate-[22deg]
                  bg-white/45
                  blur-md
                  transition-all
                  duration-[1400ms]
                  group-hover:left-[120%]
                "
              />

              {/* INNER BORDER */}

              <span
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  rounded-[30px]
                  ring-1
                  ring-inset
                  ring-white/80
                "
              />

              <div className="relative z-10">

                {/* CATEGORY */}

                <div className="flex items-center gap-3">

                  <span
                    className="
                      h-[3px]
                      w-9
                      rounded-full
                      bg-[#a3834d]
                      shadow-[0_0_12px_rgba(163,131,77,0.35)]
                    "
                  />

                  <p
                    className="
                      text-[13px]
                      font-extrabold
                      tracking-[0.08em]
                      text-[#a3834d]
                      sm:text-[14px]
                    "
                  >
                    {product.category.name}
                  </p>

                </div>

                {/* NAME */}

                <h1
                  className="
                    mt-4
                    text-[32px]
                    font-black
                    leading-[1.25]
                    tracking-[-0.035em]
                    text-[#171717]
                    sm:mt-5
                    sm:text-[42px]
                    lg:text-[44px]
                    xl:text-[48px]
                  "
                >
                  {product.name}
                </h1>

                {/* PRODUCT CODE */}

                <div
                  className="
                    mt-4
                    flex
                    items-center
                    gap-2
                  "
                >

                  <span
                    className="
                      h-1.5
                      w-1.5
                      rounded-full
                      bg-[#a3834d]
                    "
                  />

                  <p
                    className="
                      text-[13px]
                      font-bold
                      text-black/60
                      sm:text-[14px]
                    "
                  >
                    كود المنتج:
                    <span className="mr-1 font-black text-[#514531]">
                      {product.productCode}
                    </span>
                  </p>

                </div>

                {/* RATING */}

                <div
                  className="
                    mt-5
                    flex
                    items-center
                    gap-3
                  "
                >

                  <div
                    className="
                      rounded-full
                      bg-[#faf6ed]
                      px-3.5
                      py-1.5
                      text-[15px]
                      tracking-[0.13em]
                      text-[#b18b4f]
                      shadow-[0_5px_15px_rgba(163,131,77,0.08)]
                    "
                  >
                    ★★★★★
                  </div>

                  <span
                    className="
                      text-[13px]
                      font-bold
                      text-black/55
                      sm:text-[14px]
                    "
                  >
                    جودة تستحق الثقة
                  </span>

                </div>

                {/* ================================================= */}
                {/* PREMIUM PRICE CARD */}
                {/* ================================================= */}

                <div
                  className="
                    relative
                    mt-7
                    overflow-hidden
                    rounded-[24px]
                    border
                    border-[#a3834d]/20
                    bg-gradient-to-br
                    from-[#fffdf8]
                    via-[#f8f1e5]
                    to-[#eee0c8]
                    px-5
                    py-5
                    shadow-[0_12px_35px_rgba(163,131,77,0.13)]
                    sm:mt-8
                    sm:px-6
                    sm:py-6
                  "
                >

                  {/* PRICE CARD GLOW */}

                  <span
                    className="
                      pointer-events-none
                      absolute
                      -right-16
                      -top-16
                      h-40
                      w-40
                      rounded-full
                      bg-[#c7a76b]/15
                      blur-3xl
                    "
                  />

                  <span
                    className="
                      pointer-events-none
                      absolute
                      -bottom-20
                      -left-16
                      h-40
                      w-40
                      rounded-full
                      bg-[#d7bd91]/20
                      blur-3xl
                    "
                  />

                  {/* MOVING WAVE */}

                  <span
                    className="
                      pointer-events-none
                      absolute
                      -left-[45%]
                      top-[-80%]
                      h-[260%]
                      w-[30%]
                      rotate-[18deg]
                      bg-gradient-to-r
                      from-transparent
                      via-white/65
                      to-transparent
                      blur-lg
                      opacity-80
                      animate-[priceWave_6s_ease-in-out_infinite]
                    "
                  />

                  <span
                    className="
                      pointer-events-none
                      absolute
                      -left-[35%]
                      top-[-80%]
                      h-[260%]
                      w-[8%]
                      rotate-[18deg]
                      bg-white/70
                      blur-sm
                      opacity-70
                      animate-[priceWave_6s_ease-in-out_infinite]
                    "
                  />

                  {/* TOP LABEL */}

                  <div
                    className="
                      relative
                      z-10
                      flex
                      items-center
                      justify-between
                      gap-3
                    "
                  >

                    <span
                      className="
                        text-[11px]
                        font-extrabold
                        tracking-[0.12em]
                        text-[#9b7b48]
                        sm:text-xs
                      "
                    >
                      السعر الحالي
                    </span>

                    {activeOffer && (
                      <span
                        className="
                          rounded-full
                          border
                          border-[#a3834d]/20
                          bg-white/65
                          px-3
                          py-1
                          text-[10px]
                          font-black
                          text-[#9b7b48]
                          shadow-[0_4px_12px_rgba(163,131,77,0.08)]
                          sm:text-xs
                        "
                      >
                        عرض خاص
                      </span>
                    )}

                  </div>

                  {/* PRICE */}

                  <div
                    className="
                      relative
                      z-10
                      mt-2
                      flex
                      flex-wrap
                      items-end
                      gap-3
                    "
                  >

                    <span
                      className="
                        text-[34px]
                        font-black
                        leading-none
                        tracking-[-0.035em]
                        text-[#171717]
                        sm:text-[40px]
                      "
                    >
                      {currentPrice.toLocaleString("ar-DZ")}

                      <span
                        className="
                          mr-1.5
                          text-[16px]
                          font-extrabold
                          text-[#80683f]
                          sm:text-[18px]
                        "
                      >
                        دج
                      </span>
                    </span>

                    {currentOldPrice &&
                      currentOldPrice > currentPrice && (
                        <span
                          className="
                            mb-0.5
                            text-[15px]
                            font-semibold
                            text-black/30
                            line-through
                            sm:text-[17px]
                          "
                        >
                          {currentOldPrice.toLocaleString("ar-DZ")}
                          {" "}دج
                        </span>
                      )}

                  </div>

                  {/* PRICE BOTTOM DETAIL */}

                  <div
                    className="
                      relative
                      z-10
                      mt-4
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <span
                      className="
                        h-1.5
                        w-1.5
                        rounded-full
                        bg-[#a3834d]
                        shadow-[0_0_10px_rgba(163,131,77,0.45)]
                      "
                    />

                    <span
                      className="
                        text-[11px]
                        font-semibold
                        text-black/45
                        sm:text-xs
                      "
                    >
                      سعر شامل للمنتج
                    </span>

                  </div>

                </div>

                {/* PREMIUM DIVIDER */}

                <div className="my-6 flex items-center gap-3 sm:my-7">

                  <span className="h-px flex-1 bg-black/[0.07]" />

                  <span
                    className="
                      h-1.5
                      w-1.5
                      rotate-45
                      bg-[#a3834d]
                      shadow-[0_0_10px_rgba(163,131,77,0.35)]
                    "
                  />

                  <span className="h-px flex-1 bg-black/[0.07]" />

                </div>

                {/* DESCRIPTION */}

                <div>

                  <div className="flex items-center gap-3">

                    <h2
                      className="
                        text-[17px]
                        font-black
                        tracking-[-0.02em]
                        text-[#1f1f1f]
                        sm:text-[19px]
                      "
                    >
                      وصف المنتج
                    </h2>

                    <span
                      className="
                        h-px
                        w-8
                        bg-[#a3834d]/50
                      "
                    />

                  </div>

                  <p
                    className="
                      mt-3
                      text-[14px]
                      font-medium
                      leading-[2]
                      text-black/55
                      sm:text-[15px]
                      sm:leading-[2.1]
                    "
                  >
                    {product.description ??
                      "قطعة أنيقة مصممة بعناية لتمنحكِ إطلالة راقية ومحتشمة. تم اختيار الخامة والتفاصيل بعناية لتناسب الاستخدام اليومي والمناسبات المختلفة."}
                  </p>

                </div>

              </div>

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
                mt-8
                grid
                grid-cols-3
                gap-3
                border-t
                border-black/10
                pt-7
                sm:mt-10
                sm:gap-4
                sm:pt-8
              "
            >

              <div
                className="
                  group
                  rounded-2xl
                  px-2
                  py-3
                  text-center
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:bg-white/50
                "
              >

                <div
                  className="
                    text-xl
                    text-[#a3834d]
                    transition-transform
                    duration-300
                    group-hover:scale-110
                  "
                >
                  ◇
                </div>

                <p
                  className="
                    mt-2
                    text-[11px]
                    font-bold
                    text-black/50
                    sm:text-xs
                  "
                >
                  جودة عالية
                </p>

              </div>

              <div
                className="
                  group
                  rounded-2xl
                  px-2
                  py-3
                  text-center
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:bg-white/50
                "
              >

                <div
                  className="
                    text-xl
                    text-[#a3834d]
                    transition-transform
                    duration-300
                    group-hover:scale-110
                  "
                >
                  ♧
                </div>

                <p
                  className="
                    mt-2
                    text-[11px]
                    font-bold
                    text-black/50
                    sm:text-xs
                  "
                >
                  شحن سريع
                </p>

              </div>

              <div
                className="
                  group
                  rounded-2xl
                  px-2
                  py-3
                  text-center
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:bg-white/50
                "
              >

                <div
                  className="
                    text-xl
                    text-[#a3834d]
                    transition-transform
                    duration-300
                    group-hover:scale-110
                  "
                >
                  ♡
                </div>

                <p
                  className="
                    mt-2
                    text-[11px]
                    font-bold
                    text-black/50
                    sm:text-xs
                  "
                >
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
        <section
          className="
            border-t
            border-black/10
            bg-white
            py-16
            sm:py-20
          "
        >

          <div
            className="
              mx-auto
              max-w-7xl
              px-4
              sm:px-6
            "
          >

            <div
              className="mb-9 sm:mb-10"
              dir="rtl"
            >

              <p
                className="
                  text-[10px]
                  font-bold
                  tracking-[0.25em]
                  text-[#a3834d]
                  sm:text-xs
                "
              >
                YOU MAY ALSO LIKE
              </p>

              <h2
                className="
                  mt-3
                  text-[27px]
                  font-black
                  tracking-[-0.025em]
                  text-[#1f1f1f]
                  sm:text-3xl
                "
              >
                منتجات قد تعجبك
              </h2>

            </div>

            <div
              className="
                grid
                gap-5
                sm:grid-cols-2
                lg:grid-cols-3
                sm:gap-6
              "
            >

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
                    shadow-[0_10px_30px_rgba(0,0,0,0.035)]
                    transition-all
                    duration-500
                    hover:-translate-y-1
                    hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)]
                  "
                >

                  <div
                    className="
                      aspect-[4/5]
                      overflow-hidden
                      bg-[#e8dfd2]
                    "
                  >

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

                    <p
                      className="
                        text-xs
                        font-bold
                        text-[#a3834d]
                      "
                    >
                      {item.category.name}
                    </p>

                    <h3
                      className="
                        mt-2
                        text-lg
                        font-black
                        text-[#1f1f1f]
                      "
                    >
                      {item.name}
                    </h3>

                    <p
                      className="
                        mt-3
                        font-black
                        text-[#1f1f1f]
                      "
                    >
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