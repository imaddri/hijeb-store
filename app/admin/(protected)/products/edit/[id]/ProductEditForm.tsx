"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { updateProduct } from "@/actions/product.actions";

// ======================================================
// TYPES
// ======================================================

type Category = {
  id: string;
  name: string;
};

type SizeType =
  | "NONE"
  | "LETTER"
  | "NUMBER"
  | "COMBINED";

type Variant = {
  id: string;
  sizeType: SizeType;
  size: string;
  color: string;
  stock: number;
};

type ExistingImage = {
  id: string;
  url: string;
  publicId: string | null;
  sortOrder: number;
};

type NewImage = {
  id: string;
  file: File;
  preview: string;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice: number | null;
  discountPercent: number | null;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  categoryId: string;
  image: string;
  variants: Variant[];
  images: ExistingImage[];
};

type ProductEditFormProps = {
  product: Product;
  categories: Category[];
};

// ======================================================
// CONSTANTS
// ======================================================

const LETTER_SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
];

const NUMBER_SIZES = [
  "34",
  "36",
  "38",
  "40",
  "42",
  "44",
  "46",
  "48",
  "50",
  "52",
  "54",
  "56",
  "58",
  "60",
];

const COMBINED_SIZES = [
  "38/40/42-1",
  "44/46/48-2",
  "50/52/54-3",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
];

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

const MAX_IMAGE_SIZE =
  5 * 1024 * 1024;

// ======================================================
// COMPONENT
// ======================================================

