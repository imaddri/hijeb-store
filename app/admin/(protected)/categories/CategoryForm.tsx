"use client";

import { useActionState } from "react";
import { createCategory } from "@/actions/category.actions";

type CategoryFormState = {
  error: string | null;
  success: boolean;
};

const initialState: CategoryFormState = {
  error: null,
  success: false,
};

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

type CategoryFormProps = {
  onClose: () => void;
};

export default function CategoryForm({
  onClose,
}: CategoryFormProps) {
  const [state, formAction, isPending] =
    useActionState(
      createCategoryAction,
      initialState,
    );

  return (
    <form action={formAction} className="space-y-6">
      {/* ============================================ */}
      {/* ERROR */}
      {/* ============================================ */}

      {state.error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-700">
            {state.error}
          </p>
        </div>
      )}

      {/* ============================================ */}
      {/* NAME */}
      {/* ============================================ */}

      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-semibold text-zinc-800"
        >
          اسم التصنيف
        </label>

        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          placeholder="مثال: الحجابات"
          autoFocus
          className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
        />

        <p className="mt-2 text-xs text-zinc-400">
          أدخل الاسم الذي سيظهر للعملاء داخل المتجر.
        </p>
      </div>

      {/* ============================================ */}
      {/* AUTO GENERATED INFO */}
      {/* ============================================ */}

      <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
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

      {/* ============================================ */}
      {/* ACTIONS */}
      {/* ============================================ */}

      <div className="flex flex-col-reverse gap-3 border-t border-zinc-100 pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-200 px-6 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          إلغاء
        </button>

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
  );
}