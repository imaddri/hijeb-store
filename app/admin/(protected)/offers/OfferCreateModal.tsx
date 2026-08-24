"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  X,
  Percent,
  CalendarDays,
} from "lucide-react";

import { createOffer } from "@/actions/offer.actions";

// ======================================================
// TYPES
// ======================================================

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
};

type OfferCreateModalProps = {
  products: Product[];
};

type OfferFormState = {
  error: string | null;
  success: boolean;
};

// ======================================================
// INITIAL STATE
// ======================================================

const initialState: OfferFormState = {
  error: null,
  success: false,
};

// ======================================================
// SERVER ACTION WRAPPER
// ======================================================

async function createOfferAction(
  _previousState: OfferFormState,
  formData: FormData,
): Promise<OfferFormState> {
  try {
    await createOffer(formData);

    return {
      error: null,
      success: true,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء إنشاء العرض",
      success: false,
    };
  }
}

// ======================================================
// COMPONENT
// ======================================================

export default function OfferCreateModal({
  products,
}: OfferCreateModalProps) {
  const router = useRouter();

  // ====================================================
  // MODAL STATE
  // ====================================================

  const [open, setOpen] = useState(false);

  // ====================================================
  // FORM STATE
  // ====================================================

  const [selectedProductId, setSelectedProductId] =
    useState("");

  const [discount, setDiscount] = useState("");

  const [state, formAction, isPending] =
    useActionState(
      createOfferAction,
      initialState,
    );

  // ====================================================
  // SELECTED PRODUCT
  // ====================================================

  const selectedProduct = products.find(
    (product) =>
      product.id === selectedProductId,
  );

  // ====================================================
  // CALCULATE DISCOUNT
  // ====================================================

  const discountValue = Number(discount);

  // ====================================================
  // CALCULATE NEW PRICE
  // ====================================================

  const newPrice =
    selectedProduct &&
    discountValue > 0 &&
    discountValue < 100
      ? Math.round(
          selectedProduct.price *
            (1 - discountValue / 100) *
            100,
        ) / 100
      : selectedProduct?.price ?? 0;

  // ====================================================
  // REDIRECT AFTER SUCCESS
  // ====================================================

  useEffect(() => {
    if (!state.success) {
      return;
    }

    setOpen(false);

    setSelectedProductId("");

    setDiscount("");

    router.push("/admin/offers");

    router.refresh();
  }, [state.success, router]);

  // ====================================================
  // CLOSE MODAL
  // ====================================================

  function closeModal() {
    if (isPending) {
      return;
    }

    setOpen(false);

    setSelectedProductId("");

    setDiscount("");
  }

  // ====================================================
  // OPEN MODAL
  // ====================================================

  function openModal() {
    if (isPending) {
      return;
    }

    setOpen(true);
  }

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <>
      {/* ==================================================
          OPEN BUTTON
      ================================================== */}

      <button
        type="button"
        onClick={openModal}
        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700"
      >
        <Plus size={18} />

        إضافة عرض جديد
      </button>

      {/* ==================================================
          MODAL
      ================================================== */}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          {/* ==================================================
              MODAL CONTAINER

              max-h-[90vh]
              يمنع النافذة من الخروج عن الشاشة
          ================================================== */}

          <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">
                  إضافة عرض جديد
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  اختر منتجًا وحدد الخصم ومدة العرض.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={isPending}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* ==================================================
                FORM

                flex-1 + min-h-0
                يسمح للجزء الداخلي بالتمرير
            ================================================== */}

            <form
              action={formAction}
              className="flex min-h-0 flex-1 flex-col"
            >
              {/* ==================================================
                  SCROLLABLE CONTENT

                  هذا الجزء فقط هو الذي يتحرك
              ================================================== */}

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                <div className="space-y-6">
                  {/* ==================================================
                      ERROR
                  ================================================== */}

                  {state.error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
                      <p className="text-sm font-medium leading-6 text-red-700">
                        {state.error}
                      </p>
                    </div>
                  )}

                  {/* ==================================================
                      PRODUCT
                  ================================================== */}

                  <div>
                    <label
                      htmlFor="offer-product"
                      className="mb-2 block text-sm font-semibold text-zinc-800"
                    >
                      المنتج
                    </label>

                    <select
                      id="offer-product"
                      name="productId"
                      required
                      value={selectedProductId}
                      onChange={(event) =>
                        setSelectedProductId(
                          event.target.value,
                        )
                      }
                      disabled={isPending}
                      className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-zinc-50"
                    >
                      <option value="">
                        اختر المنتج
                      </option>

                      {products.map(
                        (product) => (
                          <option
                            key={product.id}
                            value={product.id}
                          >
                            {product.name} —{" "}
                            {product.price.toLocaleString(
                              "ar-DZ",
                            )}{" "}
                            دج
                          </option>
                        ),
                      )}
                    </select>

                    {products.length === 0 && (
                      <p className="mt-2 text-xs text-red-500">
                        لا توجد منتجات نشطة متاحة لإضافة عرض.
                      </p>
                    )}
                  </div>

                  {/* ==================================================
                      CURRENT PRICE
                  ================================================== */}

                  {selectedProduct && (
                    <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
                      <p className="text-sm text-zinc-500">
                        السعر الحالي
                      </p>

                      <p className="mt-1 text-2xl font-bold text-zinc-900">
                        {selectedProduct.price.toLocaleString(
                          "ar-DZ",
                        )}{" "}
                        دج
                      </p>
                    </div>
                  )}

                  {/* ==================================================
                      DISCOUNT
                  ================================================== */}

                  <div>
                    <label
                      htmlFor="offer-discount"
                      className="mb-2 block text-sm font-semibold text-zinc-800"
                    >
                      نسبة الخصم
                    </label>

                    <div className="relative">
                      <input
                        id="offer-discount"
                        name="discountPercent"
                        type="number"
                        min="1"
                        max="99"
                        step="1"
                        required
                        value={discount}
                        onChange={(event) =>
                          setDiscount(
                            event.target.value,
                          )
                        }
                        disabled={isPending}
                        placeholder="مثال: 20"
                        className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 pl-12 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-zinc-50"
                      />

                      <Percent
                        size={18}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                      />
                    </div>
                  </div>

                  {/* ==================================================
                      NEW PRICE
                  ================================================== */}

                  {selectedProduct && (
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm text-emerald-700">
                            السعر الجديد
                          </p>

                          <p className="mt-1 text-2xl font-bold text-emerald-700">
                            {newPrice.toLocaleString(
                              "ar-DZ",
                            )}{" "}
                            دج
                          </p>
                        </div>

                        {discountValue > 0 &&
                          discountValue < 100 && (
                            <div className="shrink-0 rounded-xl bg-white px-4 py-2 text-sm font-bold text-orange-600 shadow-sm">
                              خصم {discountValue}%
                            </div>
                          )}
                      </div>
                    </div>
                  )}

                  {/* ==================================================
                      DATES
                  ================================================== */}

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* ==================================================
                        START DATE
                    ================================================== */}

                    <div>
                      <label
                        htmlFor="offer-start-date"
                        className="mb-2 block text-sm font-semibold text-zinc-800"
                      >
                        تاريخ البداية
                      </label>

                      <div className="relative">
                        <input
                          id="offer-start-date"
                          name="startDate"
                          type="datetime-local"
                          required
                          disabled={isPending}
                          className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-zinc-50"
                        />

                        <CalendarDays
                          size={18}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                        />
                      </div>
                    </div>

                    {/* ==================================================
                        END DATE
                    ================================================== */}

                    <div>
                      <label
                        htmlFor="offer-end-date"
                        className="mb-2 block text-sm font-semibold text-zinc-800"
                      >
                        تاريخ النهاية
                      </label>

                      <div className="relative">
                        <input
                          id="offer-end-date"
                          name="endDate"
                          type="datetime-local"
                          required
                          disabled={isPending}
                          className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-zinc-50"
                        />

                        <CalendarDays
                          size={18}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ==================================================
                  ACTIONS

                  ثابتة في الأسفل ولا تختفي عند زيادة المحتوى
              ================================================== */}

              <div className="shrink-0 border-t border-zinc-100 bg-white px-6 py-5">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isPending}
                    className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-200 px-6 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    disabled={
                      isPending ||
                      products.length === 0 ||
                      !selectedProductId
                    }
                    className="inline-flex h-12 items-center justify-center rounded-xl bg-emerald-600 px-7 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPending
                      ? "جاري الحفظ..."
                      : "إضافة العرض"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}