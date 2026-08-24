"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  variantId: string;
  productId: string;
  currentStock: number;
}

export default function UpdateVariantStockForm({
  variantId,
  productId,
  currentStock,
}: Props) {
  const router = useRouter();

  const [stock, setStock] = useState(
    String(currentStock),
  );

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    const quantity = Number(stock);

    if (!Number.isInteger(quantity)) {
      setError("الكمية يجب أن تكون رقمًا صحيحًا.");
      return;
    }

    if (quantity < 0) {
      setError("الكمية لا يمكن أن تكون أقل من صفر.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/admin/inventory/variant",
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            variantId,
            productId,
            stock: quantity,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "حدث خطأ أثناء تحديث المخزون.",
        );
      }

      router.push(
        `/admin/inventory/${productId}`,
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "حدث خطأ غير متوقع.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
    >

      <div>

        <label
          htmlFor="stock"
          className="mb-2 block text-sm font-semibold text-zinc-700"
        >
          كمية المخزون الجديدة
        </label>

        <input
          id="stock"
          type="number"
          min="0"
          step="1"
          value={stock}
          onChange={(event) =>
            setStock(event.target.value)
          }
          disabled={loading}
          className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-lg font-semibold text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 disabled:bg-zinc-100"
        />

      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

        <button
          type="button"
          onClick={() =>
            router.push(
              `/admin/inventory/${productId}`,
            )
          }
          disabled={loading}
          className="rounded-xl border border-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          إلغاء
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "جاري الحفظ..."
            : "حفظ المخزون"}
        </button>

      </div>

    </form>
  );
}