"use client";

import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Boxes,
  Settings,
  Tag,
} from "lucide-react";

import NavigationItem from "./NavigationItem";

export default function Sidebar() {
  return (
    <aside className="w-full shrink-0 bg-zinc-900 text-white md:min-h-screen md:w-64">
      <div className="border-b border-white/10 px-4 py-4 sm:p-6">
        <h2 className="text-lg font-bold sm:text-xl">
          Boutique Maram
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          لوحة الإدارة
        </p>
      </div>

      <nav className="flex gap-2 overflow-x-auto p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-col md:space-y-2 md:overflow-visible md:p-4">

        <NavigationItem
          href="/admin/dashboard"
          title="لوحة التحكم"
          icon={<LayoutDashboard size={20} />}
        />

        <NavigationItem
          href="/admin/products"
          title="المنتجات"
          icon={<Package size={20} />}
        />

        <NavigationItem
          href="/admin/categories"
          title="التصنيفات"
          icon={<FolderTree size={20} />}
        />

        {/* العروض */}
        <NavigationItem
          href="/admin/offers"
          title="العروض"
          icon={<Tag size={20} />}
        />

        <NavigationItem
          href="/admin/orders"
          title="الطلبات"
          icon={<ShoppingCart size={20} />}
        />

        <NavigationItem
          href="/admin/inventory"
          title="المخزون"
          icon={<Boxes size={20} />}
        />

        <NavigationItem
          href="/admin/settings"
          title="الإعدادات"
          icon={<Settings size={20} />}
        />

      </nav>
    </aside>
  );
}