"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  WifiOff,
  Wifi,
  RefreshCw,
  X,
} from "lucide-react";

export default function NetworkStatus() {
  const [isOffline, setIsOffline] =
    useState(false);

  const [showBackOnline, setShowBackOnline] =
    useState(false);

  useEffect(() => {
    function handleOffline() {
      setIsOffline(true);
      setShowBackOnline(false);
    }

    function handleOnline() {
      setIsOffline(false);
      setShowBackOnline(true);

      const timer = setTimeout(() => {
        setShowBackOnline(false);
      }, 3000);

      return () => clearTimeout(timer);
    }

    // الحالة الأولية
    if (!navigator.onLine) {
      setIsOffline(true);
    }

    window.addEventListener(
      "offline",
      handleOffline
    );

    window.addEventListener(
      "online",
      handleOnline
    );

    return () => {
      window.removeEventListener(
        "offline",
        handleOffline
      );

      window.removeEventListener(
        "online",
        handleOnline
      );
    };
  }, []);

  // ======================================================
  // OFFLINE
  // ======================================================

  if (isOffline) {
    return (
      <div
        dir="rtl"
        className="
          fixed
          inset-0
          z-[9999]
          flex
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
            <WifiOff
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
            الاتصال غير متوفر
          </h1>

          {/* DESCRIPTION */}

          <p
            className="
              mx-auto
              mt-3
              max-w-sm
              text-sm
              leading-7
              text-gray-500
            "
          >
            يبدو أن جهازك غير متصل
            بالإنترنت حاليًا.
            <br />
            تحقق من اتصالك بالإنترنت
            وحاول مرة أخرى.
          </p>

          {/* RETRY */}

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="
              mt-7
              inline-flex
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
            ستعود الصفحة للعمل
            تلقائيًا بعد استعادة
            الاتصال.
          </div>
        </div>
      </div>
    );
  }

  // ======================================================
  // BACK ONLINE
  // ======================================================

  if (showBackOnline) {
    return (
      <div
        dir="rtl"
        className="
          fixed
          bottom-5
          left-1/2
          z-[9999]
          flex
          w-[calc(100%-2rem)]
          max-w-md
          -translate-x-1/2
          items-center
          gap-3
          rounded-2xl
          border
          border-green-100
          bg-white
          px-4
          py-3
          shadow-xl
        "
      >
        {/* ICON */}

        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-green-50
            text-green-600
          "
        >
          <Wifi
            size={20}
          />
        </div>

        {/* TEXT */}

        <div className="flex-1">
          <p
            className="
              text-sm
              font-bold
              text-[#1f1f1f]
            "
          >
            عاد الاتصال بالإنترنت
          </p>

          <p
            className="
              mt-0.5
              text-xs
              text-gray-500
            "
          >
            يمكنك متابعة استخدام
            المتجر الآن.
          </p>
        </div>

        {/* CLOSE */}

        <button
          type="button"
          aria-label="إغلاق"
          onClick={() =>
            setShowBackOnline(false)
          }
          className="
            rounded-lg
            p-2
            text-gray-400
            transition
            hover:bg-gray-100
            hover:text-[#1f1f1f]
          "
        >
          <X
            size={16}
          />
        </button>
      </div>
    );
  }

  return null;
}