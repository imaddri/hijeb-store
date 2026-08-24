import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FolderTree, Package } from "lucide-react";

import CategoryCreateModal from "./CategoryCreateModal";
import CategoryActions from "./CategoryActions";

import { prisma } from "@/lib/prisma";

export default async function CategoriesPage() {
  // ======================================================
  // GET CATEGORIES
  // ======================================================

  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  // ======================================================
  // STATS
  // ======================================================

  const totalCategories = categories.length;

  const totalProducts = categories.reduce(
    (total, category) =>
      total + category._count.products,
    0,
  );

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">
              إدارة التصنيفات
            </h1>

            <p className="mt-2 text-zinc-500">
              إدارة تصنيفات ومنتجات المتجر
            </p>
          </div>

          <CategoryCreateModal />
        </div>

        {/* ================================================== */}
        {/* STATS */}
        {/* ================================================== */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* TOTAL CATEGORIES */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-zinc-500">
                  إجمالي التصنيفات
                </p>

                <p className="mt-2 text-3xl font-bold text-zinc-900">
                  {totalCategories}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                <FolderTree size={24} />
              </div>

            </div>
          </div>

          {/* TOTAL PRODUCTS */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-zinc-500">
                  المنتجات المصنفة
                </p>

                <p className="mt-2 text-3xl font-bold text-zinc-900">
                  {totalProducts}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Package size={24} />
              </div>

            </div>
          </div>

          {/* ACTIVE */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">

            <p className="text-sm text-zinc-500">
              التصنيفات النشطة
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {totalCategories}
            </p>

          </div>

        </div>

        {/* ================================================== */}
        {/* TABLE */}
        {/* ================================================== */}

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">

          <div className="border-b border-zinc-100 px-6 py-5">

            <h2 className="text-xl font-bold text-zinc-900">
              قائمة التصنيفات
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              جميع التصنيفات الموجودة في المتجر.
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[800px]">

              <thead className="bg-zinc-50">

                <tr>

                  <th className="px-6 py-4 text-right text-lg font-bold !text-black">
                    التصنيف
                  </th>

                  <th className="px-6 py-4 text-right text-lg font-bold !text-black">
                    الرمز
                  </th>

                  <th className="px-6 py-4 text-right text-lg font-bold !text-black">
                    المنتجات
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

                {categories.length === 0 ? (

                  <tr>

                    <td
                      colSpan={5}
                      className="px-6 py-16 text-center"
                    >

                      <p className="text-lg font-semibold text-zinc-900">
                        لا توجد تصنيفات
                      </p>

                      <p className="mt-2 text-sm text-zinc-500">
                        اضغط على "إضافة تصنيف" لإنشاء أول تصنيف.
                      </p>

                    </td>

                  </tr>

                ) : (

                  categories.map((category) => (

                    <tr
                      key={category.id}
                      className="border-t border-zinc-100 transition hover:bg-zinc-50"
                    >

                      {/* NAME */}

                      <td className="p-5">

                        <div>
                          <p className="font-semibold text-zinc-900">
                            {category.name}
                          </p>

                          <p className="mt-1 text-xs text-zinc-400">
                            Slug: {category.slug}
                          </p>
                        </div>

                      </td>

                      {/* CODE */}

                      <td className="p-5">

                        <span className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700">
                          {category.code}
                        </span>

                      </td>

                      {/* PRODUCTS */}

                      <td className="p-5">

                        <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
                          {category._count.products} منتجات
                        </span>

                      </td>

                      {/* STATUS */}

                      <td className="p-5">

                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                          نشط
                        </span>

                      </td>

                      {/* ACTIONS */}

                      <td className="p-5">

                        <CategoryActions
                          categoryId={category.id}
                          categoryName={category.name}
                          productsCount={
                            category._count.products
                          }
                        />

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}