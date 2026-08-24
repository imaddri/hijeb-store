"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  updateCategory,
} from "@/actions/category.actions";

type Category = {
  id: string;
  name: string;
  slug: string;
  code: string;
};

type Props = {
  category: Category;
};

type FormState = {
  error?: string;
};

const initialState: FormState = {};

export default function CategoryEditForm({
  category,
}: Props) {
  const updateCategoryWithId =
    async (
      previousState: FormState,
      formData: FormData,
    ): Promise<FormState> => {
      try {
        await updateCategory(
          category.id,
          formData,
        );

        return {};
      } catch (error) {
        return {
          error:
            error instanceof Error
              ? error.message
              : "حدث خطأ أثناء تعديل التصنيف",
        };
      }
    };

  const [
    state,
    formAction,
    isPending,
  ] = useActionState(
    updateCategoryWithId,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
    >
      {/* ================= FORM HEADER ================= */}

      <div className="mb-8">
        <h2 className="text-xl font-bold text-zinc-900">
          معلومات التصنيف
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          قم بتعديل اسم التصنيف ثم احفظ التغييرات.
        </p>
      </div>

      {/* ================= ERROR ================= */}

      {state.error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </div>
      )}

      {/* ================= NAME ================= */}

      <div className="mb-6">
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-semibold text-zinc-700"
        >
          اسم التصنيف
        </label>

        <input
          id="name"
          name="name"
          type="text"
          defaultValue={category.name}
          placeholder="مثال: الحجابات"
          required
          disabled={isPending}
          className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-zinc-50"
        />
      </div>

      {/* ================= SLUG ================= */}

      <div className="mb-6">
        <label
          htmlFor="slug"
          className="mb-2 block text-sm font-semibold text-zinc-700"
        >
          Slug
        </label>

        <input
          id="slug"
          type="text"
          value={category.slug}
          readOnly
          className="h-12 w-full cursor-not-allowed rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-500 outline-none"
        />

        <p className="mt-2 text-xs text-zinc-400">
          يتم تحديث الـ Slug تلقائيًا عند تغيير اسم التصنيف.
        </p>
      </div>

      {/* ================= CODE ================= */}

      <div className="mb-8">
        <label
          htmlFor="code"
          className="mb-2 block text-sm font-semibold text-zinc-700"
        >
          رمز التصنيف
        </label>

        <input
          id="code"
          type="text"
          value={category.code}
          readOnly
          className="h-12 w-full cursor-not-allowed rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm font-semibold text-zinc-500 outline-none"
        />

        <p className="mt-2 text-xs text-zinc-400">
          رمز التصنيف ثابت ولا يتغير عند تعديل الاسم.
        </p>
      </div>

      {/* ================= ACTIONS ================= */}

      <div className="flex flex-col-reverse gap-3 border-t border-zinc-100 pt-6 sm:flex-row sm:justify-end">
        <Link
          href="/admin/categories"
          className="flex h-12 items-center justify-center rounded-xl border border-zinc-200 px-6 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
        >
          إلغاء
        </Link>

        <button
          type="submit"
          disabled={isPending}
          className="flex h-12 items-center justify-center rounded-xl bg-emerald-600 px-7 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending
            ? "جاري الحفظ..."
            : "حفظ التعديلات"}
        </button>
      </div>
    </form>
  );
}