export default function ProductEditForm({
  product,
  categories,
}: ProductEditFormProps) {
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  // ====================================================
  // BASIC DATA
  // ====================================================

  const [name, setName] =
    useState(product.name);

  const [description, setDescription] =
    useState(product.description);

  const [categoryId, setCategoryId] =
    useState(product.categoryId);

  const [price, setPrice] =
    useState(String(product.price));

  const [oldPrice, setOldPrice] =
    useState(
      product.oldPrice !== null
        ? String(product.oldPrice)
        : "",
    );

  const [discountPercent, setDiscountPercent] =
    useState(
      product.discountPercent !== null
        ? String(
            product.discountPercent,
          )
        : "",
    );

  // ====================================================
  // SETTINGS
  // ====================================================

  const [isActive, setIsActive] =
    useState(product.isActive);

  const [isFeatured, setIsFeatured] =
    useState(product.isFeatured);

  const [isNew, setIsNew] =
    useState(product.isNew);

  // ====================================================
  // SIZE TYPE
  // ====================================================

  /*
   * مهم:
   *
   * لا نعتمد فقط على product.variants[0].sizeType
   *
   * لأن المنتجات القديمة قد تحتوي على قياسات مركبة
   * ولكن sizeType محفوظ بطريقة قديمة أو غير صحيحة.
   *
   * لذلك نتحقق أولاً:
   *
   * 1. هل يوجد COMBINED صراحة؟
   *
   * 2. هل القياس نفسه موجود داخل COMBINED_SIZES؟
   *
   * 3. هل القياس يحتوي "/" مثل:
   *    38/40/42-1
   *
   * إذا وجدنا ذلك نفتح COMBINED تلقائياً.
   */

  const initialSizeType: SizeType =
    product.variants.length > 0
      ? (() => {
          const hasExplicitCombined =
            product.variants.some(
              (variant) =>
                variant.sizeType ===
                "COMBINED",
            );

          if (hasExplicitCombined) {
            return "COMBINED";
          }

          const hasCombinedSize =
            product.variants.some(
              (variant) =>
                variant.size &&
                (
                  COMBINED_SIZES.includes(
                    variant.size,
                  ) ||
                  variant.size.includes(
                    "/",
                  )
                ),
            );

          if (hasCombinedSize) {
            return "COMBINED";
          }

          return product.variants[0]
            .sizeType;
        })()
      : "NONE";

  const [sizeType, setSizeType] =
    useState<SizeType>(
      initialSizeType,
    );

  // ====================================================
  // SELECTED SIZES
  // ====================================================

  /*
   * نحتفظ بكل القياسات الموجودة فعلياً
   * في المنتج حتى تظهر باللون الأخضر
   * عند فتح صفحة التعديل.
   */

  const initialSizes = useMemo(() => {
    return Array.from(
      new Set(
        product.variants
          .filter(
            (variant) =>
              variant.sizeType !==
                "NONE" &&
              variant.size,
          )
          .map(
            (variant) =>
              variant.size,
          ),
      ),
    );
  }, [product.variants]);

  const [selectedSizes, setSelectedSizes] =
    useState<string[]>(
      initialSizes,
    );

  // ====================================================
  // SELECTED SIZES BY TYPE
  // ====================================================

  const [selectedSizesByType, setSelectedSizesByType] =
    useState<Record<SizeType, string[]>>({
      NONE: [],
      LETTER:
        initialSizeType === "LETTER"
          ? initialSizes
          : [],
      NUMBER:
        initialSizeType === "NUMBER"
          ? initialSizes
          : [],
      COMBINED:
        initialSizeType === "COMBINED"
          ? initialSizes
          : [],
    });

  // ====================================================
  // COLORS
  // ====================================================

  const initialColors = useMemo(() => {
    return Array.from(
      new Set(
        product.variants
          .map(
            (variant) =>
              variant.color,
          )
          .filter(Boolean),
      ),
    );
  }, [product.variants]);

  const [colors, setColors] =
    useState<string[]>(
      initialColors,
    );

  const [colorInput, setColorInput] =
    useState("");

  // ====================================================
  // VARIANTS
  // ====================================================

  const [variants, setVariants] =
    useState<Variant[]>(
      product.variants,
    );

  // ====================================================
  // DELETED VARIANTS
  // ====================================================

  const [deletedVariantKeys, setDeletedVariantKeys] =
    useState<string[]>([]);

  // ====================================================
  // IMAGES
  // ====================================================

  const [existingImages, setExistingImages] =
    useState<ExistingImage[]>(
      [...product.images].sort(
        (a, b) =>
          a.sortOrder -
          b.sortOrder,
      ),
    );

  const [deletedImageIds, setDeletedImageIds] =
    useState<string[]>([]);

  const [newImages, setNewImages] =
    useState<NewImage[]>([]);

  /*
   * إذا كانت الصورة الرئيسية الحالية
   * موجودة في الصور القديمة:
   *
   * mainImageId = id
   *
   * وإذا كانت صورة جديدة:
   *
   * newMainImageIndex = index
   */

  const [mainImageId, setMainImageId] =
    useState<string | null>(() => {
      const main =
        product.images.find(
          (image) =>
            image.sortOrder === 0,
        );

      return main?.id ?? null;
    });

  const [newMainImageIndex, setNewMainImageIndex] =
    useState<number>(-1);

  // ====================================================
  // CLEANUP NEW IMAGE PREVIEWS
  // ====================================================

  useEffect(() => {
    return () => {
      newImages.forEach(
        (image) => {
          URL.revokeObjectURL(
            image.preview,
          );
        },
      );
    };
  }, []);

  // ====================================================
  // ERROR
  // ====================================================

  function showError(
    message: string,
  ) {
    setError(message);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ====================================================
  // SIZE TYPE CHANGE
  // ====================================================

  function handleSizeTypeChange(
    type: SizeType,
  ) {
    setSizeType(type);

    setSelectedSizes(
      selectedSizesByType[type] ?? [],
    );

    setError("");
  }

  // ====================================================
  // SIZE SELECTION
  // ====================================================

  function toggleSize(
    size: string,
  ) {
    setSelectedSizes(
      (current) => {
        const updated =
          current.includes(size)
            ? current.filter(
                (item) =>
                  item !== size,
              )
            : [
                ...current,
                size,
              ];

        setSelectedSizesByType(
          (allTypes) => ({
            ...allTypes,
            [sizeType]: updated,
          }),
        );

        return updated;
      },
    );

    setError("");
  }

  // ====================================================
  // ADD COLOR
  // ====================================================

  function addColor() {
    const color =
      colorInput.trim();

    if (!color) {
      return;
    }

    const exists =
      colors.some(
        (item) =>
          item.toLowerCase() ===
          color.toLowerCase(),
      );

    if (exists) {
      showError(
        "هذا اللون تمت إضافته مسبقًا",
      );

      return;
    }

    setColors((current) => [
      ...current,
      color,
    ]);

    setColorInput("");

    setError("");
  }

  // ====================================================
  // ENTER KEY
  // ====================================================

  function handleColorKeyDown(
    event: React.KeyboardEvent,
  ) {
    if (
      event.key === "Enter"
    ) {
      event.preventDefault();

      addColor();
    }
  }

  // ====================================================
  // REMOVE COLOR
  // ====================================================

  function removeColor(
    color: string,
  ) {
    setColors((current) =>
      current.filter(
        (item) =>
          item !== color,
      ),
    );

    setVariants((current) => {
      const removedVariants =
        current.filter(
          (variant) =>
            variant.color !==
            color,
        );

      current
        .filter(
          (variant) =>
            variant.color ===
            color,
        )
        .forEach(
          (variant) => {
            const key =
              getVariantKey(
                variant,
              );

            setDeletedVariantKeys(
              (deleted) =>
                deleted.includes(
                  key,
                )
                  ? deleted
                  : [
                      ...deleted,
                      key,
                    ],
            );
          },
        );

      return removedVariants;
    });
  }

  // ====================================================
  // VARIANT KEY
  // ====================================================

  function getVariantKey(
    variant: {
      sizeType: SizeType;
      size: string;
      color: string;
    },
  ) {
    const normalizedSizeType =
      variant.sizeType ===
      "COMBINED"
        ? "NUMBER"
        : variant.sizeType;

    return [
      normalizedSizeType,
      variant.size.trim(),
      variant.color
        .trim()
        .toLowerCase(),
    ].join("|");
  }

  // ====================================================
  // GENERATE VARIANTS
  // ====================================================

  function generateVariants() {
    setError("");

    // ----------------------------------------------
    // COLORS
    // ----------------------------------------------

    if (colors.length === 0) {
      showError(
        "يجب إضافة لون واحد على الأقل",
      );

      return;
    }

    // ----------------------------------------------
    // NONE
    // ----------------------------------------------

    if (
      sizeType === "NONE"
    ) {
      const generated: Variant[] =
        colors
          .map(
            (color) => {
              const existing =
                variants.find(
                  (variant) =>
                    variant.sizeType ===
                      "NONE" &&
                    variant.color
                      .toLowerCase() ===
                      color.toLowerCase(),
                );

              const newVariant = {
                sizeType:
                  "NONE" as const,
                size: "",
                color,
              };

              const key =
                getVariantKey(
                  newVariant,
                );

              if (
                deletedVariantKeys.includes(
                  key,
                )
              ) {
                return null;
              }

              return {
                id:
                  existing?.id ??
                  crypto.randomUUID(),

                sizeType:
                  "NONE",

                size: "",

                color,

                stock:
                  existing?.stock ??
                  0,
              };
            },
          )
          .filter(
            (
              variant,
            ): variant is Variant =>
              variant !== null,
          );

      setVariants(
        (current) => {
          const currentKeys =
            new Set(
              current.map(
                getVariantKey,
              ),
            );

          const newVariants =
            generated.filter(
              (variant) =>
                !currentKeys.has(
                  getVariantKey(
                    variant,
                  ),
                ),
            );

          return [
            ...current,
            ...newVariants,
          ];
        },
      );

      return;
    }

    // ----------------------------------------------
    // SIZES
    // ----------------------------------------------

    if (
      selectedSizes.length ===
      0
    ) {
      showError(
        "يجب اختيار قياس واحد على الأقل",
      );

      return;
    }

    // ----------------------------------------------
    // SIZE × COLOR
    // ----------------------------------------------

    const generated: Variant[] =
      [];

    for (
      const size of selectedSizes
    ) {
      for (
        const color of colors
      ) {
        const sizeTypeForKey =
          sizeType ===
          "COMBINED"
            ? "NUMBER"
            : sizeType;

        const key = [
          sizeTypeForKey,
          size,
          color
            .trim()
            .toLowerCase(),
        ].join("|");

        // ------------------------------------------
        // DO NOT RESTORE DELETED VARIANT
        // ------------------------------------------

        if (
          deletedVariantKeys.includes(
            key,
          )
        ) {
          continue;
        }

        // ------------------------------------------
        // FIND EXISTING VARIANT
        // ------------------------------------------

        const existing =
          variants.find(
            (variant) =>
              getVariantKey(
                variant,
              ) === key,
          );

        generated.push({
          id:
            existing?.id ??
            crypto.randomUUID(),

          sizeType,

          size,

          color,

          stock:
            existing?.stock ??
            0,
        });
      }
    }

    // ----------------------------------------------
    // MERGE — NEVER DELETE EXISTING VARIANTS
    // ----------------------------------------------

    setVariants(
      (current) => {
        const currentKeys =
          new Set(
            current.map(
              getVariantKey,
            ),
          );

        const newVariants =
          generated.filter(
            (variant) =>
              !currentKeys.has(
                getVariantKey(
                  variant,
                ),
              ),
          );

        return [
          ...current,
          ...newVariants,
        ];
      },
    );
  }

  // ====================================================
  // UPDATE VARIANT STOCK
  // ====================================================

  function updateVariantStock(
    id: string,
    value: string,
  ) {
    const stock =
      Number(value);

    setVariants(
      (current) =>
        current.map(
          (variant) =>
            variant.id === id
              ? {
                  ...variant,

                  stock:
                    Number.isInteger(
                      stock,
                    ) &&
                    stock >= 0
                      ? stock
                      : 0,
                }
              : variant,
        ),
    );

    setError("");
  }

  // ====================================================
  // REMOVE VARIANT
  // ====================================================

  function removeVariant(
    id: string,
  ) {
    setVariants(
      (current) => {
        const variant =
          current.find(
            (item) =>
              item.id === id,
          );

        if (!variant) {
          return current;
        }

        const key =
          getVariantKey(
            variant,
          );

        setDeletedVariantKeys(
          (deleted) =>
            deleted.includes(key)
              ? deleted
              : [
                  ...deleted,
                  key,
                ],
        );

        return current.filter(
          (item) =>
            item.id !== id,
        );
      },
    );
  }

  // ====================================================
  // VALIDATE IMAGE
  // ====================================================

  function validateImage(
    file: File,
  ) {
    if (
      !ALLOWED_IMAGE_TYPES.includes(
        file.type,
      )
    ) {
      return "الصورة غير مدعومة. استخدم JPG أو PNG أو WEBP أو AVIF";
    }

    if (
      file.size >
      MAX_IMAGE_SIZE
    ) {
      return "الصورة تتجاوز 5 ميغابايت";
    }

    return null;
  }

  // ====================================================
  // ADD NEW IMAGES
  // ====================================================

  function handleNewImagesChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files =
      Array.from(
        event.target.files ??
          [],
      );

    if (
      files.length === 0
    ) {
      return;
    }

    setError("");

    const validFiles: File[] =
      [];

    for (
      const file of files
    ) {
      const validationError =
        validateImage(file);

      if (validationError) {
        showError(
          validationError,
        );

        event.target.value =
          "";

        return;
      }

      validFiles.push(file);
    }

    const createdImages: NewImage[] =
      validFiles.map(
        (file) => ({
          id: crypto.randomUUID(),

          file,

          preview:
            URL.createObjectURL(
              file,
            ),
        }),
      );

    setNewImages(
      (current) => [
        ...current,
        ...createdImages,
      ],
    );

    event.target.value = "";
  }

  // ====================================================
  // REMOVE NEW IMAGE
  // ====================================================

  function removeNewImage(
    id: string,
  ) {
    setNewImages(
      (current) => {
        const image =
          current.find(
            (item) =>
              item.id === id,
          );

        if (image) {
          URL.revokeObjectURL(
            image.preview,
          );
        }

        return current.filter(
          (item) =>
            item.id !== id,
        );
      },
    );

    setNewMainImageIndex(
      (currentIndex) => {
        if (
          currentIndex < 0
        ) {
          return -1;
        }

        return -1;
      },
    );
  }

  // ====================================================
  // DELETE EXISTING IMAGE
  // ====================================================

  function deleteExistingImage(
    imageId: string,
  ) {
    if (
      existingImages.length <=
        1 &&
      newImages.length === 0
    ) {
      showError(
        "لا يمكن حذف الصورة الوحيدة للمنتج. يجب أن يبقى للمنتج صورة واحدة على الأقل.",
      );

      return;
    }

    setExistingImages(
      (current) =>
        current.filter(
          (image) =>
            image.id !==
            imageId,
        ),
    );

    setDeletedImageIds(
      (current) =>
        current.includes(
          imageId,
        )
          ? current
          : [
              ...current,
              imageId,
            ],
    );

    if (
      mainImageId ===
      imageId
    ) {
      const remaining =
        existingImages.filter(
          (image) =>
            image.id !==
            imageId,
        );

      if (
        remaining.length >
        0
      ) {
        setMainImageId(
          remaining[0].id,
        );

        setNewMainImageIndex(
          -1,
        );
      } else if (
        newImages.length >
        0
      ) {
        setMainImageId(null);

        setNewMainImageIndex(
          0,
        );
      } else {
        setMainImageId(null);

        setNewMainImageIndex(
          -1,
        );
      }
    }
  }

  // ====================================================
  // SET EXISTING IMAGE AS MAIN
  // ====================================================

  function setExistingAsMain(
    imageId: string,
  ) {
    setMainImageId(imageId);

    setNewMainImageIndex(-1);

    setError("");
  }

  // ====================================================
  // SET NEW IMAGE AS MAIN
  // ====================================================

  function setNewAsMain(
    index: number,
  ) {
    setMainImageId(null);

    setNewMainImageIndex(
      index,
    );

    setError("");
  }

  // ====================================================
  // TOTAL STOCK
  // ====================================================

  const totalVariantStock =
    variants.reduce(
      (total, variant) =>
        total + variant.stock,
      0,
    );

  // ====================================================
  // TOTAL IMAGES
  // ====================================================

  const totalImages =
    existingImages.length +
    newImages.length;

  // ====================================================
  // SUBMIT
  // ====================================================

  async function handleSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError("");

    // ----------------------------------------------
    // NAME
    // ----------------------------------------------

    const trimmedName =
      name.trim();

    if (!trimmedName) {
      showError(
        "اسم المنتج مطلوب",
      );

      return;
    }

    // ----------------------------------------------
    // CATEGORY
    // ----------------------------------------------

    if (!categoryId) {
      showError(
        "يجب اختيار التصنيف",
      );

      return;
    }

    // ----------------------------------------------
    // PRICE
    // ----------------------------------------------

    const numericPrice =
      Number(price);

    if (
      !Number.isFinite(
        numericPrice,
      ) ||
      numericPrice < 0
    ) {
      showError(
        "السعر غير صالح",
      );

      return;
    }

    // ----------------------------------------------
    // OLD PRICE
    // ----------------------------------------------

    if (
      oldPrice.trim() !==
      ""
    ) {
      const numericOldPrice =
        Number(oldPrice);

      if (
        !Number.isFinite(
          numericOldPrice,
        ) ||
        numericOldPrice < 0
      ) {
        showError(
          "السعر القديم غير صالح",
        );

        return;
      }
    }

    // ----------------------------------------------
    // DISCOUNT
    // ----------------------------------------------

    if (
      discountPercent.trim() !==
      ""
    ) {
      const numericDiscount =
        Number(
          discountPercent,
        );

      if (
        !Number.isFinite(
          numericDiscount,
        ) ||
        numericDiscount < 0 ||
        numericDiscount > 100
      ) {
        showError(
          "نسبة الخصم يجب أن تكون بين 0 و100",
        );

        return;
      }
    }

    // ----------------------------------------------
    // VARIANTS
    // ----------------------------------------------

    if (
      variants.length === 0
    ) {
      showError(
        "يجب أن يحتوي المنتج على تنويع واحد على الأقل",
      );

      return;
    }

    // ----------------------------------------------
    // INVALID STOCK
    // ----------------------------------------------

    const invalidVariant =
      variants.find(
        (variant) =>
          !Number.isInteger(
            variant.stock,
          ) ||
          variant.stock < 0,
      );

    if (invalidVariant) {
      showError(
        "يوجد مخزون غير صالح في أحد التنويعات",
      );

      return;
    }

    // ----------------------------------------------
    // CHECK DUPLICATES
    // ----------------------------------------------

    const combinations =
      new Set<string>();

    for (
      let index = 0;
      index < variants.length;
      index++
    ) {
      const variant =
        variants[index];

      const key = [
        variant.sizeType,
        variant.size,
        variant.color,
      ]
        .join("|")
        .toLowerCase();

      if (
        combinations.has(key)
      ) {
        showError(
          `تم تكرار نفس القياس واللون في التنويع رقم ${
            index + 1
          }`,
        );

        return;
      }

      combinations.add(key);
    }

    // ----------------------------------------------
    // IMAGES
    // ----------------------------------------------

    if (
      totalImages === 0
    ) {
      showError(
        "يجب أن يحتوي المنتج على صورة واحدة على الأقل",
      );

      return;
    }

    // ----------------------------------------------
    // FORM DATA
    // ----------------------------------------------

    const formData =
      new FormData();

    formData.append(
      "name",
      trimmedName,
    );

    formData.append(
      "description",
      description.trim(),
    );

    formData.append(
      "categoryId",
      categoryId,
    );

    formData.append(
      "price",
      numericPrice.toString(),
    );

    formData.append(
      "oldPrice",
      oldPrice.trim(),
    );

    formData.append(
      "discountPercent",
      discountPercent.trim(),
    );

    formData.append(
      "isActive",
      isActive.toString(),
    );

    formData.append(
      "isFeatured",
      isFeatured.toString(),
    );

    formData.append(
      "isNew",
      isNew.toString(),
    );

    // ----------------------------------------------
    // VARIANTS
    // ----------------------------------------------

    formData.append(
      "variants",
      JSON.stringify(
        variants.map(
          (variant) => ({
            sizeType:
              variant.sizeType ===
              "COMBINED"
                ? "NUMBER"
                : variant.sizeType,

            size:
              variant.sizeType ===
              "NONE"
                ? null
                : variant.size,

            color:
              variant.color,

            stock:
              variant.stock,
          }),
        ),
      ),
    );

    // ----------------------------------------------
    // DELETED IMAGE IDS
    // ----------------------------------------------

    formData.append(
      "deletedImageIds",
      JSON.stringify(
        deletedImageIds,
      ),
    );

    // ----------------------------------------------
    // EXISTING MAIN IMAGE
    // ----------------------------------------------

    if (mainImageId) {
      formData.append(
        "mainImageId",
        mainImageId,
      );
    } else {
      formData.append(
        "mainImageId",
        "",
      );
    }

    // ----------------------------------------------
    // NEW IMAGES
    // ----------------------------------------------

    newImages.forEach(
      (image) => {
        formData.append(
          "images",
          image.file,
        );
      },
    );

    // ----------------------------------------------
    // NEW MAIN IMAGE
    // ----------------------------------------------

    if (
      newMainImageIndex >= 0 &&
      newMainImageIndex <
        newImages.length
    ) {
      formData.append(
        "newMainImageIndex",
        newMainImageIndex.toString(),
      );
    } else {
      formData.append(
        "newMainImageIndex",
        "-1",
      );
    }

    // ----------------------------------------------
    // DEBUG
    // ----------------------------------------------

    console.log(
      "📦 Updating product:",
      product.id,
    );

    console.log(
      "📝 Product name:",
      trimmedName,
    );

    console.log(
      "💰 Product price:",
      numericPrice,
    );

    console.log(
      "🖼️ Existing images:",
      existingImages.length,
    );

    console.log(
      "🗑️ Deleted images:",
      deletedImageIds,
    );

    console.log(
      "➕ New images:",
      newImages.length,
    );

    console.log(
      "⭐ Main image:",
      mainImageId,
    );

    console.log(
      "⭐ New main index:",
      newMainImageIndex,
    );

    console.log(
      "📦 Variants:",
      variants,
    );

    // ----------------------------------------------
    // SUBMIT
    // ----------------------------------------------

    setIsSubmitting(true);

    try {
      await updateProduct(
        product.id,
        formData,
      );

      console.log(
        "✅ Product updated successfully",
      );

      /*
       * updateProduct يقوم بالـ redirect
       * بعد نجاح العملية.
       */
    } catch (error) {
      console.error(
        "❌ Product edit form error:",
        error,
      );

      const errorDigest =
        (
          error as {
            digest?: string;
          }
        )?.digest;

      if (
        errorDigest?.includes(
          "NEXT_REDIRECT",
        )
      ) {
        return;
      }

      setError(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء تعديل المنتج",
      );

      setIsSubmitting(false);
    }
  }

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* ==================================================
          BASIC INFORMATION
      ================================================== */}

      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-6 border-b border-zinc-100 pb-5">
          <h2 className="text-xl font-bold text-zinc-900">
            معلومات المنتج
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            تعديل المعلومات الأساسية الخاصة بالمنتج.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-zinc-800">
              اسم المنتج
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target
                    .value,
                )
              }
              required
              disabled={
                isSubmitting
              }
              className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 disabled:bg-zinc-50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-zinc-800">
              التصنيف
            </label>

            <select
              value={categoryId}
              onChange={(event) =>
                setCategoryId(
                  event.target
                    .value,
                )
              }
              required
              disabled={
                isSubmitting
              }
              className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 disabled:bg-zinc-50"
            >
              <option value="">
                اختر التصنيف
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={
                      category.id
                    }
                    value={
                      category.id
                    }
                  >
                    {
                      category.name
                    }
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-bold text-zinc-800">
              وصف المنتج
            </label>

            <textarea
              value={
                description
              }
              onChange={(event) =>
                setDescription(
                  event.target
                    .value,
                )
              }
              rows={5}
              disabled={
                isSubmitting
              }
              className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 disabled:bg-zinc-50"
            />
          </div>
        </div>
      </section>

      {/* ==================================================
          PRICE
      ================================================== */}

      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-6 border-b border-zinc-100 pb-5">
          <h2 className="text-xl font-bold text-zinc-900">
            السعر
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            تعديل السعر الحالي والسعر القديم ونسبة الخصم.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-bold text-zinc-800">
              السعر
            </label>

            <div className="relative">
              <input
                type="number"
                value={price}
                onChange={(event) =>
                  setPrice(
                    event.target
                      .value,
                  )
                }
                min="0"
                step="0.01"
                disabled={
                  isSubmitting
                }
                className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 pl-14 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              />

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-400">
                دج
              </span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-zinc-800">
              السعر القديم
            </label>

            <div className="relative">
              <input
                type="number"
                value={
                  oldPrice
                }
                onChange={(event) =>
                  setOldPrice(
                    event.target
                      .value,
                  )
                }
                min="0"
                step="0.01"
                disabled={
                  isSubmitting
                }
                className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 pl-14 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              />

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-400">
                دج
              </span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-zinc-800">
              نسبة الخصم
            </label>

            <div className="relative">
              <input
                type="number"
                value={
                  discountPercent
                }
                onChange={(event) =>
                  setDiscountPercent(
                    event.target
                      .value,
                  )
                }
                min="0"
                max="100"
                step="1"
                disabled={
                  isSubmitting
                }
                className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 pl-12 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              />

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-400">
                %
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          VARIANTS
      ================================================== */}

      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-6 border-b border-zinc-100 pb-5">
          <h2 className="text-xl font-bold text-zinc-900">
            القياسات والألوان والمخزون
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            عدّل القياسات والألوان والمخزون لكل تركيبة.
          </p>
        </div>

        <div>
          <label className="mb-3 block text-sm font-bold text-zinc-800">
            نوع القياس
          </label>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                [
                  "NONE",
                  "بدون قياس",
                  "للمنتجات ذات القياس الثابت",
                ],
                [
                  "LETTER",
                  "قياسات حروف",
                  "XS / S / M / L / XL",
                ],
                [
                  "NUMBER",
                  "قياسات أرقام",
                  "36 / 38 / 40 / 42",
                ],
                [
                  "COMBINED",
                  "قياسات مركبة",
                  "38/40/42-1 / 44/46/48-2 / 1 / 2 / 3",
                ],
              ] as const
            ).map(
              (item) => (
                <button
                  key={
                    item[0]
                  }
                  type="button"
                  onClick={() =>
                    handleSizeTypeChange(
                      item[0],
                    )
                  }
                  disabled={
                    isSubmitting
                  }
                  className={`rounded-2xl border p-4 text-right transition ${
                    sizeType ===
                    item[0]
                      ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/10"
                      : "border-zinc-200 bg-white hover:border-emerald-300"
                  }`}
                >
                  <p className="font-bold text-zinc-900">
                    {item[1]}
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    {item[2]}
                  </p>
                </button>
              ),
            )}
          </div>
        </div>

        {sizeType ===
          "LETTER" && (
          <div className="mt-6">
            <label className="mb-3 block text-sm font-bold text-zinc-800">
              اختر القياسات
            </label>

            <div className="flex flex-wrap gap-3">
              {LETTER_SIZES.map(
                (size) => {
                  const selected =
                    selectedSizes.includes(
                      size,
                    );

                  return (
                    <button
                      key={
                        size
                      }
                      type="button"
                      onClick={() =>
                        toggleSize(
                          size,
                        )
                      }
                      disabled={
                        isSubmitting
                      }
                      className={`min-w-16 rounded-xl border px-5 py-3 text-sm font-bold ${
                        selected
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-emerald-400"
                      }`}
                    >
                      {size}
                    </button>
                  );
                },
              )}
            </div>
          </div>
        )}

        {sizeType ===
          "NUMBER" && (
          <div className="mt-6">
            <label className="mb-3 block text-sm font-bold text-zinc-800">
              اختر القياسات
            </label>

            <div className="flex flex-wrap gap-3">
              {NUMBER_SIZES.map(
                (size) => {
                  const selected =
                    selectedSizes.includes(
                      size,
                    );

                  return (
                    <button
                      key={
                        size
                      }
                      type="button"
                      onClick={() =>
                        toggleSize(
                          size,
                        )
                      }
                      disabled={
                        isSubmitting
                      }
                      className={`min-w-16 rounded-xl border px-5 py-3 text-sm font-bold ${
                        selected
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-emerald-400"
                      }`}
                    >
                      {size}
                    </button>
                  );
                },
              )}
            </div>
          </div>
        )}

        {sizeType ===
          "COMBINED" && (
          <div className="mt-6">
            <label className="mb-3 block text-sm font-bold text-zinc-800">
              اختر القياسات المركبة
            </label>

            <div className="flex flex-wrap gap-3">
              {COMBINED_SIZES.map(
                (size) => {
                  const selected =
                    selectedSizes.includes(
                      size,
                    );

                  return (
                    <button
                      key={
                        size
                      }
                      type="button"
                      onClick={() =>
                        toggleSize(
                          size,
                        )
                      }
                      disabled={
                        isSubmitting
                      }
                      className={`rounded-xl border px-5 py-3 text-sm font-bold ${
                        selected
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-emerald-400"
                      }`}
                    >
                      {size}
                    </button>
                  );
                },
              )}
            </div>
          </div>
        )}

        {/* COLORS */}

        <div className="mt-8">
          <label className="mb-3 block text-sm font-bold text-zinc-800">
            ألوان المنتج
          </label>

          <div className="flex gap-3">
            <input
              type="text"
              value={
                colorInput
              }
              onChange={(event) =>
                setColorInput(
                  event.target
                    .value,
                )
              }
              onKeyDown={
                handleColorKeyDown
              }
              placeholder="مثال: بني"
              disabled={
                isSubmitting
              }
              className="h-12 flex-1 rounded-xl border border-zinc-200 px-4 text-sm outline-none focus:border-emerald-500"
            />

            <button
              type="button"
              onClick={addColor}
              disabled={
                isSubmitting
              }
              className="rounded-xl bg-zinc-900 px-6 text-sm font-bold text-white"
            >
              إضافة اللون
            </button>
          </div>

          {colors.length >
            0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {colors.map(
                (color) => (
                  <div
                    key={
                      color
                    }
                    className="flex items-center gap-2 rounded-full border bg-zinc-50 px-4 py-2"
                  >
                    <span className="text-sm font-semibold">
                      {color}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        removeColor(
                          color,
                        )
                      }
                      disabled={
                        isSubmitting
                      }
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold hover:bg-red-100 hover:text-red-600"
                    >
                      ×
                    </button>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        {/* GENERATE */}

        <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-zinc-900">
                تحديث تنويعات المنتج
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                سيتم إنشاء تركيبة لكل قياس مع كل لون.
              </p>
            </div>

            <button
              type="button"
              onClick={
                generateVariants
              }
              disabled={
                isSubmitting
              }
              className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white"
            >
              تحديث التنويعات
            </button>
          </div>
        </div>

        {/* VARIANTS TABLE */}

        {variants.length >
          0 && (
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-zinc-900">
                  مخزون التنويعات
                </h3>

                <p className="mt-1 text-xs text-zinc-500">
                  عدّل المخزون لكل قياس ولون.
                </p>
              </div>

              <div className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-bold">
                إجمالي المخزون:{" "}
                {
                  totalVariantStock
                }
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-zinc-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-sm">
                  <thead className="bg-zinc-50">
                    <tr>
                      <th className="px-4 py-4 text-right">
                        القياس
                      </th>

                      <th className="px-4 py-4 text-right">
                        اللون
                      </th>

                      <th className="px-4 py-4 text-right">
                        المخزون
                      </th>

                      <th className="px-4 py-4 text-center">
                        حذف
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-100">
                    {variants.map(
                      (
                        variant,
                      ) => (
                        <tr
                          key={
                            variant.id
                          }
                        >
                          <td className="px-4 py-4 font-bold">
                            {variant.sizeType ===
                            "NONE"
                              ? "بدون قياس"
                              : variant.size}
                          </td>

                          <td className="px-4 py-4">
                            {
                              variant.color
                            }
                          </td>

                          <td className="px-4 py-4">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={
                                variant.stock
                              }
                              onChange={(
                                event,
                              ) =>
                                updateVariantStock(
                                  variant.id,
                                  event
                                    .target
                                    .value,
                                )
                              }
                              disabled={
                                isSubmitting
                              }
                              className="h-11 w-32 rounded-xl border px-3"
                            />
                          </td>

                          <td className="px-4 py-4 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                removeVariant(
                                  variant.id,
                                )
                              }
                              disabled={
                                isSubmitting
                              }
                              className="rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                            >
                              حذف
                            </button>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ==================================================
          IMAGES
      ================================================== */}

      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-6 border-b border-zinc-100 pb-5">
          <h2 className="text-xl font-bold text-zinc-900">
            صور المنتج
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            يمكنك حذف الصور، إضافة صور جديدة، واختيار أي صورة كرئيسية.
          </p>
        </div>

        {/* CURRENT IMAGES */}

        {existingImages.length >
          0 && (
          <div>
            <div className="mb-4">
              <p className="font-bold text-zinc-900">
                الصور الحالية
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                اضغط على "جعل رئيسية" لاختيار الصورة الأساسية.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {existingImages.map(
                (
                  image,
                  index,
                ) => {
                  const isMain =
                    mainImageId ===
                    image.id;

                  return (
                    <div
                      key={
                        image.id
                      }
                      className={`overflow-hidden rounded-2xl border-2 bg-zinc-50 ${
                        isMain
                          ? "border-emerald-500"
                          : "border-zinc-200"
                      }`}
                    >
                      <div className="relative aspect-square">
                        <Image
                          src={
                            image.url
                          }
                          alt={`صورة المنتج ${
                            index +
                            1
                          }`}
                          fill
                          className="object-contain p-3"
                        />

                        {isMain && (
                          <div className="absolute right-3 top-3 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow">
                            الرئيسية
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 border-t border-zinc-200 bg-white p-3">
                        {!isMain && (
                          <button
                            type="button"
                            onClick={() =>
                              setExistingAsMain(
                                image.id,
                              )
                            }
                            disabled={
                              isSubmitting
                            }
                            className="w-full rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                          >
                            جعلها الصورة الرئيسية
                          </button>
                        )}

                        {isMain && (
                          <div className="w-full rounded-xl bg-emerald-50 px-3 py-2 text-center text-xs font-bold text-emerald-700">
                            هذه هي الصورة الرئيسية
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            deleteExistingImage(
                              image.id,
                            )
                          }
                          disabled={
                            isSubmitting
                          }
                          className="w-full rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
                        >
                          حذف الصورة
                        </button>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        )}

        {/* ADD NEW IMAGES */}

        <div className="mt-8 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/30 p-5">
          <div className="mb-4">
            <p className="font-bold text-zinc-900">
              إضافة صور جديدة
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              يمكنك اختيار عدة صور في نفس الوقت.
            </p>
          </div>

          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={
              handleNewImagesChange
            }
            disabled={
              isSubmitting
            }
            className="block w-full cursor-pointer rounded-xl border border-zinc-200 bg-white text-sm text-zinc-700 file:mr-4 file:border-0 file:bg-emerald-600 file:px-5 file:py-3 file:font-semibold file:text-white hover:file:bg-emerald-700"
          />

          <p className="mt-2 text-xs text-zinc-500">
            JPG، PNG، WEBP أو AVIF — الحد الأقصى 5MB لكل صورة.
          </p>
        </div>

        {/* NEW IMAGES */}

        {newImages.length >
          0 && (
          <div className="mt-8">
            <div className="mb-4">
              <p className="font-bold text-zinc-900">
                الصور الجديدة
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                يمكنك اختيار إحدى الصور الجديدة لتكون الرئيسية.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {newImages.map(
                (
                  image,
                  index,
                ) => {
                  const isMain =
                    newMainImageIndex ===
                    index;

                  return (
                    <div
                      key={
                        image.id
                      }
                      className={`overflow-hidden rounded-2xl border-2 bg-white ${
                        isMain
                          ? "border-emerald-500"
                          : "border-zinc-200"
                      }`}
                    >
                      <div className="relative aspect-square">
                        <Image
                          src={
                            image.preview
                          }
                          alt={`صورة جديدة ${
                            index +
                            1
                          }`}
                          fill
                          unoptimized
                          className="object-contain p-3"
                        />

                        <div className="absolute left-3 top-3 rounded-full bg-zinc-900 px-3 py-1 text-xs font-bold text-white">
                          جديدة
                        </div>

                        {isMain && (
                          <div className="absolute right-3 top-3 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                            الرئيسية
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 border-t border-zinc-100 p-3">
                        {!isMain && (
                          <button
                            type="button"
                            onClick={() =>
                              setNewAsMain(
                                index,
                              )
                            }
                            disabled={
                              isSubmitting
                            }
                            className="w-full rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                          >
                            جعلها الصورة الرئيسية
                          </button>
                        )}

                        {isMain && (
                          <div className="w-full rounded-xl bg-emerald-50 px-3 py-2 text-center text-xs font-bold text-emerald-700">
                            الصورة الرئيسية الجديدة
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            removeNewImage(
                              image.id,
                            )
                          }
                          disabled={
                            isSubmitting
                          }
                          className="w-full rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
                        >
                          إزالة الصورة
                        </button>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        )}

        {/* IMAGE SUMMARY */}

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-zinc-50 p-4">
            <p className="text-xs text-zinc-500">
              الصور الحالية
            </p>

            <p className="mt-1 text-2xl font-bold text-zinc-900">
              {
                existingImages.length
              }
            </p>
          </div>

          <div className="rounded-2xl bg-emerald-50 p-4">
            <p className="text-xs text-zinc-500">
              صور جديدة
            </p>

            <p className="mt-1 text-2xl font-bold text-emerald-700">
              {
                newImages.length
              }
            </p>
          </div>

          <div className="rounded-2xl bg-zinc-50 p-4">
            <p className="text-xs text-zinc-500">
              إجمالي الصور بعد الحفظ
            </p>

            <p className="mt-1 text-2xl font-bold text-zinc-900">
              {totalImages}
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================
          SETTINGS
      ================================================== */}

      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-6 border-b border-zinc-100 pb-5">
          <h2 className="text-xl font-bold text-zinc-900">
            إعدادات المنتج
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            حدد حالة ظهور المنتج في المتجر.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-zinc-200 p-4 hover:border-emerald-300">
            <input
              type="checkbox"
              checked={
                isActive
              }
              onChange={(
                event,
              ) =>
                setIsActive(
                  event.target
                    .checked,
                )
              }
              disabled={
                isSubmitting
              }
              className="h-5 w-5 accent-emerald-600"
            />

            <div>
              <p className="font-bold text-zinc-800">
                منتج نشط
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                يظهر المنتج في المتجر.
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-zinc-200 p-4 hover:border-emerald-300">
            <input
              type="checkbox"
              checked={
                isFeatured
              }
              onChange={(
                event,
              ) =>
                setIsFeatured(
                  event.target
                    .checked,
                )
              }
              disabled={
                isSubmitting
              }
              className="h-5 w-5 accent-emerald-600"
            />

            <div>
              <p className="font-bold text-zinc-800">
                منتج مميز
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                يظهر ضمن المنتجات المميزة.
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-zinc-200 p-4 hover:border-emerald-300">
            <input
              type="checkbox"
              checked={
                isNew
              }
              onChange={(
                event,
              ) =>
                setIsNew(
                  event.target
                    .checked,
                )
              }
              disabled={
                isSubmitting
              }
              className="h-5 w-5 accent-emerald-600"
            />

            <div>
              <p className="font-bold text-zinc-800">
                منتج جديد
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                يظهر كمنتج جديد.
              </p>
            </div>
          </label>
        </div>
      </section>

      {/* ==================================================
          SUMMARY
      ================================================== */}

      <section className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs text-zinc-500">
              عدد التنويعات
            </p>

            <p className="mt-1 text-2xl font-bold text-zinc-900">
              {
                variants.length
              }
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs text-zinc-500">
              إجمالي المخزون
            </p>

            <p className="mt-1 text-2xl font-bold text-emerald-600">
              {
                totalVariantStock
              }
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs text-zinc-500">
              عدد الصور
            </p>

            <p className="mt-1 text-2xl font-bold text-zinc-900">
              {totalImages}
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================
          ACTIONS
      ================================================== */}

      <div className="flex flex-col-reverse justify-end gap-3 border-t border-zinc-200 pt-6 sm:flex-row">
        <button
          type="button"
          onClick={() =>
            window.history.back()
          }
          disabled={
            isSubmitting
          }
          className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-8 py-3 font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
        >
          إلغاء
        </button>

        <button
          type="submit"
          disabled={
            isSubmitting
          }
          className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-8 py-3 font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "جاري حفظ التعديلات..."
            : "حفظ التعديلات"}
        </button>
      </div>
    </form>
  );
}