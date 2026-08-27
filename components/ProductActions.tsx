"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const { addToCart } = useCart();

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

  // ==========================================================
  // GET COLOR VALUE
  // ==========================================================

  function getColorValue(color: string) {
    return colorMap[color] ?? "#d6d3d1";
  }

  // ==========================================================
  // AVAILABLE COLORS
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

  // ==========================================================
  // DEFAULT COLOR
  // ==========================================================

  const [selectedColor, setSelectedColor] =
    useState<string | null>(
      colors[0] ?? null
    );

  // ==========================================================
  // AVAILABLE SIZES
  // ==========================================================

  const availableSizes = useMemo(() => {
    return Array.from(
      new Set(
        variants
          .filter((variant) => {
            if (!selectedColor) {
              return true;
            }

            return (
              variant.color === selectedColor
            );
          })
          .filter(
            (variant) => variant.size !== null
          )
          .map((variant) => variant.size!)
      )
    );
  }, [variants, selectedColor]);

  // ==========================================================
  // DEFAULT SIZE
  // ==========================================================

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
  // QUANTITY
  // ==========================================================

  const [quantity, setQuantity] =
    useState(1);

  const [added, setAdded] =
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
  // CURRENT STOCK
  // ==========================================================

  const currentStock =
    selectedVariant?.stock ??
    (variants.length === 0
      ? fallbackStock
      : 0);

  // ==========================================================
  // COLOR SELECT
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
  }

  // ==========================================================
  // SIZE SELECT
  // ==========================================================

  function handleSizeChange(
    size: string
  ) {
    setSelectedSize(size);
    setQuantity(1);
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
    }, 2000);
  }

  // ==========================================================
  // NO VARIANTS
  // ==========================================================

  const hasVariants =
    variants.length > 0;

  return (
    <div>

      {/* ==================================================== */}
      {/* COLOR */}
      {/* ==================================================== */}

      {hasVariants &&
        colors.length > 0 && (
          <div
            className="mt-6"
            dir="rtl"
          >

            {/* COLOR HEADER */}

            <div className="flex items-center gap-3">

              <h3 className="text-base font-semibold text-[#1f1f1f]">
                اللون
              </h3>

              {selectedColor && (
                <span className="text-base font-semibold text-[#a3834d]">
                  {selectedColor}
                </span>
              )}

            </div>

            {/* COLOR OPTIONS */}

            <div className="mt-5 flex flex-wrap justify-end gap-5">

              {colors.map((color) => {

                const isSelected =
                  selectedColor === color;

                const hasStock =
                  variants.some(
                    (variant) =>
                      variant.color ===
                        color &&
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
                      handleColorChange(
                        color
                      )
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
                      gap-2
                      transition-all
                      duration-200
                      ${
                        !hasStock
                          ? "cursor-not-allowed opacity-35"
                          : "cursor-pointer"
                      }
                    `}
                  >

                    {/* OUTER RING */}

                    <span
                      className={`
  flex
  h-14
  w-14
  items-center
  justify-center
  rounded-full
  transition-all
  duration-200
  ${
    isSelected
      ? "scale-110"
      : "group-hover:scale-105"
  }
`}
                    >

                      {/* ACTUAL COLOR */}

                      <span
                        className={`
                          relative
                          h-11
                          w-11
                          rounded-full
                          border
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

                        {/* CHECK */}

                        {isSelected &&
                          hasStock && (
                            <span
                              className={`
                                absolute
                                inset-0
                                flex
                                items-center
                                justify-center
                                rounded-full
                                ${
                                  isWhite
                                    ? "text-black/70"
                                    : "text-white"
                                }
                              `}
                            >
                              <span className="text-sm font-bold drop-shadow">
                                ✓
                              </span>
                            </span>
                          )}

                        {/* OUT OF STOCK */}

                        {!hasStock && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="absolute h-px w-12 rotate-45 bg-black/50" />
                          </span>
                        )}

                      </span>

                    </span>

                    {/* COLOR NAME */}

                    <span
                      className={`
                        max-w-20
                        text-center
                        text-xs
                        transition
                        ${
                          isSelected
                            ? "font-semibold text-[#1f1f1f]"
                            : "text-black/55 group-hover:text-black/80"
                        }
                      `}
                    >
                      {color}
                    </span>

                  </button>
                );
              })}

            </div>

          </div>
        )}

      {/* ==================================================== */}
      {/* SIZE */}
      {/* ==================================================== */}

      {hasVariants &&
        availableSizes.length > 0 && (
          <div
            className="mt-7"
            dir="rtl"
          >

            <div
              className="flex items-center justify-between"
            >

              <h3 className="text-base font-semibold text-[#1f1f1f]">
                المقاس
              </h3>

              <button
                type="button"
                onClick={() =>
                  setShowSizeGuide(
                    (current) => !current
                  )
                }
                className="shrink-0 rounded-xl border border-[#a3834d]/30 bg-[#f8f5ef] px-4 py-2.5 text-sm font-medium text-[#8b7350] transition hover:border-[#a3834d] hover:bg-[#a3834d] hover:text-white"
              >
                اعرفي قياسك
                <span>▼</span>
              </button>

            </div>

            {/* ==================================================== */}
            {/* SIZE GUIDE */}
            {/* ==================================================== */}

            {showSizeGuide && (
              <div
                ref={sizeGuideRef}
                className="mt-4 w-full max-w-full overflow-hidden rounded-2xl border border-[#a3834d]/20 bg-[#f8f4ed]"
              >

                <div className="border-b border-[#a3834d]/15 px-4 py-3">

                  <p className="text-sm font-semibold text-[#1f1f1f]">
                    اعرفي قياسك
                  </p>

                  <p className="mt-1 text-xs text-black/50">
                    اختاري المقاس الأقرب إلى طولك
                  </p>

                </div>

                <div className="w-full overflow-x-auto">

                  <table
                    className="w-full min-w-0 table-fixed text-sm"
                    dir="rtl"
                  >

                    <thead>

                      <tr className="border-b border-black/10 text-[#1f1f1f]">

                        <th className="w-1/3 px-2 py-3 text-center font-semibold sm:px-4">
                          الطول
                        </th>

                        <th className="w-1/3 px-2 py-3 text-center font-semibold sm:px-4">
                          مقاس العباية
                        </th>


                      </tr>

                    </thead>

                    <tbody>

                      

                      

                      <tr className="border-b border-black/5">

                        <td className="px-2 py-3 text-center text-black/65 sm:px-4">
                          158 – 160 سم
                        </td>

                        <td className="px-2 py-3 text-center font-semibold text-[#a3834d] sm:px-4">
                          54
                        </td>

                        

                      </tr>

                      <tr className="border-b border-black/5">

                        <td className="px-2 py-3 text-center text-black/65 sm:px-4">
                          161 – 164 سم
                        </td>

                        <td className="px-2 py-3 text-center font-semibold text-[#a3834d] sm:px-4">
                          56
                        </td>

                        

                      </tr>

                      <tr className="border-b border-black/5">

                        <td className="px-2 py-3 text-center text-black/65 sm:px-4">
                          165 – 168 سم
                        </td>

                        <td className="px-2 py-3 text-center font-semibold text-[#a3834d] sm:px-4">
                          58
                        </td>

                        

                      </tr>

                      <tr className="border-b border-black/5">

                        <td className="px-2 py-3 text-center text-black/65 sm:px-4">
                          169 – 175 سم
                        </td>

                        <td className="px-2 py-3 text-center font-semibold text-[#a3834d] sm:px-4">
                          60
                        </td>

                        
                      </tr>

                      

                      
                    </tbody>

                  </table>

                </div>

              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-3">

              {availableSizes.map(
                (size) => {

                  const isSelected =
                    selectedSize ===
                    size;

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
                        handleSizeChange(
                          size
                        )
                      }
                      disabled={
                        !sizeHasStock
                      }
                      className={`
                        flex
                        h-11
                        min-w-12
                        items-center
                        justify-center
                        rounded-xl
                        px-4
                        text-sm
                        font-medium
                        transition-all
                        ${
                          isSelected
                            ? "bg-[#1f1f1f] text-white shadow-lg"
                            : "border border-black/10 bg-white text-[#1f1f1f] hover:border-[#1f1f1f]"
                        }
                        ${
                          !sizeHasStock
                            ? "cursor-not-allowed opacity-30 line-through"
                            : ""
                        }
                      `}
                    >
                      {size}
                    </button>
                  );
                }
              )}

            </div>

          </div>
        )}

      {/* ==================================================== */}
      {/* STOCK */}
      {/* ==================================================== */}

      <div
        className="mt-7 flex items-center gap-2 text-sm"
        dir="rtl"
      >

        <span
          className={`
            h-2.5
            w-2.5
            rounded-full
            ${
              currentStock > 0
                ? "bg-green-500"
                : "bg-red-500"
            }
          `}
        />

        <span className="text-black/60">

          {currentStock > 0
            ? `متوفر في المخزون (${currentStock} قطعة)`
            : "غير متوفر حاليًا"}

        </span>

      </div>

      {/* ==================================================== */}
      {/* QUANTITY */}
      {/* ==================================================== */}

      {currentStock > 0 && (
        <div
          className="mt-7"
          dir="rtl"
        >

          <h3 className="mb-4 text-base font-semibold text-[#1f1f1f]">
            الكمية
          </h3>

          <div className="flex h-14 w-fit items-center overflow-hidden rounded-2xl border border-black/10 bg-white">

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
              className="flex h-full w-14 items-center justify-center text-xl transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30"
            >
              −
            </button>

            <div className="flex h-full w-14 items-center justify-center border-x border-black/10 text-sm font-semibold">
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
              className="flex h-full w-14 items-center justify-center text-xl transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30"
            >
              +
            </button>

          </div>

        </div>
      )}

      {/* ==================================================== */}
      {/* SELECTED INFO */}
      {/* ==================================================== */}

      <div
        className="mt-5 rounded-2xl border border-black/5 bg-white/60 p-4"
        dir="rtl"
      >

        <p className="text-sm font-medium text-black/50">
          اختيارك الحالي
        </p>

        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-base">

          {selectedColor && (
            <span>
              اللون:
              <strong className="mr-1 font-semibold text-[#a3834d]">
                {selectedColor}
              </strong>
            </span>
          )}

          {selectedSize && (
            <span>
              المقاس:
              <strong className="mr-1 font-semibold text-[#a3834d]">
                {selectedSize}
              </strong>
            </span>
          )}

          {currentStock > 0 && (
            <span>
              الكمية:
              <strong className="mr-1 font-semibold text-[#a3834d]">
                {quantity}
              </strong>
            </span>
          )}

        </div>

      </div>

      {/* ==================================================== */}
      {/* ACTIONS */}
      {/* ==================================================== */}

      <div className="mt-5 flex gap-3">

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={currentStock <= 0}
          className={`
            flex
            h-14
            flex-1
            items-center
            justify-center
            rounded-2xl
            px-6
            text-sm
            font-medium
            text-white
            transition-all
            ${
              added
                ? "bg-green-600"
                : currentStock > 0
                  ? "bg-[#1f1f1f] hover:bg-[#a3834d]"
                  : "cursor-not-allowed bg-black/20"
            }
          `}
        >
          {added
            ? "✓ تمت الإضافة إلى السلة"
            : currentStock > 0
              ? "إضافة إلى السلة"
              : "غير متوفر"}
        </button>

        <button
          type="button"
          aria-label="إضافة إلى المفضلة"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-black/10 bg-white text-xl transition hover:bg-[#1f1f1f] hover:text-white"
        >
          ♡
        </button>

      </div>

    </div>
  );
}