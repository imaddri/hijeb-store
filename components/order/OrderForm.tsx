"use client";

import { useRef, useState } from "react";

import algeria from "@/data/algeria.json";

import { useCart } from "@/context/CartContext";

import { createOrder } from "@/actions/order.actions";

import { useRouter } from "next/navigation";

type AlgeriaData = {
  id: number;
  commune_name_ascii: string;
  commune_name: string;
  daira_name_ascii: string;
  daira_name: string;
  wilaya_code: string;
  wilaya_name_ascii: string;
  wilaya_name: string;
};

const data = algeria as AlgeriaData[];

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

type OrderFormProps = {
  selectedWilaya: string;
  setSelectedWilaya: (value: string) => void;
  deliveryType: DeliveryType;
  setDeliveryType: (value: DeliveryType) => void;
};

export default function OrderForm({
  selectedWilaya,
  setSelectedWilaya,
  deliveryType,
  setDeliveryType,
}: OrderFormProps) {
  const router = useRouter();

  const { cart, clearCart } = useCart();

  const [selectedCommune, setSelectedCommune] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // ======================================================
  // PREVENT DOUBLE SUBMISSION
  // ======================================================

  const submittingRef = useRef(false);

  // ======================================================
  // WILAYAS
  // ======================================================

  const wilayas = Array.from(
    new Map(
      data.map((item) => [
        item.wilaya_code,
        {
          code: item.wilaya_code,
          name: item.wilaya_name,
        },
      ])
    ).values()
  ).sort((a, b) => a.code.localeCompare(b.code));

  // ======================================================
  // COMMUNES
  // ======================================================

  const communes = data
    .filter(
      (item) => item.wilaya_code === selectedWilaya
    )
    .sort((a, b) =>
      a.commune_name.localeCompare(
        b.commune_name,
        "ar"
      )
    );

  // ======================================================
  // SHIPPING PRICE
  // ======================================================

  const baseShippingCost =
    SHIPPING_PRICES[selectedWilaya] ?? 0;

  const shippingCost =
    baseShippingCost +
    (deliveryType === "HOME"
      ? HOME_DELIVERY_SURCHARGE
      : 0);

  // ======================================================
  // WILAYA CHANGE
  // ======================================================

  function handleWilayaChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const wilayaCode = event.target.value;

    setSelectedWilaya(wilayaCode);

    setSelectedCommune("");
  }

  // ======================================================
  // SUBMIT
  // ======================================================

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    // ====================================================
    // PREVENT DOUBLE SUBMISSION
    // ====================================================

    if (submittingRef.current) {
      return;
    }

    submittingRef.current = true;

    setError("");

    // ====================================================
    // EMPTY CART
    // ====================================================

    if (cart.length === 0) {
      setError(
        "السلة فارغة. أضف منتجًا واحدًا على الأقل قبل تأكيد الطلب."
      );

      submittingRef.current = false;

      return;
    }

    // ====================================================
    // SHIPPING PRICE
    // ====================================================

    if (
      !selectedWilaya ||
      !SHIPPING_PRICES[selectedWilaya]
    ) {
      setError(
        "يرجى اختيار ولاية صالحة لحساب سعر التوصيل."
      );

      submittingRef.current = false;

      return;
    }

    // ====================================================
    // DELIVERY TYPE
    // ====================================================

    if (
      deliveryType !== "OFFICE" &&
      deliveryType !== "HOME"
    ) {
      setError(
        "يرجى اختيار طريقة التوصيل."
      );

      submittingRef.current = false;

      return;
    }

    setLoading(true);

    try {
      const formData = new FormData(
        event.currentTarget
      );

      const name = String(
        formData.get("name") ?? ""
      );

      const phone = String(
        formData.get("phone") ?? ""
      );

      const address = String(
        formData.get("address") ?? ""
      );

      const notes = String(
        formData.get("notes") ?? ""
      );

      // ==============================================
      // CREATE ORDER
      // ==============================================

      const result = await createOrder({
        name,
        phone,
        wilaya: selectedWilaya,
        commune: selectedCommune,
        address,
        notes,
        deliveryType,
        items: cart.map((item) => ({
          id: item.id,
          variantId: item.variantId ?? null,
          quantity: item.quantity,
        })),
      });

      // ==============================================
      // ERROR
      // ==============================================

      if (!result.success) {
        setError(
          result.error ??
            "حدث خطأ أثناء إنشاء الطلب."
        );

        return;
      }

      // ==============================================
      // SUCCESS
      // ==============================================

      clearCart();

      // نرسل رقم الطلب القصير بدل الـ cuid الطويل

      router.push(
        `/order/success?orderNumber=${result.orderNumber}`
      );
    } catch (error) {
      console.error(
        "ORDER FORM ERROR:",
        error
      );

      setError(
        "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setLoading(false);

      // السماح بمحاولة جديدة إذا فشل الطلب
      // عند نجاح الطلب سيتم الانتقال إلى صفحة النجاح

      submittingRef.current = false;
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
      dir="rtl"
    >
      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm leading-7 text-red-600">
          {error}
        </div>
      )}

      {/* ================================================= */}
      {/* NAME */}
      {/* ================================================= */}

      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-[#1f1f1f]"
        >
          الاسم الكامل
        </label>

        <input
          id="name"
          type="text"
          name="name"
          placeholder="أدخل اسمك الكامل"
          required
          disabled={loading}
          className="
            w-full
            rounded-xl
            border
            border-black/10
            bg-white
            px-4
            py-4
            text-sm
            outline-none
            transition
            focus:border-[#a3834d]
            focus:ring-1
            focus:ring-[#a3834d]/20
            disabled:cursor-not-allowed
            disabled:bg-black/5
          "
        />
      </div>

      {/* ================================================= */}
      {/* PHONE */}
      {/* ================================================= */}

      <div>
        <label
          htmlFor="phone"
          className="mb-2 block text-sm font-medium text-[#1f1f1f]"
        >
          رقم الهاتف
        </label>

        <input
          id="phone"
          type="tel"
          name="phone"
          placeholder="05 XX XX XX XX"
          required
          disabled={loading}
          dir="ltr"
          className="
            w-full
            rounded-xl
            border
            border-black/10
            bg-white
            px-4
            py-4
            text-sm
            outline-none
            transition
            focus:border-[#a3834d]
            focus:ring-1
            focus:ring-[#a3834d]/20
            disabled:cursor-not-allowed
            disabled:bg-black/5
          "
        />
      </div>

      {/* ================================================= */}
      {/* WILAYA + COMMUNE */}
      {/* ================================================= */}

      <div className="grid gap-5 sm:grid-cols-2">

        {/* WILAYA */}

        <div>
          <label
            htmlFor="state"
            className="mb-2 block text-sm font-medium text-[#1f1f1f]"
          >
            الولاية
          </label>

          <select
            id="state"
            name="state"
            value={selectedWilaya}
            onChange={handleWilayaChange}
            required
            disabled={loading}
            className="
              w-full
              cursor-pointer
              rounded-xl
              border
              border-black/10
              bg-white
              px-4
              py-4
              text-sm
              outline-none
              transition
              focus:border-[#a3834d]
              focus:ring-1
              focus:ring-[#a3834d]/20
              disabled:cursor-not-allowed
            "
          >
            <option value="">
              اختر الولاية
            </option>

            {wilayas.map((wilaya) => (
              <option
                key={wilaya.code}
                value={wilaya.code}
              >
                {wilaya.code} - {wilaya.name}
              </option>
            ))}
          </select>
        </div>

        {/* COMMUNE */}

        <div>
          <label
            htmlFor="city"
            className="mb-2 block text-sm font-medium text-[#1f1f1f]"
          >
            البلدية
          </label>

          <select
            id="city"
            name="city"
            value={selectedCommune}
            onChange={(event) =>
              setSelectedCommune(
                event.target.value
              )
            }
            disabled={
              !selectedWilaya || loading
            }
            required
            className={`
              w-full
              rounded-xl
              border
              border-black/10
              px-4
              py-4
              text-sm
              outline-none
              transition
              ${
                selectedWilaya
                  ? "cursor-pointer bg-white focus:border-[#a3834d] focus:ring-1 focus:ring-[#a3834d]/20"
                  : "cursor-not-allowed bg-zinc-50 text-black/40"
              }
            `}
          >
            <option value="">
              {selectedWilaya
                ? "اختر البلدية"
                : "اختر الولاية أولًا"}
            </option>

            {communes.map((commune) => (
              <option
                key={commune.id}
                value={commune.commune_name}
              >
                {commune.commune_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ================================================= */}
      {/* DELIVERY TYPE */}
      {/* ================================================= */}

      <div>
        <label className="mb-3 block text-sm font-medium text-[#1f1f1f]">
          طريقة التوصيل
        </label>

        <div className="grid gap-3 sm:grid-cols-2">

          {/* OFFICE DELIVERY */}

          <button
            type="button"
            onClick={() =>
              setDeliveryType("OFFICE")
            }
            disabled={loading}
            className={`
              rounded-2xl
              border
              px-4
              py-4
              text-right
              transition
              disabled:cursor-not-allowed
              ${
                deliveryType === "OFFICE"
                  ? "border-[#a3834d] bg-[#f8f5ef] ring-1 ring-[#a3834d]/20"
                  : "border-black/10 bg-white hover:border-[#a3834d]/40"
              }
            `}
          >
            <div className="flex items-center justify-between gap-3">

              <div>
                <p className="font-semibold text-[#1f1f1f]">
                  التوصيل إلى المكتب
                </p>

                <p className="mt-1 text-xs text-black/45">
                  استلام الطلب من مكتب التوصيل
                </p>
              </div>

              <div
                className={`
                  flex
                  h-5
                  w-5
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  ${
                    deliveryType === "OFFICE"
                      ? "border-[#a3834d] bg-[#a3834d]"
                      : "border-black/20 bg-white"
                  }
                `}
              >
                {deliveryType === "OFFICE" && (
                  <div className="h-2 w-2 rounded-full bg-white" />
                )}
              </div>

            </div>
          </button>

          {/* HOME DELIVERY */}

          <button
            type="button"
            onClick={() =>
              setDeliveryType("HOME")
            }
            disabled={loading}
            className={`
              rounded-2xl
              border
              px-4
              py-4
              text-right
              transition
              disabled:cursor-not-allowed
              ${
                deliveryType === "HOME"
                  ? "border-[#a3834d] bg-[#f8f5ef] ring-1 ring-[#a3834d]/20"
                  : "border-black/10 bg-white hover:border-[#a3834d]/40"
              }
            `}
          >
            <div className="flex items-center justify-between gap-3">

              <div>
                <p className="font-semibold text-[#1f1f1f]">
                  التوصيل إلى المنزل
                </p>

                <p className="mt-1 text-xs text-[#a3834d]">
                  +200 دج
                </p>
              </div>

              <div
                className={`
                  flex
                  h-5
                  w-5
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  ${
                    deliveryType === "HOME"
                      ? "border-[#a3834d] bg-[#a3834d]"
                      : "border-black/20 bg-white"
                  }
                `}
              >
                {deliveryType === "HOME" && (
                  <div className="h-2 w-2 rounded-full bg-white" />
                )}
              </div>

            </div>
          </button>

        </div>
      </div>

      {/* ================================================= */}
      {/* SHIPPING PRICE */}
      {/* ================================================= */}

      {selectedWilaya && (
        <div className="rounded-2xl border border-[#a3834d]/20 bg-[#f8f5ef] px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-black/50">
              سعر التوصيل
            </span>

            <span className="font-semibold text-[#a3834d]">
              {shippingCost.toLocaleString(
                "ar-DZ"
              )}{" "}
              دج
            </span>
          </div>

          {deliveryType === "HOME" && (
            <div className="mt-2 flex items-center justify-between gap-4 text-xs">
              <span className="text-black/40">
                رسوم التوصيل إلى المنزل
              </span>

              <span className="font-medium text-black/50">
                +200 دج
              </span>
            </div>
          )}
        </div>
      )}

      {/* ================================================= */}
      {/* ADDRESS */}
      {/* ================================================= */}

      <div>
        <label
          htmlFor="address"
          className="mb-2 block text-sm font-medium text-[#1f1f1f]"
        >
          العنوان
        </label>

        <textarea
          id="address"
          name="address"
          rows={4}
          placeholder="أدخل عنوان التوصيل بالتفصيل"
          
          disabled={loading}
          className="
            w-full
            resize-none
            rounded-xl
            border
            border-black/10
            bg-white
            px-4
            py-4
            text-sm
            outline-none
            transition
            focus:border-[#a3834d]
            focus:ring-1
            focus:ring-[#a3834d]/20
            disabled:cursor-not-allowed
            disabled:bg-black/5
          "
        />
      </div>

      {/* ================================================= */}
      {/* NOTES */}
      {/* ================================================= */}

      <div>
        <label
          htmlFor="notes"
          className="mb-2 block text-sm font-medium text-[#1f1f1f]"
        >
          ملاحظات

          <span className="mr-2 text-xs text-black/40">
            (اختياري)
          </span>
        </label>

        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="أي ملاحظات إضافية..."
          disabled={loading}
          className="
            w-full
            resize-none
            rounded-xl
            border
            border-black/10
            bg-white
            px-4
            py-4
            text-sm
            outline-none
            transition
            focus:border-[#a3834d]
            focus:ring-1
            focus:ring-[#a3834d]/20
            disabled:cursor-not-allowed
            disabled:bg-black/5
          "
        />
      </div>

      {/* ================================================= */}
      {/* SUBMIT */}
      {/* ================================================= */}

      <button
        type="submit"
        disabled={
          loading || cart.length === 0
        }
        className="
          w-full
          rounded-xl
          bg-[#1f1f1f]
          py-4
          font-semibold
          text-white
          transition
          hover:bg-[#a3834d]
          disabled:cursor-not-allowed
          disabled:bg-black/20
        "
      >
        {loading
          ? "جاري تأكيد الطلب..."
          : "تأكيد الطلب"}
      </button>
    </form>
  );
}