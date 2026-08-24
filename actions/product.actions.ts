"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { uploadToCloudinary } from "@/lib/cloudinary";

// ======================================================
// TYPES
// ======================================================

type VariantInput = {
  sizeType: "NONE" | "LETTER" | "NUMBER";
  size: string | null;
  color: string | null;
  stock: number;
};

type UploadedImage = {
  url: string;
  publicId: string | null;
};

// ======================================================
// GENERATE UNIQUE SLUG
// ======================================================

async function generateUniqueSlug(
  name: string,
  currentProductId?: string,
) {
  const baseSlug =
    name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\u0600-\u06FF-]/g, "") ||
    `product-${Date.now()}`;

  let slug = baseSlug;

  const existingProduct =
    await prisma.product.findFirst({
      where: {
        slug,
        ...(currentProductId
          ? {
              NOT: {
                id: currentProductId,
              },
            }
          : {}),
      },
    });

  if (existingProduct) {
    slug = `${baseSlug}-${Date.now()}`;
  }

  return slug;
}

// ======================================================
// GENERATE PRODUCT CODE
// ======================================================
//
// القاعدة:
//
// رمز المنتج = رمز التصنيف + رقم تسلسلي
//
// مثال:
//
// H   → H1, H2, H3
// AB  → AB1, AB2, AB3
// K   → K1, K2, K3
// CC5 → CC51, CC52, CC53
//
// التسلسل مستقل لكل تصنيف.
//
// إذا حذفنا CC52:
//
// CC51
// CC53
//
// المنتج الجديد سيكون:
//
// CC54
//
// ولن يتم إعادة استخدام CC52.
// ======================================================

async function generateProductCode(
  categoryId: string,
) {
  // ====================================================
  // GET CATEGORY
  // ====================================================

  const category =
    await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
      select: {
        code: true,
      },
    });

  if (!category) {
    throw new Error(
      "التصنيف غير موجود",
    );
  }

  if (!category.code) {
    throw new Error(
      "رمز التصنيف غير موجود",
    );
  }

  const prefix = category.code;

  // ====================================================
  // GET PRODUCTS OF SAME CATEGORY
  // ====================================================

  const products =
    await prisma.product.findMany({
      where: {
        categoryId,

        productCode: {
          startsWith: prefix,
        },
      },

      select: {
        productCode: true,
      },
    });

  // ====================================================
  // FIND HIGHEST NUMBER
  // ====================================================

  let highestNumber = 0;

  const escapedPrefix =
    prefix.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );

  const codeRegex =
    new RegExp(
      `^${escapedPrefix}(\\d+)$`,
    );

  for (const product of products) {
    if (!product.productCode) {
      continue;
    }

    const match =
      product.productCode.match(
        codeRegex,
      );

    if (!match) {
      continue;
    }

    const number =
      Number(match[1]);

    if (
      Number.isInteger(number) &&
      number > highestNumber
    ) {
      highestNumber = number;
    }
  }

  // ====================================================
  // NEXT NUMBER
  // ====================================================

  const nextNumber =
    highestNumber + 1;

  return `${prefix}${nextNumber}`;
}

// ======================================================
// PARSE BOOLEAN
// ======================================================

function parseBoolean(
  value: FormDataEntryValue | null,
) {
  if (value === null) {
    return false;
  }

  const normalized = String(value)
    .toLowerCase()
    .trim();

  return (
    normalized === "true" ||
    normalized === "1" ||
    normalized === "on" ||
    normalized === "yes"
  );
}

// ======================================================
// PARSE JSON ARRAY
// ======================================================

function parseStringArray(
  formData: FormData,
  key: string,
): string[] {
  const raw = formData.get(key);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(
      String(raw),
    );

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => String(item))
      .filter(Boolean);
  } catch {
    throw new Error(
      `بيانات ${key} غير صالحة`,
    );
  }
}

// ======================================================
// PARSE VARIANTS
// ======================================================

