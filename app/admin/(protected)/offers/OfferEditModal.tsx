"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useActionState } from "react";

import { useRouter } from "next/navigation";

import {
  Pencil,
  X,
  Percent,
  CalendarDays,
} from "lucide-react";

import { updateOffer } from "@/actions/offer.actions";

// ======================================================
// TYPES
// ======================================================

type Offer = {
  id: string;

  productId: string;

  discountPercent: number;

  newPrice: number;

  startDate: Date;

  endDate: Date;

  product: {
    id: string;

    name: string;

    price: number;

    oldPrice?: number | null;
  };
};

// ======================================================
// PROPS
// ======================================================

type OfferEditModalProps = {
  offer: Offer;
};

// ======================================================
// FORM STATE
// ======================================================

type OfferFormState = {
  error: string | null;

  success: boolean;
};

const initialState: OfferFormState = {
  error: null,

  success: false,
};

// ======================================================
// UPDATE ACTION
// ======================================================

async function updateOfferAction(
  _previousState: OfferFormState,

  formData: FormData,
): Promise<OfferFormState> {
  try {
    await updateOffer(formData);

    return {
      error: null,

      success: true,
    };
  } catch (error) {
    console.error(
      "❌ Update offer error:",
      error,
    );

    return {
      error:
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء تعديل العرض",

      success: false,
    };
  }
}

// ======================================================
// FORMAT DATETIME LOCAL
// ======================================================

