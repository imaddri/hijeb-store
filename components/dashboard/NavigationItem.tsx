"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface Props {
  href: string;
  title: string;
  icon: ReactNode;
}

export default function NavigationItem({
  href,
  title,
  icon,
}: Props) {
  const pathname = usePathname();

  const active = pathname === href;

  return (
    <Link
      href={href}
      className={`
        flex
        items-center
        gap-3
        rounded-xl
        px-4
        py-3
        text-sm
        font-medium
        transition
        ${
          active
            ? "bg-emerald-600 text-white"
            : "text-zinc-400 hover:bg-white/5 hover:text-white"
        }
      `}
    >
      {icon}

      <span>
        {title}
      </span>
    </Link>
  );
}