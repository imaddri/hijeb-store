
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

type ProductVariant = {
  id: string;
  sizeType: "NONE" | "LETTER" | "NUMBER";
  size: string | null;
  color: string | null;
  stock: number;
};

type ProductActionsProps = {
  fallbackStock?: number;

  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };

  variants: ProductVariant[];
};

export default function ProductActions({
  fallbackStock = 0,
  product,
  variants,
}: ProductActionsProps) {
  const {
    addToCart,
    buyNow,
  } = useCart();

  const router = useRouter();

  // ==========================================================
  // COLOR MAP
  // ==========================================================

  const colorMap: Record<string, string> = {
    "أسود": "#171717",
    "أبيض": "#ffffff",
    "بيج": "#d8c6ac",
    "بني": "#8a6f58",
    "رمادي": "#8b8b8b",
    "رمادي فاتح": "#c7c7c7",
    "رمادي غامق": "#4a4a4a",
    "كحلي": "#1f2a44",
    "أزرق": "#3b82f6",
    "أزرق فاتح": "#93c5fd",
    "أزرق غامق": "#1e3a8a",
    "أخضر": "#4f6f52",
    "أخضر فاتح": "#9caf88",
    "أخضر غامق": "#29432f",
    "أحمر": "#a83d3d",
    "وردي": "#d98ca3",
    "زهري": "#e6a6b8",
    "بنفسجي": "#76558f",
    "موف": "#9a789b",
    "برتقالي": "#d9822b",
    "أصفر": "#e5c85c",
    "ذهبي": "#b08a45",
    "فضي": "#c0c0c0",
    "بيج فاتح": "#eadfce",
    "بني فاتح": "#b89b7a",
    "بني غامق": "#5a4030",
  };

  function getColorValue(color: string) {
    return colorMap[color] ?? "#d6d3d1";
  }

  // ==========================================================
  // COLORS
  // ==========================================================

  const colors = useMemo(() => {
    return Array.from(
      new Set(
        variants
          .map((variant) => variant.color)
          .filter(
            (color): color is string =>
              Boolean(color)
          )
      )
    );
  }, [variants]);

  const [selectedColor, setSelectedColor] =
    useState<string | null>(
      colors[0] ?? null
    );

  // ==========================================================
  // SIZES
  // ==========================================================

  const availableSizes = useMemo(() => {
    return Array.from(
      new Set(
        variants
          .filter((variant) => {
            if (!selectedColor) {
              return true;
            }

            return variant.color === selectedColor;
          })
          .filter(
            (variant) => variant.size !== null
          )
          .map((variant) => variant.size!)
      )
    );
  }, [variants, selectedColor]);

  const [selectedSize, setSelectedSize] =
    useState<string | null>(
      availableSizes[0] ?? null
    );

  // ==========================================================
  // SIZE GUIDE
  // ==========================================================

  const [showSizeGuide, setShowSizeGuide] =
    useState(false);

  const sizeGuideRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        sizeGuideRef.current &&
        !sizeGuideRef.current.contains(
          event.target as Node
        )
      ) {
        setShowSizeGuide(false);
      }
    }

    if (showSizeGuide) {
      document.addEventListener(
        "mousedown",
        handleClickOutside
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [showSizeGuide]);

  // ==========================================================
  // STATE
  // ==========================================================

  const [quantity, setQuantity] =
    useState(1);

  const [added, setAdded] =
    useState(false);

  const [favorite, setFavorite] =
    useState(false);

  const [selectionKey, setSelectionKey] =
    useState(0);

  // ==========================================================
  // BUY NOW LOCK
  // ==========================================================

  const buyNowLockedRef =
    useRef(false);

  const [buyingNow, setBuyingNow] =
    useState(false);

  // ==========================================================
  // SELECTED VARIANT
  // ==========================================================

  const selectedVariant = useMemo(() => {
    if (variants.length === 0) {
      return null;
    }

    return (
      variants.find((variant) => {
        const colorMatches =
          selectedColor === null ||
          variant.color === selectedColor;

        const sizeMatches =
          selectedSize === null ||
          variant.size === selectedSize;

        return (
          colorMatches &&
          sizeMatches
        );
      }) ?? null
    );
  }, [
    variants,
    selectedColor,
    selectedSize,
  ]);

  // ==========================================================
  // STOCK
  // ==========================================================

  const currentStock =
    selectedVariant?.stock ??
    (variants.length === 0
      ? fallbackStock
      : 0);

  const isInStock =
    currentStock > 0;

  // ==========================================================
  // LOW STOCK
  // ==========================================================
  // عندما يصبح المخزون 2 أو 1:
  // يتحول تنبيه المخزون إلى اللون الأحمر
  // مع وميض أحمر لتنبيه الزبونة.
  //
  // إذا كان المخزون 0:
  // يبقى أيضًا باللون الأحمر ولكن بحالة "غير متوفر".
  // ==========================================================

  const isLowStock =
    currentStock > 0 &&
    currentStock <= 2;

  // ==========================================================
  // SELECTION ANIMATION
  // ==========================================================

  function triggerSelectionAnimation() {
    setSelectionKey(
      (current) => current + 1
    );
  }

  // ==========================================================
  // COLOR CHANGE
  // ==========================================================

  function handleColorChange(
    color: string
  ) {
    setSelectedColor(color);

    const firstAvailableSize =
      variants.find(
        (variant) =>
          variant.color === color &&
          variant.stock > 0 &&
          variant.size !== null
      )?.size ?? null;

    setSelectedSize(
      firstAvailableSize
    );

    setQuantity(1);

    triggerSelectionAnimation();
  }

  // ==========================================================
  // SIZE CHANGE
  // ==========================================================

  function handleSizeChange(
    size: string
  ) {
    setSelectedSize(size);
    setQuantity(1);

    triggerSelectionAnimation();
  }

  // ==========================================================
  // ADD TO CART
  // ==========================================================

  function handleAddToCart() {
    if (currentStock <= 0) {
      return;
    }

    if (
      variants.length > 0 &&
      !selectedVariant
    ) {
      return;
    }

    const safeQuantity = Math.min(
      quantity,
      currentStock
    );

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      color: selectedColor ?? "",
      size: selectedSize ?? "",
      variantId:
        selectedVariant?.id ?? null,
      quantity: safeQuantity,
    });

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 2200);
  }

  // ==========================================================
  // BUY NOW
  // ==========================================================

  function handleBuyNow() {
    // --------------------------------------------------------
    // منع الضغط المتكرر
    // --------------------------------------------------------

    if (buyNowLockedRef.current) {
      return;
    }

    // --------------------------------------------------------
    // التأكد من المخزون
    // --------------------------------------------------------

    if (currentStock <= 0) {
      return;
    }

    // --------------------------------------------------------
    // التأكد من وجود Variant صحيح
    // --------------------------------------------------------

    if (
      variants.length > 0 &&
      !selectedVariant
    ) {
      return;
    }

    // --------------------------------------------------------
    // قفل الزر مباشرة
    // --------------------------------------------------------

    buyNowLockedRef.current = true;

    setBuyingNow(true);

    // --------------------------------------------------------
    // تحديد الكمية الآمنة
    // --------------------------------------------------------

    const safeQuantity = Math.min(
      Math.max(quantity, 1),
      currentStock
    );

    // --------------------------------------------------------
    // المنتج الذي سيتم طلبه
    // --------------------------------------------------------

    const item = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      color: selectedColor ?? "",
      size: selectedSize ?? "",
      variantId:
        selectedVariant?.id ?? null,
      quantity: safeQuantity,
    };

    // --------------------------------------------------------
    // BUY NOW
    // --------------------------------------------------------

    buyNow(item);

    // --------------------------------------------------------
    // الانتقال إلى صفحة الطلب
    // --------------------------------------------------------

    router.push("/order");
  }

  const hasVariants =
    variants.length > 0;

  return (
    <div>

      {/* ================================================== */}
      {/* COLOR CARD */}
      {/* ================================================== */}

      {hasVariants &&
        colors.length > 0 && (
          <section
            className="
              mt-8
              overflow-hidden
              rounded-3xl
              border
              border-black/[0.06]
              bg-white
              p-5
              shadow-[0_12px_35px_rgba(0,0,0,0.045)]
              sm:p-6
            "
          >

            <div className="flex items-end justify-between gap-4">

              <div>

                <h3 className="text-[18px] font-bold tracking-[-0.025em] text-[#171717] sm:text-[20px]">
                  اللون
                </h3>

                {selectedColor && (
                  <div className="mt-2 flex items-center gap-2">

                    <span
                      className="
                        h-2.5
                        w-2.5
                        rounded-full
                        bg-[#a3834d]
                        shadow-[0_0_8px_rgba(163,131,77,0.5)]
                      "
                    />

                    <span className="text-[13px] font-medium text-black/50 sm:text-[14px]">
                      {selectedColor}
                    </span>

                  </div>
                )}

              </div>

              <span className="rounded-full bg-[#f7f4ee] px-3 py-1.5 text-[11px] font-semibold text-black/40">
                {colors.length} ألوان
              </span>

            </div>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-6">

              {colors.map((color) => {

                const isSelected =
                  selectedColor === color;

                const hasStock =
                  variants.some(
                    (variant) =>
                      variant.color === color &&
                      variant.stock > 0
                  );

                const colorValue =
                  getColorValue(color);

                const isWhite =
                  colorValue.toLowerCase() ===
                  "#ffffff";

                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() =>
                      handleColorChange(color)
                    }
                    disabled={!hasStock}
                    aria-label={`اختيار اللون ${color}`}
                    title={color}
                    className={`
                      group
                      relative
                      flex
                      flex-col
                      items-center
                      gap-2.5
                      transition-all
                      duration-300
                      ${
                        !hasStock
                          ? "cursor-not-allowed opacity-30"
                          : "cursor-pointer"
                      }
                    `}
                  >

                    <span
                      className={`
                        relative
                        flex
                        h-[70px]
                        w-[70px]
                        items-center
                        justify-center
                        rounded-full
                        transition-all
                        duration-300
                        ${
                          isSelected
                            ? "scale-110"
                            : "group-hover:scale-105"
                        }
                      `}
                    >

                      {isSelected &&
                        hasStock && (
                          <>

                            <span
                              className="
                                absolute
                                inset-[-5px]
                                rounded-full
                                border-2
                                border-[#a3834d]
                              "
                            />

                            <span
                              className="
                                absolute
                                inset-[-9px]
                                rounded-full
                                border
                                border-[#a3834d]/25
                                animate-ping
                              "
                            />

                          </>
                        )}

                      <span
                        className={`
                          relative
                          h-[52px]
                          w-[52px]
                          overflow-hidden
                          rounded-full
                          border
                          shadow-[0_5px_18px_rgba(0,0,0,0.14)]
                          transition-all
                          duration-300
                          ${
                            isWhite
                              ? "border-black/15"
                              : "border-black/5"
                          }
                        `}
                        style={{
                          backgroundColor:
                            colorValue,
                        }}
                      >

                        {hasStock && (
                          <span
                            className="
                              absolute
                              -left-10
                              top-[-20%]
                              h-[140%]
                              w-7
                              rotate-[25deg]
                              bg-white/35
                              blur-[3px]
                              transition-all
                              duration-700
                              group-hover:left-[120%]
                            "
                          />
                        )}

                        {isSelected &&
                          hasStock && (
                            <span
                              className={`
                                absolute
                                inset-0
                                flex
                                items-center
                                justify-center
                                ${
                                  isWhite
                                    ? "text-black/70"
                                    : "text-white"
                                }
                              `}
                            >
                              <span className="text-[17px] font-black drop-shadow-[0_1px_5px_rgba(0,0,0,0.65)]">
                                ✓
                              </span>
                            </span>
                          )}

                        {!hasStock && (
                          <>

                            <span className="absolute left-1/2 top-1/2 h-[2px] w-[58px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-black/45" />

                            <span className="absolute left-1/2 top-1/2 h-[2px] w-[58px] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-black/20" />

                          </>
                        )}

                      </span>

                    </span>

                    <span
                      className={`
                        text-[12px]
                        font-medium
                        transition-all
                        duration-300
                        ${
                          isSelected
                            ? "font-bold text-[#171717]"
                            : "text-black/50 group-hover:text-black/85"
                        }
                      `}
                    >
                      {color}
                    </span>

                  </button>
                );
              })}

            </div>

          </section>
        )}

      {/* ================================================== */}
      {/* SIZE */}
      {/* ================================================== */}

      {hasVariants &&
        availableSizes.length > 0 && (
          <section className="mt-10">

            <div className="flex items-center justify-between gap-4">

              <div>

                <h3 className="text-[18px] font-bold tracking-[-0.025em] text-[#171717] sm:text-[20px]">
                  المقاس
                </h3>

                {selectedSize && (
                  <p className="mt-2 text-[13px] text-black/45 sm:text-[14px]">
                    المقاس المحدد:{" "}
                    <span className="font-bold text-[#a3834d]">
                      {selectedSize}
                    </span>
                  </p>
                )}

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowSizeGuide(
                    (current) => !current
                  )
                }
                className="
                  group
                  flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-black/10
                  bg-[#faf9f6]
                  px-4
                  py-2.5
                  text-[12px]
                  font-bold
                  text-[#303030]
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:border-[#a3834d]/40
                  hover:bg-[#a3834d]
                  hover:text-white
                  hover:shadow-lg
                  sm:text-[13px]
                "
              >
                اعرفي قياسك

                <span
                  className={`
                    text-[9px]
                    transition-transform
                    duration-300
                    ${
                      showSizeGuide
                        ? "rotate-180"
                        : ""
                    }
                  `}
                >
                  ▼
                </span>

              </button>

            </div>

            {/* SIZE GUIDE */}

            {showSizeGuide && (
              <div
                ref={sizeGuideRef}
                className="
                  mt-5
                  overflow-hidden
                  rounded-2xl
                  border
                  border-black/10
                  bg-[#faf8f4]
                  shadow-[0_15px_45px_rgba(0,0,0,0.08)]
                "
              >

                <div className="border-b border-black/5 px-5 py-4">

                  <p className="text-[15px] font-bold text-[#1c1c1c]">
                    اعرفي قياسك
                  </p>

                  <p className="mt-1 text-[12px] leading-5 text-black/45">
                    اختاري المقاس الأقرب إلى طولك
                  </p>

                </div>

                <table
                  className="w-full table-fixed text-[12px] sm:text-[13px]"
                  dir="rtl"
                >

                  <thead>

                    <tr className="border-b border-black/10">

                      <th className="px-3 py-4 text-center font-bold">
                        الطول
                      </th>

                      <th className="px-3 py-4 text-center font-bold">
                        مقاس العباية
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    <tr className="border-b border-black/5 transition-colors hover:bg-white">

                      <td className="px-3 py-4 text-center text-black/60">
                        158 – 160 سم
                      </td>

                      <td className="px-3 py-4 text-center font-bold text-[#a3834d]">
                        54
                      </td>

                    </tr>

                    <tr className="border-b border-black/5 transition-colors hover:bg-white">

                      <td className="px-3 py-4 text-center text-black/60">
                        161 – 164 سم
                      </td>

                      <td className="px-3 py-4 text-center font-bold text-[#a3834d]">
                        56
                      </td>

                    </tr>

                    <tr className="border-b border-black/5 transition-colors hover:bg-white">

                      <td className="px-3 py-4 text-center text-black/60">
                        165 – 168 سم
                      </td>

                      <td className="px-3 py-4 text-center font-bold text-[#a3834d]">
                        58
                      </td>

                    </tr>

                    <tr className="transition-colors hover:bg-white">

                      <td className="px-3 py-4 text-center text-black/60">
                        169 – 175 سم
                      </td>

                      <td className="px-3 py-4 text-center font-bold text-[#a3834d]">
                        60
                      </td>

                    </tr>

                  </tbody>

                </table>

              </div>
            )}

            {/* SIZE OPTIONS */}

            <div
              key={selectionKey}
              className="mt-6 flex flex-wrap gap-3"
            >

              {availableSizes.map(
                (size) => {

                  const isSelected =
                    selectedSize === size;

                  const sizeHasStock =
                    variants.some(
                      (variant) =>
                        variant.color ===
                          selectedColor &&
                        variant.size ===
                          size &&
                        variant.stock > 0
                    );

                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() =>
                        handleSizeChange(size)
                      }
                      disabled={
                        !sizeHasStock
                      }
                      className={`
                        relative
                        flex
                        h-[54px]
                        min-w-[64px]
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-xl
                        border
                        px-5
                        text-[14px]
                        font-bold
                        transition-all
                        duration-300
                        ${
                          isSelected &&
                          sizeHasStock
                            ? "scale-[1.04] border-[#1d1d1d] bg-[#1d1d1d] text-white shadow-[0_10px_25px_rgba(0,0,0,0.16)]"
                            : "border-black/10 bg-white text-[#252525] hover:-translate-y-1 hover:border-black/25 hover:shadow-lg"
                        }
                        ${
                          !sizeHasStock
                            ? "cursor-not-allowed opacity-25 line-through"
                            : "cursor-pointer"
                        }
                      `}
                    >

                      {isSelected &&
                        sizeHasStock && (
                          <span className="absolute inset-0 bg-white/5" />
                        )}

                      <span className="relative z-10">
                        {size}
                      </span>

                    </button>
                  );
                }
              )}

            </div>

          </section>
        )}

      {/* ================================================== */}
      {/* STOCK */}
      {/* ================================================== */}

      <section
        className="mt-10"
        dir="rtl"
      >

        <div
          className={`
            relative
            overflow-hidden
            rounded-2xl
            border
            px-5
            py-5
            transition-all
            duration-500
            ${
              isInStock && !isLowStock
                ? "border-green-400/40 bg-green-50"
                : "border-red-400/40 bg-red-50"
            }
          `}
        >

          {isInStock && !isLowStock && (
            <>

              <span className="pointer-events-none absolute -right-10 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-green-400/25 blur-3xl animate-pulse" />

              <span className="pointer-events-none absolute -right-2 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-green-400/25 blur-2xl animate-ping" />

              <span className="pointer-events-none absolute -left-24 top-0 h-full w-20 rotate-[18deg] bg-white/60 blur-md transition-all duration-1000 group-hover:left-[120%]" />

              <span className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-green-400/10 animate-pulse" />

            </>
          )}

          {isLowStock && (
            <>

              <span className="pointer-events-none absolute -right-10 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-red-400/25 blur-3xl animate-pulse" />

              <span className="pointer-events-none absolute -right-2 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-red-400/25 blur-2xl animate-ping" />

              <span className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-red-400/15 animate-pulse" />

            </>
          )}

          <div className="relative flex items-center gap-5">

            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">

              {isInStock && !isLowStock && (
                <>

                  <span className="absolute inset-0 rounded-full bg-green-400/20 animate-ping" />

                  <span className="absolute inset-2 rounded-full bg-green-400/15 animate-pulse" />

                </>
              )}

              {isLowStock && (
                <>

                  <span className="absolute inset-0 rounded-full bg-red-400/25 animate-ping" />

                  <span className="absolute inset-2 rounded-full bg-red-400/20 animate-pulse" />

                </>
              )}

              <span
                className={`
                  relative
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-full
                  ${
                    isInStock && !isLowStock
                      ? "bg-green-500 shadow-[0_0_25px_rgba(34,197,94,0.95)]"
                      : "bg-red-500 shadow-[0_0_25px_rgba(239,68,68,0.9)]"
                  }
                `}
              >

                {isInStock && (
                  <span className="text-[13px] font-black text-white">
                    ✓
                  </span>
                )}

              </span>

            </div>

            <div className="min-w-0 flex-1">

              <div className="flex flex-wrap items-center gap-2">

                <span
                  className={`
                    text-[15px]
                    font-extrabold
                    sm:text-[17px]
                    ${
                      isInStock && !isLowStock
                        ? "text-green-700"
                        : "text-red-600"
                    }
                  `}
                >
                  {isInStock
                    ? isLowStock
                      ? "متبقي كمية قليلة"
                      : "متوفر في المخزون"
                    : "غير متوفر حاليًا"}
                </span>

                {isInStock && !isLowStock && (
                  <span className="animate-pulse rounded-full bg-green-500 px-3 py-1 text-[10px] font-bold text-white shadow-[0_4px_12px_rgba(34,197,94,0.25)]">
                    متاح الآن
                  </span>
                )}

                {isLowStock && (
                  <span className="animate-pulse rounded-full bg-red-500 px-3 py-1 text-[10px] font-bold text-white shadow-[0_4px_12px_rgba(239,68,68,0.30)]">
                    الكمية محدودة
                  </span>
                )}

              </div>

              {isInStock && (
                <p
                  className={`
                    mt-2
                    text-[12px]
                    font-medium
                    sm:text-[14px]
                    ${
                      isLowStock
                        ? "text-red-700/75"
                        : "text-green-700/70"
                    }
                  `}
                >
                  لدينا حاليًا{" "}
                  <strong
                    className={`
                      font-black
                      ${
                        isLowStock
                          ? "text-red-700"
                          : "text-green-700"
                      }
                    `}
                  >
                    {currentStock}
                  </strong>{" "}
                  قطعة متوفرة
                </p>
              )}

            </div>

          </div>

        </div>

      </section>

      {/* ================================================== */}
      {/* QUANTITY */}
      {/* ================================================== */}

      {currentStock > 0 && (
        <section
          className="mt-9"
          dir="rtl"
        >

          <div className="flex items-center justify-between gap-5">

            <div>

              <h3 className="text-[18px] font-bold text-[#171717] sm:text-[20px]">
                الكمية
              </h3>

              <p className="mt-1.5 text-[12px] text-black/40 sm:text-[13px]">
                حددي الكمية المطلوبة
              </p>

            </div>

            <div className="flex h-[56px] items-center overflow-hidden rounded-xl border border-black/10 bg-white shadow-[0_6px_20px_rgba(0,0,0,0.06)]">

              <button
                type="button"
                onClick={() =>
                  setQuantity(
                    (current) =>
                      Math.max(
                        1,
                        current - 1
                      )
                  )
                }
                disabled={quantity <= 1}
                className="flex h-full w-14 items-center justify-center text-[23px] transition-all duration-200 hover:bg-black/5 hover:text-[#a3834d] disabled:cursor-not-allowed disabled:opacity-20"
              >
                −
              </button>

              <div className="flex h-full w-14 items-center justify-center border-x border-black/10 text-[15px] font-black">
                {quantity}
              </div>

              <button
                type="button"
                onClick={() =>
                  setQuantity(
                    (current) =>
                      Math.min(
                        currentStock,
                        current + 1
                      )
                  )
                }
                disabled={
                  quantity >= currentStock
                }
                className="flex h-full w-14 items-center justify-center text-[23px] transition-all duration-200 hover:bg-black/5 hover:text-[#a3834d] disabled:cursor-not-allowed disabled:opacity-20"
              >
                +
              </button>

            </div>

          </div>

        </section>
      )}

      {/* ================================================== */}
      {/* SELECTED INFO */}
      {/* ================================================== */}

      <section
        className="
          mt-8
          rounded-2xl
          border
          border-black/[0.06]
          bg-[#faf9f7]
          px-5
          py-5
          shadow-[0_8px_25px_rgba(0,0,0,0.025)]
        "
        dir="rtl"
      >

        <div className="flex items-center justify-between">

          <p className="text-[12px] font-bold text-black/40 sm:text-[13px]">
            اختيارك الحالي
          </p>

          <span className="text-[10px] font-medium text-black/25 sm:text-[11px]">
            محدث الآن
          </span>

        </div>

        <div className="mt-4 flex flex-wrap gap-x-7 gap-y-3">

          {selectedColor && (
            <span className="text-[13px] text-black/60 sm:text-[14px]">
              اللون:
              <strong className="mr-2 font-black text-[#a3834d]">
                {selectedColor}
              </strong>
            </span>
          )}

          {selectedSize && (
            <span className="text-[13px] text-black/60 sm:text-[14px]">
              المقاس:
              <strong className="mr-2 font-black text-[#a3834d]">
                {selectedSize}
              </strong>
            </span>
          )}

          {currentStock > 0 && (
            <span className="text-[13px] text-black/60 sm:text-[14px]">
              الكمية:
              <strong className="mr-2 font-black text-[#a3834d]">
                {quantity}
              </strong>
            </span>
          )}

        </div>

      </section>

      {/* ================================================== */}
      {/* ACTIONS */}
      {/* ================================================== */}

      <section
        className="mt-7"
        dir="rtl"
      >

        <div className="flex gap-3">

          {/* ================================================= */}
          {/* BUY NOW */}
          {/* ================================================= */}

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={
              currentStock <= 0 ||
              buyingNow
            }
            className={`
              group
              relative
              flex
              h-[62px]
              flex-1
              items-center
              justify-center
              overflow-hidden
              rounded-xl
              px-4
              text-[13px]
              font-extrabold
              text-white
              transition-all
              duration-300
              sm:px-6
              sm:text-[16px]
              ${
                currentStock > 0 &&
                !buyingNow
                  ? "bg-[#a3834d] shadow-[0_12px_30px_rgba(163,131,77,0.22)] hover:-translate-y-1 hover:bg-[#8f713f] hover:shadow-[0_18px_40px_rgba(163,131,77,0.32)] active:translate-y-0"
                  : "cursor-not-allowed bg-[#a3834d]/60"
              }
            `}
          >

            {currentStock > 0 &&
              !buyingNow && (
                <>

                  <span className="pointer-events-none absolute inset-0 bg-white/0 transition-all duration-300 group-hover:bg-white/10" />

                  <span className="pointer-events-none absolute -left-16 top-[-30%] h-[160%] w-10 rotate-[22deg] bg-white/25 blur-[3px] transition-all duration-700 group-hover:left-[115%]" />

                  <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white/20" />

                </>
              )}

            <span className="relative z-10">
              {buyingNow
                ? "جارٍ تجهيز الطلب..."
                : currentStock > 0
                  ? "اطلب الآن"
                  : "غير متوفر"}
            </span>

          </button>

          {/* ================================================= */}
          {/* ADD TO CART */}
          {/* ================================================= */}

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={currentStock <= 0}
            className={`
              group
              relative
              flex
              h-[62px]
              flex-1
              items-center
              justify-center
              overflow-hidden
              rounded-xl
              px-4
              text-[13px]
              font-extrabold
              text-white
              transition-all
              duration-300
              sm:px-6
              sm:text-[16px]
              ${
                added
                  ? "bg-green-600 shadow-[0_14px_35px_rgba(22,163,74,0.25)]"
                  : currentStock > 0
                    ? "bg-[#1b1b1b] shadow-[0_12px_30px_rgba(0,0,0,0.14)] hover:-translate-y-1 hover:bg-[#a3834d] hover:shadow-[0_18px_40px_rgba(163,131,77,0.30)] active:translate-y-0"
                    : "cursor-not-allowed bg-black/20"
              }
            `}
          >

            {currentStock > 0 &&
              !added && (
                <>

                  <span className="pointer-events-none absolute inset-0 bg-white/0 transition-all duration-300 group-hover:bg-white/10" />

                  <span className="pointer-events-none absolute -left-16 top-[-30%] h-[160%] w-10 rotate-[22deg] bg-white/25 blur-[3px] transition-all duration-700 group-hover:left-[115%]" />

                  <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white/10" />

                </>
              )}

            <span className="relative z-10">
              {added
                ? "✓ تمت الإضافة إلى السلة"
                : currentStock > 0
                  ? "إضافة إلى السلة"
                  : "غير متوفر"}
            </span>

          </button>

          {/* ================================================= */}
          {/* FAVORITE */}
          {/* ================================================= */}

          <button
            type="button"
            aria-label="إضافة إلى المفضلة"
            aria-pressed={favorite}
            onClick={() =>
              setFavorite(
                (current) => !current
              )
            }
            className={`
              group
              relative
              flex
              h-[62px]
              w-[62px]
              shrink-0
              items-center
              justify-center
              overflow-hidden
              rounded-xl
              border
              transition-all
              duration-300
              ${
                favorite
                  ? "border-[#a3834d] bg-[#a3834d] text-white shadow-[0_14px_30px_rgba(163,131,77,0.28)]"
                  : "border-black/10 bg-white text-[#1d1d1d] hover:-translate-y-1 hover:border-[#a3834d] hover:text-[#a3834d] hover:shadow-lg"
              }
            `}
          >

            {favorite && (
              <span className="absolute inset-0 animate-ping rounded-xl bg-[#a3834d]/20" />
            )}

            <span
              className={`
                relative
                text-[28px]
                leading-none
                transition-all
                duration-300
                ${
                  favorite
                    ? "scale-110"
                    : "group-hover:scale-110"
                }
              `}
            >
              {favorite
                ? "♥"
                : "♡"}
            </span>

          </button>

        </div>

      </section>

      {/* ================================================== */}
      {/* TRUST CARD */}
      {/* ================================================== */}

      <section
        className="
          mt-7
          grid
          grid-cols-3
          gap-2
          rounded-2xl
          border
          border-black/[0.06]
          bg-white
          p-3
          shadow-[0_10px_30px_rgba(0,0,0,0.045)]
        "
        dir="rtl"
      >

        {/* AVAILABLE */}

        <div
          className="
            group
            rounded-xl
            px-2
            py-4
            text-center
            transition-all
            duration-300
            hover:-translate-y-1
            hover:bg-[#faf8f3]
          "
        >

          <div
            className="
              mx-auto
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              bg-[#f5f1ea]
              text-[15px]
              font-black
              text-[#6d5936]
              transition-all
              duration-300
              group-hover:bg-[#a3834d]
              group-hover:text-white
              group-hover:shadow-[0_8px_20px_rgba(163,131,77,0.25)]
            "
          >
            ✓
          </div>

          <p
            className="
              mt-2.5
              text-[11px]
              font-bold
              text-black/55
              sm:text-[12px]
            "
          >
            متوفر
          </p>

          <span className="mt-1 block text-[9px] text-black/30 sm:text-[10px]">
            مخزون مؤكد
          </span>

        </div>

        {/* FAST DELIVERY */}

        <div
          className="
            group
            rounded-xl
            px-2
            py-4
            text-center
            transition-all
            duration-300
            hover:-translate-y-1
            hover:bg-[#faf8f3]
          "
        >

          <div
            className="
              mx-auto
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              bg-[#f5f1ea]
              text-[15px]
              transition-all
              duration-300
              group-hover:bg-[#a3834d]
              group-hover:text-white
              group-hover:shadow-[0_8px_20px_rgba(163,131,77,0.25)]
            "
          >
            🚚
          </div>

          <p
            className="
              mt-2.5
              text-[11px]
              font-bold
              text-black/55
              sm:text-[12px]
            "
          >
            توصيل سريع
          </p>

          <span className="mt-1 block text-[9px] text-black/30 sm:text-[10px]">
            إلى باب منزلك
          </span>

        </div>

        {/* SECURE */}

        <div
          className="
            group
            rounded-xl
            px-2
            py-4
            text-center
            transition-all
            duration-300
            hover:-translate-y-1
            hover:bg-[#faf8f3]
          "
        >

          <div
            className="
              mx-auto
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              bg-[#f5f1ea]
              text-[15px]
              transition-all
              duration-300
              group-hover:bg-[#a3834d]
              group-hover:text-white
              group-hover:shadow-[0_8px_20px_rgba(163,131,77,0.25)]
            "
          >
            🔒
          </div>

          <p
            className="
              mt-2.5
              text-[11px]
              font-bold
              text-black/55
              sm:text-[12px]
            "
          >
            شراء آمن
          </p>

          <span className="mt-1 block text-[9px] text-black/30 sm:text-[10px]">
            تجربة موثوقة
          </span>

        </div>

      </section>

    </div>
  );
}