function parseVariants(
  formData: FormData,
): VariantInput[] {
  const rawVariants =
    formData.get("variants");

  if (!rawVariants) {
    return [];
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(
      String(rawVariants),
    );
  } catch {
    throw new Error(
      "بيانات تنويعات المنتج غير صالحة",
    );
  }

  if (!Array.isArray(parsed)) {
    throw new Error(
      "تنويعات المنتج غير صالحة",
    );
  }

  return parsed.map(
    (variant, index) => {
      if (
        !variant ||
        typeof variant !== "object"
      ) {
        throw new Error(
          `بيانات التنويع رقم ${
            index + 1
          } غير صالحة`,
        );
      }

      const item =
        variant as Record<
          string,
          unknown
        >;

      const sizeType =
        String(
          item.sizeType || "NONE",
        ) as VariantInput["sizeType"];

      if (
        ![
          "NONE",
          "LETTER",
          "NUMBER",
        ].includes(sizeType)
      ) {
        throw new Error(
          `نوع القياس في التنويع رقم ${
            index + 1
          } غير صالح`,
        );
      }

      let size:
        | string
        | null =
        item.size === null ||
        item.size === undefined
          ? null
          : String(
              item.size,
            ).trim();

      let color:
        | string
        | null =
        item.color === null ||
        item.color === undefined
          ? null
          : String(
              item.color,
            ).trim();

      if (sizeType === "NONE") {
        size = null;
      }

      if (color === "") {
        color = null;
      }

      const stock = Number(
        item.stock ?? 0,
      );

      if (
        !Number.isInteger(stock) ||
        stock < 0
      ) {
        throw new Error(
          `مخزون التنويع رقم ${
            index + 1
          } غير صالح`,
        );
      }

      if (
        sizeType !== "NONE" &&
        !size
      ) {
        throw new Error(
          `يجب تحديد القياس في التنويع رقم ${
            index + 1
          }`,
        );
      }

      if (!color) {
        throw new Error(
          `يجب تحديد اللون في التنويع رقم ${
            index + 1
          }`,
        );
      }

      return {
        sizeType,
        size,
        color,
        stock,
      };
    },
  );
}

// ======================================================
// VALIDATE VARIANTS
// ======================================================

function validateVariants(
  variants: VariantInput[],
) {
  if (variants.length === 0) {
    throw new Error(
      "يجب إضافة تنويع واحد على الأقل للمنتج",
    );
  }

  const combinations =
    new Set();

  for (
    let index = 0;
    index < variants.length;
    index++
  ) {
    const variant =
      variants[index];

    const key = [
      variant.sizeType,
      variant.size ?? "",
      variant.color ?? "",
    ]
      .join("|")
      .toLowerCase();

    if (
      combinations.has(key)
    ) {
      throw new Error(
        `تم تكرار نفس القياس واللون في التنويع رقم ${
          index + 1
        }`,
      );
    }

    combinations.add(key);
  }

  return variants;
}

// ======================================================
// UPLOAD SINGLE IMAGE
// ======================================================

async function uploadImage(
  file: File,
): Promise<UploadedImage> {
  const uploaded = await uploadToCloudinary(file);

  return {
    url: uploaded,
    publicId: null,
  };
}

// ======================================================
// GET IMAGE FILES
// ======================================================

function getImageFiles(
  formData: FormData,
): File[] {
  const files =
    formData.getAll("images");

  return files.filter(
    (item): item is File =>
      item instanceof File &&
      item.size > 0,
  );
}

// ======================================================
// CREATE PRODUCT
// ======================================================

