"use client";

import Image from "next/image";

import { useCart } from "@/context/CartContext";

// ======================================================
// SHIPPING PRICES
// ======================================================
//
// أسعار التوصيل حسب الولاية.
// يمكنك تعديل الأسعار لاحقًا من هنا.
//
// ======================================================

const SHIPPING_PRICES: Record<string, number> = {
  "01": 600,
  "02": 400,
  "03": 400,
  "04": 400,
  "05": 400,
  "06": 400,
  "07": 400,
  "08": 600,
  "09": 400,
  "10": 400,
  "11": 700,
  "12": 400,
  "13": 400,
  "14": 400,
  "15": 400,
  "16": 400,
  "17": 400,
  "18": 400,
  "19": 400,
  "20": 500,
  "21": 400,
  "22": 400,
  "23": 400,
  "24": 400,
  "25": 400,
  "26": 400,
  "27": 400,
  "28": 400,
  "29": 400,
  "30": 400,
  "31": 400,
  "32": 600,
  "33": 750,
  "34": 400,
  "35": 400,
  "36": 400,
  "37": 750,
  "38": 600,
  "39": 300,
  "40": 400,
  "41": 400,
  "42": 400,
  "43": 400,
  "44": 400,
  "45": 600,
  "46": 400,
  "47": 400,
  "48": 400,
  "49": 600,
  "50": 700,
  "51": 400,
  "52": 800,
  "53": 750,
  "54": 750,
  "55": 400,
  "56": 750,
  "57": 400,
  "58": 600,
};

// ======================================================
// HOME DELIVERY SURCHARGE
// ======================================================

const HOME_DELIVERY_SURCHARGE = 200;

type DeliveryType = "OFFICE" | "HOME";

type OrderSummaryProps = {
  selectedWilaya: string;
  deliveryType: DeliveryType;
};

export default function OrderSummary({
  selectedWilaya,
  deliveryType,
}: OrderSummaryProps) {
  const {
    cart,
    cartCount,
    cartTotal,
  } = useCart();

  // ======================================================
  // SHIPPING
  // ======================================================

  const baseShippingCost =
    SHIPPING_PRICES[selectedWilaya] ?? 0;

  const shippingCost =
    baseShippingCost +
    (deliveryType === "HOME"
      ? HOME_DELIVERY_SURCHARGE
      : 0);

  // ======================================================
  // TOTAL
  // ======================================================

  const total =
    cartTotal + shippingCost;

  return (
    <div dir="rtl">

      {/* ================= HEADER ================= */}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#1f1f1f]">
          ملخص الطلب
        </h2>

        <span className="text-sm text-black/40">
          {cartCount} منتج
        </span>
      </div>

      {/* ================= EMPTY ================= */}

      {cart.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-[#f8f5ef] p-6 text-center">
          <p className="text-sm text-black/50">
            السلة فارغة.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">

          {cart.map((item) => (
            <div
              key={`${item.id}-${item.color}-${item.size}-${item.variantId}`}
              className="
                rounded-2xl
                bg-[#f8f5ef]
                p-4
              "
            >
              <div className="flex gap-4">

                {/* IMAGE */}

                <div
                  className="
                    relative
                    h-24
                    w-20
                    shrink-0
                    overflow-hidden
                    rounded-xl
                    bg-[#e8dfd2]
                  "
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                {/* INFO */}

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-[#1f1f1f]">
                        {item.name}
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-black/50">

                        {item.color && (
                          <span>
                            اللون:{" "}
                            <strong className="font-medium text-[#a3834d]">
                              {item.color}
                            </strong>
                          </span>
                        )}

                        {item.size && (
                          <span>
                            المقاس:{" "}
                            <strong className="font-medium text-[#a3834d]">
                              {item.size}
                            </strong>
                          </span>
                        )}

                      </div>
                    </div>

                    <span className="shrink-0 font-semibold text-[#a3834d]">
                      {(
                        item.price *
                        item.quantity
                      ).toLocaleString(
                        "ar-DZ"
                      )}{" "}
                      دج
                    </span>

                  </div>

                  <div className="mt-3 text-xs text-black/40">
                    الكمية: {item.quantity}
                  </div>
                </div>

              </div>
            </div>
          ))}

        </div>
      )}

      {/* ================= TOTAL ================= */}

      {cart.length > 0 && (
        <div className="mt-8 border-t border-black/10 pt-6">

          {/* SUBTOTAL */}

          <div className="flex justify-between text-sm">
            <span className="text-black/50">
              سعر المنتجات
            </span>

            <span className="font-medium">
              {cartTotal.toLocaleString(
                "ar-DZ"
              )}{" "}
              دج
            </span>
          </div>

          {/* DELIVERY TYPE */}

          <div className="mt-4 flex justify-between text-sm">
            <span className="text-black/50">
              طريقة التوصيل
            </span>

            <span className="font-medium text-[#a3834d]">
              {deliveryType === "HOME"
                ? "التوصيل إلى المنزل"
                : "التوصيل إلى المكتب"}
            </span>
          </div>

          {/* SHIPPING */}

          <div className="mt-4 flex justify-between text-sm">
            <span className="text-black/50">
              التوصيل
            </span>

            <span className="font-medium text-[#a3834d]">
              {selectedWilaya
                ? `${shippingCost.toLocaleString(
                    "ar-DZ"
                  )} دج`
                : "اختر الولاية"}
            </span>
          </div>

          {/* HOME DELIVERY SURCHARGE */}

          {selectedWilaya &&
            deliveryType === "HOME" && (
              <div className="mt-2 flex justify-between text-xs">
                <span className="text-black/40">
                  رسوم التوصيل إلى المنزل
                </span>

                <span className="font-medium text-black/50">
                  +200 دج
                </span>
              </div>
            )}

          {/* TOTAL */}

          <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-5">
            <span className="text-base font-semibold">
              الإجمالي
            </span>

            <span className="text-2xl font-bold text-[#a3834d]">
              {total.toLocaleString(
                "ar-DZ"
              )}{" "}
              دج
            </span>
          </div>

        </div>
      )}

    </div>
  );
}