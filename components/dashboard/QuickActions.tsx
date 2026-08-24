import Link from "next/link";

export default function QuickActions() {
  return (
    <section className="mb-2">

      <div className="mb-2">
        

        <p className="mt-1 text-sm text-zinc-500">
          الوصول السريع إلى أهم أقسام المتجر.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

        <Link
          href="/admin/products/new"
          className="
            flex
            items-center
            justify-center
            rounded-xl
            bg-emerald-600
            px-5
            py-3
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-emerald-700
          "
        >
          + إضافة منتج
        </Link>

        <Link
          href="/admin/categories"
          className="
            flex
            items-center
            justify-center
            rounded-xl
            border
            border-zinc-200
            bg-white
            px-5
            py-3
            text-sm
            font-semibold
            text-zinc-700
            transition
            hover:bg-zinc-50
          "
        >
          إدارة التصنيفات
        </Link>

        <Link
          href="/admin/inventory"
          className="
            flex
            items-center
            justify-center
            rounded-xl
            border
            border-zinc-200
            bg-white
            px-5
            py-3
            text-sm
            font-semibold
            text-zinc-700
            transition
            hover:bg-zinc-50
          "
        >
          إدارة المخزون
        </Link>

        <Link
          href="/admin/orders"
          className="
            flex
            items-center
            justify-center
            rounded-xl
            border
            border-zinc-200
            bg-white
            px-5
            py-3
            text-sm
            font-semibold
            text-zinc-700
            transition
            hover:bg-zinc-50
          "
        >
          عرض الطلبات
        </Link>

      </div>
    </section>
  );
}