export async function createProduct(
  formData: FormData,
) {
  try {
    const name = String(
      formData.get("name") || "",
    ).trim();

    const categoryId = String(
      formData.get("categoryId") || "",
    ).trim();

    const description = String(
      formData.get("description") || "",
    ).trim();

    const price = Number(
      formData.get("price") || 0,
    );

    const oldPriceValue =
      String(
        formData.get("oldPrice") || "",
      ).trim();

    const oldPrice =
      oldPriceValue === ""
        ? null
        : Number(oldPriceValue);

    const discountValue =
      String(
        formData.get(
          "discountPercent",
        ) || "",
      ).trim();

    const discountPercent =
      discountValue === ""
        ? null
        : Number(discountValue);

    const isActive =
      parseBoolean(
        formData.get("isActive"),
      );

    const isFeatured =
      parseBoolean(
        formData.get("isFeatured"),
      );

    const isNew =
      parseBoolean(
        formData.get("isNew"),
      );

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!name) {
      throw new Error(
        "اسم المنتج مطلوب",
      );
    }

    if (!categoryId) {
      throw new Error(
        "يجب اختيار التصنيف",
      );
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      throw new Error(
        "السعر غير صالح",
      );
    }

    if (
      oldPrice !== null &&
      (!Number.isFinite(oldPrice) ||
        oldPrice < 0)
    ) {
      throw new Error(
        "السعر القديم غير صالح",
      );
    }

    if (
      discountPercent !== null &&
      (!Number.isFinite(
        discountPercent,
      ) ||
        discountPercent < 0 ||
        discountPercent > 100)
    ) {
      throw new Error(
        "نسبة الخصم غير صالحة",
      );
    }

    // ==================================================
    // CATEGORY
    // ==================================================

    const category =
      await prisma.category.findUnique(
        {
          where: {
            id: categoryId,
          },
        },
      );

    if (!category) {
      throw new Error(
        "التصنيف غير موجود",
      );
    }

    // ==================================================
    // SLUG
    // ==================================================

    const slug =
      await generateUniqueSlug(
        name,
      );

    // ==================================================
    // PRODUCT CODE
    // ==================================================

    const productCode =
      await generateProductCode(
        category.id,
      );

    // ==================================================
    // VARIANTS
    // ==================================================

    const variants =
      validateVariants(
        parseVariants(formData),
      );

    // ==================================================
    // IMAGES
    // ==================================================

    const imageFiles =
      getImageFiles(formData);

    if (
      imageFiles.length === 0
    ) {
      throw new Error(
        "يجب إضافة صورة واحدة على الأقل للمنتج",
      );
    }

    const imageIndexValue =
      Number(
        formData.get(
          "imageIndex",
        ) || 0,
      );

    const imageIndex =
      Number.isInteger(
        imageIndexValue,
      ) &&
      imageIndexValue >= 0 &&
      imageIndexValue <
        imageFiles.length
        ? imageIndexValue
        : 0;

    // ==================================================
    // UPLOAD IMAGES
    // ==================================================

    const uploadedImages:
      UploadedImage[] = [];

    for (
      const file of imageFiles
    ) {
      const uploaded =
        await uploadImage(file);

      uploadedImages.push(
        uploaded,
      );
    }

    const mainImage =
      uploadedImages[imageIndex];

    if (!mainImage) {
      throw new Error(
        "تعذر تحديد الصورة الرئيسية",
      );
    }

    // ==================================================
    // STOCK
    // ==================================================

    const totalStock =
      variants.reduce(
        (total, variant) =>
          total + variant.stock,
        0,
      );

    // ==================================================
    // CREATE
    // ==================================================

    await prisma.product.create({
      data: {
        productCode,
        name,
        slug,
        description:
          description || null,
        price,
        oldPrice,
        stock: totalStock,
        image: mainImage.url,
        discountPercent,
        isActive,
        isFeatured,
        isNew,
        categoryId,

        images: {
          create:
            uploadedImages.map(
              (
                uploaded,
                index,
              ) => ({
                url:
                  uploaded.url,
                publicId:
                  uploaded.publicId,
                sortOrder:
                  index ===
                  imageIndex
                    ? 0
                    : index <
                        imageIndex
                      ? index + 1
                      : index,
              }),
            ),
        },

        variants: {
          create:
            variants.map(
              (variant) => ({
                sizeType:
                  variant.sizeType,
                size:
                  variant.size,
                color:
                  variant.color,
                stock:
                  variant.stock,
              }),
            ),
        },
      },
    });

    revalidatePath(
      "/admin/products",
    );

    revalidatePath("/");

    console.log(
      "✅ Product created successfully:",
      name,
      "| Code:",
      productCode,
    );
  } catch (error) {
    console.error(
      "❌ createProduct error:",
      error,
    );

    throw new Error(
      error instanceof Error
        ? error.message
        : "حدث خطأ أثناء إنشاء المنتج",
    );
  }

  redirect(
    "/admin/products",
  );
}

