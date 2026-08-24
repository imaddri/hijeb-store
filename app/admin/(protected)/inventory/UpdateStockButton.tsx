"use client";

import { useState } from "react";
import { Pencil, X } from "lucide-react";

type UpdateStockButtonProps = {
  productId: string;
  productName: string;
  currentStock: number;
};

export default function UpdateStockButton({
  productId,
  productName,
  currentStock,
}: UpdateStockButtonProps) {
  const [open, setOpen] = useState(false);

  const [stock, setStock] = useState(
    String(currentStock),
  );

  function handleOpen() {
    setStock(String(currentStock));
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    // سنربط هذا الزر بقاعدة البيانات
    // في الخطوة التالية.
  }

  return (
    <>
      {/* ================================================= */}
      {/* BUTTON */}
      {/* ================================================= */}

      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700"
      >
        <Pencil size={15} />

        تعديل الكمية
      </button>

      {/* ================================================= */}
      {/* MODAL */}
      {/* ================================================= */}

      {open && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">

            {/* HEADER */}

            <div className="flex items-start justify-between gap-4">

              <div>

                <h3 className="text-xl font-bold text-zinc-900">
                  تعديل المخزون
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  {productName}
                </p>

              </div>

              <button
                type="button"
                onClick={handleClose}
                className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >

              <div>

                <label
                  htmlFor={`stock-${productId}`}
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  الكمية الجديدة
                </label>

                <input
                  id={`stock-${productId}`}
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(event) =>
                    setStock(event.target.value)
                  }
                  className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-lg font-semibold text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                />

              </div>

              {/* BUTTONS */}

              <div className="flex gap-3">

                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  حفظ الكمية
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </>
  );
}