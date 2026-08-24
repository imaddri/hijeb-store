import Link from "next/link";
import { notFound } from "next/navigation";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { prisma } from "@/lib/prisma";

import ProductEditForm from "./ProductEditForm";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({
  params,
}: PageProps) {
  const { id } = await params;

  // ======================================================
  // GET PRODUCT
  // ======================================================

  const product = await prisma.product.findUnique({
    where: {
      id,
    },

    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },

      variants: {
        orderBy: [
          {
            sizeType: "asc",
          },
          {
            size: "asc",
          },
          {
            color: "asc",
          },
        ],
      },

      images: {
        orderBy: {
          sortOrder: "asc",
        },
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
  // GET CATEGORIES
  // ======================================================

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },

    select: {
      id: true,
      name: true,
    },
  });

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-zinc-500">
              <Link
                href="/admin/products"
                className="transition hover:text-emerald-600"
              >
                المنتجات
              </Link>

              <span>/</span>

              <span>تعديل المنتج</span>
            </div>

            <h1 className="text-3xl font-bold text-zinc-900">
              تعديل المنتج
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              قم بتعديل معلومات المنتج والأسعار والمخزون والصور.
            </p>
          </div>

          <Link
            href="/admin/products"
            className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-6 py-3 font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50"
          >
            ← العودة إلى المنتجات
          </Link>
        </div>

        {/* ==================================================
            PRODUCT FORM
        ================================================== */}

        <ProductEditForm
          product={{
            id: product.id,

            name: product.name,

            description:
              product.description ?? "",

            price: product.price,

            oldPrice:
              product.oldPrice,

            discountPercent:
              product.discountPercent,

            isActive:
              product.isActive,

            isFeatured:
              product.isFeatured,

            isNew:
              product.isNew,

            categoryId:
              product.categoryId,

            image:
              product.image,

            variants:
              product.variants.map(
                (variant) => ({
                  id: variant.id,

                  sizeType:
                    variant.sizeType,

                  size:
                    variant.size ?? "",

                  color:
                    variant.color ?? "",

                  stock:
                    variant.stock,
                }),
              ),

            images:
              product.images.map(
                (image) => ({
                  id: image.id,

                  url: image.url,

                  publicId:
                    image.publicId,

                  sortOrder:
                    image.sortOrder,
                }),
              ),
          }}
          categories={categories}
        />
      </div>
    </DashboardLayout>
  );
}