// ======================================================
// UPDATE PRODUCT
// ======================================================

export async function updateProduct(
  id: string,
  formData: FormData,
) {
  try {
    if (!id) {
      throw new Error(
        "معرف المنتج غير موجود",
      );
    }

    const name = String(
      formData.get("name") || "",
    ).trim();

    const categoryId = String(
      formData.get("categoryId") || "",
    ).trim();

    const description = String(
      formData.get("description") || "",
    ).trim();

    const price = Number(
      formData.get("price") || 0,
    );

    const oldPriceValue =
      String(
        formData.get("oldPrice") || "",
      ).trim();

    const oldPrice =
      oldPriceValue === ""
        ? null
        : Number(oldPriceValue);

    const discountValue =
      String(
        formData.get(
          "discountPercent",
        ) || "",
      ).trim();

    const discountPercent =
      discountValue === ""
        ? null
        : Number(discountValue);

    const isActive =
      parseBoolean(
        formData.get("isActive"),
      );

    const isFeatured =
      parseBoolean(
        formData.get("isFeatured"),
      );

    const isNew =
      parseBoolean(
        formData.get("isNew"),
      );

    if (!name) {
      throw new Error(
        "اسم المنتج مطلوب",
      );
    }

    if (!categoryId) {
      throw new Error(
        "يجب اختيار التصنيف",
      );
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      throw new Error(
        "السعر غير صالح",
      );
    }

    if (
      oldPrice !== null &&
      (!Number.isFinite(oldPrice) ||
        oldPrice < 0)
    ) {
      throw new Error(
        "السعر القديم غير صالح",
      );
    }

    if (
      discountPercent !== null &&
      (!Number.isFinite(
        discountPercent,
      ) ||
        discountPercent < 0 ||
        discountPercent > 100)
    ) {
      throw new Error(
        "نسبة الخصم غير صالحة",
      );
    }

    // ==================================================
    // VARIANTS
    // ==================================================

    const variants =
      validateVariants(
        parseVariants(formData),
      );

    // ==================================================
    // EXISTING PRODUCT
    // ==================================================

    const existingProduct =
      await prisma.product.findUnique(
        {
          where: {
            id,
          },

          include: {
            images: {
              orderBy: {
                sortOrder:
                  "asc",
              },
            },
          },
        },
      );

    if (!existingProduct) {
      throw new Error(
        "المنتج غير موجود",
      );
    }

    // ==================================================
    // CATEGORY
    // ==================================================

    const category =
      await prisma.category.findUnique(
        {
          where: {
            id: categoryId,
          },
        },
      );

    if (!category) {
      throw new Error(
        "التصنيف غير موجود",
      );
    }

    // ==================================================
    // PRODUCT CODE
    // ==================================================

    let productCode =
      existingProduct.productCode;

    if (
      existingProduct.categoryId !==
      categoryId
    ) {
      productCode =
        await generateProductCode(
          category.id,
        );
    }

    // ==================================================
    // SLUG
    // ==================================================

    let slug =
      existingProduct.slug;

    if (
      existingProduct.name !==
      name
    ) {
      slug =
        await generateUniqueSlug(
          name,
          id,
        );
    }

    // ==================================================
    // IMAGES
    // ==================================================

    const deletedImageIds =
      parseStringArray(
        formData,
        "deletedImageIds",
      );

    const mainImageIdRaw =
      formData.get(
        "mainImageId",
      );

    const mainImageId =
      mainImageIdRaw
        ? String(
            mainImageIdRaw,
          ).trim()
        : null;

    const newImages =
      getImageFiles(formData);

    const deletedSet =
      new Set(
        deletedImageIds,
      );

    const remainingImages =
      existingProduct.images.filter(
        (image) =>
          !deletedSet.has(
            image.id,
          ),
      );

    const newMainImageIndexRaw =
      Number(
        formData.get(
          "newMainImageIndex",
        ) ?? -1,
      );

    const hasNewMainImage =
      Number.isInteger(
        newMainImageIndexRaw,
      ) &&
      newMainImageIndexRaw >=
        0 &&
      newMainImageIndexRaw <
        newImages.length;

    if (
      remainingImages.length ===
        0 &&
      newImages.length === 0
    ) {
      throw new Error(
        "يجب أن يحتوي المنتج على صورة واحدة على الأقل",
      );
    }

    const requestedMainExisting =
      mainImageId
        ? remainingImages.find(
            (image) =>
              image.id ===
              mainImageId,
          )
        : null;

    // ==================================================
    // UPLOAD NEW IMAGES
    // ==================================================

    const uploadedNewImages:
      UploadedImage[] = [];

    for (
      const file of newImages
    ) {
      const uploaded =
        await uploadImage(file);

      uploadedNewImages.push(
        uploaded,
      );
    }

    // ==================================================
    // DETERMINE MAIN IMAGE
    // ==================================================

    let finalMainUrl =
      existingProduct.image;

    let mainComesFromNewImage =
      false;

    if (
      hasNewMainImage
    ) {
      const uploadedMain =
        uploadedNewImages[
          newMainImageIndexRaw
        ];

      if (!uploadedMain) {
        throw new Error(
          "تعذر تحديد الصورة الجديدة الرئيسية",
        );
      }

      finalMainUrl =
        uploadedMain.url;

      mainComesFromNewImage =
        true;
    } else if (
      requestedMainExisting
    ) {
      finalMainUrl =
        requestedMainExisting.url;
    } else {
      const currentMain =
        remainingImages.find(
          (image) =>
            image.sortOrder ===
            0,
        );

      if (currentMain) {
        finalMainUrl =
          currentMain.url;
      } else if (
        remainingImages.length >
        0
      ) {
        finalMainUrl =
          remainingImages[0].url;
      } else if (
        uploadedNewImages.length >
        0
      ) {
        finalMainUrl =
          uploadedNewImages[0].url;

        mainComesFromNewImage =
          true;
      }
    }

    // ==================================================
    // STOCK
    // ==================================================

    const totalStock =
      variants.reduce(
        (total, variant) =>
          total + variant.stock,
        0,
      );

    // ==================================================
    // DATABASE TRANSACTION
    // ==================================================

    await prisma.$transaction(
      async (tx) => {
        await tx.product.update({
          where: {
            id,
          },

          data: {
            productCode,
            name,
            slug,
            categoryId,
            description:
              description || null,
            price,
            oldPrice,
            stock: totalStock,
            discountPercent,
            isActive,
            isFeatured,
            isNew,
            image:
              finalMainUrl,
          },
        });

        // ============================================
        // DELETE IMAGES
        // ============================================

        if (
          deletedImageIds.length >
          0
        ) {
          await tx.productImage.deleteMany(
            {
              where: {
                productId: id,
                id: {
                  in: deletedImageIds,
                },
              },
            },
          );
        }

        // ============================================
        // TEMPORARY ORDER
        // ============================================

        for (
          const image of remainingImages
        ) {
          await tx.productImage.update(
            {
              where: {
                id: image.id,
              },

              data: {
                sortOrder:
                  999999,
              },
            },
          );
        }

        // ============================================
        // CREATE NEW IMAGES
        // ============================================

        for (
          const uploaded of uploadedNewImages
        ) {
          await tx.productImage.create(
            {
              data: {
                productId:
                  id,
                url:
                  uploaded.url,
                publicId:
                  uploaded.publicId,
                sortOrder:
                  999999,
              },
            },
          );
        }

        // ============================================
        // GET ALL IMAGES
        // ============================================

        const allImages =
          await tx.productImage.findMany(
            {
              where: {
                productId: id,
              },
            },
          );

        // ============================================
        // FIND MAIN IMAGE
        // ============================================

        let mainRecord:
          | (typeof allImages)[number]
          | undefined;

        if (
          mainComesFromNewImage &&
          hasNewMainImage
        ) {
          const uploadedMain =
            uploadedNewImages[
              newMainImageIndexRaw
            ];

          mainRecord =
            allImages.find(
              (image) =>
                image.url ===
                uploadedMain.url,
            );
        }

        if (
          !mainRecord &&
          mainImageId
        ) {
          mainRecord =
            allImages.find(
              (image) =>
                image.id ===
                mainImageId,
            );
        }

        if (!mainRecord) {
          mainRecord =
            allImages.find(
              (image) =>
                image.url ===
                existingProduct.image,
            );
        }

        if (!mainRecord) {
          mainRecord =
            allImages[0];
        }

        if (!mainRecord) {
          throw new Error(
            "تعذر تحديد الصورة الرئيسية",
          );
        }

        // ============================================
        // SORT IMAGES
        // ============================================

        const otherImages =
          allImages.filter(
            (image) =>
              image.id !==
              mainRecord!.id,
          );

        await tx.productImage.update(
          {
            where: {
              id: mainRecord.id,
            },

            data: {
              sortOrder: 0,
            },
          },
        );

        for (
          let index = 0;
          index <
          otherImages.length;
          index++
        ) {
          await tx.productImage.update(
            {
              where: {
                id:
                  otherImages[
                    index
                  ].id,
              },

              data: {
                sortOrder:
                  index + 1,
              },
            },
          );
        }

        // ============================================
        // UPDATE MAIN IMAGE
        // ============================================

        await tx.product.update({
          where: {
            id,
          },

          data: {
            image:
              mainRecord.url,
          },
        });

        // ============================================
        // VARIANTS
        // ============================================

        await tx.productVariant.deleteMany(
          {
            where: {
              productId: id,
            },
          },
        );

        await tx.productVariant.createMany(
          {
            data: variants.map(
              (variant) => ({
                productId: id,
                sizeType:
                  variant.sizeType,
                size:
                  variant.size,
                color:
                  variant.color,
                stock:
                  variant.stock,
              }),
            ),
          },
        );
      },
    );

    // ==================================================
    // CACHE
    // ==================================================

    revalidatePath(
      "/admin/products",
    );

    revalidatePath(
      `/admin/products/edit/${id}`,
    );

    revalidatePath("/");

    console.log(
      "✅ Product updated successfully:",
      id,
      "| Code:",
      productCode,
    );
  } catch (error) {
    console.error(
      "❌ updateProduct error:",
      error,
    );

    throw new Error(
      error instanceof Error
        ? error.message
        : "حدث خطأ أثناء تعديل المنتج",
    );
  }

  redirect(
    "/admin/products",
  );
}

