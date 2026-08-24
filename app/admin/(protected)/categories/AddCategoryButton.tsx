"use client";

import {
  useState,
} from "react";

import {
  Plus,
  X,
  Loader2,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { createCategory } from "@/actions/category.actions";

export default function AddCategoryButton() {
  const router = useRouter();

  const [open, setOpen] =
    useState(false);

  const [name, setName] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  // ====================================================
  // CLOSE MODAL
  // ====================================================

  function closeModal() {
    if (isSubmitting) {
      return;
    }

    setOpen(false);
    setName("");
    setError("");
    setSuccess("");
  }

  // ====================================================
  // SUBMIT
  // ====================================================

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmedName =
      name.trim();

    if (!trimmedName) {
      setError(
        "اسم التصنيف مطلوب",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const formData =
        new FormData();

      formData.set(
        "name",
        trimmedName,
      );

      const result =
        await createCategory(
          formData,
        );

      if (!result.success) {
        setError(
          result.message,
        );

        return;
      }

      setSuccess(
        result.message,
      );

      setName("");

      // ================================================
      // REFRESH SERVER COMPONENT
      // ================================================

      router.refresh();

      // ================================================
      // CLOSE AFTER SHORT DELAY
      // ================================================

      setTimeout(() => {
        setOpen(false);
        setSuccess("");
      }, 700);
    } catch (error) {
      console.error(
        "❌ Category form error:",
        error,
      );

      setError(
        "حدث خطأ أثناء إضافة التصنيف",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {/* ==================================================
          ADD CATEGORY BUTTON
          ================================================== */}

      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setError("");
          setSuccess("");
        }}
        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
      >
        <Plus size={18} />

        إضافة تصنيف
      </button>

      {/* ==================================================
          MODAL
          ================================================== */}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div
            dir="rtl"
            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            {/* ============================================
                HEADER
                ============================================ */}

            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">
                  إضافة تصنيف جديد
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  أضف تصنيفًا جديدًا
                  إلى متجرك
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={
                  isSubmitting
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* ============================================
                FORM
                ============================================ */}

            <form
              onSubmit={handleSubmit}
              className="p-6"
            >
              {/* ==========================================
                  NAME
                  ========================================== */}

              <div>
                <label
                  htmlFor="category-name"
                  className="mb-2 block text-sm font-semibold text-zinc-800"
                >
                  اسم التصنيف
                </label>

                <input
                  id="category-name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target
                        .value,
                    )
                  }
                  placeholder="مثال: الحجابات"
                  autoFocus
                  disabled={
                    isSubmitting
                  }
                  className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 disabled:bg-zinc-50"
                />
              </div>

              {/* ==========================================
                  ERROR
                  ========================================== */}

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              {/* ==========================================
                  SUCCESS
                  ========================================== */}

              {success && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {success}
                </div>
              )}

              {/* ==========================================
                  BUTTONS
                  ========================================== */}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={
                    isSubmitting
                  }
                  className="flex-1 rounded-xl border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={
                    isSubmitting
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      جاري الإضافة...
                    </>
                  ) : (
                    <>
                      <Plus
                        size={18}
                      />

                      إضافة التصنيف
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}