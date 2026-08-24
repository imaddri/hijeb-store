"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { deleteOffer } from "@/actions/offer.actions";

type DeleteOfferButtonProps = {
  offerId: string;
};

export default function DeleteOfferButton({
  offerId,
}: DeleteOfferButtonProps) {
  const [isDeleting, setIsDeleting] =
    useState(false);

  async function handleDelete() {
    const confirmed =
      window.confirm(
        "هل أنت متأكد من حذف هذا العرض؟\n\nسيتم أيضًا إعادة المنتج إلى سعره قبل العرض.",
      );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const formData = new FormData();

      formData.append(
        "id",
        offerId,
      );

      await deleteOffer(formData);
    } catch (error) {
      console.error(
        "Delete offer error:",
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء حذف العرض",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Trash2 size={15} />

      {isDeleting
        ? "جاري الحذف..."
        : "حذف"}
    </button>
  );
}