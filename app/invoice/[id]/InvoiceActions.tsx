"use client";

import Link from "next/link";
import {
  ArrowRight,
  Download,
  Printer,
} from "lucide-react";

type Props = {
  orderNumber: string | number;
};

export default function InvoiceActions({
  orderNumber,
}: Props) {
  function handlePrint() {
    window.print();
  }

  return (
    <div className="mx-auto mb-6 flex max-w-4xl flex-wrap items-center justify-between gap-3 print:hidden">
      {/* BACK */}

      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50"
      >
        <ArrowRight size={18} />

        العودة إلى الطلبات
      </Link>

      {/* ACTIONS */}

      <div className="flex flex-wrap gap-2">
        {/* PRINT / PDF */}

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-zinc-800"
        >
          <Download size={18} />

          تحميل PDF
        </button>

        {/* PRINT */}

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-xl bg-[#a3834d] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#8f713f]"
        >
          <Printer size={18} />

          طباعة
        </button>

        {/* NUMBER */}

        <div className="hidden items-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-500 shadow-sm sm:flex">
          ORD-{orderNumber}
        </div>
      </div>
    </div>
  );
}