
"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus, X } from "lucide-react";

import { createCategory } from "@/actions/category.actions";

// ======================================================
// FORM STATE
// ======================================================

type CategoryFormState = {
  error: string | null;
  success: boolean;
};

// ======================================================
// INITIAL STATE
// ======================================================

const initialState: CategoryFormState = {
  error: null,
  success: false,
};

// ======================================================
// SERVER ACTION WRAPPER
// ======================================================

async function createCategoryAction(
  _previousState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  try {
    await createCategory(formData);

    return {
      error: null,
      success: true,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء إنشاء التصنيف",
      success: false,
    };
  }
}

// ======================================================
// COMPONENT
// ======================================================

export default function CategoryCreateModal() {
  const [open, setOpen] = useState(false);

  const [state, formAction, isPending] = useActionState(
    createCategoryAction,
    initialState,
  );

  // ======================================================
  // CLOSE MODAL AFTER EVERY SUCCESSFUL SUBMISSION
  // ======================================================
  //
  // مهم جدًا:
  // نراقب state كاملًا وليس state.success فقط.
  //
  // لأن state.success يبقى true بعد أول عملية ناجحة،
  // وفي العملية الثانية يصبح true مرة أخرى:
  //
  // true → true
  //
  // لذلك [state] يضمن تشغيل useEffect بعد كل نتيجة جديدة
  // من useActionState.
  //
  // ======================================================

  useEffect(() => {
    if (state.success) {
      setOpen(false);
    }
  }, [state]);

  // ======================================================
  // OPEN MODAL
  // ======================================================

  function handleOpen() {
    setOpen(true);
  }

  // ======================================================
  // CLOSE MODAL
  // ======================================================

  function handleClose() {
    if (!isPending) {
      setOpen(false);
    }
  }

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <>
      {/* ==================================================
          ADD CATEGORY BUTTON
      ================================================== */}

      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700"
      >
        <Plus size={18} />

        إضافة تصنيف
      </button>

      {/* ==================================================
          MODAL
      ================================================== */}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleClose();
            }
          }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">
                  إضافة تصنيف
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  أضف تصنيفًا جديدًا إلى المتجر.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
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
              className="p-6"
            >
              {/* ==================================================
                  ERROR
              ================================================== */}

              {state.error && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
                  <p className="text-sm font-medium text-red-700">
                    {state.error}
                  </p>
                </div>
              )}

              {/* ==================================================
                  NAME
              ================================================== */}

              <div>
                <label
                  htmlFor="category-name"
                  className="mb-2 block text-sm font-semibold text-zinc-800"
                >
                  اسم التصنيف
                </label>

                <input
                  id="category-name"
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  placeholder="مثال: الحجابات"
                  autoFocus
                  disabled={isPending}
                  className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 disabled:bg-zinc-50"
                />

                <p className="mt-2 text-xs text-zinc-400">
                  أدخل الاسم الذي سيظهر للعملاء داخل المتجر.
                </p>
              </div>

              {/* ==================================================
                  INFO
              ================================================== */}

              <div className="mt-5 rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
                <p className="text-sm font-semibold text-zinc-800">
                  معلومات التصنيف
                </p>

                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  سيتم إنشاء الرابط التعريفي{" "}
                  <span className="font-medium text-zinc-700">
                    Slug
                  </span>{" "}
                  ورمز التصنيف{" "}
                  <span className="font-medium text-zinc-700">
                    Code
                  </span>{" "}
                  تلقائيًا.
                </p>
              </div>

              {/* ==================================================
                  ACTIONS
              ================================================== */}

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-zinc-100 pt-6 sm:flex-row sm:justify-end">
                {/* CANCEL */}

                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isPending}
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-200 px-6 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  إلغاء
                </button>

                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-emerald-600 px-7 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending
                    ? "جاري الحفظ..."
                    : "إضافة التصنيف"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
