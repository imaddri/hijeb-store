"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ======================================================
// CREATE OFFER
// ======================================================

export async function createOffer(formData: FormData) {
  try {
    // ==================================================
    // GET DATA
    // ==================================================

    const productId = String(
      formData.get("productId") || "",
    ).trim();

    const discountPercent = Number(
      formData.get("discountPercent") || 0,
    );

    const startDateValue = String(
      formData.get("startDate") || "",
    ).trim();

    const endDateValue = String(
      formData.get("endDate") || "",
    ).trim();

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!productId) {
      throw new Error("يجب اختيار منتج");
    }

    if (
      !Number.isFinite(discountPercent) ||
      discountPercent <= 0 ||
      discountPercent >= 100
    ) {
      throw new Error(
        "نسبة الخصم يجب أن تكون بين 1% و99%",
      );
    }

    if (!startDateValue) {
      throw new Error("تاريخ بداية العرض مطلوب");
    }

    if (!endDateValue) {
      throw new Error("تاريخ نهاية العرض مطلوب");
    }

    // ==================================================
    // DATES
    // ==================================================

    const startDate = new Date(startDateValue);
    const endDate = new Date(endDateValue);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      throw new Error("تاريخ العرض غير صالح");
    }

    if (endDate <= startDate) {
      throw new Error(
        "تاريخ نهاية العرض يجب أن يكون بعد تاريخ البداية",
      );
    }

    // ==================================================
    // GET PRODUCT
    // ==================================================

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new Error("المنتج غير موجود");
    }

    // ==================================================
    // CHECK PRODUCT
    // ==================================================

    if (!product.isActive) {
      throw new Error(
        "لا يمكن إضافة عرض لمنتج غير نشط",
      );
    }

    // ==================================================
    // CHECK EXISTING OFFER
    // ==================================================

    const existingOffer =
      await prisma.offer.findFirst({
        where: {
          productId,
          startDate: {
            lte: endDate,
          },
          endDate: {
            gte: startDate,
          },
        },
      });

    if (existingOffer) {
      throw new Error(
        "يوجد عرض آخر لهذا المنتج في نفس الفترة",
      );
    }

    // ==================================================
    // CALCULATE PRICE
    // ==================================================

    const newPrice =
      product.price -
      product.price *
        (discountPercent / 100);

    const roundedPrice =
      Math.round(newPrice * 100) / 100;

    // ==================================================
    // CREATE OFFER + UPDATE PRODUCT
    // ==================================================

    const offer = await prisma.$transaction(
      async (tx) => {
        const createdOffer =
          await tx.offer.create({
            data: {
              productId,
              discountPercent,
              newPrice: roundedPrice,
              startDate,
              endDate,
            },
          });

        await tx.product.update({
          where: {
            id: productId,
          },
          data: {
            oldPrice: product.price,
            price: roundedPrice,
            discountPercent,
          },
        });

        return createdOffer;
      },
    );

    // ==================================================
    // CACHE
    // ==================================================

    revalidatePath("/admin/offers");
    revalidatePath("/admin/products");
    revalidatePath("/");

    console.log(
      "✅ Offer created successfully:",
      offer.id,
    );

    return {
      success: true,
      message: "تمت إضافة العرض بنجاح",
    };
  } catch (error) {
    console.error(
      "❌ createOffer error:",
      error,
    );

    throw new Error(
      error instanceof Error
        ? error.message
        : "حدث خطأ أثناء إنشاء العرض",
    );
  }
}

// ======================================================
// UPDATE OFFER
// ======================================================

