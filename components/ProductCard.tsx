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
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-700
              ease-out
              group-hover:scale-[1.045]
            "
          />

          {/* IMAGE OVERLAY */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-t
              from-black/[0.18]
              via-transparent
              to-black/[0.03]
              opacity-70
            "
          />

          {/* DISCOUNT / BADGE */}

          {hasDiscount && discountPercent ? (
            <span
              className="
                absolute
                left-2
                top-2
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

          {/* FAVORITE BUTTON */}

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

          {/* QUICK VIEW HINT */}

          <div
            className="
              pointer-events-none
              absolute
              bottom-4
              left-1/2
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
            items-end
            justify-between
            gap-2
            sm:mt-4
            sm:gap-3
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

          {/* DETAILS BUTTON */}

          <Link
            href={`/products/${product.id}`}
            aria-label={`عرض ${product.name}`}
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[#1f1f1f]
              text-base
              text-white
              shadow-sm
              transition-all
              duration-300
              hover:scale-105
              hover:bg-[#a3834d]
              hover:shadow-lg
              sm:h-11
              sm:w-11
              sm:text-lg
            "
          >
            →
          </Link>

        </div>

      </div>
    </article>
  );
}