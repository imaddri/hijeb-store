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

export default function OrderForm() {
  const router = useRouter();

  const { cart, clearCart } = useCart();

  const [selectedWilaya, setSelectedWilaya] = useState("");
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
          required
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