
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createProduct } from "@/actions/product.actions";

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

type SelectedImage = {
  id: string;
  file: File;
  preview: string;
};

type ProductFormProps = {
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

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

const MAX_IMAGES = 12;

async function compressImageFile(file: File) {
  if (file.size <= MAX_IMAGE_SIZE) {
    return file;
  }

  const reader = new FileReader();

  const dataUrl = await new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("فشل قراءة الصورة"));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("فشل تجهيز الصورة"));
    image.src = dataUrl;
  });

  const maxDimension = 1600;
  const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));

  const context = canvas.getContext("2d");

  if (!context) {
    return file;
  }

  context.drawImage(img, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(
      resolve,
      file.type === "image/png" ? "image/jpeg" : file.type || "image/jpeg",
      0.78,
    );
  });

  if (!blob) {
    return file;
  }

  const compressedName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";

  return new File([blob], compressedName, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

// ======================================================
// ID GENERATOR
// ======================================================

function generateId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 15)}`;
}

// ======================================================
// COMPONENT
// ======================================================

export default function ProductForm({
  categories,
}: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  // ====================================================
  // SIZE TYPE
  // ====================================================

  const [sizeType, setSizeType] =
    useState<SizeType>("NONE");

  // ====================================================
  // SELECTED SIZES
  // ====================================================

  const [selectedSizes, setSelectedSizes] =
    useState<string[]>([]);

  // ====================================================
  // COLORS
  // ====================================================

  const [colors, setColors] = useState<string[]>([]);

  const [colorInput, setColorInput] =
    useState("");

  // ====================================================
  // VARIANTS
  // ====================================================

  const [variants, setVariants] =
    useState<Variant[]>([]);

  // ====================================================
  // IMAGES
  // ====================================================

  const [images, setImages] =
    useState<SelectedImage[]>([]);

  // ====================================================
  // CLEANUP IMAGE PREVIEWS
  // ====================================================

  useEffect(() => {
    return () => {
      images.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });
    };
  }, [images]);

  // ====================================================
  // ERROR
  // ====================================================

  function showError(message: string) {
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

    setSelectedSizes([]);

    setVariants([]);

    setError("");
  }

  // ====================================================
  // SIZE SELECTION
  // ====================================================

  function toggleSize(size: string) {
    setSelectedSizes((current) => {
      if (current.includes(size)) {
        return current.filter(
          (item) => item !== size,
        );
      }

      return [...current, size];
    });

    setError("");
  }

  // ====================================================
  // ADD COLOR
  // ====================================================

  function addColor() {
    const color = colorInput.trim();

    if (!color) {
      return;
    }

    const exists = colors.some(
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
  // ENTER KEY FOR COLOR
  // ====================================================

  function handleColorKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      addColor();
    }
  }

  // ====================================================
  // REMOVE COLOR
  // ====================================================

  function removeColor(color: string) {
    setColors((current) =>
      current.filter(
        (item) => item !== color,
      ),
    );

    setVariants((current) =>
      current.filter(
        (variant) =>
          variant.color !== color,
      ),
    );
  }

  // ====================================================
  // GENERATE VARIANTS
  // ====================================================

  function generateVariants() {
    setError("");

    // ----------------------------------------------
    // COLORS REQUIRED
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

    if (sizeType === "NONE") {
      const generated: Variant[] =
        colors.map((color) => ({
          id: generateId(),
          sizeType: "NONE",
          size: "",
          color,
          stock: 0,
        }));

      setVariants(generated);

      return;
    }

    // ----------------------------------------------
    // SIZES REQUIRED
    // ----------------------------------------------

    if (selectedSizes.length === 0) {
      showError(
        "يجب اختيار قياس واحد على الأقل",
      );

      return;
    }

    // ----------------------------------------------
    // CREATE SIZE × COLOR
    // ----------------------------------------------

    const generated: Variant[] = [];

    for (const size of selectedSizes) {
      for (const color of colors) {
        const existing =
          variants.find(
            (variant) =>
              variant.sizeType ===
                sizeType &&
              variant.size === size &&
              variant.color === color,
          );

        generated.push({
          id:
            existing?.id ??
            generateId(),

          sizeType,

          size,

          color,

          stock:
            existing?.stock ?? 0,
        });
      }
    }

    setVariants(generated);
  }

  // ====================================================
  // UPDATE VARIANT STOCK
  // ====================================================

  function updateVariantStock(
    id: string,
    value: string,
  ) {
    const stock = Number(value);

    setVariants((current) =>
      current.map((variant) =>
        variant.id === id
          ? {
              ...variant,
              stock:
                Number.isInteger(stock) &&
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

  function removeVariant(id: string) {
    setVariants((current) =>
      current.filter(
        (variant) =>
          variant.id !== id,
      ),
    );
  }

  // ====================================================
  // IMAGE CHANGE
  // ====================================================

  async function handleImagesChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(
      event.target.files ?? [],
    );

    if (files.length === 0) {
      return;
    }

    setError("");

    if (
      images.length + files.length >
      MAX_IMAGES
    ) {
      showError(
        `يمكنك إضافة ${MAX_IMAGES} صور كحد أقصى`,
      );

      event.target.value = "";

      return;
    }

    const validFiles: File[] = [];

    for (const file of files) {
      if (
        !ALLOWED_IMAGE_TYPES.includes(
          file.type,
        )
      ) {
        showError(
          `الصورة "${file.name}" غير مدعومة. استخدم JPG أو PNG أو WEBP أو AVIF`,
        );

        event.target.value = "";

        return;
      }

      if (file.size > MAX_IMAGE_SIZE * 8) {
        showError(
          `الصورة "${file.name}" كبيرة جدًا. الحد الآمن هو 2 ميغابايت لكل صورة لتجنب مشكلة Vercel عند رفع عدة صور.`,
        );

        event.target.value = "";

        return;
      }

      validFiles.push(file);
    }

    try {
      const compressedFiles =
        await Promise.all(
          validFiles.map(
            async (file) =>
              compressImageFile(file),
          ),
        );

      const newImages: SelectedImage[] =
        compressedFiles.map((file) => ({
          id: generateId(),
          file,
          preview:
            URL.createObjectURL(file),
        }));

      setImages((current) => [
        ...current,
        ...newImages,
      ]);
    } catch (error) {
      console.error(
        "Image compression error:",
        error,
      );
      showError(
        "تعذر تجهيز بعض الصور. حاول رفع صور أصغر أو صور JPG/PNG ذات جودة متوسطة.",
      );
    }

    event.target.value = "";
  }

  // ====================================================
  // REMOVE IMAGE
  // ====================================================

  function removeImage(id: string) {
    setImages((current) => {
      const image = current.find(
        (item) => item.id === id,
      );

      if (image) {
        URL.revokeObjectURL(
          image.preview,
        );
      }

      return current.filter(
        (item) => item.id !== id,
      );
    });
  }

  // ====================================================
  // SET MAIN IMAGE
  // ====================================================

  function setMainImage(id: string) {
    setImages((current) => {
      const selected = current.find(
        (item) => item.id === id,
      );

      if (!selected) {
        return current;
      }

      return [
        selected,
        ...current.filter(
          (item) => item.id !== id,
        ),
      ];
    });
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
  // SUBMIT
  // ====================================================

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError("");

    // ----------------------------------------------
    // IMAGES
    // ----------------------------------------------

    if (images.length === 0) {
      showError(
        "يجب إضافة صورة واحدة على الأقل للمنتج",
      );

      return;
    }

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
    // VARIANTS
    // ----------------------------------------------

    if (variants.length === 0) {
      showError(
        "يجب إنشاء تنويعات المنتج أولًا",
      );

      return;
    }

    // ----------------------------------------------
    // CHECK VARIANT STOCK
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
    // CHECK REQUIRED STOCK
    // ----------------------------------------------

    const form =
      event.currentTarget;

    const formData =
      new FormData(form);

    // ----------------------------------------------
    // REMOVE OLD VARIANTS FIELD
    // ----------------------------------------------

    formData.delete(
      "variants",
    );

    // ----------------------------------------------
    // ADD VARIANTS JSON
    // ----------------------------------------------

    formData.append(
      "variants",
      JSON.stringify(
        variants.map(
          (variant) => ({
            /*
             * IMPORTANT:
             * The server currently accepts only:
             * NONE / LETTER / NUMBER
             *
             * COMBINED remains available in the UI,
             * but is sent as NUMBER to the server.
             *
             * The actual combined size value remains
             * inside `size`, for example:
             * 38/40/42-1
             */
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
    // REMOVE SINGLE IMAGE
    // ----------------------------------------------

    formData.delete("image");

    // ----------------------------------------------
    // ADD ALL IMAGES
    // ----------------------------------------------

    images.forEach(
      (image) => {
        formData.append(
          "images",
          image.file,
        );
      },
    );

    // ----------------------------------------------
    // MAIN IMAGE
    // ----------------------------------------------

    formData.append(
      "imageIndex",
      "0",
    );

    // ----------------------------------------------
    // SUBMIT
    // ----------------------------------------------

    setIsSubmitting(true);

    try {
      await createProduct(
        formData,
      );
    } catch (error) {
      console.error(
        "❌ Product form error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء حفظ المنتج",
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
      className="space-y-6"
      dir="rtl"
    >
      {/* ==================================================
          BASIC INFORMATION
      ================================================== */}

      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-6 border-b border-zinc-100 pb-5">
          <h2 className="text-xl font-bold text-zinc-900">
            معلومات المنتج
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            المعلومات الأساسية الخاصة بالمنتج.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* NAME */}

          <div>
            <label className="mb-2 block text-sm font-bold text-zinc-800">
              اسم المنتج
            </label>

            <input
              type="text"
              name="name"
              required
              placeholder="مثال: حجاب حريري فاخر"
              className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
            />
          </div>

          {/* CATEGORY */}

          <div>
            <label className="mb-2 block text-sm font-bold text-zinc-800">
              التصنيف
            </label>

            <select
              name="categoryId"
              required
              defaultValue=""
              className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
            >
              <option
                value=""
                disabled
              >
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

          {/* DESCRIPTION */}

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-bold text-zinc-800">
              وصف المنتج
            </label>

            <textarea
              name="description"
              rows={5}
              placeholder="اكتب وصفًا مختصرًا وواضحًا للمنتج..."
              className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
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
            حدد السعر الحالي والسعر القديم ونسبة الخصم.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* PRICE */}

          <div>
            <label className="mb-2 block text-sm font-bold text-zinc-800">
              السعر
            </label>

            <div className="relative">
              <input
                type="number"
                name="price"
                required
                min="0"
                step="0.01"
                className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 pl-14 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              />

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-400">
                دج
              </span>
            </div>
          </div>

          {/* OLD PRICE */}

          <div>
            <label className="mb-2 block text-sm font-bold text-zinc-800">
              السعر القديم
            </label>

            <div className="relative">
              <input
                type="number"
                name="oldPrice"
                min="0"
                step="0.01"
                className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 pl-14 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              />

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-400">
                دج
              </span>
            </div>
          </div>

          {/* DISCOUNT */}

          <div>
            <label className="mb-2 block text-sm font-bold text-zinc-800">
              نسبة الخصم
            </label>

            <div className="relative">
              <input
                type="number"
                name="discountPercent"
                min="0"
                max="100"
                step="1"
                className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 pl-12 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
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
            حدد نوع القياس، ثم الألوان، وبعدها كمية المخزون لكل تركيبة.
          </p>
        </div>

        {/* SIZE TYPE */}

        <div>
          <label className="mb-3 block text-sm font-bold text-zinc-800">
            نوع القياس
          </label>

          <div className="grid gap-3 sm:grid-cols-4">
            {/* NONE */}

            <button
              type="button"
              onClick={() =>
                handleSizeTypeChange(
                  "NONE",
                )
              }
              className={`rounded-2xl border p-4 text-right transition ${
                sizeType ===
                "NONE"
                  ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/10"
                  : "border-zinc-200 bg-white hover:border-emerald-300"
              }`}
            >
              <p className="font-bold text-zinc-900">
                بدون قياس
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                للمنتجات ذات القياس الثابت
              </p>
            </button>

            {/* LETTER */}

            <button
              type="button"
              onClick={() =>
                handleSizeTypeChange(
                  "LETTER",
                )
              }
              className={`rounded-2xl border p-4 text-right transition ${
                sizeType ===
                "LETTER"
                  ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/10"
                  : "border-zinc-200 bg-white hover:border-emerald-300"
              }`}
            >
              <p className="font-bold text-zinc-900">
                قياسات حروف
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                XS / S / M / L / XL
              </p>
            </button>

            {/* NUMBER */}

            <button
              type="button"
              onClick={() =>
                handleSizeTypeChange(
                  "NUMBER",
                )
              }
              className={`rounded-2xl border p-4 text-right transition ${
                sizeType ===
                "NUMBER"
                  ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/10"
                  : "border-zinc-200 bg-white hover:border-emerald-300"
              }`}
            >
              <p className="font-bold text-zinc-900">
                قياسات أرقام
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                36 / 38 / 40 / 42
              </p>
            </button>

            {/* COMBINED */}

            <button
              type="button"
              onClick={() =>
                handleSizeTypeChange(
                  "COMBINED",
                )
              }
              className={`rounded-2xl border p-4 text-right transition ${
                sizeType ===
                "COMBINED"
                  ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/10"
                  : "border-zinc-200 bg-white hover:border-emerald-300"
              }`}
            >
              <p className="font-bold text-zinc-900">
                قياسات مركبة
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                44/46/48
              </p>
            </button>
          </div>
        </div>

        {/* LETTER SIZES */}

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
                      key={size}
                      type="button"
                      onClick={() =>
                        toggleSize(
                          size,
                        )
                      }
                      className={`min-w-16 rounded-xl border px-5 py-3 text-sm font-bold transition ${
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

        {/* NUMBER SIZES */}

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
                      key={size}
                      type="button"
                      onClick={() =>
                        toggleSize(
                          size,
                        )
                      }
                      className={`min-w-16 rounded-xl border px-5 py-3 text-sm font-bold transition ${
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

        {/* COMBINED SIZES */}

        {sizeType ===
          "COMBINED" && (
          <div className="mt-6">
            <label className="mb-3 block text-sm font-bold text-zinc-800">
              اختر القياسات
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
                      key={size}
                      type="button"
                      onClick={() =>
                        toggleSize(
                          size,
                        )
                      }
                      className={`min-w-16 rounded-xl border px-5 py-3 text-sm font-bold transition ${
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
              value={colorInput}
              onChange={(event) =>
                setColorInput(
                  event.target.value,
                )
              }
              onKeyDown={
                handleColorKeyDown
              }
              placeholder="مثال: بني"
              className="h-12 flex-1 rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
            />

            <button
              type="button"
              onClick={
                addColor
              }
              className="rounded-xl bg-zinc-900 px-6 text-sm font-bold text-white transition hover:bg-zinc-800"
            >
              إضافة اللون
            </button>
          </div>

          {/* COLOR TAGS */}

          {colors.length >
            0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {colors.map(
                (color) => (
                  <div
                    key={color}
                    className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2"
                  >
                    <span className="text-sm font-semibold text-zinc-800">
                      {color}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        removeColor(
                          color,
                        )
                      }
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-600 transition hover:bg-red-100 hover:text-red-600"
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
                إنشاء تنويعات المنتج
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
              className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              إنشاء التنويعات
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
                  حدد المخزون لكل قياس ولون بشكل مستقل.
                </p>
              </div>

              <div className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-bold text-zinc-700">
                إجمالي المخزون:{" "}
                {totalVariantStock}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-zinc-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-sm">
                  <thead className="bg-zinc-50">
                    <tr>
                      <th className="px-4 py-4 text-right font-bold text-zinc-700">
                        القياس
                      </th>

                      <th className="px-4 py-4 text-right font-bold text-zinc-700">
                        اللون
                      </th>

                      <th className="px-4 py-4 text-right font-bold text-zinc-700">
                        المخزون
                      </th>

                      <th className="px-4 py-4 text-center font-bold text-zinc-700">
                        حذف
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-100 bg-white">
                    {variants.map(
                      (variant) => (
                        <tr
                          key={
                            variant.id
                          }
                        >
                          <td className="px-4 py-4 font-bold text-zinc-900">
                            {variant.sizeType ===
                            "NONE"
                              ? "بدون قياس"
                              : variant.size}
                          </td>

                          <td className="px-4 py-4 text-zinc-700">
                            {variant.color}
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
                              className="h-11 w-32 rounded-xl border border-zinc-200 px-3 text-sm font-semibold text-zinc-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
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
                              className="rounded-lg px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
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
            يمكنك إضافة عدة صور. الصورة الأولى ستكون الصورة الرئيسية للمنتج.
          </p>
        </div>

        {/* UPLOAD */}

        <div>
          <label className="mb-3 block text-sm font-bold text-zinc-800">
            اختيار الصور
          </label>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            onChange={
              handleImagesChange
            }
            disabled={
              isSubmitting
            }
            className="block w-full cursor-pointer rounded-xl border border-zinc-200 bg-white text-sm text-zinc-700 file:mr-4 file:border-0 file:bg-emerald-600 file:px-5 file:py-3 file:font-semibold file:text-white hover:file:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <p className="mt-2 text-xs text-zinc-500">
            JPG, PNG, WEBP أو AVIF — الحد الأقصى 5MB للصورة الواحدة — حتى 10 صور.
          </p>
        </div>

        {/* IMAGE PREVIEWS */}

        {images.length >
          0 && (
          <div className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-zinc-900">
                  الصور المحددة
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  اضغط على "رئيسية" لتحديد الصورة الرئيسية.
                </p>
              </div>

              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-600">
                {images.length} /{" "}
                {MAX_IMAGES}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {images.map(
                (image, index) => (
                  <div
                    key={
                      image.id
                    }
                    className={`relative overflow-hidden rounded-2xl border-2 bg-zinc-50 ${
                      index === 0
                        ? "border-emerald-500"
                        : "border-zinc-200"
                    }`}
                  >
                    {/* IMAGE */}

                    <div className="relative aspect-square">
                      <Image
                        src={
                          image.preview
                        }
                        alt={`صورة المنتج ${index + 1}`}
                        fill
                        unoptimized
                        className="object-contain p-2"
                      />
                    </div>

                    {/* MAIN BADGE */}

                    {index ===
                      0 && (
                      <div className="absolute right-3 top-3 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                        الصورة الرئيسية
                      </div>
                    )}

                    {/* ACTIONS */}

                    <div className="flex items-center justify-between gap-2 border-t border-zinc-100 bg-white p-3">
                      <button
                        type="button"
                        onClick={() =>
                          setMainImage(
                            image.id,
                          )
                        }
                        disabled={
                          index ===
                          0
                        }
                        className="rounded-lg bg-zinc-100 px-3 py-2 text-xs font-bold text-zinc-700 transition hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-default disabled:bg-emerald-50 disabled:text-emerald-700"
                      >
                        {index ===
                        0
                          ? "رئيسية"
                          : "تعيين كرئيسية"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removeImage(
                            image.id,
                          )
                        }
                        className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {/* EMPTY */}

        {images.length ===
          0 && (
          <div className="mt-6 flex min-h-[220px] items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                📷
              </div>

              <p className="mt-4 text-sm font-semibold text-zinc-600">
                لم يتم اختيار صور
              </p>

              <p className="mt-1 text-xs text-zinc-400">
                ستظهر معاينة الصور هنا
              </p>
            </div>
          </div>
        )}
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
          {/* ACTIVE */}

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-zinc-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/30">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked
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

          {/* FEATURED */}

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-zinc-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/30">
            <input
              type="checkbox"
              name="isFeatured"
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

          {/* NEW */}

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-zinc-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/30">
            <input
              type="checkbox"
              name="isNew"
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
          ERROR
      ================================================== */}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

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
              {variants.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs text-zinc-500">
              إجمالي المخزون
            </p>

            <p className="mt-1 text-2xl font-bold text-emerald-600">
              {totalVariantStock}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs text-zinc-500">
              عدد الصور
            </p>

            <p className="mt-1 text-2xl font-bold text-zinc-900">
              {images.length}
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================
          ACTIONS
      ================================================== */}

      <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() =>
            window.history.back()
          }
          disabled={
            isSubmitting
          }
          className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-8 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          إلغاء
        </button>

        <button
          type="submit"
          disabled={
            isSubmitting
          }
          className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-8 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "جاري رفع الصور وحفظ المنتج..."
            : "حفظ المنتج"}
        </button>
      </div>
    </form>
  );
}