function formatDateTimeLocal(
  date: Date,
) {
  const d = new Date(date);

  const year =
    d.getFullYear();

  const month = String(
    d.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    d.getDate(),
  ).padStart(2, "0");

  const hours = String(
    d.getHours(),
  ).padStart(2, "0");

  const minutes = String(
    d.getMinutes(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// ======================================================
// COMPONENT
// ======================================================

export default function OfferEditModal({
  offer,
}: OfferEditModalProps) {
  const router = useRouter();

  // ====================================================
  // MODAL
  // ====================================================

  const [open, setOpen] =
    useState(false);

  // ====================================================
  // FORM VALUES
  // ====================================================

  const [discount, setDiscount] =
    useState(
      String(
        offer.discountPercent,
      ),
    );

  const [startDate, setStartDate] =
    useState(
      formatDateTimeLocal(
        offer.startDate,
      ),
    );

  const [endDate, setEndDate] =
    useState(
      formatDateTimeLocal(
        offer.endDate,
      ),
    );

  // ====================================================
  // ACTION STATE
  // ====================================================

  const [
    state,
    formAction,
    isPending,
  ] = useActionState(
    updateOfferAction,
    initialState,
  );

  // ====================================================
  // IMPORTANT
  //
  // This ref prevents router.refresh()
  // from running repeatedly.
  // ====================================================

  const submissionStarted =
    useRef(false);

  // ====================================================
  // ORIGINAL PRICE
  // ====================================================

  const originalPrice =
    offer.product.oldPrice ??
    offer.product.price ??
    offer.newPrice;

  // ====================================================
  // DISCOUNT VALUE
  // ====================================================

  const discountValue =
    Number(discount);

  // ====================================================
  // NEW PRICE
  // ====================================================

  const calculatedNewPrice =
    Number.isFinite(
      discountValue,
    ) &&
    discountValue > 0 &&
    discountValue < 100
      ? Math.round(
          originalPrice *
            (1 -
              discountValue /
                100) *
            100,
        ) / 100
      : offer.newPrice;

  // ======================================================
  // WATCH SUBMISSION
  // ======================================================
  //
  // IMPORTANT:
  //
  // We do NOT simply check:
  //
  // state.success
  //
  // because it remains true after the first submission.
  //
  // Instead:
  //
  // 1. isPending === true
  //    => a new submission started
  //
  // 2. isPending === false
  //    + state.success === true
  //    => that submission finished successfully
  //
  // Then we handle it exactly once.
  // ======================================================

  useEffect(() => {
    // --------------------------------------------------
    // A NEW SUBMISSION HAS STARTED
    // --------------------------------------------------

    if (isPending) {
      submissionStarted.current =
        true;

      return;
    }

    // --------------------------------------------------
    // NOTHING TO HANDLE
    // --------------------------------------------------

    if (
      !submissionStarted.current
    ) {
      return;
    }

    // --------------------------------------------------
    // SUBMISSION FINISHED WITH ERROR
    // --------------------------------------------------

    if (!state.success) {
      submissionStarted.current =
        false;

      return;
    }

    // --------------------------------------------------
    // SUCCESS
    // --------------------------------------------------

    submissionStarted.current =
      false;

    // Close modal
    setOpen(false);

    // Refresh server data
    router.refresh();
  }, [
    isPending,
    state.success,
    router,
  ]);

  // ======================================================
  // UPDATE LOCAL VALUES WHEN OFFER CHANGES
  // ======================================================

  useEffect(() => {
    setDiscount(
      String(
        offer.discountPercent,
      ),
    );

    setStartDate(
      formatDateTimeLocal(
        offer.startDate,
      ),
    );

    setEndDate(
      formatDateTimeLocal(
        offer.endDate,
      ),
    );
  }, [
    offer.id,
    offer.discountPercent,
    offer.startDate,
    offer.endDate,
  ]);

  // ======================================================
  // OPEN MODAL
  // ======================================================

  function openModal() {
    if (isPending) {
      return;
    }

    // Reset values from current offer
    setDiscount(
      String(
        offer.discountPercent,
      ),
    );

    setStartDate(
      formatDateTimeLocal(
        offer.startDate,
      ),
    );

    setEndDate(
      formatDateTimeLocal(
        offer.endDate,
      ),
    );

    setOpen(true);
  }

  // ======================================================
  // CLOSE MODAL
  // ======================================================

  function closeModal() {
    if (isPending) {
      return;
    }

    setOpen(false);
  }

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <>
      {/* ==================================================
          EDIT BUTTON
      ================================================== */}

      <button
        type="button"
        onClick={openModal}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Pencil size={15} />

        تعديل
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
          ================================================== */}

          <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">
                  تعديل العرض
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  تعديل نسبة الخصم ومدة العرض
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={isPending}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* ==================================================
                FORM
            ================================================== */}

            <form
              action={formAction}
              className="flex min-h-0 flex-1 flex-col"
            >
              {/* ==================================================
                  SCROLLABLE CONTENT
              ================================================== */}

              <div className="min-h-0 flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* ==================================================
                      ERROR
                  ================================================== */}

                  {state.error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
                      <p className="text-sm font-medium text-red-700">
                        {state.error}
                      </p>
                    </div>
                  )}

                  {/* ==================================================
                      PRODUCT
                  ================================================== */}

                  <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
                    <p className="text-sm text-zinc-500">
                      المنتج
                    </p>

                    <p className="mt-1 text-lg font-bold text-zinc-900">
                      {
                        offer
                          .product
                          .name
                      }
                    </p>

                    <p className="mt-2 text-sm text-zinc-500">
                      السعر الأصلي:{" "}
                      <span className="font-semibold text-zinc-700">
                        {originalPrice.toLocaleString(
                          "ar-DZ",
                        )}{" "}
                        دج
                      </span>
                    </p>
                  </div>

                  {/* ==================================================
                      DISCOUNT
                  ================================================== */}

                  <div>
                    <label
                      htmlFor={`offer-discount-${offer.id}`}
                      className="mb-2 block text-sm font-semibold text-zinc-800"
                    >
                      نسبة الخصم
                    </label>

                    <div className="relative">
                      <input
                        id={`offer-discount-${offer.id}`}
                        name="discountPercent"
                        type="number"
                        min="1"
                        max="99"
                        step="1"
                        required
                        value={
                          discount
                        }
                        onChange={(
                          event,
                        ) =>
                          setDiscount(
                            event
                              .target
                              .value,
                          )
                        }
                        className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 pl-12 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                      />

                      <Percent
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                      />
                    </div>
                  </div>

                  {/* ==================================================
                      NEW PRICE
                  ================================================== */}

                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-emerald-700">
                          السعر الجديد
                        </p>

                        <p className="mt-1 text-2xl font-bold text-emerald-700">
                          {calculatedNewPrice.toLocaleString(
                            "ar-DZ",
                          )}{" "}
                          دج
                        </p>
                      </div>

                      {discountValue >
                        0 &&
                        discountValue <
                          100 && (
                          <div className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-orange-600 shadow-sm">
                            خصم{" "}
                            {
                              discountValue
                            }
                            %
                          </div>
                        )}
                    </div>
                  </div>

                  {/* ==================================================
                      DATES
                  ================================================== */}

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* START */}

                    <div>
                      <label
                        htmlFor={`offer-start-${offer.id}`}
                        className="mb-2 block text-sm font-semibold text-zinc-800"
                      >
                        تاريخ البداية
                      </label>

                      <div className="relative">
                        <input
                          id={`offer-start-${offer.id}`}
                          name="startDate"
                          type="datetime-local"
                          required
                          value={
                            startDate
                          }
                          onChange={(
                            event,
                          ) =>
                            setStartDate(
                              event
                                .target
                                .value,
                            )
                          }
                          className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 pl-12 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                        />

                        <CalendarDays
                          size={18}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                        />
                      </div>
                    </div>

                    {/* END */}

                    <div>
                      <label
                        htmlFor={`offer-end-${offer.id}`}
                        className="mb-2 block text-sm font-semibold text-zinc-800"
                      >
                        تاريخ النهاية
                      </label>

                      <div className="relative">
                        <input
                          id={`offer-end-${offer.id}`}
                          name="endDate"
                          type="datetime-local"
                          required
                          value={
                            endDate
                          }
                          onChange={(
                            event,
                          ) =>
                            setEndDate(
                              event
                                .target
                                .value,
                            )
                          }
                          className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 pl-12 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                        />

                        <CalendarDays
                          size={18}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ==================================================
                      HIDDEN ID
                  ================================================== */}

                  <input
                    type="hidden"
                    name="id"
                    value={offer.id}
                  />

                  <input
                    type="hidden"
                    name="productId"
                    value={
                      offer.productId
                    }
                  />
                </div>
              </div>

              {/* ==================================================
                  ACTIONS
              ================================================== */}

              <div className="shrink-0 border-t border-zinc-100 bg-white px-6 py-4">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  {/* CANCEL */}

                  <button
                    type="button"
                    onClick={
                      closeModal
                    }
                    disabled={
                      isPending
                    }
                    className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-200 px-6 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    إلغاء
                  </button>

                  {/* SAVE */}

                  <button
                    type="submit"
                    disabled={
                      isPending
                    }
                    className="inline-flex h-12 items-center justify-center rounded-xl bg-emerald-600 px-7 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPending
                      ? "جاري الحفظ..."
                      : "حفظ التعديل"}
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