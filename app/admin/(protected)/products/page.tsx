import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { prisma } from "@/lib/prisma";
import DeleteProductButton from "./DeleteProductButton";
import SearchProducts from "./SearchProducts";
import {
  Boxes,
  AlertTriangle,
  PackageCheck,
  PackageX,
} from "lucide-react";

interface Props {
  searchParams: Promise<{
    search?: string;
    category?: string;
  }>;
}

export default async function AdminProductsPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  const search = params.search?.trim() || "";
  const category = params.category || "";

  // ============================================
  // PRODUCTS
  // ============================================

  const products = await prisma.product.findMany({
    where: {
      ...(search
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
        : {}),

      ...(category
        ? {
            categoryId: category,
          }
        : {}),
    },

    include: {
      category: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  // ============================================
  // ALL PRODUCTS FOR STATS
  // ============================================

  const allProducts = await prisma.product.findMany({
    select: {
      stock: true,
    },
  });

  const totalProducts = allProducts.length;

  const availableProducts = allProducts.filter(
    (product) => product.stock > 10,
  ).length;

  const lowStockProducts = allProducts.filter(
    (product) =>
      product.stock > 0 &&
      product.stock <= 10,
  ).length;

  const outOfStockProducts = allProducts.filter(
    (product) => product.stock === 0,
  ).length;

  // ============================================
  // CATEGORIES
  // ============================================

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  // ============================================
  // PAGE
  // ============================================

  return (
    <DashboardLayout>
      {/* ================= HEADER ================= */}

      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">
            المنتجات
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            إدارة جميع منتجات المتجر وإضافة منتجات جديدة.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          + إضافة منتج
        </Link>
      </div>

      {/* ================= STATS ================= */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* TOTAL */}

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">
                إجمالي المنتجات
              </p>

              <p className="mt-3 text-3xl font-bold text-zinc-900">
                {totalProducts}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <Boxes size={24} />
            </div>
          </div>
        </div>

        {/* AVAILABLE */}

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">
                المنتجات المتوفرة
              </p>

              <p className="mt-3 text-3xl font-bold text-emerald-600">
                {availableProducts}
              </p>
            </div>

            <PackageCheck
              className="text-emerald-600"
              size={28}
            />
          </div>
        </div>

        {/* LOW STOCK */}

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">
                مخزون منخفض
              </p>

              <p className="mt-3 text-3xl font-bold text-yellow-600">
                {lowStockProducts}
              </p>
            </div>

            <AlertTriangle
              className="text-yellow-600"
              size={28}
            />
          </div>
        </div>

        {/* OUT OF STOCK */}

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">
                نفد المخزون
              </p>

              <p className="mt-3 text-3xl font-bold text-red-600">
                {outOfStockProducts}
              </p>
            </div>

            <PackageX
              className="text-red-600"
              size={28}
            />
          </div>
        </div>
      </div>

      {/* ================= TOOLBAR ================= */}

      <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          {/* SEARCH */}

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              البحث
            </label>

            <SearchProducts />
          </div>

          {/* CATEGORY */}

          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              التصنيف
            </label>

            <form
              method="GET"
              className="flex gap-2"
            >
              <input
                type="hidden"
                name="search"
                value={search}
              />

              <select
                id="category"
                name="category"
                defaultValue={category}
                className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              >
                <option value="">
                  جميع التصنيفات
                </option>

                {categories.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="h-11 shrink-0 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                تطبيق
              </button>
            </form>
          </div>
        </div>

        {/* RESET */}

        {(search || category) && (
          <div className="mt-4 flex justify-end">
            <Link
              href="/admin/products"
              className="rounded-xl border border-zinc-200 px-6 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
            >
              إعادة ضبط
            </Link>
          </div>
        )}
      </div>

      {/* ================= PRODUCTS TABLE ================= */}

      <div className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        {/* TABLE HEADER */}

        <div className="border-b border-zinc-100 px-6 py-5">
          <h2 className="text-3xl font-bold text-zinc-900">
            قائمة المنتجات
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            {search || category
              ? `تم العثور على ${products.length} منتج`
              : "جميع المنتجات الموجودة في المتجر."}
          </p>
        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-6 py-4 text-right text-lg font-bold !text-black">
                  المنتج
                </th>

                <th className="px-6 py-4 text-right text-lg font-bold !text-black">
                  التصنيف
                </th>

                <th className="px-6 py-4 text-right text-lg font-bold !text-black">
                  السعر
                </th>

                <th className="px-6 py-4 text-right text-lg font-bold !text-black">
                  المخزون
                </th>

                <th className="px-6 py-4 text-right text-lg font-bold !text-black">
                  الحالة
                </th>

                <th className="px-6 py-4 text-right text-lg font-bold !text-black">
                  الإجراءات
                </th>
              </tr>
            </thead>

            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center"
                  >
                    <p className="text-lg font-semibold text-zinc-900">
                      لا توجد منتجات
                    </p>

                    <p className="mt-2 text-sm text-zinc-500">
                      لم يتم العثور على منتج مطابق للبحث.
                    </p>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const status =
                    product.stock === 0
                      ? "نفد المخزون"
                      : product.stock <= 10
                        ? "مخزون منخفض"
                        : "متوفر";

                  return (
                    <tr
                      key={product.id}
                      className="border-t border-zinc-100 transition hover:bg-zinc-50/70"
                    >
                      {/* PRODUCT */}

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-100 text-xs font-bold text-zinc-400">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              "IMG"
                            )}
                          </div>

                          <div>
                            <p className="text-right text-sm font-bold !text-black">
                              {product.name}
                            </p>

                            <p className="mt-1 text-right text-sm font-medium text-zinc-500 !text-black">
                              #{product.productCode}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* CATEGORY */}

                      <td className="px-6 py-4 text-right text-lg font-bold !text-black">
                        {product.category.name}
                      </td>

                      {/* PRICE */}

                      <td className="px-6 py-5 text-right font-semibold text-zinc-900">
                        {product.price.toLocaleString(
                          "ar-DZ",
                        )}{" "}
                        دج

                        {product.oldPrice && (
                          <div className="mt-1 text-xs font-normal text-zinc-400 line-through">
                            {product.oldPrice.toLocaleString(
                              "ar-DZ",
                            )}{" "}
                            دج
                          </div>
                        )}
                      </td>

                      {/* STOCK */}

                      <td className="px-6 py-5 text-right font-medium text-zinc-700">
                        {product.stock} قطعة
                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4 text-right">
                        {status === "متوفر" && (
                          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                            {status}
                          </span>
                        )}

                        {status === "مخزون منخفض" && (
                          <span className="rounded-full bg-yellow-50 px-3 py-1.5 text-sm font-semibold text-yellow-700">
                            {status}
                          </span>
                        )}

                        {status === "نفد المخزون" && (
                          <span className="rounded-full bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700">
                            {status}
                          </span>
                        )}
                      </td>

                      {/* ACTIONS */}

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/products/edit/${product.id}`}
                            className="rounded-xl border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            تعديل
                          </Link>

                          <DeleteProductButton
                            productId={product.id}
                            productName={product.name}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}