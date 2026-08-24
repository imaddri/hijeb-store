import Link from "next/link";
import { notFound } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

function getStockStatus(stock: number) {
  if (stock === 0) {
    return {
      text: "نفد المخزون",
      className: "bg-red-100 text-red-700",
    };
  }

  if (stock <= 10) {
    return {
      text: "مخزون منخفض",
      className: "bg-yellow-100 text-yellow-700",
    };
  }

  return {
    text: "متوفر",
    className: "bg-emerald-100 text-emerald-700",
  };
}

function getSizeLabel(
  sizeType: string,
  size: string | null,
) {
  if (sizeType === "NONE") {
    return "بدون مقاس";
  }

  return size || "—";
}

export default async function InventoryProductPage({
  params,
}: Props) {
  const { id } = await params;

  // ======================================================
  // PRODUCT
  // ======================================================

  const product = await prisma.product.findUnique({
    where: {
      id,
    },

    include: {
      category: true,

      variants: {
        orderBy: [
          {
            size: "asc",
          },
          {
            color: "asc",
          },
        ],
      },
    },
  });

  // ======================================================
  // PRODUCT NOT FOUND
  // ======================================================

  if (!product) {
    notFound();
  }

  // ======================================================
  // TOTAL STOCK
  // ======================================================

  const totalStock = product.variants.reduce(
    (total, variant) => total + variant.stock,
    0,
  );

  // ======================================================
  // VARIANT STATISTICS
  // ======================================================

  const availableVariants = product.variants.filter(
    (variant) => variant.stock > 10,
  ).length;

  const lowStockVariants = product.variants.filter(
    (variant) =>
      variant.stock > 0 &&
      variant.stock <= 10,
  ).length;

  const outOfStockVariants = product.variants.filter(
    (variant) => variant.stock === 0,
  ).length;

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* ==================================================
            BACK
        ================================================== */}

        <div>
          <Link
  href="/admin/inventory"
  className="inline-flex items-center gap-2 rounded-xl bg-[#C8A96B] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-black hover:shadow-md"
>
  <span className="text-lg leading-none">←</span>
  <span>العودة إلى المخزون</span>
</Link>
        </div>

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

          <div className="flex items-center gap-4">

            {/* PRODUCT IMAGE */}

            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-zinc-100">

              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-zinc-400">
                  IMG
                </span>
              )}

            </div>

            <div>

              <h1 className="text-3xl font-bold text-zinc-900">
                {product.name}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-2">

                <span className="text-sm text-zinc-500">
                  #{product.productCode}
                </span>

                <span className="text-zinc-300">
                  •
                </span>

                <span className="text-sm text-zinc-500">
                  {product.category.name}
                </span>

              </div>

            </div>

          </div>

          <Link
            href={`/admin/products/edit/${product.id}`}
            className="inline-flex items-center justify-center rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700"
          >
            تعديل المنتج
          </Link>

        </div>

        {/* ==================================================
            STATS
        ================================================== */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* TOTAL */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">

            <p className="text-sm text-zinc-500">
              إجمالي المخزون
            </p>

            <p className="mt-2 text-3xl font-bold text-zinc-900">
              {totalStock}
            </p>

            <p className="mt-1 text-xs text-zinc-400">
              قطعة
            </p>

          </div>

          {/* AVAILABLE */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">

            <p className="text-sm text-zinc-500">
              خيارات متوفرة
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {availableVariants}
            </p>

            <p className="mt-1 text-xs text-zinc-400">
              أكثر من 10 قطع
            </p>

          </div>

          {/* LOW */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">

            <p className="text-sm text-zinc-500">
              خيارات منخفضة
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {lowStockVariants}
            </p>

            <p className="mt-1 text-xs text-zinc-400">
              من 1 إلى 10 قطع
            </p>

          </div>

          {/* OUT */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">

            <p className="text-sm text-zinc-500">
              خيارات نفدت
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              {outOfStockVariants}
            </p>

            <p className="mt-1 text-xs text-zinc-400">
              بدون مخزون
            </p>

          </div>

        </div>

        {/* ==================================================
            VARIANTS TABLE
        ================================================== */}

        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">

          <div className="border-b border-zinc-100 px-6 py-5">

            <h2 className="text-xl font-bold text-zinc-900">
              مخزون الأحجام والألوان
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              كل صف يمثل تركيبة مستقلة من الحجم واللون.
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[800px] text-sm">

              <thead className="bg-zinc-50">

                <tr>

                  <th className="px-6 py-4 text-right text-lg font-bold !text-black">
                    المنتج
                  </th>

                  <th className="px-6 py-4 text-right text-lg font-bold !text-black">
                    الحجم
                  </th>

                  <th className="px-6 py-4 text-right text-lg font-bold !text-black">
                    اللون
                  </th>

                  <th className="px-6 py-4 text-right text-lg font-bold !text-black">
                    الكمية
                  </th>

                  <th className="px-6 py-4 text-right text-lg font-bold !text-black">
                    الحالة
                  </th>

                  <th className="px-6 py-4 text-right text-lg font-bold !text-black">
                    الإجراء
                  </th>

                </tr>

              </thead>

              <tbody>

                {product.variants.length === 0 ? (

                  <tr>

                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center"
                    >

                      <p className="text-lg font-semibold text-zinc-900">
                        لا توجد خيارات لهذا المنتج
                      </p>

                      <p className="mt-2 text-sm text-zinc-500">
                        لم تتم إضافة أحجام أو ألوان لهذا المنتج.
                      </p>

                    </td>

                  </tr>

                ) : (

                  product.variants.map((variant) => {

                    const status = getStockStatus(
                      variant.stock,
                    );

                    return (
                      <tr
                        key={variant.id}
                        className="border-t border-zinc-100 transition hover:bg-zinc-50/70"
                      >

                        {/* PRODUCT */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-100">

                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-[10px] font-bold text-zinc-400">
                                  IMG
                                </span>
                              )}

                            </div>

                            <div>

                              <p className="font-bold text-black">
                                {product.name}
                              </p>

                              <p className="mt-1 text-xs text-zinc-500">
                                #{product.productCode}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* SIZE */}

                        <td className="px-6 py-5 text-right">

                          <span className="inline-flex rounded-lg bg-zinc-100 px-3 py-1.5 font-semibold text-zinc-800">
                            {getSizeLabel(
                              variant.sizeType,
                              variant.size,
                            )}
                          </span>

                        </td>

                        {/* COLOR */}

                        <td className="px-6 py-5 text-right">

                          {variant.color ? (
                            <span className="font-semibold text-zinc-800">
                              {variant.color}
                            </span>
                          ) : (
                            <span className="text-zinc-400">
                              بدون لون
                            </span>
                          )}

                        </td>

                        {/* STOCK */}

                        <td className="px-6 py-5 text-right">

                          <span className="text-lg font-bold text-zinc-900">
                            {variant.stock}
                          </span>

                          <span className="mr-1 text-xs text-zinc-400">
                            قطعة
                          </span>

                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-5 text-right">

                          <span
                            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${status.className}`}
                          >
                            {status.text}
                          </span>

                        </td>

                        {/* ACTION */}

                        <td className="px-6 py-5">

                          <Link
                            href={`/admin/inventory/${product.id}/edit/${variant.id}`}
                            className="inline-flex rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            تعديل
                          </Link>

                        </td>

                      </tr>
                    );
                  })

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}