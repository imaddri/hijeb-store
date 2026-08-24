import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
) {
  try {
    const body = await request.json();

    const variantId = body.variantId;
    const productId = body.productId;
    const stock = body.stock;

    // ====================================================
    // VALIDATION
    // ====================================================

    if (
      typeof variantId !== "string" ||
      typeof productId !== "string"
    ) {
      return NextResponse.json(
        {
          error: "بيانات المنتج غير صحيحة.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      typeof stock !== "number" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return NextResponse.json(
        {
          error: "الكمية يجب أن تكون رقمًا صحيحًا أكبر من أو تساوي صفر.",
        },
        {
          status: 400,
        },
      );
    }

    // ====================================================
    // CHECK VARIANT
    // ====================================================

    const variant =
      await prisma.productVariant.findFirst({
        where: {
          id: variantId,
          productId,
        },
      });

    if (!variant) {
      return NextResponse.json(
        {
          error: "الخيار المطلوب غير موجود.",
        },
        {
          status: 404,
        },
      );
    }

    // ====================================================
    // UPDATE VARIANT + PRODUCT TOTAL STOCK
    // ====================================================

    const result =
      await prisma.$transaction(
        async (tx) => {
          // تحديث مخزون الـ Variant
          const updatedVariant =
            await tx.productVariant.update({
              where: {
                id: variantId,
              },

              data: {
                stock,
              },
            });

          // جلب جميع Variants للمنتج
          const variants =
            await tx.productVariant.findMany({
              where: {
                productId,
              },

              select: {
                stock: true,
              },
            });

          // حساب إجمالي المخزون
          const totalStock =
            variants.reduce(
              (total, item) =>
                total + item.stock,
              0,
            );

          // تحديث Product.stock
          const updatedProduct =
            await tx.product.update({
              where: {
                id: productId,
              },

              data: {
                stock: totalStock,
              },
            });

          return {
            updatedVariant,
            updatedProduct,
          };
        },
      );

    return NextResponse.json({
      success: true,
      variant: result.updatedVariant,
      productStock:
        result.updatedProduct.stock,
    });
  } catch (error) {
    console.error(
      "UPDATE_VARIANT_STOCK_ERROR:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "حدث خطأ أثناء تحديث المخزون.",
      },
      {
        status: 500,
      },
    );
  }
}