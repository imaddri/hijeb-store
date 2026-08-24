import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-4">

      {/* ==================== LOGO ICON ==================== */}

      <div
        className="
          flex
          h-14
          w-14
          shrink-0
          items-center
          justify-center
          overflow-hidden
          rounded-full
          bg-[#1f1f1f]
          shadow-md
        "
      >
        <Image
          src="/icons/log.svg"
          alt="BOUTIQUE MARAM"
          width={120}
          height={120}
          priority
          className="
            h-[150px]
            w-[150px]
            object-contain
          "
        />
      </div>


      {/* ==================== BRAND NAME ==================== */}

      <div>

        <h1
          className="
            text-sm sm:text-xl
            font-bold
            tracking-[0.08em] sm:tracking-[0.15em]
            text-[#1f1f1f]
          "
        >
          BOUTIQUE MARAM
        </h1>

        <p
          className="
            mt-1
            text-xs
            tracking-[0.18em] sm:tracking-[0.35em]
            text-[#a3834d]
          "
        >
          MODEST ELEGANCE
        </p>

      </div>

    </Link>
  );
}