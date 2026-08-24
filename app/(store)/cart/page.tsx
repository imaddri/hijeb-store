"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import { useCart } from "@/context/CartContext";

export default function CartPage() {

  const {
    cart,
    cartCount,
    cartTotal,
    removeFromCart,
    updateQuantity,
  } = useCart();

  const [mounted, setMounted] =
    useState(false);

  // ==========================================================
  // MOUNT
  // ==========================================================

  useEffect(() => {
    setMounted(true);
  }, []);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (!mounted) {

    return (
      <main className="min-h-screen bg-[#faf9f7]">

        <section className="mx-auto max-w-7xl px-6 pb-20 pt-4 sm:pt-8">

          <div
            className="-mt-2 mb-6"
            dir="rtl"
          >

            <p className="text-xs font-medium tracking-[0.3em] text-[#a3834d]">
              YOUR SHOPPING BAG
            </p>

            <h2 className="mt-3 text-4xl font-semibold tracking-tight">
              سلة التسوق
            </h2>

          </div>

        </section>

      </main>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <main className="min-h-screen bg-[#faf9f7]">

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-4 sm:pt-8">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div
          className="mb-10 flex items-end justify-between gap-6"
          dir="rtl"
        >

          <div>

            <p className="text-xs font-medium tracking-[0.3em] text-[#a3834d]">
              YOUR SHOPPING BAG
            </p>

            <h2 className="mt-3 text-4xl font-semibold tracking-tight">
              سلة التسوق
            </h2>

            <p className="mt-3 text-sm text-black/45">
              لديك {cartCount} منتج في سلتك
            </p>

          </div>

          {/* BACK */}

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

        {/* ================================================== */}
        {/* EMPTY */}
        {/* ================================================== */}

        {cart.length === 0 ? (

          <div
            className="
              rounded-[2rem]
              border
              border-black/5
              bg-white
              px-6
              py-20
              text-center
            "
          >

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f8f5ef] text-3xl">
              🛍
            </div>

            <h3 className="mt-6 text-2xl font-semibold">
              السلة فارغة
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-black/45">
              لم تقم بإضافة أي منتجات إلى سلتك بعد.
              اكتشف مجموعتنا واختر ما يناسبك.
            </p>

            <Link
              href="/"
              className="
                mt-8
                inline-flex
                rounded-2xl
                bg-[#1f1f1f]
                px-8
                py-4
                text-sm
                font-medium
                text-white
                transition
                hover:bg-[#a3834d]
              "
            >
              اكتشف المنتجات
            </Link>

          </div>

        ) : (

          /* ================================================== */
          /* CART */
          /* ================================================== */

          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

            {/* ================================================= */}
            {/* PRODUCTS */}
            {/* ================================================= */}

            <div className="space-y-4">

              {cart.map((item) => (

                <div
                  key={`${item.id}-${item.variantId ?? item.color}-${item.size}`}
                  className="
                    rounded-[2rem]
                    border
                    border-black/5
                    bg-white
                    p-5
                  "
                >

                  <div className="flex gap-5">

                    {/* IMAGE */}

                    <div
                      className="
                        h-32
                        w-28
                        shrink-0
                        overflow-hidden
                        rounded-2xl
                        bg-[#e8dfd2]
                      "
                    >

                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />

                    </div>

                    {/* INFORMATION */}

                    <div className="flex min-w-0 flex-1 flex-col">

                      <div
                        className="flex items-start justify-between gap-4"
                        dir="rtl"
                      >

                        <div>

                          {item.color && (
                            <p className="text-xs text-[#a3834d]">
                              اللون: {item.color}
                            </p>
                          )}

                          <h3 className="mt-1 text-lg font-semibold">
                            {item.name}
                          </h3>

                          {item.size && (
                            <p className="mt-2 text-sm text-black/45">
                              المقاس: {item.size}
                            </p>
                          )}

                        </div>

                        <p className="shrink-0 font-semibold">
                          {item.price.toLocaleString(
                            "ar-DZ"
                          )}{" "}
                          دج
                        </p>

                      </div>

                      {/* BOTTOM */}

                      <div className="mt-auto flex items-center justify-between gap-4 pt-5">

                        {/* QUANTITY */}

                        <div
                          className="
                            flex
                            h-10
                            items-center
                            overflow-hidden
                            rounded-xl
                            border
                            border-black/10
                          "
                        >

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.color,
                                item.size,
                                item.quantity - 1
                              )
                            }
                            disabled={
                              item.quantity <= 1
                            }
                            className="
                              flex
                              h-full
                              w-10
                              items-center
                              justify-center
                              transition
                              hover:bg-black/5
                              disabled:cursor-not-allowed
                              disabled:opacity-30
                            "
                          >
                            −
                          </button>

                          <span
                            className="
                              flex
                              h-full
                              w-10
                              items-center
                              justify-center
                              border-x
                              border-black/10
                              text-sm
                              font-semibold
                            "
                          >
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.color,
                                item.size,
                                item.quantity + 1
                              )
                            }
                            className="
                              flex
                              h-full
                              w-10
                              items-center
                              justify-center
                              transition
                              hover:bg-black/5
                            "
                          >
                            +
                          </button>

                        </div>

                        {/* REMOVE */}

                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(
                              item.id,
                              item.color,
                              item.size
                            )
                          }
                          className="
                            rounded-xl
                            border
                            border-red-200
                            bg-red-50
                            px-4
                            py-2.5
                            text-sm
                            font-semibold
                            text-red-600
                            transition
                            hover:border-red-300
                            hover:bg-red-600
                            hover:text-white
                          "
                        >
                          حذف المنتج
                        </button>

                      </div>

                    </div>

                  </div>

                </div>

              ))}

            </div>

            {/* ================================================= */}
            {/* SUMMARY */}
            {/* ================================================= */}

            <aside
              className="
                h-fit
                rounded-[2rem]
                border
                border-black/5
                bg-white
                p-7
              "
              dir="rtl"
            >

              <h3 className="text-xl font-semibold">
                ملخص الطلب
              </h3>

              <div className="my-6 h-px bg-black/10" />

              {/* COUNT */}

              <div className="flex items-center justify-between text-sm">

                <span className="text-black/50">
                  عدد المنتجات
                </span>

                <span className="font-medium">
                  {cartCount}
                </span>

              </div>

              {/* SHIPPING */}

              <div className="mt-4 flex items-center justify-between text-sm">

                <span className="text-black/50">
                  الشحن
                </span>

                <span className="font-medium">
                  يُحسب لاحقًا
                </span>

              </div>

              <div className="my-6 h-px bg-black/10" />

              {/* TOTAL */}

              <div className="flex items-center justify-between">

                <span className="text-sm text-black/50">
                  الإجمالي
                </span>

                <span className="text-2xl font-bold text-[#a3834d]">
                  {cartTotal.toLocaleString(
                    "ar-DZ"
                  )}{" "}
                  دج
                </span>

              </div>

              {/* CHECKOUT */}

              <Link
                href="/order"
                className="
                  mt-6
                  flex
                  w-full
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#1f1f1f]
                  px-6
                  py-4
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-[#a3834d]
                "
              >
                متابعة الطلب
              </Link>

              {/* CONTINUE SHOPPING */}

              <Link
                href="/"
                className="
                  mt-4
                  block
                  text-center
                  text-sm
                  text-black/45
                  transition
                  hover:text-[#a3834d]
                "
              >
                متابعة التسوق
              </Link>

            </aside>

          </div>
        )}

      </section>

    </main>
  );
}