"use client";

import { useEffect, useState } from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

export default function SearchProducts() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlSearch = searchParams.get("search") || "";

  const [search, setSearch] = useState(urlSearch);

  // ============================================
  // SYNC INPUT WITH URL
  // ============================================

  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  // ============================================
  // LIVE SEARCH
  // ============================================

  useEffect(() => {
    const trimmedSearch = search.trim();

    // إذا كانت القيمة نفسها الموجودة في URL
    // لا نعيد تنفيذ navigation
    if (trimmedSearch === urlSearch) {
      return;
    }

    const timeout = setTimeout(() => {
      const params = new URLSearchParams(
        searchParams.toString(),
      );

      if (trimmedSearch) {
        params.set("search", trimmedSearch);
      } else {
        params.delete("search");
      }

      const queryString = params.toString();

      const newUrl = queryString
        ? `${pathname}?${queryString}`
        : pathname;

      // مهم جدًا:
      // scroll: false يمنع Next.js من
      // إرجاع الصفحة إلى أعلى الصفحة
      router.replace(newUrl, {
        scroll: false,
      });
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [
    search,
    urlSearch,
    pathname,
    router,
    searchParams,
  ]);

  // ============================================
  // INPUT
  // ============================================

  return (
    <input
      type="text"
      value={search}
      onChange={(e) => {
        setSearch(e.target.value);
      }}
      placeholder="ابحث باسم المنتج أو رمز المنتج..."
      className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
    />
  );
}