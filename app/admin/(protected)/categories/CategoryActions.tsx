"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteCategory } from "@/actions/category.actions";

type Props = {
  categoryId: string;
  categoryName: string;
  productsCount: number;
};

export default function CategoryActions({
  categoryId,
  categoryName,
  productsCount,
}: Props) {
  const [isDeleting, setIsDeleting] =
    useState(false);

  async function handleDelete() {
    if (productsCount > 0) {
      window.alert(
        `لا يمكن حذف التصنيف "${categoryName}" لأنه مرتبط بـ ${productsCount} منتج.`,
      );

      return;
    }

    const confirmed = window.confirm(
      `هل أنت متأكد من حذف التصنيف "${categoryName}"؟\n\nلا يمكن التراجع عن هذا الإجراء.`,
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const formData = new FormData();

      formData.append("id", categoryId);

      await deleteCategory(formData);
    } catch (error) {
      console.error(
        "❌ Delete category error:",
        error,
      );

      window.alert(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء حذف التصنيف",
      );

      setIsDeleting(false);
    }
  }

  return (
    <div className="flex gap-2">

      {/* EDIT */}

      <Link
        href={`/admin/categories/edit/${categoryId}`}
        className="rounded-lg border border-zinc-200 px-3 py-2 text-sm transition hover:bg-zinc-100"
      >
        تعديل
      </Link>

      {/* DELETE */}

      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isDeleting
          ? "جاري الحذف..."
          : "حذف"}
      </button>

    </div>
  );
}