export async function updateOffer(formData: FormData) {
  try {
    // ==================================================
    // GET DATA
    // ==================================================

    const id = String(
      formData.get("id") || "",
    ).trim();

    const discountPercent = Number(
      formData.get("discountPercent") || 0,
    );

    const startDateValue = String(
      formData.get("startDate") || "",
    ).trim();

    const endDateValue = String(
      formData.get("endDate") || "",
    ).trim();

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!id) {
      throw new Error(
        "معرف العرض غير موجود",
      );
    }

    if (
      !Number.isFinite(discountPercent) ||
      discountPercent <= 0 ||
      discountPercent >= 100
    ) {
      throw new Error(
        "نسبة الخصم يجب أن تكون بين 1% و99%",
      );
    }

    if (!startDateValue) {
      throw new Error(
        "تاريخ بداية العرض مطلوب",
      );
    }

    if (!endDateValue) {
      throw new Error(
        "تاريخ نهاية العرض مطلوب",
      );
    }

    // ==================================================
    // DATES
    // ==================================================

    const startDate = new Date(
      startDateValue,
    );

    const endDate = new Date(
      endDateValue,
    );

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      throw new Error(
        "تاريخ العرض غير صالح",
      );
    }

    if (endDate <= startDate) {
      throw new Error(
        "تاريخ نهاية العرض يجب أن يكون بعد تاريخ البداية",
      );
    }

    // ==================================================
    // GET OFFER
    // ==================================================

    const offer =
      await prisma.offer.findUnique({
        where: {
          id,
        },
        include: {
          product: true,
        },
      });

    if (!offer) {
      throw new Error(
        "العرض غير موجود",
      );
    }

    // ==================================================
    // CHECK PRODUCT
    // ==================================================

    if (!offer.product.isActive) {
      throw new Error(
        "لا يمكن تعديل عرض لمنتج غير نشط",
      );
    }

    // ==================================================
    // CHECK OVERLAPPING OFFERS
    // ==================================================

    const existingOffer =
      await prisma.offer.findFirst({
        where: {
          id: {
            not: id,
          },

          productId: offer.productId,

          startDate: {
            lte: endDate,
          },

          endDate: {
            gte: startDate,
          },
        },
      });

    if (existingOffer) {
      throw new Error(
        "يوجد عرض آخر لهذا المنتج في نفس الفترة",
      );
    }

    // ==================================================
    // ORIGINAL PRODUCT PRICE
    // ==================================================

    const originalPrice =
      offer.product.oldPrice ??
      offer.product.price;

    // ==================================================
    // CALCULATE NEW PRICE
    // ==================================================

    const newPrice =
      originalPrice -
      originalPrice *
        (discountPercent / 100);

    const roundedPrice =
      Math.round(newPrice * 100) / 100;

    // ==================================================
    // UPDATE OFFER + PRODUCT
    // ==================================================

    const updatedOffer =
      await prisma.$transaction(
        async (tx) => {
          const updated =
            await tx.offer.update({
              where: {
                id,
              },

              data: {
                discountPercent,
                newPrice: roundedPrice,
                startDate,
                endDate,
              },
            });

          await tx.product.update({
            where: {
              id: offer.productId,
            },

            data: {
              oldPrice: originalPrice,
              price: roundedPrice,
              discountPercent,
            },
          });

          return updated;
        },
      );

    // ==================================================
    // CACHE
    // ==================================================

    revalidatePath("/admin/offers");
    revalidatePath("/admin/products");
    revalidatePath("/");

    console.log(
      "✅ Offer updated successfully:",
      updatedOffer.id,
    );

    return {
      success: true,
      message: "تم تعديل العرض بنجاح",
    };
  } catch (error) {
    console.error(
      "❌ updateOffer error:",
      error,
    );

    throw new Error(
      error instanceof Error
        ? error.message
        : "حدث خطأ أثناء تعديل العرض",
    );
  }
}

// ======================================================
// DELETE OFFER
// ======================================================

export async function deleteOffer(
  formData: FormData,
) {
  try {
    const id = String(
      formData.get("id") || "",
    ).trim();

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!id) {
      throw new Error(
        "معرف العرض غير موجود",
      );
    }

    // ==================================================
    // GET OFFER
    // ==================================================

    const offer =
      await prisma.offer.findUnique({
        where: {
          id,
        },

        include: {
          product: true,
        },
      });

    if (!offer) {
      throw new Error(
        "العرض غير موجود",
      );
    }

    // ==================================================
    // CALCULATE RESTORE PRICE
    // ==================================================

    const newPrice =
      offer.newPrice ?? offer.product.price;

    let restorePrice =
      offer.product.oldPrice;

    if (
      restorePrice === null ||
      restorePrice === undefined
    ) {
      const divisor =
        1 -
        offer.discountPercent / 100;

      restorePrice =
        divisor > 0
          ? newPrice / divisor
          : newPrice;
    }

    restorePrice =
      Math.round(
        restorePrice * 100,
      ) / 100;

    // ==================================================
    // DELETE + RESTORE PRODUCT
    // ==================================================

    await prisma.$transaction(
      async (tx) => {
        await tx.offer.delete({
          where: {
            id,
          },
        });

        await tx.product.update({
          where: {
            id: offer.productId,
          },

          data: {
            price: restorePrice,
            oldPrice: null,
            discountPercent: null,
          },
        });
      },
    );

    // ==================================================
    // CACHE
    // ==================================================

    revalidatePath("/admin/offers");
    revalidatePath("/admin/products");
    revalidatePath("/");

    console.log(
      "✅ Offer deleted successfully:",
      id,
    );

    return {
      success: true,
      message: "تم حذف العرض بنجاح",
    };
  } catch (error) {
    console.error(
      "❌ deleteOffer error:",
      error,
    );

    throw new Error(
      error instanceof Error
        ? error.message
        : "حدث خطأ أثناء حذف العرض",
    );
  }
}