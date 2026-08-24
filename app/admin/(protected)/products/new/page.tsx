import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { prisma } from "@/lib/prisma";
import ProductForm from "./ProductForm";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* ================= HEADER ================= */}

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

          <div>

            <h1 className="text-3xl font-bold text-zinc-900">
              إضافة منتج جديد
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              أضف منتجًا جديدًا إلى متجر Hijab Store.
            </p>

          </div>

          <Link
            href="/admin/products"
            className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-6 py-3 font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50"
          >
            ← العودة إلى المنتجات
          </Link>

        </div>

        {/* ================= PRODUCT FORM ================= */}

        <ProductForm categories={categories} />

      </div>
    </DashboardLayout>
  );
}