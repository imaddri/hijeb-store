import { v2 as cloudinary } from "cloudinary";

// ======================================================
// CLOUDINARY CONFIG
// ======================================================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ======================================================
// UPLOAD IMAGE
// ======================================================

export async function uploadToCloudinary(
  file: File,
): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error("لم يتم اختيار صورة");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "hijab-store/products",
        resource_type: "image",
      },

      (error, result) => {
        if (error) {
          console.error(
            "❌ Cloudinary upload error:",
            error,
          );

          reject(
            new Error("فشل رفع الصورة إلى Cloudinary"),
          );

          return;
        }

        if (!result?.secure_url) {
          reject(
            new Error(
              "لم يتم الحصول على رابط الصورة من Cloudinary",
            ),
          );

          return;
        }

        resolve(result.secure_url);
      },
    );

    uploadStream.end(buffer);
  });
}

// ======================================================
// DELETE IMAGE
// ======================================================

export async function deleteFromCloudinary(
 imageUrl: string,
): Promise<void> {
  if (!imageUrl) {
    return;
  }

  try {
    const url = new URL(imageUrl);

    const pathname = url.pathname;

    const uploadIndex = pathname.indexOf("/upload/");

    if (uploadIndex === -1) {
      return;
    }

    let publicId = pathname.substring(
      uploadIndex + "/upload/".length,
    );

    // إزالة transformations إن وجدت
    const parts = publicId.split("/");

    if (
      parts[0]?.startsWith("v") &&
      /^v\d+$/.test(parts[0])
    ) {
      parts.shift();
    }

    publicId = parts.join("/");

    // إزالة امتداد الصورة
    publicId = publicId.replace(
      /\.(jpg|jpeg|png|webp|gif)$/i,
      "",
    );

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(
      "❌ Cloudinary delete error:",
      error,
    );
  }
}