// ======================================================
// DELETE PRODUCT
// ======================================================

export async function deleteProduct(
  formData: FormData,
) {
  const id = String(
    formData.get("id") || "",
  ).trim();

  try {
    // ==================================================
    // VALIDATION
    // ==================================================

    if (!id) {
      throw new Error(
        "معرف المنتج غير موجود",
      );
    }

    // ==================================================
    // GET PRODUCT
    // ==================================================

    const product =
      await prisma.product.findUnique({
        where: {
          id,
        },

        include: {
          images: true,
        },
      });

    if (!product) {
      throw new Error(
        "المنتج غير موجود",
      );
    }

    // ==================================================
    // DELETE DATABASE RECORDS
    // ==================================================

    await prisma.$transaction(
      async (tx) => {
        // ----------------------------------------------
        // DELETE IMAGES
        // ----------------------------------------------

        await tx.productImage.deleteMany({
          where: {
            productId: id,
          },
        });

        // ----------------------------------------------
        // DELETE VARIANTS
        // ----------------------------------------------

        await tx.productVariant.deleteMany({
          where: {
            productId: id,
          },
        });

        // ----------------------------------------------
        // DELETE PRODUCT
        // ----------------------------------------------

        await tx.product.delete({
          where: {
            id,
          },
        });
      },
    );

    // ==================================================
    // CACHE
    // ==================================================

    revalidatePath(
      "/admin/products",
    );

    revalidatePath("/");

    console.log(
      "✅ Product deleted successfully:",
      id,
      "| Code:",
      product.productCode,
    );
  } catch (error) {
    console.error(
      "❌ deleteProduct error:",
      error,
    );

    throw new Error(
      error instanceof Error
        ? error.message
        : "حدث خطأ أثناء حذف المنتج",
    );
  }

  // ==================================================
  // REDIRECT
  // ==================================================

  redirect(
    "/admin/products",
  );
}