"use client";

import {
  RefreshCw,
  AlertTriangle,
  Home,
} from "lucide-react";

import Link from "next/link";

export default function ErrorPage({
  reset,
}: {
  error: Error & {
    digest?: string;
  };

  reset: () => void;
}) {
  return (
    <main
      dir="rtl"
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-[#faf9f6]
        px-5
      "
    >
      <div
        className="
          w-full
          max-w-md
          rounded-3xl
          border
          border-black/5
          bg-white
          p-8
          text-center
          shadow-xl
        "
      >
        {/* ICON */}

        <div
          className="
            mx-auto
            flex
            h-20
            w-20
            items-center
            justify-center
            rounded-3xl
            bg-[#1f1f1f]
            text-[#d4b574]
          "
        >
          <AlertTriangle
            size={36}
            strokeWidth={1.8}
          />
        </div>

        {/* TITLE */}

        <h1
          className="
            mt-6
            text-2xl
            font-bold
            text-[#1f1f1f]
          "
        >
          حدث خطأ غير متوقع
        </h1>

        {/* DESCRIPTION */}

        <p
          className="
            mt-3
            text-sm
            leading-7
            text-gray-500
          "
        >
          نعتذر، حدثت مشكلة أثناء
          تحميل هذه الصفحة.
          <br />
          حاول مرة أخرى أو عد إلى
          الصفحة الرئيسية.
        </p>

        {/* ACTIONS */}

        <div
          className="
            mt-7
            grid
            gap-3
            sm:grid-cols-2
          "
        >
          {/* RETRY */}

          <button
            type="button"
            onClick={() =>
              reset()
            }
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-[#1f1f1f]
              px-5
              py-3.5
              text-sm
              font-bold
              text-white
              transition
              hover:bg-[#a3834d]
            "
          >
            <RefreshCw
              size={18}
            />

            حاول مرة أخرى
          </button>

          {/* HOME */}

          <Link
            href="/"
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-black/10
              bg-white
              px-5
              py-3.5
              text-sm
              font-bold
              text-[#1f1f1f]
              transition
              hover:border-[#a3834d]
              hover:text-[#a3834d]
            "
          >
            <Home
              size={18}
            />

            الصفحة الرئيسية
          </Link>
        </div>

        {/* SUPPORT MESSAGE */}

        <div
          className="
            mt-5
            rounded-xl
            bg-[#faf9f6]
            px-4
            py-3
            text-xs
            leading-6
            text-gray-500
          "
        >
          إذا استمرت المشكلة،
          تحقق من اتصال الإنترنت
          وحاول مرة أخرى.
        </div>
      </div>
    </main>
  );
}