"use client";

import {
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

export default function GlobalError({
  reset,
}: {
  error: Error & {
    digest?: string;
  };

  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className="
          m-0
          min-h-screen
          bg-[#faf9f6]
        "
      >
        <main
          className="
            flex
            min-h-screen
            items-center
            justify-center
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
              تعذر تحميل المتجر
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
              حدثت مشكلة مؤقتة أثناء
              الاتصال بالمتجر.
              <br />
              تحقق من اتصالك بالإنترنت
              ثم حاول مرة أخرى.
            </p>

            {/* RETRY */}

            <button
              type="button"
              onClick={() =>
                reset()
              }
              className="
                mt-7
                flex
                w-full
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

              إعادة المحاولة
            </button>

            {/* INFO */}

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
              إذا كان الاتصال بالإنترنت
              منقطعًا، ستحتاج إلى
              استعادته أولًا.
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}