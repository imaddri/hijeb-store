import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getOrderById } from "@/actions/order.actions";
import InvoiceActions from "./InvoiceActions";

// ======================================================
// TYPES
// ======================================================

type Props = {
  params: Promise<{
    id: string;
  }>;
};

// ======================================================
// SHIPPING PRICES
// ======================================================
//
// نفس أسعار التوصيل الموجودة في order.actions.ts
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
  "39": 600,
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

// ======================================================
// GET DELIVERY TYPE
// ======================================================
//
// لا نحتاج إلى deliveryType داخل Prisma.
// نستنتج النوع من سعر التوصيل المحفوظ في الطلب.
//
// OFFICE:
// سعر الولاية الأساسي.
//
// HOME:
// سعر الولاية الأساسي + 200 دج.
//
// ======================================================

function getDeliveryType(
  wilaya: string,
  shippingCost: number
) {
  const baseShippingCost =
    SHIPPING_PRICES[wilaya?.trim()];

  if (
    baseShippingCost === undefined
  ) {
    return {
      type: "UNKNOWN",
      label: "غير محدد",
    };
  }

  if (
    shippingCost ===
    baseShippingCost +
      HOME_DELIVERY_SURCHARGE
  ) {
    return {
      type: "HOME",
      label: "التوصيل إلى المنزل",
    };
  }

  if (
    shippingCost ===
    baseShippingCost
  ) {
    return {
      type: "OFFICE",
      label: "التوصيل إلى المكتب",
    };
  }

  return {
    type: "UNKNOWN",
    label: "غير محدد",
  };
}

// ======================================================
// FORMAT PRICE
// ======================================================

function formatPrice(value: number) {
  return value.toLocaleString("ar-DZ");
}

// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ar-DZ", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

// ======================================================
// STATUS
// ======================================================

function getStatusLabel(status: string) {
  switch (status) {
    case "PENDING":
      return "جديد";

    case "CONFIRMED":
      return "تم التأكيد";

    case "PROCESSING":
      return "قيد المعالجة";

    case "SHIPPED":
      return "تم الشحن";

    case "DELIVERED":
      return "تم التسليم";

    case "CANCELLED":
      return "ملغى";

    default:
      return status;
  }
}

// ======================================================
// PAGE
// ======================================================

