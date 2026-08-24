"use client";

import { useState } from "react";

type ProductGalleryProps = {
  images: string[];
  productName: string;
  activeOffer?: {
    discountPercent: number;
  } | null;
  isNew: boolean;
};

export default function ProductGallery({
  images,
  productName,
  activeOffer,
  isNew,
}: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div>
      {/* ================================================= */}
      {/* MAIN IMAGE */}
      {/* ================================================= */}

      <div
        className="
          relative
          aspect-[4/5]
          overflow-hidden
          rounded-[2rem]
          bg-[#e8dfd2]
        "
      >
        <img
          src={images[selectedImage]}
          alt={productName}
          className="
            h-full
            w-full
            object-cover
            transition-opacity
            duration-300
          "
        />

        {/* OFFER */}

        {activeOffer && (
          <span
            className="
              absolute
              right-6
              top-6
              rounded-full
              bg-[#1f1f1f]
              px-5
              py-2.5
              text-xs
              font-medium
              text-white
            "
          >
            خصم {activeOffer.discountPercent}%
          </span>
        )}

        {/* NEW */}

        {!activeOffer && isNew && (
          <span
            className="
              absolute
              right-6
              top-6
              rounded-full
              bg-[#1f1f1f]
              px-5
              py-2.5
              text-xs
              font-medium
              text-white
            "
          >
            جديد
          </span>
        )}
      </div>

      {/* ================================================= */}
      {/* THUMBNAILS */}
      {/* ================================================= */}

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {images.slice(0, 4).map((image, index) => {
            const isSelected = selectedImage === index;

            return (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setSelectedImage(index)}
                aria-label={`عرض الصورة ${index + 1}`}
                className={`
                  relative
                  aspect-square
                  overflow-hidden
                  rounded-2xl
                  bg-[#e8dfd2]
                  transition
                  duration-200
                  ${
                    isSelected
                      ? "border-2 border-[#a3834d] ring-2 ring-[#a3834d]/20"
                      : "border border-black/10 hover:border-[#a3834d]/50"
                  }
                `}
              >
                <img
                  src={image}
                  alt={`${productName} ${index + 1}`}
                  className={`
                    h-full
                    w-full
                    object-cover
                    transition
                    duration-300
                    ${
                      isSelected
                        ? "opacity-100"
                        : "opacity-70 hover:opacity-100"
                    }
                  `}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}