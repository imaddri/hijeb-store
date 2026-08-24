import Link from "next/link";
import { notFound } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { prisma } from "@/lib/prisma";
import UpdateVariantStockForm from "./UpdateVariantStockForm";

interface Props {
  params: Promise<{
    id: string;
    variantId: string;
  }>;
}

export default async function EditVariantStockPage({
  params,
}: Props) {
  const { id, variantId } = await params;

  // ======================================================
  // GET VARIANT
  // ======================================================

  const variant = await prisma.productVariant.findFirst({
    where: {
      id: variantId,
      productId: id,
    },

    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
  });

  // ======================================================
  // NOT FOUND
  // ======================================================

  if (!variant) {
    notFound();
  }

  // ======================================================
  // SIZE
  // ======================================================

  const size =
    variant.sizeType === "NONE"
      ? "بدون مقاس"
      : variant.size || "—";

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-8">

        {/* ==================================================
            BACK
        ================================================== */}

        <div>
          <Link
            href={`/admin/inventory/${variant.productId}`}
            className="inline-flex items-center text-sm font-semibold text-zinc-500 transition hover:text-emerald-600"
          >
            ← العودة إلى مخزون المنتج
          </Link>
        </div>

        {/* ==================================================
            HEADER
        ================================================== */}

        <div>
          <h1 className="text-3xl font-bold text-zinc-900">
            تعديل المخزون
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            تعديل كمية هذا الخيار فقط.
          </p>
        </div>

        {/* ==================================================
            PRODUCT INFO
        ================================================== */}

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">

          <div className="flex items-center gap-4">

            {/* IMAGE */}

            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-zinc-100">

              {variant.product.image ? (
                <img
                  src={variant.product.image}
                  alt={variant.product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-zinc-400">
                  IMG
                </span>
              )}

            </div>

            {/* INFO */}

            <div>

              <h2 className="text-xl font-bold text-zinc-900">
                {variant.product.name}
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                #{variant.product.productCode}
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                {variant.product.category.name}
              </p>

            </div>

          </div>

        </div>

        {/* ==================================================
            VARIANT INFORMATION
        ================================================== */}

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold text-zinc-900">
            الخيار المحدد
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            هذا التعديل سيؤثر على هذا الخيار فقط.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">

            {/* SIZE */}

            <div className="rounded-2xl bg-zinc-50 p-4">

              <p className="text-sm text-zinc-500">
                الحجم
              </p>

              <p className="mt-2 text-lg font-bold text-zinc-900">
                {size}
              </p>

            </div>

            {/* COLOR */}

            <div className="rounded-2xl bg-zinc-50 p-4">

              <p className="text-sm text-zinc-500">
                اللون
              </p>

              <p className="mt-2 text-lg font-bold text-zinc-900">
                {variant.color || "بدون لون"}
              </p>

            </div>

            {/* CURRENT STOCK */}

            <div className="rounded-2xl bg-zinc-50 p-4">

              <p className="text-sm text-zinc-500">
                المخزون الحالي
              </p>

              <p className="mt-2 text-lg font-bold text-emerald-600">
                {variant.stock}
              </p>

            </div>

          </div>

        </div>

        {/* ==================================================
            UPDATE FORM
        ================================================== */}

        <UpdateVariantStockForm
          variantId={variant.id}
          productId={variant.productId}
          currentStock={variant.stock}
        />

      </div>
    </DashboardLayout>
  );
}