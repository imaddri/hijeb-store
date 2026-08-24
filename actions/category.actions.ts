"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ======================================================
// GENERATE SLUG
// ======================================================

function generateSlug(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\u0600-\u06FF-]/g, "") ||
    `category-${Date.now()}`
  );
}

// ======================================================
// GENERATE UNIQUE SLUG
// ======================================================

async function generateUniqueSlug(
  name: string,
  currentCategoryId?: string,
) {
  const baseSlug = generateSlug(name);

  let slug = baseSlug;

  const existingCategory =
    await prisma.category.findFirst({
      where: {
        slug,

        ...(currentCategoryId
          ? {
              NOT: {
                id: currentCategoryId,
              },
            }
          : {}),
      },
    });

  if (existingCategory) {
    slug = `${baseSlug}-${Date.now()}`;
  }

  return slug;
}

// ======================================================
// GENERATE CATEGORY CODE
// ======================================================
//
// الشكل:
// CC1
// CC2
// CC3
// CC4
//
// الحروف دائمًا إنجليزية
// والأرقام دائمًا في النهاية
//
// ======================================================

async function generateCategoryCode(
  currentCategoryId?: string,
) {
  const prefix = "CC";

  const lastCategory =
    await prisma.category.findFirst({
      where: {
        code: {
          startsWith: prefix,
        },

        ...(currentCategoryId
          ? {
              NOT: {
                id: currentCategoryId,
              },
            }
          : {}),
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  let nextNumber = 1;

  if (lastCategory?.code) {
    const match =
      lastCategory.code.match(
        /^CC(\d+)$/,
      );

    if (match) {
      nextNumber =
        Number(match[1]) + 1;
    }
  }

  return `${prefix}${nextNumber}`;
}

// ======================================================
// CREATE CATEGORY
// ======================================================

export async function createCategory(
  formData: FormData,
) {
  try {
    // ==================================================
    // GET NAME
    // ==================================================

    const name = String(
      formData.get("name") || "",
    ).trim();

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!name) {
      throw new Error(
        "اسم التصنيف مطلوب",
      );
    }

    if (name.length < 2) {
      throw new Error(
        "اسم التصنيف يجب أن يحتوي على حرفين على الأقل",
      );
    }

    // ==================================================
    // CHECK DUPLICATE NAME
    // ==================================================

    const existingCategory =
      await prisma.category.findFirst({
        where: {
          name: {
            equals: name,
            mode: "insensitive",
          },
        },
      });

    if (existingCategory) {
      throw new Error(
        "هذا التصنيف موجود بالفعل",
      );
    }

    // ==================================================
    // GENERATE SLUG
    // ==================================================

    const slug =
      await generateUniqueSlug(name);

    // ==================================================
    // GENERATE CODE
    // ==================================================

    const code =
      await generateCategoryCode();

    // ==================================================
    // CREATE
    // ==================================================

    const category =
      await prisma.category.create({
        data: {
          name,
          slug,
          code,
        },
      });

    // ==================================================
    // CACHE
    // ==================================================

    revalidatePath(
      "/admin/categories",
    );

    revalidatePath(
      "/admin/products",
    );

    revalidatePath("/");

    console.log(
      "✅ Category created successfully:",
      category.name,
      "| Code:",
      category.code,
    );

    // ==================================================
    // RETURN RESULT
    // ==================================================

    return {
      success: true,
      message:
        "تمت إضافة التصنيف بنجاح",

      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        code: category.code,
      },
    };
  } catch (error) {
    console.error(
      "❌ createCategory error:",
      error,
    );

    throw new Error(
      error instanceof Error
        ? error.message
        : "حدث خطأ أثناء إنشاء التصنيف",
    );
  }
}

// ======================================================
// UPDATE CATEGORY
// ======================================================

export async function updateCategory(
  id: string,
  formData: FormData,
) {
  try {
    // ==================================================
    // VALIDATION
    // ==================================================

    if (!id) {
      throw new Error(
        "معرف التصنيف غير موجود",
      );
    }

    const name = String(
      formData.get("name") || "",
    ).trim();

    if (!name) {
      throw new Error(
        "اسم التصنيف مطلوب",
      );
    }

    if (name.length < 2) {
      throw new Error(
        "اسم التصنيف يجب أن يحتوي على حرفين على الأقل",
      );
    }

    // ==================================================
    // GET CURRENT CATEGORY
    // ==================================================

    const existingCategory =
      await prisma.category.findUnique({
        where: {
          id,
        },
      });

    if (!existingCategory) {
      throw new Error(
        "التصنيف غير موجود",
      );
    }

    // ==================================================
    // CHECK DUPLICATE NAME
    // ==================================================

    const duplicateCategory =
      await prisma.category.findFirst({
        where: {
          name: {
            equals: name,
            mode: "insensitive",
          },

          NOT: {
            id,
          },
        },
      });

    if (duplicateCategory) {
      throw new Error(
        "هذا التصنيف موجود بالفعل",
      );
    }

    // ==================================================
    // GENERATE SLUG
    // ==================================================

    let slug =
      existingCategory.slug;

    if (
      existingCategory.name.toLowerCase() !==
      name.toLowerCase()
    ) {
      slug =
        await generateUniqueSlug(
          name,
          id,
        );
    }

    // ==================================================
    // UPDATE
    // ==================================================

    await prisma.category.update({
      where: {
        id,
      },

      data: {
        name,
        slug,
      },
    });

    // ==================================================
    // CACHE
    // ==================================================

    revalidatePath(
      "/admin/categories",
    );

    revalidatePath(
      `/admin/categories/edit/${id}`,
    );

    revalidatePath(
      "/admin/products",
    );

    revalidatePath("/");

    console.log(
      "✅ Category updated successfully:",
      id,
    );
  } catch (error) {
    console.error(
      "❌ updateCategory error:",
      error,
    );

    throw new Error(
      error instanceof Error
        ? error.message
        : "حدث خطأ أثناء تعديل التصنيف",
    );
  }

  // ==================================================
  // REDIRECT AFTER UPDATE
  // ==================================================

  redirect("/admin/categories");
}

// ======================================================
// DELETE CATEGORY
// ======================================================

export async function deleteCategory(
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
        "معرف التصنيف غير موجود",
      );
    }

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

    if (!category) {
      throw new Error(
        "التصنيف غير موجود",
      );
    }

    // ==================================================
    // CHECK PRODUCTS
    // ==================================================

    if (
      category._count.products > 0
    ) {
      throw new Error(
        `لا يمكن حذف التصنيف "${category.name}" لأنه مرتبط بـ ${category._count.products} منتج.`,
      );
    }

    // ==================================================
    // DELETE
    // ==================================================

    await prisma.category.delete({
      where: {
        id,
      },
    });

    // ==================================================
    // CACHE
    // ==================================================

    revalidatePath(
      "/admin/categories",
    );

    revalidatePath(
      "/admin/products",
    );

    revalidatePath("/");

    console.log(
      "✅ Category deleted successfully:",
      id,
    );
  } catch (error) {
    console.error(
      "❌ deleteCategory error:",
      error,
    );

    throw new Error(
      error instanceof Error
        ? error.message
        : "حدث خطأ أثناء حذف التصنيف",
    );
  }

  // ==================================================
  // REDIRECT AFTER DELETE
  // ==================================================

  
}