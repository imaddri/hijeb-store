"use client";

import { useEffect, useRef, useState } from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

export default function SearchInventory() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("search") || "";

  const [search, setSearch] = useState(initialSearch);

  // يمنع تنفيذ البحث عند أول تحميل للصفحة
  const isFirstRender = useRef(true);

  useEffect(() => {
    // لا تنفذ شيئًا عند أول Rendering
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      const currentSearch =
        searchParams.get("search") || "";

      const newSearch = search.trim();

      // إذا لم تتغير القيمة، لا تعمل router.replace
      if (currentSearch === newSearch) {
        return;
      }

      const params = new URLSearchParams(
        searchParams.toString(),
      );

      if (newSearch) {
        params.set("search", newSearch);
      } else {
        params.delete("search");
      }

      const queryString = params.toString();

      router.replace(
        queryString
          ? `${pathname}?${queryString}`
          : pathname,
        {
          scroll: false,
        },
      );
    }, 400);

    return () => {
      clearTimeout(timeout);
    };
  }, [search]);

  return (
    <div className="w-full">
      <input
        type="text"
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
        }}
        placeholder="ابحث باسم المنتج أو رمز المنتج..."
        className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
      />
    </div>
  );
}