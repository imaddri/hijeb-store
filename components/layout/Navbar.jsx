"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  PackageSearch,
} from "lucide-react";

import Logo from "@/components/shared/Logo";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const [isOpen, setIsOpen] =
    useState(false);

  const [mounted, setMounted] =
    useState(false);

  const { cartCount } =
    useCart();

  // ======================================================
  // MOUNT
  // ======================================================

  useEffect(() => {
    setMounted(true);
  }, []);

  // ======================================================
  // NAVIGATION LINKS
  // ======================================================

  const navLinks = [
    {
      href: "/",
      label: "الرئيسية",
    },

    {
      href: "/categories/hijabs",
      label: "الحجابات",
    },

    {
      href: "/categories/abayas",
      label: "العبايات",
    },

    {
      href: "/categories/khimars",
      label: "الخمارات",
    },

    {
      href: "/products",
      label: "المنتجات",
    },

    {
      href: "/#offers",
      label: "العروض",
    },

    {
      href: "/track-order",
      label: "تتبع الطلب",
      tracking: true,
    },
  ];

  return (
    <header
      dir="rtl"
      className="
        sticky
        top-0
        z-50
        border-b
        border-black/10
        bg-white/90
        backdrop-blur
      "
    >

      {/* ==================================================
          MAIN NAVBAR
      ================================================== */}

      <div
        className="
          mx-auto
          flex
          h-16 sm:h-24
          max-w-7xl
          items-center
          justify-between
          px-3 sm:px-6
        "
      >

        {/* ==================================================
            LOGO
        ================================================== */}

        <Logo />

        {/* ==================================================
            DESKTOP NAVIGATION
        ================================================== */}

        <nav
          className="
            hidden
            items-center
            gap-8
            text-base
            font-semibold
            lg:flex
          "
        >

          {navLinks.map(
            (link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                className="
                  flex
                  items-center
                  gap-1.5
                  text-[#1f1f1f]
                  transition
                  duration-300
                  hover:text-[#a3834d]
                "
              >

                {link.tracking && (
                  <PackageSearch
                    size={17}
                    strokeWidth={1.8}
                  />
                )}

                {link.label}

              </Link>
            )
          )}

        </nav>

        {/* ==================================================
            ACTIONS
        ================================================== */}

        <div
          className="
            flex
            items-center
            gap-2 sm:gap-3
          "
        >

          {/* ==================================================
              SEARCH
          ================================================== */}

          <Link
            href="/products"
            aria-label="البحث عن المنتجات"
            className="
              rounded-xl
              border
              border-black/10
              p-2.5 sm:p-3
              transition
              hover:bg-[#1f1f1f]
              hover:text-white
            "
          >
            <Search size={20} />
          </Link>

          {/* ==================================================
              TRACK ORDER ICON
          ================================================== */}

          <Link
            href="/track-order"
            aria-label="تتبع الطلب"
            className="
              hidden
              rounded-xl
              border
              border-black/10
              p-2.5 sm:p-3
              transition
              hover:bg-[#1f1f1f]
              hover:text-white
              sm:flex
              lg:hidden
            "
          >
            <PackageSearch
              size={20}
            />
          </Link>

          {/* ==================================================
              CART
          ================================================== */}

          <Link
            href="/cart"
            aria-label="سلة التسوق"
            className="
              relative
              rounded-xl
              border
              border-black/10
              p-2.5 sm:p-3
              transition
              hover:bg-[#1f1f1f]
              hover:text-white
            "
          >

            <ShoppingBag
              size={20}
            />

            {mounted &&
              cartCount > 0 && (
                <span
                  className="
                    absolute
                    -right-2
                    -top-2
                    flex
                    h-6
                    min-w-6
                    items-center
                    justify-center
                    rounded-full
                    bg-[#a3834d]
                    px-1
                    text-xs
                    font-bold
                    text-white
                  "
                >
                  {cartCount}
                </span>
              )}

          </Link>

          {/* ==================================================
              MOBILE MENU BUTTON
          ================================================== */}

          <button
            type="button"
            aria-label={
              isOpen
                ? "إغلاق القائمة"
                : "فتح القائمة"
            }
            aria-expanded={
              isOpen
            }
            onClick={() =>
              setIsOpen(
                (prev) =>
                  !prev
              )
            }
            className="
              rounded-xl
              border
              border-black/10
              p-3
              transition
              hover:bg-[#1f1f1f]
              hover:text-white
              lg:hidden
            "
          >

            {isOpen ? (
              <X size={20} />
            ) : (
              <Menu size={20} />
            )}

          </button>

        </div>

      </div>

      {/* ==================================================
          MOBILE MENU
      ================================================== */}

      {isOpen && (
        <div
          className="
            border-t
            border-black/10
            bg-white
            px-3 sm:px-6
            py-5
            lg:hidden
          "
        >

          <nav
            className="
              flex
              flex-col
              gap-2
              text-base
              font-semibold
            "
          >

            {navLinks.map(
              (link) => (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  onClick={() =>
                    setIsOpen(
                      false
                    )
                  }
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-lg
                    px-3
                    py-3
                    text-[#1f1f1f]
                    transition
                    hover:bg-[#f8f5ef]
                    hover:text-[#a3834d]
                  "
                >

                  {link.tracking && (
                    <PackageSearch
                      size={18}
                    />
                  )}

                  {link.label}

                </Link>
              )
            )}

          </nav>

        </div>
      )}

    </header>
  );
}