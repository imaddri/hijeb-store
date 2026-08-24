import { notFound } from "next/navigation";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { prisma } from "@/lib/prisma";

import CategoryEditForm from "./CategoryEditForm";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CategoryEditPage({
  params,
}: PageProps) {
  const { id } = await params;

  // ==================================================
  // GET CATEGORY
  // ==================================================

  const category =
    await prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

  // ==================================================
  // NOT FOUND
  // ==================================================

  if (!category) {
    notFound();
  }

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl">
        {/* ================= HEADER ================= */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">
            تعديل التصنيف
          </h1>

          <p className="mt-2 text-zinc-500">
            تعديل معلومات التصنيف
            وإدارة بياناته.
          </p>
        </div>

        {/* ================= CATEGORY INFO ================= */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="text-sm text-zinc-500">
              رمز التصنيف
            </p>

            <p className="mt-2 text-xl font-bold text-zinc-900">
              {category.code}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="text-sm text-zinc-500">
              عدد المنتجات
            </p>

            <p className="mt-2 text-xl font-bold text-zinc-900">
              {category._count.products}
            </p>
          </div>
        </div>

        {/* ================= FORM ================= */}

        <CategoryEditForm
          category={{
            id: category.id,
            name: category.name,
            slug: category.slug,
            code: category.code,
          }}
        />
      </div>
    </DashboardLayout>
  );
}