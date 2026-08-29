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
  // CURRENT DATE
  // ==========================================================

  const now = new Date();

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

      // ======================================================
      // PRODUCT VARIANTS
      // ======================================================

      variants: {
        select: {
          stock: true,
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
  // PRODUCTS WITH DISCOUNTS
  // ==========================================================

  const offerProducts = products.filter((product) => {
    const activeOffer = product.offers[0];

    const productDiscount =
      product.oldPrice !== null &&
      product.oldPrice > product.price;

    const offerDiscount =
      activeOffer !== undefined &&
      activeOffer.oldPrice !== null &&
      activeOffer.newPrice !== null &&
      activeOffer.oldPrice > activeOffer.newPrice;

    return productDiscount || offerDiscount;
  });

  // ==========================================================
  // CHECK PRODUCT STOCK
  // ==========================================================

  const isProductOutOfStock = (
    product: (typeof products)[number]
  ) => {
    /*
      إذا كان المنتج لديه variants:
      نعتبره غير متوفر عندما تكون جميع الـ variants
      stock فيها 0 أو أقل.

      إذا لم يكن لديه variants:
      نعتبره متوفرًا لأن المنتج قد يكون منتجًا بدون خيارات.
    */

    if (product.variants.length === 0) {
      return false;
    }

    return product.variants.every(
      (variant) => variant.stock <= 0
    );
  };

  // ==========================================================
  // EMPTY IMAGE FALLBACK
  // ==========================================================

  const getProductImage = (
    product: (typeof products)[number]
  ) => {
    if (product.image) {
      return product.image;
    }

    if (product.images.length > 0) {
      return product.images[0].url;
    }

    return "/images/product-placeholder.jpg";
  };

  return (
    <main
      className="
        overflow-x-hidden
        bg-[#f8f5ef]
      "
    >
      {/* ===================================================== */}
      {/* ================= GLOBAL ANIMATIONS ================= */}
      {/* ===================================================== */}

      <style>{`
        @keyframes maramHeroReveal {
          0% {
            opacity: 0;
            transform: translate3d(0, 32px, 0);
          }

          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes maramHeroImage {
          0% {
            opacity: 0;
            transform: translate3d(35px, 0, 0) scale(.94);
          }

          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes maramHeroImageLeft {
          0% {
            opacity: 0;
            transform: translate3d(-35px, 0, 0) scale(.94);
          }

          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes maramFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(0, -10px, 0);
          }
        }

        @keyframes maramFloatReverse {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(0, 8px, 0);
          }
        }

        @keyframes maramGlow {
          0%,
          100% {
            opacity: .35;
            transform: scale(1);
          }

          50% {
            opacity: .65;
            transform: scale(1.08);
          }
        }

        @keyframes maramScroll {
          0% {
            transform: translate3d(0, 0, 0);
          }

          100% {
            transform: translate3d(-33.333333%, 0, 0);
          }
        }

        @keyframes maramPulse {
          0%,
          100% {
            opacity: .5;
            transform: scale(.95);
          }

          50% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes maramFadeUp {
          0% {
            opacity: 0;
            transform: translate3d(0, 24px, 0);
          }

          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes maramSoftScale {
          0% {
            opacity: 0;
            transform: scale(.96);
          }

          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* ====================================================
           HERO SLIDER — 4 SLIDES
           ==================================================== */

        @keyframes maramHeroSlideOne {
          0%,
          23% {
            opacity: 1;
            visibility: visible;
          }

          25%,
          98% {
            opacity: 0;
            visibility: hidden;
          }

          100% {
            opacity: 1;
            visibility: visible;
          }
        }

        @keyframes maramHeroSlideTwo {
          0%,
          23% {
            opacity: 0;
            visibility: hidden;
          }

          25%,
          48% {
            opacity: 1;
            visibility: visible;
          }

          50%,
          100% {
            opacity: 0;
            visibility: hidden;
          }
        }

        @keyframes maramHeroSlideThree {
          0%,
          48% {
            opacity: 0;
            visibility: hidden;
          }

          50%,
          73% {
            opacity: 1;
            visibility: visible;
          }

          75%,
          100% {
            opacity: 0;
            visibility: hidden;
          }
        }

        @keyframes maramHeroSlideFour {
          0%,
          73% {
            opacity: 0;
            visibility: hidden;
          }

          75%,
          98% {
            opacity: 1;
            visibility: visible;
          }

          100% {
            opacity: 0;
            visibility: hidden;
          }
        }

        @keyframes maramHeroContentOne {
          0%,
          3% {
            opacity: 0;
            transform: translate3d(0, 30px, 0);
          }

          7%,
          21% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }

          24%,
          100% {
            opacity: 0;
            transform: translate3d(0, -18px, 0);
          }
        }

        @keyframes maramHeroContentTwo {
          0%,
          28% {
            opacity: 0;
            transform: translate3d(0, 30px, 0);
          }

          32%,
          46% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }

          49%,
          100% {
            opacity: 0;
            transform: translate3d(0, -18px, 0);
          }
        }

        @keyframes maramHeroContentThree {
          0%,
          53% {
            opacity: 0;
            transform: translate3d(0, 30px, 0);
          }

          57%,
          71% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }

          74%,
          100% {
            opacity: 0;
            transform: translate3d(0, -18px, 0);
          }
        }

        @keyframes maramHeroContentFour {
          0%,
          78% {
            opacity: 0;
            transform: translate3d(0, 30px, 0);
          }

          82%,
          96% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }

          99%,
          100% {
            opacity: 0;
            transform: translate3d(0, -18px, 0);
          }
        }

        @keyframes maramHeroImageOne {
          0%,
          3% {
            opacity: 0;
            transform: translate3d(45px, 0, 0) scale(.94);
          }

          8%,
          21% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }

          24%,
          100% {
            opacity: 0;
            transform: translate3d(-30px, 0, 0) scale(1.03);
          }
        }

        @keyframes maramHeroImageTwo {
          0%,
          28% {
            opacity: 0;
            transform: translate3d(45px, 0, 0) scale(.94);
          }

          33%,
          46% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }

          49%,
          100% {
            opacity: 0;
            transform: translate3d(-30px, 0, 0) scale(1.03);
          }
        }

        @keyframes maramHeroImageThree {
          0%,
          53% {
            opacity: 0;
            transform: translate3d(45px, 0, 0) scale(.94);
          }

          58%,
          71% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }

          74%,
          100% {
            opacity: 0;
            transform: translate3d(-30px, 0, 0) scale(1.03);
          }
        }

        @keyframes maramHeroImageFour {
          0%,
          78% {
            opacity: 0;
            transform: translate3d(45px, 0, 0) scale(.94);
          }

          83%,
          96% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }

          99%,
          100% {
            opacity: 0;
            transform: translate3d(-30px, 0, 0) scale(1.03);
          }
        }

        @keyframes maramHeroDotOne {
          0%,
          23% {
            opacity: 1;
            transform: scale(1.25);
          }

          25%,
          98% {
            opacity: .35;
            transform: scale(1);
          }

          100% {
            opacity: 1;
            transform: scale(1.25);
          }
        }

        @keyframes maramHeroDotTwo {
          0%,
          23% {
            opacity: .35;
            transform: scale(1);
          }

          25%,
          48% {
            opacity: 1;
            transform: scale(1.25);
          }

          50%,
          100% {
            opacity: .35;
            transform: scale(1);
          }
        }

        @keyframes maramHeroDotThree {
          0%,
          48% {
            opacity: .35;
            transform: scale(1);
          }

          50%,
          73% {
            opacity: 1;
            transform: scale(1.25);
          }

          75%,
          100% {
            opacity: .35;
            transform: scale(1);
          }
        }

        @keyframes maramHeroDotFour {
          0%,
          73% {
            opacity: .35;
            transform: scale(1);
          }

          75%,
          98% {
            opacity: 1;
            transform: scale(1.25);
          }

          100% {
            opacity: .35;
            transform: scale(1);
          }
        }

        @keyframes maramHeroProgress {
          0% {
            transform: scaleX(0);
          }

          100% {
            transform: scaleX(1);
          }
        }

        .maram-hero-slider {
          position: relative;
          min-height: 680px;
          height: 680px;
        }

        .maram-hero-slide {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.maram-hero-slide a,
.maram-hero-slide button {
  pointer-events: auto;
}

        .maram-hero-slide-one {
          animation: maramHeroSlideOne 20s ease-in-out infinite;
        }

        .maram-hero-slide-two {
          animation: maramHeroSlideTwo 20s ease-in-out infinite;
        }

        .maram-hero-slide-three {
          animation: maramHeroSlideThree 20s ease-in-out infinite;
        }

        .maram-hero-slide-four {
          animation: maramHeroSlideFour 20s ease-in-out infinite;
        }

        .maram-hero-content-one {
          animation: maramHeroContentOne 20s ease-in-out infinite;
        }

        .maram-hero-content-two {
          animation: maramHeroContentTwo 20s ease-in-out infinite;
        }

        .maram-hero-content-three {
          animation: maramHeroContentThree 20s ease-in-out infinite;
        }

        .maram-hero-content-four {
          animation: maramHeroContentFour 20s ease-in-out infinite;
        }

        .maram-hero-image-one {
          animation: maramHeroImageOne 20s ease-in-out infinite;
        }

        .maram-hero-image-two {
          animation: maramHeroImageTwo 20s ease-in-out infinite;
        }

        .maram-hero-image-three {
          animation: maramHeroImageThree 20s ease-in-out infinite;
        }

        .maram-hero-image-four {
          animation: maramHeroImageFour 20s ease-in-out infinite;
        }

        .maram-hero-progress {
          position: absolute;
          bottom: 18px;
          left: 50%;
          z-index: 40;
          display: flex;
          transform: translateX(-50%);
          align-items: center;
          gap: 8px;
        }

        .maram-hero-progress span {
          display: block;
          height: 5px;
          width: 5px;
          border-radius: 9999px;
          background: #a3834d;
        }

        .maram-hero-progress span:nth-child(1) {
          animation: maramHeroDotOne 20s linear infinite;
        }

        .maram-hero-progress span:nth-child(2) {
          animation: maramHeroDotTwo 20s linear infinite;
        }

        .maram-hero-progress span:nth-child(3) {
          animation: maramHeroDotThree 20s linear infinite;
        }

        .maram-hero-progress span:nth-child(4) {
          animation: maramHeroDotFour 20s linear infinite;
        }

        .maram-hero-progress-bar {
          position: absolute;
          bottom: 8px;
          left: 50%;
          z-index: 40;
          height: 1px;
          width: 120px;
          overflow: hidden;
          transform: translateX(-50%);
          background: rgba(163, 131, 77, .18);
        }

        .maram-hero-progress-bar::after {
          content: "";
          position: absolute;
          inset: 0;
          transform-origin: right center;
          animation: maramHeroProgress 20s linear infinite;
          background: #a3834d;
        }

        .maram-hero-slide:hover .maram-hero-content-one,
        .maram-hero-slide:hover .maram-hero-content-two,
        .maram-hero-slide:hover .maram-hero-content-three,
        .maram-hero-slide:hover .maram-hero-content-four {
          animation-play-state: paused;
        }

        @media (max-width: 1023px) {
          .maram-hero-slider {
            min-height: 900px;
            height: 900px;
          }

          .maram-hero-slide {
            overflow-y: visible;
          }
        }

        @media (max-width: 640px) {
          .maram-marquee {
            animation-duration: 16s;
          }

          .maram-hero-slider {
            min-height: 900px;
            height: 900px;
          }

          .maram-hero-progress {
            bottom: 14px;
          }

          .maram-hero-progress-bar {
            bottom: 5px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .maram-hero-slide-one,
          .maram-hero-slide-two,
          .maram-hero-slide-three,
          .maram-hero-slide-four,
          .maram-hero-content-one,
          .maram-hero-content-two,
          .maram-hero-content-three,
          .maram-hero-content-four,
          .maram-hero-image-one,
          .maram-hero-image-two,
          .maram-hero-image-three,
          .maram-hero-image-four,
          .maram-hero-progress span,
          .maram-hero-progress-bar::after {
            animation: none !important;
          }

          .maram-hero-slide-one {
            opacity: 1 !important;
            visibility: visible !important;
          }

          .maram-hero-slide-two,
          .maram-hero-slide-three,
          .maram-hero-slide-four {
            display: none !important;
          }

          .maram-hero-content-one,
          .maram-hero-image-one {
            opacity: 1 !important;
            transform: none !important;
          }
        }

        .maram-hero-reveal {
          animation: maramHeroReveal .9s cubic-bezier(.22,1,.36,1) both;
        }

        .maram-hero-reveal-delay-1 {
          animation: maramHeroReveal 1s .12s cubic-bezier(.22,1,.36,1) both;
        }

        .maram-hero-reveal-delay-2 {
          animation: maramHeroReveal 1s .22s cubic-bezier(.22,1,.36,1) both;
        }

        .maram-hero-reveal-delay-3 {
          animation: maramHeroReveal 1s .34s cubic-bezier(.22,1,.36,1) both;
        }

        .maram-hero-image {
          animation: maramHeroImage 1.1s .15s cubic-bezier(.22,1,.36,1) both;
        }

        .maram-float {
          animation: maramFloat 4.5s ease-in-out infinite;
          will-change: transform;
        }

        .maram-float-reverse {
          animation: maramFloatReverse 5s ease-in-out infinite;
          will-change: transform;
        }

        .maram-glow {
          animation: maramGlow 5s ease-in-out infinite;
          will-change: transform, opacity;
        }

        .maram-pulse {
          animation: maramPulse 2.5s ease-in-out infinite;
          will-change: transform, opacity;
        }

        .maram-marquee {
          animation-name: maramScroll;
          animation-duration: 24s;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          animation-fill-mode: both;
          will-change: transform;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          perspective: 1000px;
        }

        .maram-marquee:hover {
          animation-play-state: running;
        }

        .maram-fade-up {
          animation: maramFadeUp .8s cubic-bezier(.22,1,.36,1) both;
        }

        .maram-soft-scale {
          animation: maramSoftScale .8s cubic-bezier(.22,1,.36,1) both;
        }

        .maram-delay-1 {
          animation-delay: .08s;
        }

        .maram-delay-2 {
          animation-delay: .16s;
        }

        .maram-delay-3 {
          animation-delay: .24s;
        }

        .maram-delay-4 {
          animation-delay: .32s;
        }

        @media (max-width: 1023px) {
  .maram-hero-slider {
    min-height: 900px;
    height: 900px;
  }

  .maram-hero-slide {
    overflow-y: visible;
  }
}
        @media (prefers-reduced-motion: reduce) {
          .maram-hero-reveal,
          .maram-hero-reveal-delay-1,
          .maram-hero-reveal-delay-2,
          .maram-hero-reveal-delay-3,
          .maram-hero-image,
          .maram-float,
          .maram-float-reverse,
          .maram-glow,
          .maram-pulse,
          .maram-marquee,
          .maram-fade-up,
          .maram-soft-scale {
            animation: none !important;
          }
        }
      `}</style>

      {/* ===================================================== */}
      {/* ==================== ANNOUNCEMENT BAR =============== */}
      {/* ===================================================== */}

      <div
        className="
          relative
          z-50
          overflow-hidden
          bg-[#e87524]
          text-white
          shadow-[0_4px_18px_rgba(232,117,36,0.18)]
        "
        dir="rtl"
      >
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-r
            from-transparent
            via-white/10
            to-transparent
          "
        />

        <div
          className="
            flex
            min-w-max
            maram-marquee
            items-center
            gap-12
            py-3
            text-sm
            font-semibold
            tracking-wide
            sm:gap-20
            sm:py-3.5
            sm:text-base
          "
        >
          {/* FIRST SET */}

          <div className="flex shrink-0 items-center gap-12 sm:gap-20">
            <span className="flex items-center gap-2 whitespace-nowrap">
              🚀 توصيل سريع لجميع ولايات الجزائر
            </span>

            <span className="h-1 w-1 shrink-0 rounded-full bg-white/70" />

            <span className="flex items-center gap-2 whitespace-nowrap">
              🔥 عروض حصرية
            </span>

            <span className="h-1 w-1 shrink-0 rounded-full bg-white/70" />

            <span className="flex items-center gap-2 whitespace-nowrap">
              👌 جودة مضمونة 100% أصلية
            </span>

            <span className="h-1 w-1 shrink-0 rounded-full bg-white/70" />

            <span className="flex items-center gap-2 whitespace-nowrap">
              ✨ أجود أنواع القماش
            </span>
          </div>

          {/* SECOND SET */}

          <div className="flex shrink-0 items-center gap-12 sm:gap-20">
            <span className="flex items-center gap-2 whitespace-nowrap">
              🚀 توصيل سريع لجميع ولايات الجزائر
            </span>

            <span className="h-1 w-1 shrink-0 rounded-full bg-white/70" />

            <span className="flex items-center gap-2 whitespace-nowrap">
              🔥 عروض حصرية
            </span>

            <span className="h-1 w-1 shrink-0 rounded-full bg-white/70" />

            <span className="flex items-center gap-2 whitespace-nowrap">
              👌 جودة مضمونة 100% أصلية
            </span>

            <span className="h-1 w-1 shrink-0 rounded-full bg-white/70" />

            <span className="flex items-center gap-2 whitespace-nowrap">
              ✨ أجود أنواع القماش
            </span>
          </div>

          {/* THIRD SET */}

          <div className="flex shrink-0 items-center gap-12 sm:gap-20">
            <span className="flex items-center gap-2 whitespace-nowrap">
              🚀 توصيل سريع لجميع ولايات الجزائر
            </span>

            <span className="h-1 w-1 shrink-0 rounded-full bg-white/70" />

            <span className="flex items-center gap-2 whitespace-nowrap">
              🔥 عروض حصرية
            </span>

            <span className="h-1 w-1 shrink-0 rounded-full bg-white/70" />

            <span className="flex items-center gap-2 whitespace-nowrap">
              👌 جودة مضمونة 100% أصلية
            </span>

            <span className="h-1 w-1 shrink-0 rounded-full bg-white/70" />

            <span className="flex items-center gap-2 whitespace-nowrap">
              ✨ أجود أنواع القماش
            </span>
          </div>
        </div>
      </div>

      {/* ===================================================== */}
      {/* ==================== HERO =========================== */}
      {/* ===================================================== */}

      <section
        className="
          relative
          overflow-hidden
          bg-[#dfd1bd]
          px-6
          pb-4
        "
      >
        {/* Decorative glow */}

        <div
          className="
            maram-glow
            pointer-events-none
            absolute
            -right-32
            top-20
            h-80
            w-80
            rounded-full
            bg-white/20
            blur-3xl
          "
        />

        <div
          className="
            maram-glow
            pointer-events-none
            absolute
            -left-32
            bottom-10
            h-80
            w-80
            rounded-full
            bg-[#a3834d]/10
            blur-3xl
          "
        />

        <div className="mx-auto max-w-7xl">
          <div className="maram-hero-slider relative">

            {/* ================================================= */}
            {/* SLIDE 1 — BRAND */}
            {/* ================================================= */}

            <div
              className="
                maram-hero-slide
                maram-hero-slide-one
              "
            >
              <div
                className="
                 grid
h-full
items-center
gap-7
px-4
py-6
sm:gap-10
sm:px-6
sm:py-8
lg:grid-cols-2
lg:gap-16
lg:px-6
lg:py-8
                "
              >
                {/* HERO CONTENT */}

                <div
                  className="
                    maram-hero-content-one
                    relative
                    z-10
                    max-w-xl
                    -mt-8
                    lg:-translate-y-5
                  "
                >
                  <div
                    className="
                      mb-5
                      inline-block
                      rounded-xl
                      -translate-y-4
                      bg-[#f3f0ea]
                      px-4
                      py-2
                      shadow-sm
                      
    z-10
    mx-auto
    -mt-8
    
    lg:-mt-12
  
                    "
                  >
                    <p className="text-xl font-semibold tracking-[0.45em] text-[#a3834d]">
                      أزياء مرام
                    </p>
                  </div>

                  <h2
                    className="
                      text-5xl
                      font-bold
                      leading-[1.02]
                      tracking-[-0.025em]
                      text-[#1f1f1f]
                      sm:text-6xl
                      lg:text-[5.2rem]
                    "
                  >
                    أناقة

                    <br />

                    <span className="text-[#a3834d]">
                      تليق بكِ
                    </span>
                  </h2>

                  <p
                    className="
                      mt-6
                      max-w-lg
                      text-[15px]
                      font-normal
                      leading-8
                      text-black/60
                      sm:text-lg
                    "
                  >
                    اكتشفي تشكيلتنا المختارة من الحجابات والعبايات والخمارات
                    المصممة بعناية لتمنحكِ إطلالة راقية تجمع بين الاحتشام والأناقة.
                  </p>

                  {/* BUTTONS */}

                  <div className="relative z-50 mt-8 flex flex-wrap gap-4">
                    <a
                      href="#products"
                      className="
                        group
                        relative
                        overflow-hidden
                        rounded-full
                        bg-[#1f1f1f]
                        px-8
                        py-4
                        text-sm
                        font-semibold
                        tracking-wide
                        text-white
                        shadow-lg
                        shadow-black/10
                        transition-all
                        duration-500
                        hover:-translate-y-1
                        hover:scale-[1.02]
                        hover:bg-[#a3834d]
                        hover:shadow-xl
                      "
                    >
                      <span className="relative z-50">
                        اكتشفي المجموعة
                      </span>

                      <span
                        className="
                          absolute
                          inset-y-0
                          -left-20
                          w-10
                          rotate-12
                          bg-white/20
                          transition-all
                          duration-700
                          group-hover:left-[120%]
                        "
                      />
                    </a>

                    <a
                      href="categories"
                      className="
                        group
                        rounded-full
                        border
                        border-[#1f1f1f]/20
                        px-8
                        py-4
                        text-sm
                        font-semibold
                        tracking-wide
                        text-[#1f1f1f]
                        transition-all
                        duration-500
                        hover:-translate-y-1
                        hover:scale-[1.02]
                        hover:bg-[#1f1f1f]
                        hover:text-white
                      "
                    >
                      تصفحي الفئات
                    </a>
                  </div>

                  {/* HERO STATS */}

                  <div
                    className="
                      mt-9
                      grid
                      grid-cols-3
                      gap-6
                      border-t
                      border-black/10
                      pt-6
                    "
                  >
                    <div className="text-center">
                      <h3 className="text-3xl font-bold text-[#a3834d]">
                        100%
                      </h3>

                      <p className="mt-1 text-sm font-medium text-zinc-500">
                        جودة مختارة
                      </p>
                    </div>

                    <div className="text-center">
                      <h3 className="text-3xl font-bold text-[#a3834d]">
                        +{products.length}
                      </h3>

                      <p className="mt-1 text-sm font-medium text-zinc-500">
                        منتجًا
                      </p>
                    </div>

                    <div className="text-center">
                      <h3 className="text-3xl font-bold text-[#a3834d]">
                        24/7
                      </h3>

                      <p className="mt-1 text-sm font-medium text-zinc-500">
                        خدمة العملاء
                      </p>
                    </div>
                  </div>
                </div>

                {/* HERO VISUAL */}

                <div
                  className="
  maram-hero-image-one
  relative
  z-10
  mx-auto
  -mt-20
  w-full
  max-w-[560px]
  lg:-mt-40
"
                >
                  <div
                    className="
                      relative
                      mx-auto
                      w-fit
                      rounded-[2.5rem]
                      bg-white
                      p-4
                      shadow-[0_25px_60px_rgba(31,31,31,0.16)]
                      transition-all
                      duration-700
                      hover:-translate-y-1
                      hover:shadow-[0_30px_70px_rgba(31,31,31,0.20)]
                      sm:p-5
                    "
                  >
                    <Image
                      src="/hero/hero.png"
                      alt="مجموعة الحجابات والعبايات"
                      width={600}
                      height={450}
                      className="
                        h-auto
                        w-[270px]
                        rounded-[2rem]
                        object-contain
                        transition-transform
                        duration-1000
                        ease-out
                        hover:scale-[1.025]
                        sm:w-[370px]
                        lg:w-[500px]
                      "
                      priority
                    />

                    <div
                      className="
                        pointer-events-none
                        absolute
                        -right-8
                        -top-8
                        h-32
                        w-32
                        rounded-full
                        border
                        border-[#a3834d]/20
                      "
                    />

                    <div
                      className="
                        pointer-events-none
                        absolute
                        -bottom-10
                        -left-10
                        h-40
                        w-40
                        rounded-full
                        border
                        border-[#a3834d]/15
                      "
                    />
                  </div>

                  <div
                    className="
                      maram-float
                      absolute
                      right-0
                      top-8
                      z-20
                      rounded-2xl
                      border
                      border-black/5
                      bg-white
                      px-5
                      py-4
                      shadow-xl
                      sm:-right-2
                    "
                  >
                    <Image
                      src="/icons/person.svg"
                      alt="عبايات أنيقة"
                      width={100}
                      height={100}
                      className="mx-auto h-9 w-9 object-contain"
                    />

                    <p className="mt-2 text-center text-sm font-bold text-[#1f1f1f]">
                      عبايات أنيقة
                    </p>

                    <p className="mt-1 text-center text-xs text-black/40">
                      تصاميم عصرية
                    </p>
                  </div>

                  <div
                    className="
                      maram-float-reverse
                      absolute
                      bottom-10
                      left-0
                      z-20
                      rounded-2xl
                      border
                      border-black/5
                      bg-white
                      px-5
                      py-4
                      shadow-xl
                      sm:-left-2
                    "
                  >
                    <Image
                      src="/icons/khimar-gold.png"
                      alt="خمارات راقية"
                      width={32}
                      height={32}
                      className="mx-auto h-8 w-8 object-contain"
                    />

                    <p className="mt-2 text-center text-sm font-bold text-[#1f1f1f]">
                      خمارات راقية
                    </p>

                    <p className="mt-1 text-center text-xs text-black/40">
                      خامات فاخرة
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ================================================= */}
            {/* SLIDE 2 — IMPORTED COLLECTION */}
            {/* ================================================= */}

            <div
              className="
                maram-hero-slide
                maram-hero-slide-two
              "
            >
              <div
                className="
                  grid
h-full
items-start
gap-0
px-4
py-4
sm:gap-2
sm:px-6
sm:py-6
lg:grid-cols-2
lg:gap-16
lg:px-6
lg:py-6
                "
              >
                {/* CONTENT */}

                <div
                  className="
                    maram-hero-content-two
                    relative
                    z-10
                    max-w-xl
                  "
                >
                  <div
                    className="
                      mb-5
                      inline-flex
                      items-center
                      gap-3
                      rounded-xl
                      bg-[#f3f0ea]
                      px-4
                      py-2
                      shadow-sm
                    "
                  >
                    <span className="h-2 w-2 rounded-full bg-[#a3834d] maram-pulse" />

                    <p className="text-sm font-semibold tracking-[0.25em] text-[#a3834d]">
                      COLLECTION PREMIUM
                    </p>
                  </div>

                  <h2
                    className="
                      text-5xl
                      font-bold
                      leading-[1.02]
                      tracking-[-0.025em]
                      text-[#1f1f1f]
                      sm:text-6xl
                      lg:text-[4.7rem]
                    "
                  >
                    اختيارات

                    <br />

                    <span className="text-[#a3834d]">
                      من حول العالم
                    </span>
                  </h2>

                  <p
                    className="
                      mt-6
                      max-w-lg
                      text-[15px]
                      font-normal
                      leading-8
                      text-black/60
                      sm:text-lg
                    "
                  >
                    تشكيلات مختارة بعناية من أجود المنتجات التركية
                    والأردنية ودبي، بتصاميم راقية تمنحكِ إطلالة
                    فاخرة ومميزة.
                  </p>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <span
                      className="
                        rounded-full
                        border
                        border-[#a3834d]/25
                        bg-white/50
                        px-5
                        py-2.5
                        text-sm
                        font-semibold
                        text-[#1f1f1f]
                      "
                    >
                      🇹🇷 تركية
                    </span>

                    <span
                      className="
                        rounded-full
                        border
                        border-[#a3834d]/25
                        bg-white/50
                        px-5
                        py-2.5
                        text-sm
                        font-semibold
                        text-[#1f1f1f]
                      "
                    >
                      🇯🇴 أردنية
                    </span>

                    <span
                      className="
                        rounded-full
                        border
                        border-[#a3834d]/25
                        bg-white/50
                        px-5
                        py-2.5
                        text-sm
                        font-semibold
                        text-[#1f1f1f]
                      "
                    >
                      🇦🇪 دبي
                    </span>
                  </div>

                  <div className="mt-8">
                    <a
                      href="#products"
                      className="
                        group
                        inline-flex
                        items-center
                        gap-3
                        rounded-full
                        bg-[#1f1f1f]
                        px-8
                        py-4
                        text-sm
                        font-semibold
                        text-white
                        shadow-lg
                        transition-all
                        duration-500
                        hover:-translate-y-1
                        hover:bg-[#a3834d]
                        hover:shadow-xl
                      "
                    >
                      اكتشفي التشكيلة

                      <span className="transition-transform duration-500 group-hover:-translate-x-1">
                        ←
                      </span>
                    </a>
                  </div>
                </div>

                {/* IMAGE */}

                <div
  className="
    maram-hero-image-two
    relative
    z-10
    mx-auto
    -mt-8
    w-full
    max-w-[560px]
    lg:-mt-2
  "
>
                  <div
                    className="
      relative
      mx-auto
      w-full
      rounded-[2.5rem]
      bg-white
      p-3
      shadow-[0_25px_60px_rgba(31,31,31,0.16)]
      sm:w-fit
      sm:p-5
    "
                  >
                    <Image
                      src="/hero/gl2.svg"
                      alt="تشكيلة أزياء فاخرة من تركيا والأردن ودبي"
                      width={600}
                      height={600}
                      className="
                        h-auto
                        w-[450px]
                        rounded-[2rem]
                        object-contain
                        transition-transform
                        duration-1000
                        ease-out
                        hover:scale-[1.025]
                        sm:w-[450px]
                        lg:w-[500px]
                      "
                    />

                    <div
                      className="
                        absolute
                        bottom-8
                        right-8
                        rounded-2xl
                        border
                        border-white/30
                        bg-[#1f1f1f]/90
                        px-5
                        py-4
                        text-white
                        shadow-2xl
                        backdrop-blur-md
                      "
                    >
                      <p className="text-xs text-white/50">
                        PREMIUM COLLECTION
                      </p>

                      <p className="mt-1 text-sm font-bold">
                        اختيارات فاخرة
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ================================================= */}
            {/* SLIDE 3 — FABRICS */}
            {/* ================================================= */}

            <div
              className="
                maram-hero-slide
                maram-hero-slide-three
              "
            >
              <div
                className="
                  grid
h-full
items-start
gap-0
px-4
py-4
sm:gap-2
sm:px-6
sm:py-6
lg:grid-cols-2
lg:gap-16
lg:px-6
lg:py-6
                "
              >
                {/* CONTENT */}

                <div
                  className="
                    maram-hero-content-three
                    relative
                    z-10
                    max-w-xl
                  "
                >
                  <div
                    className="
                      mb-5
                      inline-block
                      rounded-xl
                      bg-[#f3f0ea]
                      px-4
                      py-2
                      shadow-sm
                    "
                  >
                    <p className="text-sm font-semibold tracking-[0.3em] text-[#a3834d]">
                      QUALITY FIRST
                    </p>
                  </div>

                  <h2
                    className="
                      text-5xl
                      font-bold
                      leading-[1.02]
                      tracking-[-0.025em]
                      text-[#1f1f1f]
                      sm:text-6xl
                      lg:text-[4.9rem]
                    "
                  >
                    جودة

                    <br />

                    <span className="text-[#a3834d]">
                      تلمسينها
                    </span>
                  </h2>

                  <p
                    className="
                      mt-6
                      max-w-lg
                      text-[15px]
                      font-normal
                      leading-8
                      text-black/60
                      sm:text-lg
                    "
                  >
                    أقمشة درجة أولى أصلية، خامات فاخرة ولمسات دقيقة
                    اخترناها لتمنحكِ الراحة والأناقة في كل إطلالة.
                  </p>

                  <div className="mt-7 grid max-w-lg grid-cols-3 gap-3">
                    <div
                      className="
                        rounded-2xl
                        border
                        border-[#a3834d]/15
                        bg-white/40
                        p-4
                        text-center
                        backdrop-blur-sm
                      "
                    >
                      <div className="text-2xl font-bold text-[#a3834d]">
                        01
                      </div>

                      <p className="mt-1 text-xs font-semibold text-[#1f1f1f]/60">
                        خامات أصلية
                      </p>
                    </div>

                    <div
                      className="
                        rounded-2xl
                        border
                        border-[#a3834d]/15
                        bg-white/40
                        p-4
                        text-center
                        backdrop-blur-sm
                      "
                    >
                      <div className="text-2xl font-bold text-[#a3834d]">
                        02
                      </div>

                      <p className="mt-1 text-xs font-semibold text-[#1f1f1f]/60">
                        جودة أولى
                      </p>
                    </div>

                    <div
                      className="
                        rounded-2xl
                        border
                        border-[#a3834d]/15
                        bg-white/40
                        p-4
                        text-center
                        backdrop-blur-sm
                      "
                    >
                      <div className="text-2xl font-bold text-[#a3834d]">
                        03
                      </div>

                      <p className="mt-1 text-xs font-semibold text-[#1f1f1f]/60">
                        راحة وأناقة
                      </p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <a
                      href="#products"
                      className="
                        group
                        inline-flex
                        items-center
                        gap-3
                        rounded-full
                        bg-[#1f1f1f]
                        px-8
                        py-4
                        text-sm
                        font-semibold
                        text-white
                        shadow-lg
                        transition-all
                        duration-500
                        hover:-translate-y-1
                        hover:bg-[#a3834d]
                        hover:shadow-xl
                      "
                    >
                      شاهدي المنتجات

                      <span className="transition-transform duration-500 group-hover:-translate-x-1">
                        ←
                      </span>
                    </a>
                  </div>
                </div>

                {/* IMAGE */}

                <div
                  className="
                    maram-hero-image-three
                    relative
                    z-10
                    mx-auto
                    w-full
                    max-w-[560px]
                  "
                >
                  <div
                    className="
                      relative
                      mx-auto
                      w-fit
                      rounded-[2.5rem]
                      bg-white
                      p-4
                      shadow-[0_25px_60px_rgba(31,31,31,0.16)]
                      sm:p-5
                    "
                  >
                    <Image
                      src="/hero/gl4.svg"
                      alt="أقمشة درجة أولى أصلية"
                      width={600}
                      height={600}
                      className="
                        h-auto
                        w-[270px]
                        rounded-[2rem]
                        object-contain
                        transition-transform
                        duration-1000
                        ease-out
                        hover:scale-[1.025]
                        sm:w-[370px]
                        lg:w-[400px]
                      "
                    />

                    <div
                      className="
                        absolute
                        left-8
                        top-8
                        rounded-2xl
                        border
                        border-white/20
                        bg-white/90
                        px-5
                        py-4
                        shadow-xl
                        backdrop-blur-md
                      "
                    >
                      <p className="text-xs font-medium text-black/40">
                        FABRIC QUALITY
                      </p>

                      <p className="mt-1 text-sm font-bold text-[#1f1f1f]">
                        درجة أولى
                      </p>

                      <div className="mt-2 h-1 w-16 overflow-hidden rounded-full bg-[#a3834d]/20">
                        <div className="h-full w-full rounded-full bg-[#a3834d]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ================================================= */}
            {/* SLIDE 4 — STORE VARIETY */}
            {/* ================================================= */}

            <div
              className="
                maram-hero-slide
                maram-hero-slide-four
              "
            >
              <div
                className="
                  grid
h-full
items-start
gap-0
px-4
py-4
sm:gap-2
sm:px-6
sm:py-6
lg:grid-cols-2
lg:gap-16
lg:px-6
lg:py-6
                "
              >
                {/* CONTENT */}

                <div
                  className="
                    maram-hero-content-four
                    relative
                    z-10
                    max-w-xl
                    lg:-translate-y-4
                  "
                >
                  <div
                    className="
                      mb-5
                      inline-flex
                      items-center
                      gap-3
                      rounded-xl
                      bg-[#f3f0ea]
                      px-4
                      py-2
                      shadow-sm
                    "
                  >
                    <span className="h-2 w-2 rounded-full bg-[#a3834d] maram-pulse" />

                    <p className="text-sm font-semibold tracking-[0.22em] text-[#a3834d]">
                      BOUTIQUE MARAM
                    </p>
                  </div>

                  <h2
                    className="
                      text-5xl
                      font-bold
                      leading-[1.02]
                      tracking-[-0.025em]
                      text-[#1f1f1f]
                      sm:text-6xl
                      lg:text-[4.7rem]
                    "
                  >
                    كل ما تحبينه

                    <br />

                    <span className="text-[#a3834d]">
                      في مكان واحد
                    </span>
                  </h2>

                  <p
                    className="
                      mt-6
                      max-w-lg
                      text-[15px]
                      font-normal
                      leading-8
                      text-black/60
                      sm:text-lg
                    "
                  >
                    اكتشفي تنوع أزياء مرام من العبايات والحجابات
                    والجلابيب، بتصاميم أنيقة وخامات مختارة بعناية
                    لتجدي إطلالتكِ المثالية.
                  </p>

                  {/* COLLECTION TYPES */}

                  <div className="mt-7 grid max-w-lg grid-cols-3 gap-2.5 sm:gap-3">
                    <a
                      href="/categories/abayas"
                      className="
                        group
                        rounded-2xl
                        border
                        border-[#a3834d]/15
                        bg-white/45
                        p-3
                        text-center
                        backdrop-blur-sm
                        transition-all
                        duration-500
                        hover:-translate-y-1
                        hover:border-[#a3834d]/40
                        hover:bg-white/70
                      "
                    >
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#a3834d]/10 text-xs font-bold text-[#a3834d] transition-transform duration-500 group-hover:scale-110">
                        01
                      </div>

                      <p className="mt-2 text-sm font-bold text-[#1f1f1f]">
                        عبايات
                      </p>
                    </a>

                    <a
                      href="/categories/hijabs"
                      className="
                        group
                        rounded-2xl
                        border
                        border-[#a3834d]/15
                        bg-white/45
                        p-3
                        text-center
                        backdrop-blur-sm
                        transition-all
                        duration-500
                        hover:-translate-y-1
                        hover:border-[#a3834d]/40
                        hover:bg-white/70
                      "
                    >
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#a3834d]/10 text-xs font-bold text-[#a3834d] transition-transform duration-500 group-hover:scale-110">
                        02
                      </div>

                      <p className="mt-2 text-sm font-bold text-[#1f1f1f]">
                        حجابات
                      </p>
                    </a>

                    <a
                      href="#products"
                      className="
                        group
                        rounded-2xl
                        border
                        border-[#a3834d]/15
                        bg-white/45
                        p-3
                        text-center
                        backdrop-blur-sm
                        transition-all
                        duration-500
                        hover:-translate-y-1
                        hover:border-[#a3834d]/40
                        hover:bg-white/70
                      "
                    >
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#a3834d]/10 text-xs font-bold text-[#a3834d] transition-transform duration-500 group-hover:scale-110">
                        03
                      </div>

                      <p className="mt-2 text-sm font-bold text-[#1f1f1f]">
                        جلابيب
                      </p>
                    </a>
                  </div>

                  <div className="mt-7">
                    <a
                      href="#products"
                      className="
                        group
                        inline-flex
                        items-center
                        gap-3
                        rounded-full
                        bg-[#1f1f1f]
                        px-8
                        py-4
                        text-sm
                        font-semibold
                        text-white
                        shadow-lg
                        transition-all
                        duration-500
                        hover:-translate-y-1
                        hover:bg-[#a3834d]
                        hover:shadow-xl
                      "
                    >
                      اكتشفي المجموعة

                      <span className="transition-transform duration-500 group-hover:-translate-x-1">
                        ←
                      </span>
                    </a>
                  </div>
                </div>

                {/* VISUAL */}

                <div
                  className="
                    maram-hero-image-four
                    relative
                    z-10
                    mx-auto
                    w-full
                    max-w-[540px]
                    lg:-translate-y-2
                  "
                >
                  <div
                    className="
                      relative
                      mx-auto
                      max-w-[500px]
                      rounded-[2.5rem]
                      bg-white
                      p-4
                      shadow-[0_25px_60px_rgba(31,31,31,0.16)]
                      sm:p-5
                    "
                  >
                    <div className="grid grid-cols-2 gap-3">
                      {/* ABAYAS */}

                      <a
                        href="/categories/abayas"
                        className="
                          group
                          relative
                          min-h-[260px]
                          overflow-hidden
                          rounded-[1.8rem]
                          bg-[#d9d0c4]
                          sm:min-h-[300px]
                        "
                      >
                        <Image
                          src="/hero/gl5.svg"
                          alt="عبايات"
                          fill
                          className="
                            object-cover
                            transition-transform
                            duration-700
                            group-hover:scale-110
                          "
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <p className="text-[10px] font-medium tracking-[0.2em] text-white/60">
                            COLLECTION
                          </p>

                          <p className="mt-1 text-lg font-bold">
                           الجلابيب
                          </p>
                        </div>
                      </a>

                      {/* HIJABS */}

                      <a
                        href="/hero/images.jfif"
                        className="
                          group
                          relative
                          min-h-[260px]
                          overflow-hidden
                          rounded-[1.8rem]
                          bg-[#e8dfd2]
                          sm:min-h-[300px]
                        "
                      >
                        <Image
                          src="/categories/hijabs.jpg"
                          alt="حجابات"
                          fill
                          className="
                            object-cover
                            transition-transform
                            duration-700
                            group-hover:scale-110
                          "
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <p className="text-[10px] font-medium tracking-[0.2em] text-white/60">
                            COLLECTION
                          </p>

                          <p className="mt-1 text-lg font-bold">
                            حجابات
                          </p>
                        </div>
                      </a>

                      {/* KHIMARS / JALABIB */}

                      <div
                        className="
                          group
                          relative
                          col-span-2
                          min-h-[170px]
                          overflow-hidden
                          rounded-[1.8rem]
                          bg-[#c9c0b3]
                          sm:min-h-[190px]
                        "
                      >
                        <Image
                          src="/categories/abayas.jpg"
                          alt="تنوع العبايات و الأزياء "
                          fill
                          className="
                            object-cover
                            transition-transform
                            duration-700
                            group-hover:scale-105
                          "
                        />

                        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-black/5" />

                        <div className="absolute inset-y-0 left-0 flex items-center p-6 text-white">
                          <div>
                            <p className="text-[10px] font-medium tracking-[0.2em] text-white/60">
                              MODEST FASHION
                            </p>

                            <p className="mt-1 text-xl font-bold">
                              عبايات • حجابات • جلابيب
                            </p>

                            <p className="mt-2 text-xs text-white/65">
                              تنوع يناسب كل إطلالة
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ================================================= */}
            {/* SLIDER INDICATORS */}
            {/* ================================================= */}

            <div className="maram-hero-progress">
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className="maram-hero-progress-bar" />
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* ==================== CATEGORIES ===================== */}
      {/* ===================================================== */}

      <section
        id="categories"
        className="
          border-t
          border-black/10
          bg-[#dfd1bd]
          py-20
        "
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="maram-fade-up">
              <p className="mb-3 text-xs font-semibold tracking-[0.3em] text-[#a3834d]">
                SHOP BY CATEGORY
              </p>

              <h3
                className="
                  text-3xl
                  font-bold
                  tracking-[-0.02em]
                  text-[#1f1f1f]
                  sm:text-4xl
                "
              >
                اكتشفي مجموعتنا
              </h3>
            </div>

            <p
              className="
                maram-fade-up
                maram-delay-1
                max-w-md
                text-sm
                font-normal
                leading-7
                text-black/50
              "
            >
              اختاري ما يناسب ذوقك من تشكيلتنا المختارة بعناية من الأزياء
              المحتشمة والأنيقة.
            </p>
          </div>

          {/* CATEGORY CARDS */}

          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {/* HIJABS */}

            <a
              href="/categories/hijabs"
              className="
                group
                relative
                min-h-[360px]
                overflow-hidden
                rounded-3xl
                bg-[#e8dfd2]
                transition-all
                duration-700
                ease-[cubic-bezier(.22,1,.36,1)]
                hover:-translate-y-3
                hover:shadow-[0_25px_55px_rgba(31,31,31,0.18)]
              "
            >
              <Image
                src="/categories/hijabs.jpg"
                alt="الحجابات"
                fill
                className="
                  object-cover
                  transition-transform
                  duration-1000
                  ease-[cubic-bezier(.22,1,.36,1)]
                  group-hover:scale-110
                "
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-y-0
                  -left-1/2
                  w-1/3
                  skew-x-[-20deg]
                  bg-gradient-to-r
                  from-transparent
                  via-white/20
                  to-transparent
                  opacity-0
                  transition-all
                  duration-700
                  group-hover:left-[120%]
                  group-hover:opacity-100
                "
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-500 group-hover:from-black/75" />

              <div className="absolute left-6 top-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 text-white transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-white/10">
                01
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-7 text-white">
                <p className="mb-2 text-xs font-medium tracking-[0.25em] text-white/70">
                  COLLECTION 01
                </p>

                <h4 className="text-2xl font-bold">
                  الحجابات
                </h4>

                <span className="mt-4 inline-flex text-sm font-medium text-white/80 transition-all duration-500 group-hover:translate-x-1">
                  اكتشفي المجموعة ←
                </span>
              </div>
            </a>

            {/* ABAYAS */}

            <a
              href="/categories/abayas"
              className="
                group
                relative
                min-h-[360px]
                overflow-hidden
                rounded-3xl
                bg-[#d9d0c4]
                transition-all
                duration-700
                ease-[cubic-bezier(.22,1,.36,1)]
                hover:-translate-y-3
                hover:shadow-[0_25px_55px_rgba(31,31,31,0.18)]
              "
            >
              <Image
                src="/categories/abayas.jpg"
                alt="العبايات"
                fill
                className="
                  object-cover
                  transition-transform
                  duration-1000
                  ease-[cubic-bezier(.22,1,.36,1)]
                  group-hover:scale-110
                "
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-y-0
                  -left-1/2
                  w-1/3
                  skew-x-[-20deg]
                  bg-gradient-to-r
                  from-transparent
                  via-white/20
                  to-transparent
                  opacity-0
                  transition-all
                  duration-700
                  group-hover:left-[120%]
                  group-hover:opacity-100
                "
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-500 group-hover:from-black/75" />

              <div className="absolute left-6 top-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 text-white transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-white/10">
                02
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-7 text-white">
                <p className="mb-2 text-xs font-medium tracking-[0.25em] text-white/70">
                  COLLECTION 02
                </p>

                <h4 className="text-2xl font-bold">
                  العبايات
                </h4>

                <span className="mt-4 inline-flex text-sm font-medium text-white/80 transition-all duration-500 group-hover:translate-x-1">
                  اكتشفي المجموعة ←
                </span>
              </div>
            </a>

            {/* KHIMARS */}

            <a
              href="/categories/khimars"
              className="
                group
                relative
                min-h-[360px]
                overflow-hidden
                rounded-3xl
                bg-[#c9c0b3]
                transition-all
                duration-700
                ease-[cubic-bezier(.22,1,.36,1)]
                hover:-translate-y-3
                hover:shadow-[0_25px_55px_rgba(31,31,31,0.18)]
              "
            >
              <Image
                src="/categories/khimars.svg"
                alt="الخمارات"
                fill
                className="
                  object-cover
                  transition-transform
                  duration-1000
                  ease-[cubic-bezier(.22,1,.36,1)]
                  group-hover:scale-110
                "
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-y-0
                  -left-1/2
                  w-1/3
                  skew-x-[-20deg]
                  bg-gradient-to-r
                  from-transparent
                  via-white/20
                  to-transparent
                  opacity-0
                  transition-all
                  duration-700
                  group-hover:left-[120%]
                  group-hover:opacity-100
                "
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-500 group-hover:from-black/75" />

              <div className="absolute left-6 top-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 text-white transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-white/10">
                03
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-7 text-white">
                <p className="mb-2 text-xs font-medium tracking-[0.25em] text-white/70">
                  COLLECTION 03
                </p>

                <h4 className="text-2xl font-bold">
                  الخمارات
                </h4>

                <span className="mt-4 inline-flex text-sm font-medium text-white/80 transition-all duration-500 group-hover:translate-x-1">
                  اكتشفي المجموعة ←
                </span>
              </div>
            </a>

            {/* MORE */}

            <a
              href="#products"
              className="
                group
                relative
                min-h-[360px]
                overflow-hidden
                rounded-3xl
                bg-[#b8aa98]
                transition-all
                duration-700
                ease-[cubic-bezier(.22,1,.36,1)]
                hover:-translate-y-3
                hover:shadow-[0_25px_55px_rgba(31,31,31,0.18)]
              "
            >
              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-br
                  from-[#d6b46a]/20
                  via-transparent
                  to-black/30
                  transition-all
                  duration-700
                  group-hover:scale-105
                "
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-y-0
                  -left-1/2
                  w-1/3
                  skew-x-[-20deg]
                  bg-gradient-to-r
                  from-transparent
                  via-white/20
                  to-transparent
                  opacity-0
                  transition-all
                  duration-700
                  group-hover:left-[120%]
                  group-hover:opacity-100
                "
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              <div className="absolute left-6 top-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 text-white transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-white/10">
                04
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-7 text-white">
                <p className="mb-2 text-xs font-medium tracking-[0.25em] text-white/70">
                  COLLECTION 04
                </p>

                <h4 className="text-2xl font-bold">
                  المزيد
                </h4>

                <span className="mt-4 inline-flex text-sm font-medium text-white/80 transition-all duration-500 group-hover:translate-x-1">
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
        className="
          bg-[#1f1f1f]
          py-4
          text-white
          sm:py-6
        "
      >
        <div className="mx-auto max-w-7xl px-6">
          <div
            className="
              relative
              isolate
              overflow-x-clip
              overflow-y-hidden
              rounded-[2rem]
              border
              border-white/10
              bg-[#272727]
              px-4
              py-4
              sm:px-10
              sm:py-4
              lg:px-10
            "
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-[#d6b46a]/20" />

            <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full border border-[#d6b46a]/10" />

            <div className="relative">
              {/* OFFER HEADER */}

              <div className="max-w-2xl maram-fade-up">
                <p className="text-xs font-semibold tracking-[0.3em] text-[#d6b46a]">
                  LIMITED TIME OFFERS
                </p>

                <h3
                  className="
                    mt-6
                    text-4xl
                    font-bold
                    leading-[1.05]
                    tracking-[-0.02em]
                    sm:text-5xl
                  "
                >
                  أناقتكِ تستحق

                  <br />

                  <span className="text-[#d6b46a]">
                    عرضًا مميزًا
                  </span>
                </h3>

                <p className="mt-1 max-w-xl text-sm font-normal leading-8 text-white/60">
                  اكتشفي تشكيلتنا المختارة واستفيدي من الخصومات
                  المتاحة على مجموعة من منتجاتنا.
                </p>
              </div>

              {/* OFFER SLIDER */}

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
                    {offerProducts.map((product, index) => (
                      <div
                        key={product.id}
                        className="
                          maram-fade-up
                          w-[58%]
                          shrink-0
                          snap-start
                          transition-all
                          duration-500
                          hover:-translate-y-2
                          sm:w-[41%]
                          lg:w-[27%]
                        "
                        style={{
                          animationDelay: `${index * 80}ms`,
                        }}
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
                            isOutOfStock:
                              isProductOutOfStock(product),
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
                  <p className="text-sm font-medium text-white/50">
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
                    font-semibold
                    tracking-wide
                    text-[#1f1f1f]
                    transition-all
                    duration-500
                    hover:-translate-y-1
                    hover:scale-[1.02]
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
        className="
          bg-[#f8f5ef]
          py-24
        "
      >
        <div className="mx-auto max-w-7xl px-6">
          {/* PRODUCTS HEADER */}

          <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="maram-fade-up">
              <p className="mb-3 text-xs font-semibold tracking-[0.3em] text-[#a3834d]">
                OUR COLLECTION
              </p>

              <h3
                className="
                  text-3xl
                  font-bold
                  tracking-[-0.02em]
                  text-[#1f1f1f]
                  sm:text-4xl
                "
              >
                منتجاتنا المختارة
              </h3>

              <p className="mt-3 max-w-lg text-sm font-normal leading-7 text-black/50">
                مجموعة مختارة من أحدث التصاميم التي تجمع بين الأناقة
                والاحتشام والجودة.
              </p>
            </div>

            <a
              href="#products"
              className="
                group
                inline-flex
                items-center
                gap-2
                text-sm
                font-semibold
                text-[#1f1f1f]
                transition-all
                duration-300
              "
            >
              <span className="underline underline-offset-8 transition group-hover:text-[#a3834d]">
                عرض جميع المنتجات
              </span>

              <span className="transition group-hover:-translate-x-1">
                ←
              </span>
            </a>
          </div>

          {/* PRODUCTS GRID */}

          {products.length > 0 ? (
            <div
              className="
                grid
                grid-cols-2
                gap-3
                sm:gap-5
                lg:grid-cols-4
                xl:grid-cols-5
              "
            >
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="
                    maram-fade-up
                    min-w-0
                    transition-all
                    duration-500
                    hover:-translate-y-2
                  "
                  style={{
                    animationDelay: `${index * 45}ms`,
                  }}
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
                      isOutOfStock:
                        isProductOutOfStock(product),
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-black/5 bg-white p-12 text-center">
              <p className="text-lg font-bold text-[#1f1f1f]">
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

      <section className="bg-[#f8f5ef] px-6 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-[#1f1f1f] px-7 py-14 text-center sm:px-12 sm:py-20">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-[#d6b46a]/20" />

            <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full border border-[#d6b46a]/10" />

            <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />

            <div className="relative z-10 mx-auto max-w-5xl">
              <p className="text-xs font-semibold tracking-[0.35em] text-[#d6b46a]">
                STAY CONNECTED
              </p>

              <h3
                className="
                  mt-5
                  text-3xl
                  font-bold
                  leading-[1.05]
                  tracking-[-0.02em]
                  text-white
                  sm:text-5xl
                "
              >
                أناقتكِ تبدأ

                <br />

                <span className="text-[#d6b46a]">
                  من اختياركِ
                </span>
              </h3>

              {/* SERVICE CARDS */}

              <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* DELIVERY */}

                <div
                  className="
                    group
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.04]
                    p-6
                    text-center
                    transition-all
                    duration-500
                    hover:-translate-y-3
                    hover:border-[#d6b46a]/40
                    hover:bg-white/[0.07]
                    hover:shadow-[0_20px_40px_rgba(0,0,0,0.18)]
                  "
                >
                  <div
                    className="
                      mx-auto
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-[#d6b46a]/30
                      bg-[#d6b46a]/10
                      transition-all
                      duration-500
                      group-hover:scale-110
                    "
                  >
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
                        d="M8.25 18.75a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM18.75 18.75a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0 1.5 1.5 0 0 1 3 0ZM3 5.25h11.25v11.25H3V5.25ZM14.25 8.25h3.386a1.5 1.5 0 0 1 1.06.44l2.114 2.114c.281.281.44.663.44 1.06v4.636h-3"
                      />
                    </svg>
                  </div>

                  <h4 className="mt-5 text-base font-bold text-white">
                    توصيل إلى جميع الولايات
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-white/45">
                    نوصّل طلبك حتى باب منزلك
                  </p>
                </div>

                {/* EASY EXCHANGE */}

                <div
                  className="
                    group
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.04]
                    p-6
                    text-center
                    transition-all
                    duration-500
                    hover:-translate-y-3
                    hover:border-[#d6b46a]/40
                    hover:bg-white/[0.07]
                    hover:shadow-[0_20px_40px_rgba(0,0,0,0.18)]
                  "
                >
                  <div
                    className="
                      mx-auto
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-[#d6b46a]/30
                      bg-[#d6b46a]/10
                      transition-all
                      duration-500
                      group-hover:scale-110
                    "
                  >
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

                  <h4 className="mt-5 text-base font-bold text-white">
                    استبدال سهل
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-white/45">
                    إمكانية الاستبدال وفق سياسة المتجر
                  </p>
                </div>

                {/* CASH ON DELIVERY */}

                <div
                  className="
                    group
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.04]
                    p-6
                    text-center
                    transition-all
                    duration-500
                    hover:-translate-y-3
                    hover:border-[#d6b46a]/40
                    hover:bg-white/[0.07]
                    hover:shadow-[0_20px_40px_rgba(0,0,0,0.18)]
                  "
                >
                  <div
                    className="
                      mx-auto
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-[#d6b46a]/30
                      bg-[#d6b46a]/10
                      transition-all
                      duration-500
                      group-hover:scale-110
                    "
                  >
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

                  <h4 className="mt-5 text-base font-bold text-white">
                    دفع آمن عند الاستلام
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-white/45">
                    اطلبي الآن وادفعي عند استلام طلبك
                  </p>
                </div>

                {/* SUPPORT */}

                <div
                  className="
                    group
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.04]
                    p-6
                    text-center
                    transition-all
                    duration-500
                    hover:-translate-y-3
                    hover:border-[#d6b46a]/40
                    hover:bg-white/[0.07]
                    hover:shadow-[0_20px_40px_rgba(0,0,0,0.18)]
                  "
                >
                  <div
                    className="
                      mx-auto
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-[#d6b46a]/30
                      bg-[#d6b46a]/10
                      transition-all
                      duration-500
                      group-hover:scale-110
                    "
                  >
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

                  <h4 className="mt-5 text-base font-bold text-white">
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
      {/* ================= PREMIUM FOOTER ==================== */}
      {/* ===================================================== */}

      <footer className="relative overflow-hidden bg-[#171717] text-white">
        <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d6b46a]/60 to-transparent" />

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
                  <h3 className="text-xl font-bold tracking-[0.12em] text-white">
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
                <a
                  href="https://www.instagram.com/boutique_maram_39/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-sm text-white/60 transition-all duration-300 hover:-translate-y-1 hover:border-[#d6b46a]/50 hover:bg-[#d6b46a] hover:text-[#171717]"
                >
                  IG
                </a>

                <a
                  href="https://www.facebook.com/profile.php?id=100090690127793&utm_source=ig&utm_medium=social&utm_content=link_in_bio#"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-sm text-white/60 transition-all duration-300 hover:-translate-y-1 hover:border-[#d6b46a]/50 hover:bg-[#d6b46a] hover:text-[#171717]"
                >
                  FB
                </a>

                <a
                  href="https://wa.me/213699733131"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-sm text-white/60 transition-all duration-300 hover:-translate-y-1 hover:border-[#d6b46a]/50 hover:bg-[#d6b46a] hover:text-[#171717]"
                >
                  WA
                </a>
              </div>
            </div>

            {/* QUICK LINKS */}

            <div className="md:col-span-2">
              <h4 className="text-sm font-bold tracking-wide text-white">
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
              <h4 className="text-sm font-bold tracking-wide text-white">
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
              <h4 className="text-sm font-bold tracking-wide text-white">
                معلومات الاتصال
              </h4>

              <div className="mt-7 space-y-5">
                <a
                  href="tel:+213699733131"
                  className="group flex items-start gap-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[#d6b46a] transition group-hover:border-[#d6b46a]/40">
                    ☎
                  </div>

                  <div>
                    <p className="text-xs text-white/30">
                      الهاتف
                    </p>

                    <p className="mt-1 text-sm font-medium text-white/70 transition group-hover:text-[#d6b46a]">
                      0699733131
                    </p>
                  </div>
                </a>

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

                    <p className="mt-1 break-all text-sm font-medium text-white/70 transition group-hover:text-[#d6b46a]">
                      contact@hijabstore.com
                    </p>
                  </div>
                </a>

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

                    <p className="mt-1 text-sm font-medium text-white/70 transition group-hover:text-[#d6b46a]">
                      0699733131
                    </p>
                  </div>
                </a>

                <a
                  href="https://www.facebook.com/profile.php?id=100090690127793&utm_source=ig&utm_medium=social&utm_content=link_in_bio#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[#d6b46a]">
                    FB
                  </div>

                  <div>
                    <p className="text-xs text-white/30">
                      فيسبوك
                    </p>

                    <p className="mt-1 text-sm font-medium text-white/70 transition group-hover:text-[#d6b46a]">
                      Boutique Maram
                    </p>
                  </div>
                </a>

                <a
                  href="https://www.instagram.com/boutique_maram_39/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[#d6b46a]">
                    IG
                  </div>

                  <div>
                    <p className="text-xs text-white/30">
                      إنستغرام
                    </p>

                    <p className="mt-1 text-sm font-medium text-white/70 transition group-hover:text-[#d6b46a]">
                      @boutique_maram_39
                    </p>
                  </div>
                </a>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[#d6b46a]">
                    ⌖
                  </div>

                  <div>
                    <p className="text-xs text-white/30">
                      الموقع
                    </p>

                    <p className="mt-1 text-sm font-medium leading-6 text-white/70">
                      الفرع الأول الشط بجانب مخبر المجد لتحاليل
                      <br />
                      الفرع الثاني الرمال بجانب قاطو شيك
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* NEWSLETTER */}

          <div className="border-t border-white/10 py-10">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <p className="text-sm font-semibold text-white">
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
                  className="
                    min-w-0
                    flex-1
                    rounded-r-full
                    border
                    border-white/10
                    bg-white/[0.04]
                    px-5
                    py-3.5
                    text-sm
                    text-white
                    outline-none
                    placeholder:text-white/25
                    focus:border-[#d6b46a]/50
                  "
                />

                <button
                  type="button"
                  className="
                    rounded-l-full
                    bg-[#d6b46a]
                    px-6
                    py-3.5
                    text-sm
                    font-bold
                    text-[#171717]
                    transition-all
                    duration-300
                    hover:bg-white
                  "
                >
                  اشتراك
                </button>
              </div>
            </div>
          </div>

          {/* BOTTOM FOOTER */}

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
          maram-float
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
            font-semibold
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