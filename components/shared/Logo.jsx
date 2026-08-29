
import Image from "next/image";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex min-w-0 items-center gap-2 sm:gap-4"
    >

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
          src="/icons/log11.svg"
          alt="BOUTIQUE MARAM"
          width={200}
          height={200}
          priority
          className="
            h-[200px]
            w-[200px]
            object-contain
          "
        />
      </div>


      {/* ==================== BRAND NAME ==================== */}

      <div>

        <h1
          className={`
            ${playfair.className}
            text-sm
            font-extrabold
            tracking-[0.08em]
            text-[#1f1f1f]
            sm:text-xl
            sm:tracking-[0.15em]
          `}
        >
          BOUTIQUE MARAM
        </h1>


        <p
          className={`
            ${playfair.className}
             mt-1
    text-xs
    font-medium
    tracking-[0.18em] sm:tracking-[0.35em]
    text-[#8f713f]
          `}
        >
          MODEST ELEGANCE
        </p>

      </div>

    </Link>
  );
}
