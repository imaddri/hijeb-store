import {
  Boxes,
  FolderTree,
  Package,
  ShoppingCart,
} from "lucide-react";

interface Props {
  products: number;
  orders: number;
  categories: number;
  stock: number;
}

export default function StatsGrid({
  products,
  orders,
  categories,
  stock,
}: Props) {
  const stats = [
    {
      title: "عدد المنتجات",
      value: products,
      icon: <Package size={24} />,
      className: "bg-emerald-100 text-emerald-700",
    },
    {
      title: "الطلبات",
      value: orders,
      icon: <ShoppingCart size={24} />,
      className: "bg-blue-100 text-blue-700",
    },
    {
      title: "التصنيفات",
      value: categories,
      icon: <FolderTree size={24} />,
      className: "bg-orange-100 text-orange-700",
    },
    {
      title: "إجمالي المخزون",
      value: stock,
      icon: <Boxes size={24} />,
      className: "bg-purple-100 text-purple-700",
    },
  ];

  return (
    <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

      {stats.map((stat) => (
        <div
          key={stat.title}
          className="
            rounded-2xl
            border
            border-zinc-200
            bg-white
            p-5
            shadow-sm
          "
        >
          <div className="flex items-start justify-between gap-4">

            <div>
              <p className="text-sm text-zinc-500">
                {stat.title}
              </p>

              <p className="mt-3 text-3xl font-bold text-zinc-900">
                {stat.value}
              </p>
            </div>

            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.className}`}
            >
              {stat.icon}
            </div>

          </div>
        </div>
      ))}

    </section>
  );
}