export default async function InvoicePage({
  params,
}: Props) {
  const { id } = await params;

  let order;

  try {
    order = await getOrderById(id);
  } catch {
    notFound();
  }

  // ====================================================
  // DELIVERY TYPE
  // ====================================================

  const deliveryType =
    getDeliveryType(
      order.customer.wilaya,
      order.shippingCost
    );

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-zinc-100 px-4 py-8 text-zinc-900 sm:px-6 lg:px-8 print:min-h-0 print:bg-white print:p-0"
    >
      {/* ================================================= */}
      {/* ACTION BAR */}
      {/* ================================================= */}

      <InvoiceActions
        orderNumber={order.orderNumber}
      />

      {/* ================================================= */}
      {/* INVOICE */}
      {/* ================================================= */}

      <main
        id="invoice"
        className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-white shadow-xl print:max-w-none print:rounded-none print:shadow-none"
      >
        {/* ================================================= */}
        {/* TOP GOLD LINE */}
        {/* ================================================= */}

        <div className="h-2 bg-[#a3834d] print:h-1" />

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="border-b border-zinc-200 px-7 py-8 sm:px-10 sm:py-10 print:px-7 print:py-4">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between print:flex-row print:gap-4">

            {/* ================================================= */}
            {/* BRAND */}
            {/* ================================================= */}

            <div>

              <div className="flex items-center gap-4 print:gap-3">

                {/* ================================================= */}
                {/* LOGO */}
                {/* ================================================= */}

                <div
                  className="
                    flex
                    h-30
                    w-30
                    shrink-0
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-full
                    bg-[#1f1f1f]
                    shadow-lg
                    shadow-black/10
                    print:h-14
                    print:w-14
                    print:rounded-full
                    print:shadow-none
                  "
                >
                  <Image
                    src="/icons/log11.svg"
                    alt="BOUTIQUE MARAM"
                    width={100}
                    height={100}
                    priority
                    className="
                      h-[120px]
                      w-[120px]
                      object-contain
                      print:h-[60px]
                      print:w-[60px]
                    "
                  />
                </div>

                {/* ================================================= */}
                {/* BRAND NAME */}
                {/* ================================================= */}

                <div>
                  <h1 className="text-2xl font-black tracking-tight text-zinc-950 print:text-xl">
                    BOUTIQUE MARAM
                  </h1>

                  <p className="mt-1 text-sm font-medium text-[#a3834d] print:text-xs">
                    أناقة تبدأ من التفاصيل
                  </p>
                </div>

              </div>

              <div className="mt-6 space-y-1 text-sm leading-6 text-zinc-500 print:mt-3 print:text-xs print:leading-5">
                <p>متجر الأزياء والحجابات النسائية</p>
                <p>الوادي-الجزائر</p>
              </div>

            </div>

            {/* ================================================= */}
            {/* INVOICE INFO */}
            {/* ================================================= */}

            <div className="text-right sm:text-left">

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400 print:text-[10px]">
                INVOICE
              </p>

              <h2 className="mt-2 text-3xl font-black text-zinc-950 print:mt-1 print:text-2xl">
                فاتورة
              </h2>

              <div className="mt-5 rounded-2xl bg-[#faf7f0] px-5 py-4 print:mt-2 print:rounded-xl print:px-4 print:py-2.5">

                <p className="text-xs font-medium text-zinc-500 print:text-[10px]">
                  رقم الفاتورة
                </p>

                <p
                  dir="ltr"
                  className="mt-1 text-lg font-black tracking-wide text-[#a3834d] print:text-base"
                >
                  ORD-{order.orderNumber}
                </p>

              </div>

              <p className="mt-4 text-sm text-zinc-500 print:mt-2 print:text-xs">
                {formatDate(order.createdAt)}
              </p>

            </div>

          </div>
        </div>

        {/* ================================================= */}
        {/* CUSTOMER + ORDER STATUS */}
        {/* ================================================= */}

        <div className="grid gap-5 border-b border-zinc-200 px-7 py-7 sm:grid-cols-2 sm:px-10 print:gap-3 print:px-7 print:py-3">

          {/* CUSTOMER */}

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 print:rounded-xl print:p-3">

            <p className="mb-4 text-xl font-bold uppercase tracking-wider text-[#a3834d] print:mb-2 print:text-sm">
              معلومات العميل
            </p>

            <h3 className="text-lg font-black text-zinc-950 print:text-base">
              {order.customer.name}
            </h3>

            <div className="mt-3 space-y-1.5 text-sm leading-6 text-zinc-600 print:mt-1.5 print:space-y-0.5 print:text-xs print:leading-5">

              <p dir="ltr" className="text-right">
                {order.customer.phone}
              </p>

              <p>
                {order.customer.wilaya} —{" "}
                {order.customer.commune}
              </p>

              <p>
                {order.customer.address}
              </p>

            </div>

          </div>

          {/* ORDER STATUS */}

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 print:rounded-xl print:p-3">

            <p className="mb-4 text-xl font-bold uppercase tracking-wider text-[#a3834d] print:mb-2 print:text-sm">
              معلومات الطلب
            </p>

            <div className="space-y-3 text-sm print:space-y-1.5 print:text-xs">

              {/* STATUS */}

              <div className="flex items-center justify-between">

                <span className="text-zinc-500">
                  حالة الطلب
                </span>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 print:px-2 print:py-0.5 print:text-[10px]">
                  {getStatusLabel(order.status)}
                </span>

              </div>

              {/* DELIVERY TYPE */}

              <div className="flex items-center justify-between">

                <span className="text-zinc-500">
                  نوع التوصيل
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold print:px-2 print:py-0.5 print:text-[10px] ${
                    deliveryType.type ===
                    "HOME"
                      ? "bg-blue-100 text-blue-700"
                      : deliveryType.type ===
                        "OFFICE"
                      ? "bg-[#f3eadc] text-[#8a6b3d]"
                      : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {deliveryType.type ===
                    "HOME" && " "}

                  {deliveryType.type ===
                    "OFFICE" && " "}

                  {deliveryType.label}
                </span>

              </div>

              {/* PRODUCTS COUNT */}

              <div className="flex items-center justify-between">

                <span className="text-zinc-500">
                  عدد المنتجات
                </span>

                <span className="font-bold text-zinc-900">
                  {order.items.length}
                </span>

              </div>

              {/* ORDER DATE */}

              <div className="flex items-center justify-between">

                <span className="text-zinc-500">
                  تاريخ الطلب
                </span>

                <span className="font-semibold text-zinc-900">
                  {new Intl.DateTimeFormat(
                    "ar-DZ",
                    {
                      dateStyle: "medium",
                    }
                  ).format(
                    order.createdAt
                  )}
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* PRODUCTS */}
        {/* ================================================= */}

        <div className="px-7 py-8 sm:px-10 print:px-7 print:py-4">

          <div className="mb-5 flex items-center justify-between print:mb-2">

            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-[#a3834d] print:text-[9px]">
                Order Items
              </p>

              <h2 className="mt-1 text-xl font-black text-zinc-950 print:mt-0.5 print:text-lg">
                تفاصيل المنتجات
              </h2>

            </div>

            <div className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-bold text-zinc-600 print:px-3 print:py-1 print:text-xs">
              {order.items.length} منتجات
            </div>

          </div>

          <div className="overflow-hidden rounded-2xl border border-zinc-200 print:rounded-xl">

            {/* TABLE HEADER */}

            <div className="hidden grid-cols-[1fr_100px_100px_130px] gap-4 bg-zinc-950 px-5 py-4 text-xs font-bold text-white sm:grid print:grid print:grid-cols-[1fr_90px_70px_110px] print:gap-3 print:px-4 print:py-2.5 print:text-[10px]">

              <div>
                المنتج
              </div>

              <div className="text-center">
                السعر
              </div>

              <div className="text-center">
                الكمية
              </div>

              <div className="text-left">
                الإجمالي
              </div>

            </div>

            {/* ITEMS */}

            <div className="divide-y divide-zinc-200">

              {order.items.map((item) => {

                const itemTotal =
                  item.price * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="grid gap-4 px-5 py-5 sm:grid-cols-[1fr_100px_100px_130px] sm:items-center print:grid-cols-[1fr_90px_70px_110px] print:gap-3 print:px-4 print:py-2.5"
                  >

                    {/* PRODUCT */}

                    <div>

                      <div className="flex items-start gap-3 print:gap-2">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#faf7f0] text-[#a3834d] print:h-8 print:w-8 print:rounded-lg">

                          <span className="text-lg font-black print:text-sm">
                            {item.quantity}
                          </span>

                        </div>

                        <div className="min-w-0">

                          <h3 className="font-bold text-zinc-900 print:text-sm">
                            {item.productName}
                          </h3>

                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500 print:mt-0.5 print:gap-x-2 print:text-[9px]">

                            {item.product?.productCode && (
                              <span>
                                الكود:{" "}
                                <b
                                  dir="ltr"
                                  className="text-zinc-700"
                                >
                                  {
                                    item
                                      .product
                                      .productCode
                                  }
                                </b>
                              </span>
                            )}

                            {item.color && (
                              <span>
                                اللون:{" "}
                                <b className="text-zinc-700">
                                  {item.color}
                                </b>
                              </span>
                            )}

                            {item.size && (
                              <span>
                                المقاس:{" "}
                                <b className="text-zinc-700">
                                  {item.size}
                                </b>
                              </span>
                            )}

                          </div>

                        </div>

                      </div>

                      {/* MOBILE PRICE */}

                      <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 sm:hidden print:hidden">

                        <span className="text-xs text-zinc-500">
                          السعر × الكمية
                        </span>

                        <span className="font-semibold text-zinc-800">
                          {formatPrice(
                            item.price
                          )}{" "}
                          ×{" "}
                          {item.quantity}
                        </span>

                      </div>

                    </div>

                    {/* PRICE */}

                    <div className="hidden text-center text-sm font-semibold text-zinc-700 sm:block print:text-xs">
                      {formatPrice(
                        item.price
                      )}{" "}
                      دج
                    </div>

                    {/* QUANTITY */}

                    <div className="hidden text-center text-sm font-semibold text-zinc-700 sm:block print:text-xs">
                      {item.quantity}
                    </div>

                    {/* TOTAL */}

                    <div className="text-left">

                      <span className="text-xs text-zinc-400 sm:hidden print:hidden">
                        الإجمالي
                      </span>

                      <p className="mt-1 text-lg font-black text-[#a3834d] sm:mt-0 print:text-sm">
                        {formatPrice(
                          itemTotal
                        )}{" "}
                        دج
                      </p>

                    </div>

                  </div>
                );
              })}

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* FINAL TOTAL */}
        {/* ================================================= */}

        <div className="px-7 pb-8 sm:px-10 print:px-7 print:pb-4">

          <div className="ml-auto max-w-md rounded-2xl bg-[#faf7f0] p-6 print:rounded-xl print:p-3.5">

            {/* ================================================= */}
            {/* SUBTOTAL */}
            {/* ================================================= */}

            <div className="flex items-center justify-between border-b border-[#e5dccb] pb-3 print:pb-2">

              <span className="text-sm font-semibold text-zinc-600 print:text-xs">
                الإجمالي قبل التوصيل
              </span>

              <span className="text-base font-black text-zinc-900 print:text-sm">
                {formatPrice(
                  order.subtotal
                )}{" "}
                دج
              </span>

            </div>

            {/* ================================================= */}
            {/* SHIPPING */}
            {/* ================================================= */}

            <div className="flex items-center justify-between border-b border-[#e5dccb] py-3 print:py-2">

              <span className="text-sm font-semibold text-zinc-600 print:text-xs">
                سعر التوصيل
              </span>

              <span className="text-base font-black text-zinc-900 print:text-sm">
                {formatPrice(
                  order.shippingCost
                )}{" "}
                دج
              </span>

            </div>

            {/* ================================================= */}
            {/* FINAL TOTAL */}
            {/* ================================================= */}

            <div className="mt-3 flex items-center justify-between rounded-xl bg-zinc-950 px-5 py-4 print:mt-2 print:px-4 print:py-2.5">

              <span className="font-bold text-white print:text-sm">
                الإجمالي النهائي
              </span>

              <span className="text-xl font-black text-[#d6b77a] print:text-lg">
                {formatPrice(
                  order.total
                )}{" "}
                دج
              </span>

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* NOTES */}
        {/* ================================================= */}

        {(order.notes ||
          order.customer.notes) && (
          <div className="mx-7 mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:mx-10 print:mx-7 print:mb-3 print:rounded-xl print:p-3">

            <p className="text-sm font-black text-amber-900 print:text-xs">
              ملاحظات
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-amber-800 print:mt-1 print:text-[10px] print:leading-4">
              {order.notes ||
                order.customer.notes}
            </p>

          </div>
        )}

        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <div className="border-t border-zinc-200 bg-zinc-950 px-7 py-7 text-white sm:px-10 print:px-7 print:py-3">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:flex-row print:gap-3">

            <div>

              <p className="font-bold print:text-sm">
                شكرًا لاختياركم BOUTIQUE MARAM
              </p>

              <p className="mt-1 text-xs text-zinc-400 print:text-[9px]">
                نتمنى لكم تجربة تسوق مميزة وأنيقة.
              </p>

            </div>

            <div className="text-right sm:text-left">

              <p className="text-xs text-zinc-500 print:text-[9px]">
                فاتورة إلكترونية
              </p>

              <p
                dir="ltr"
                className="mt-1 text-sm font-bold text-[#d6b77a] print:text-xs"
              >
                ORD-{order.orderNumber}
              </p>

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* PRINT FOOTER */}
        {/* ================================================= */}

        <div className="hidden px-10 py-4 text-center text-xs text-zinc-400 print:block print:px-7 print:py-2 print:text-[8px]">
          تم إنشاء هذه الفاتورة إلكترونيًا — BOUTIQUE MARAM
        </div>

      </main>

    </div>
  );
}