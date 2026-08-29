
"use client";

import Link from "next/link";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    oldPrice: number | null;
    image: string;
    category: {
      name: string;
    };
    badge?: string | null;

    // =====================================================
    // STOCK
    // =====================================================

    isOutOfStock?: boolean;
  };
};

export default function ProductCard({
  product,
}: ProductCardProps) {
  const hasDiscount =
    product.oldPrice !== null &&
    product.oldPrice > product.price;

  const discountPercent = hasDiscount
    ? Math.round(
        ((product.oldPrice! - product.price) /
          product.oldPrice!) *
          100
      )
    : null;

  const isOutOfStock =
    product.isOutOfStock === true;

  return (
    <article
      className="
        group
        min-w-0
        overflow-hidden
        rounded-[1.75rem]
        border
        border-black/[0.06]
        bg-white
        shadow-[0_4px_20px_rgba(0,0,0,0.04)]
        transition-all
        duration-500
        hover:-translate-y-1
        hover:shadow-[0_18px_45px_rgba(0,0,0,0.10)]
      "
    >
      {/* ===================================================== */}
      {/* PRODUCT IMAGE */}
      {/* ===================================================== */}

      <Link
        href={`/products/${product.id}`}
        className="block"
      >
        <div
          className="
            relative
            aspect-[4/5]
            overflow-hidden
            bg-[#eee8df]
          "
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className={`
              h-full
              w-full
              object-cover
              transition-all
              duration-700
              ease-out
              ${
                isOutOfStock
                  ? "grayscale-[35%] opacity-75"
                  : "group-hover:scale-[1.045]"
              }
            `}
          />

          {/* IMAGE OVERLAY */}

          <div
            className={`
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-t
              from-black/[0.18]
              via-transparent
              to-black/[0.03]
              transition-opacity
              duration-500
              ${
                isOutOfStock
                  ? "opacity-80"
                  : "opacity-70"
              }
            `}
          />

          {/* ================================================= */}
          {/* OUT OF STOCK */}
          {/* ================================================= */}

          {isOutOfStock && (
            <div
              className="
                absolute
                inset-0
                z-20
                flex
                items-center
                justify-center
                bg-black/20
              "
            >
              <span
                className="
                  rounded-full
                  border
                  border-white/30
                  bg-black/75
                  px-5
                  py-3
                  text-[12px]
                  font-bold
                  text-white
                  shadow-[0_8px_25px_rgba(0,0,0,0.25)]
                  backdrop-blur-md
                  sm:px-6
                  sm:py-3.5
                  sm:text-[14px]
                "
              >
                غير متوفر حاليًا
              </span>
            </div>
          )}

          {/* ================================================= */}
          {/* DISCOUNT / BADGE */}
          {/* ================================================= */}

          {hasDiscount && discountPercent ? (
            <span
              className="
                absolute
                left-2
                top-2
                z-30
                rounded-full
                bg-[#1f1f1f]
                px-2
                py-1.5
                text-[9px]
                font-semibold
                tracking-wide
                text-white
                shadow-lg
                sm:left-4
                sm:top-4
                sm:px-3.5
                sm:py-2
                sm:text-[11px]
              "
            >
              خصم {discountPercent}%
            </span>
          ) : product.badge ? (
            <span
              className="
                absolute
                left-2
                top-2
                z-30
                rounded-full
                bg-[#1f1f1f]
                px-2
                py-1.5
                text-[9px]
                font-semibold
                tracking-wide
                text-white
                shadow-lg
                sm:left-4
                sm:top-4
                sm:px-3.5
                sm:py-2
                sm:text-[11px]
              "
            >
              {product.badge}
            </span>
          ) : null}

          {/* ================================================= */}
          {/* FAVORITE BUTTON */}
          {/* ================================================= */}

          <button
            type="button"
            aria-label="إضافة إلى المفضلة"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            className="
              absolute
              right-2
              top-2
              z-30
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              border
              border-white/70
              bg-white/90
              text-[16px]
              text-[#1f1f1f]
              shadow-md
              backdrop-blur-md
              transition-all
              duration-300
              hover:scale-105
              hover:bg-[#1f1f1f]
              hover:text-white
              sm:right-4
              sm:top-4
              sm:h-10
              sm:w-10
              sm:text-[20px]
            "
          >
            ♡
          </button>

          {/* ================================================= */}
          {/* QUICK VIEW HINT */}
          {/* ================================================= */}

          {!isOutOfStock && (
            <div
              className="
                pointer-events-none
                absolute
                bottom-4
                left-1/2
                z-30
                hidden
                -translate-x-1/2
                rounded-full
                bg-white/90
                px-4
                py-2
                text-[11px]
                font-medium
                text-[#1f1f1f]
                opacity-0
                shadow-lg
                backdrop-blur-md
                transition-all
                duration-300
                group-hover:opacity-100
                sm:block
              "
            >
              عرض المنتج
            </div>
          )}
        </div>
      </Link>

      {/* ===================================================== */}
      {/* PRODUCT INFORMATION */}
      {/* ===================================================== */}

      <div className="min-w-0 p-3 sm:p-5">

        {/* CATEGORY */}

        <p
          className="
            truncate
            text-xs
            font-medium
            tracking-wide
            text-[#a3834d]
            sm:text-sm
          "
        >
          {product.category.name}
        </p>

        {/* PRODUCT NAME */}

        <Link
          href={`/products/${product.id}`}
          className="mt-1.5 block min-w-0"
        >
          <h3
            className="
              line-clamp-1
              text-sm
              font-semibold
              leading-6
              text-[#1f1f1f]
              transition-colors
              duration-300
              group-hover:text-[#a3834d]
              sm:text-lg
              sm:leading-7
            "
          >
            {product.name}
          </h3>
        </Link>

        {/* ================================================= */}
        {/* BOTTOM */}
        {/* ================================================= */}

        <div
          className="
            mt-3
            flex
            min-w-0
            flex-col
            gap-3
            sm:mt-4
          "
        >

          {/* PRICE */}

          <div className="min-w-0">

            <div
              className="
                truncate
                text-sm
                font-bold
                leading-6
                text-[#1f1f1f]
                sm:text-lg
              "
            >
              {product.price.toLocaleString("ar-DZ")} دج
            </div>

            {hasDiscount && (
              <span
                className="
                  block
                  truncate
                  text-[11px]
                  text-black/30
                  line-through
                  sm:text-sm
                "
              >
                {product.oldPrice!.toLocaleString("ar-DZ")} دج
              </span>
            )}

          </div>

          {/* ================================================= */}
          {/* ORDER BUTTON */}
          {/* ================================================= */}

          <Link
            href={`/products/${product.id}`}
            aria-label={`اطلب الآن ${product.name}`}
            className={`
              flex
              h-10
              w-full
              shrink-0
              items-center
              justify-center
              gap-2
              rounded-xl
              px-4
              text-xs
              font-bold
              text-white
              shadow-sm
              transition-all
              duration-300
              sm:h-11
              sm:rounded-xl
              sm:px-5
              sm:text-sm
              ${
                isOutOfStock
                  ? "bg-black/40 hover:bg-black/60"
                  : "bg-[#a3834d] hover:bg-[#a3834d] hover:shadow-lg"
              }
            `}
          >
            <span className="text-base sm:text-lg">
              🛒
            </span>

            <span>
              اطلب الآن
            </span>
          </Link>

        </div>

      </div>
    </article>
  );
}
