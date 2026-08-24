"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

export default function LoginSuccessToast() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(false);
    }, 4000);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div
      dir="rtl"
      className="
        fixed
        right-5
        top-5
        z-[999999]
        w-[calc(100%-2.5rem)]
        max-w-sm
      "
    >
      <div
        className="
          flex
          items-center
          gap-2
          rounded-2xl
          border
          border-emerald-200
          bg-white
          px-4
          py-3
          shadow-[0_20px_60px_-15px_rgba(16,185,129,0.35)]
        "
      >
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-emerald-50
            text-emerald-600
          "
        >
          <CheckCircle2 size={22} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-zinc-900">
            مرحبًا بعودتك 👋
          </p>
        </div>

        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="إغلاق"
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            text-zinc-400
            transition
            hover:bg-zinc-100
            hover:text-zinc-700
          "
        >
          <X size={17} />
        </button>
      </div>
    </div>
  );
}