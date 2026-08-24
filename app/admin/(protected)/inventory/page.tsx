import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { prisma } from "@/lib/prisma";
import {
  Boxes,
  AlertTriangle,
  PackageCheck,
  PackageX,
} from "lucide-react";
import SearchInventory from "./SearchInventory";

// ======================================================
// TYPES
// ======================================================

interface Props {
  searchParams: Promise<{
    search?: string;
  }>;
}

// ======================================================
// STOCK STATUS
// ======================================================

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

// ======================================================
// PAGE
// ======================================================

export default async function InventoryPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  const search = params.search?.trim() || "";

  // ====================================================
  // PRODUCTS + VARIANTS
  // ====================================================

  const products = await prisma.product.findMany({
    where: search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              productCode: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }
      : undefined,

    include: {
      category: true,

      variants: {
        select: {
          id: true,
          stock: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  // ====================================================
  // INVENTORY CALCULATIONS
  // ====================================================

  const inventory = products.map((product) => {
    const totalStock = product.variants.reduce(
      (total, variant) => total + variant.stock,
      0,
    );

    return {
      ...product,
      totalStock,
    };
  });

  // ====================================================
  // STATS
  // ====================================================

  const totalStock = inventory.reduce(
    (total, product) => total + product.totalStock,
    0,
  );

  const available = inventory.filter(
    (product) => product.totalStock > 10,
  ).length;

  const lowStock = inventory.filter(
    (product) =>
      product.totalStock > 0 &&
      product.totalStock <= 10,
  ).length;

  const outOfStock = inventory.filter(
    (product) => product.totalStock === 0,
  ).length;

  // ====================================================
  // PAGE
  // ====================================================

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div>
          <h1 className="text-3xl font-bold text-zinc-900">
            إدارة المخزون
          </h1>

          <p className="mt-2 text-zinc-500">
            متابعة كميات المنتجات وحالة المخزون حسب الأحجام والألوان.
          </p>
        </div>

        {/* ==================================================
            STATS
        ================================================== */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* إجمالي المخزون */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
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

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                <Boxes size={24} />
              </div>

            </div>
          </div>

          {/* المنتجات المتوفرة */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-zinc-500">
                  منتجات متوفرة
                </p>

                <p className="mt-2 text-3xl font-bold text-emerald-600">
                  {available}
                </p>

                <p className="mt-1 text-xs text-zinc-400">
                  أكثر من 10 قطع
                </p>
              </div>

              <PackageCheck
                className="text-emerald-600"
                size={28}
              />

            </div>
          </div>

          {/* مخزون منخفض */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-zinc-500">
                  مخزون منخفض
                </p>

                <p className="mt-2 text-3xl font-bold text-yellow-600">
                  {lowStock}
                </p>

                <p className="mt-1 text-xs text-zinc-400">
                  من 1 إلى 10 قطع
                </p>
              </div>

              <AlertTriangle
                className="text-yellow-600"
                size={28}
              />

            </div>
          </div>

          {/* نفد المخزون */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-zinc-500">
                  نفد المخزون
                </p>

                <p className="mt-2 text-3xl font-bold text-red-600">
                  {outOfStock}
                </p>

                <p className="mt-1 text-xs text-zinc-400">
                  لا توجد قطع
                </p>
              </div>

              <PackageX
                className="text-red-600"
                size={28}
              />

            </div>
          </div>

        </div>

        {/* ==================================================
            SEARCH
        ================================================== */}

        <SearchInventory />

        {/* ==================================================
            INVENTORY TABLE
        ================================================== */}

        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">

          <div className="border-b border-zinc-100 px-6 py-5">

            <h2 className="text-xl font-bold text-zinc-900">
              حالة المخزون
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              {search
                ? `نتائج البحث عن "${search}" — ${inventory.length} منتج`
                : "إجمالي المخزون لكل منتج محسوب من جميع الأحجام والألوان."}
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[850px] text-sm">

              <thead className="bg-zinc-50">

                <tr>

                  <th className="px-6 py-4 text-right text-lg font-bold !text-black">
                    المنتج
                  </th>

                  <th className="px-6 py-4 text-right text-lg font-bold !text-black">
                    التصنيف
                  </th>

                  <th className="px-6 py-4 text-right text-lg font-bold !text-black">
                    عدد الخيارات
                  </th>

                  <th className="px-6 py-4 text-right text-lg font-bold !text-black">
                    إجمالي المخزون
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

                {inventory.length === 0 ? (

                  <tr>

                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center"
                    >

                      <p className="text-lg font-semibold text-zinc-900">
                        لا توجد منتجات
                      </p>

                      <p className="mt-2 text-sm text-zinc-500">
                        {search
                          ? "لم يتم العثور على منتج مطابق لاسم المنتج أو رمز المنتج."
                          : "لم تتم إضافة أي منتجات إلى المتجر بعد."}
                      </p>

                    </td>

                  </tr>

                ) : (

                  inventory.map((product) => {

                    const status = getStockStatus(
                      product.totalStock,
                    );

                    return (

                      <tr
                        key={product.id}
                        className="border-t border-zinc-100 transition hover:bg-zinc-50/70"
                      >

                        {/* PRODUCT */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-4">

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-100">

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

                              <p className="text-right font-bold text-black">
                                {product.name}
                              </p>

                              <p className="mt-1 text-right text-xs text-zinc-500">
                                #{product.productCode}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* CATEGORY */}

                        <td className="px-6 py-5 text-right font-semibold text-black">
                          {product.category.name}
                        </td>

                        {/* VARIANTS */}

                        <td className="px-6 py-5 text-right font-medium text-zinc-700">

                          {product.variants.length}

                          <span className="mr-1 text-xs text-zinc-400">
                            خيار
                          </span>

                        </td>

                        {/* TOTAL STOCK */}

                        <td className="px-6 py-5 text-right">

                          <span className="text-lg font-bold text-zinc-900">
                            {product.totalStock}
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
                            href={`/admin/inventory/${product.id}`}
                            className="inline-flex rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-[#C8A96B] hover:bg-[#C8A96B] hover:text-white"
                          >
                            تعديل المخزون
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