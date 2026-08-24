"use client";

import { useState } from "react";
import { deleteProduct } from "@/actions/product.actions";

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
}

export default function DeleteProductButton({
  productId,
  productName,
}: DeleteProductButtonProps) {
  const [isDeleting, setIsDeleting] =
    useState(false);

  async function handleDelete() {
    const confirmed =
      window.confirm(
        `هل أنت متأكد من حذف المنتج "${productName}"؟\n\nلا يمكن التراجع عن هذا الإجراء.`,
      );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const formData = new FormData();

      formData.append(
        "id",
        productId,
      );

      await deleteProduct(formData);
    } catch (error) {
      console.error(
        "❌ Delete product error:",
        error,
      );

      setIsDeleting(false);

      alert(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء حذف المنتج",
      );
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isDeleting
        ? "جاري الحذف..."
        : "حذف"}
    </button>
  );
}