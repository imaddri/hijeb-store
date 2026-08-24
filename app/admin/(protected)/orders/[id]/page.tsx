import Link from "next/link";
import { redirect } from "next/navigation";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

import {
  deleteOrderItem,
  deliverOrder,
  deleteOrder,
  getOrderById,
  returnOrderToProcessing,
  updateOrderCustomer,
  updateOrderItem,
  confirmOrder,
} from "@/actions/order.actions";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Hash,
  MapPin,
  MessageSquare,
  Package,
  PackageCheck,
  Phone,
  RotateCcw,
  Save,
  ShoppingBag,
  Trash2,
  Truck,
  User,
} from "lucide-react";

// ======================================================
// TYPES
// ======================================================

type Props = {
  params: Promise<{
    id: string;
  }>;
};

// ======================================================
// STATUS LABEL
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
// STATUS STYLE
// ======================================================

function getStatusStyle(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-blue-100 text-blue-700";

    case "CONFIRMED":
      return "bg-indigo-100 text-indigo-700";

    case "PROCESSING":
      return "bg-yellow-100 text-yellow-700";

    case "SHIPPED":
      return "bg-purple-100 text-purple-700";

    case "DELIVERED":
      return "bg-emerald-100 text-emerald-700";

    case "CANCELLED":
      return "bg-red-100 text-red-700";

    default:
      return "bg-zinc-100 text-zinc-700";
  }
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
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

// ======================================================
// PAGE
// ======================================================

export default async function OrderDetailsPage({
  params,
}: Props) {
  const { id } = await params;

  const order = await getOrderById(id);

  return (
    <DashboardLayout>
      <div dir="rtl" className="space-y-6">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            {/* BACK */}

            <div className="mb-3">

              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
              >
                <ArrowRight size={17} />

                العودة إلى الطلبات
              </Link>

            </div>

            {/* TITLE */}

            <div className="flex flex-wrap items-center gap-3">

              <h1 className="text-3xl font-bold text-zinc-900">
                تفاصيل الطلب
              </h1>

              <span
                dir="ltr"
                className="rounded-lg bg-[#a3834d]/10 px-3 py-1.5 font-semibold text-[#a3834d]"
              >
                ORD-{order.orderNumber}
              </span>

            </div>

            <p className="mt-2 text-sm text-zinc-500">
              جميع معلومات وتفاصيل هذا الطلب
            </p>

          </div>

          {/* ================================================= */}
          {/* STATUS ACTIONS */}
          {/* ================================================= */}

          <div className="flex flex-wrap items-center gap-2">

            {/* PENDING */}

            {order.status === "PENDING" && (
              <form
                action={async () => {
                  "use server";

                  await confirmOrder(order.id);
                }}
              >
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-yellow-100 px-4 py-3 text-sm font-semibold text-yellow-700 transition hover:bg-yellow-200"
                >
                  <Truck size={18} />

                  توصيل
                </button>
              </form>
            )}

            {/* PROCESSING */}

            {order.status === "PROCESSING" && (
              <form
                action={async () => {
                  "use server";

                  await deliverOrder(order.id);
                }}
              >
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-200"
                >
                  <PackageCheck size={18} />

                  تم التسليم
                </button>
              </form>
            )}

            {/* DELIVERED */}

            {order.status === "DELIVERED" && (
              <form
                action={async () => {
                  "use server";

                  await returnOrderToProcessing(order.id);
                }}
              >
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-orange-100 px-4 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-200"
                >
                  <RotateCcw size={18} />

                  إرجاع لقيد المعالجة
                </button>
              </form>
            )}

            {/* STATUS */}

            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusStyle(
                order.status
              )}`}
            >
              {getStatusLabel(order.status)}
            </span>

          </div>

        </div>

        {/* ================================================= */}
        {/* ORDER META */}
        {/* ================================================= */}

        <div className="grid gap-4 md:grid-cols-2">

          {/* ORDER NUMBER */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Hash size={22} />
              </div>

              <div>

                <p className="text-sm text-zinc-500">
                  رقم الطلب
                </p>

                <p
                  dir="ltr"
                  className="mt-1 text-lg font-bold text-zinc-900"
                >
                  ORD-{order.orderNumber}
                </p>

              </div>

            </div>

          </div>

          {/* DATE */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                <CalendarDays size={22} />
              </div>

              <div>

                <p className="text-sm text-zinc-500">
                  تاريخ إنشاء الطلب
                </p>

                <p className="mt-1 font-semibold text-zinc-900">
                  {formatDate(order.createdAt)}
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* CUSTOMER */}
        {/* ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">

          {/* HEADER */}

          <div className="border-b border-zinc-100 bg-gradient-to-l from-[#faf7f0] to-white p-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <User size={21} />
              </div>

              <div>

                <h2 className="text-lg font-bold text-zinc-900">
                  معلومات العميل
                </h2>

                <p className="text-sm text-zinc-500">
                  تعديل بيانات صاحب الطلب وعنوان التوصيل
                </p>

              </div>

            </div>

          </div>

          {/* CUSTOMER FORM */}

          <form
            action={async (formData) => {
              "use server";

              await updateOrderCustomer({
                orderId: order.id,

                name: String(
                  formData.get("name") || ""
                ),

                phone: String(
                  formData.get("phone") || ""
                ),

                wilaya: String(
                  formData.get("wilaya") || ""
                ),

                commune: String(
                  formData.get("commune") || ""
                ),

                address: String(
                  formData.get("address") || ""
                ),

                notes: String(
                  formData.get("notes") || ""
                ),
              });
            }}
            className="p-6"
          >

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

              {/* NAME */}

              <div>

                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-700">
                  <User size={16} />

                  اسم العميل
                </label>

                <input
                  name="name"
                  defaultValue={order.customer.name}
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-800 outline-none transition focus:border-[#a3834d] focus:ring-2 focus:ring-[#a3834d]/10"
                />

              </div>

              {/* PHONE */}

              <div>

                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-700">
                  <Phone size={16} />

                  رقم الهاتف
                </label>

                <div className="relative">

                  <Phone
                    size={18}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />

                  <input
                    name="phone"
                    defaultValue={order.customer.phone}
                    dir="ltr"
                    className="w-full rounded-xl border border-zinc-200 py-3 pl-4 pr-10 text-sm font-medium text-zinc-800 outline-none transition focus:border-[#a3834d] focus:ring-2 focus:ring-[#a3834d]/10"
                  />

                </div>

              </div>

              {/* WILAYA */}

              <div>

                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-700">
                  <MapPin size={16} />

                  الولاية
                </label>

                <input
                  name="wilaya"
                  defaultValue={order.customer.wilaya}
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-800 outline-none transition focus:border-[#a3834d] focus:ring-2 focus:ring-[#a3834d]/10"
                />

              </div>

              {/* COMMUNE */}

              <div>

                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-700">
                  <MapPin size={16} />

                  البلدية
                </label>

                <input
                  name="commune"
                  defaultValue={order.customer.commune}
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-800 outline-none transition focus:border-[#a3834d] focus:ring-2 focus:ring-[#a3834d]/10"
                />

              </div>

              {/* ADDRESS */}

              <div className="md:col-span-2">

                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-700">
                  <MapPin size={16} />

                  العنوان الكامل
                </label>

                <div className="relative">

                  <MapPin
                    size={18}
                    className="absolute right-3 top-3 text-zinc-400"
                  />

                  <textarea
                    name="address"
                    defaultValue={order.customer.address}
                    rows={3}
                    className="w-full rounded-xl border border-zinc-200 px-4 py-3 pr-10 text-sm font-medium leading-7 text-zinc-800 outline-none transition focus:border-[#a3834d] focus:ring-2 focus:ring-[#a3834d]/10"
                  />

                </div>

              </div>

              {/* NOTES */}

              <div className="md:col-span-2 lg:col-span-3">

                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-700">
                  <MessageSquare size={16} />

                  ملاحظات العميل
                </label>

                <textarea
                  name="notes"
                  defaultValue={order.customer.notes || ""}
                  rows={3}
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium leading-7 text-zinc-800 outline-none transition focus:border-[#a3834d] focus:ring-2 focus:ring-[#a3834d]/10"
                />

              </div>

            </div>

            {/* SAVE */}

            <div className="mt-5 flex justify-start">

              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                <Save size={18} />

                حفظ بيانات العميل
              </button>

            </div>

          </form>

        </div>

        {/* ================================================= */}
        {/* NOTES */}
        {/* ================================================= */}

        {(order.notes || order.customer.notes) && (

          <div className="rounded-2xl border border-amber-200 bg-amber-50">

            <div className="p-5">

              <div className="flex items-start gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <MessageSquare size={21} />
                </div>

                <div className="flex-1">

                  <h2 className="font-bold text-amber-900">
                    ملاحظات الطلب
                  </h2>

                  {order.notes && (
                    <p className="mt-2 leading-7 text-amber-800">
                      {order.notes}
                    </p>
                  )}

                  {!order.notes &&
                    order.customer.notes && (
                      <p className="mt-2 leading-7 text-amber-800">
                        {order.customer.notes}
                      </p>
                    )}

                </div>

              </div>

            </div>

          </div>

        )}

        {/* ================================================= */}
        {/* PRODUCTS */}
        {/* ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">

          {/* HEADER */}

          <div className="border-b border-zinc-100 bg-gradient-to-l from-[#faf7f0] to-white p-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <ShoppingBag size={21} />
              </div>

              <div>

                <h2 className="text-lg font-bold text-zinc-900">
                  المنتجات
                </h2>

                <p className="text-sm text-zinc-500">
                  تعديل المنتجات والكميات والنسخ
                </p>

              </div>

              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
                {order.items.length}
              </span>

            </div>

          </div>

          {/* PRODUCTS */}

          <div className="divide-y divide-zinc-100">

            {order.items.map((item) => {

              const currentVariant =
                item.product.variants.find(
                  (variant) =>
                    variant.color === item.color &&
                    variant.size === item.size
                );

              const itemTotal =
                item.price * item.quantity;

              return (
                <div
                  key={item.id}
                  className="p-5"
                >

                  <form
                    action={async (formData) => {
                      "use server";

                      const productId = String(
                        formData.get("productId") || ""
                      );

                      const variantIdValue = String(
                        formData.get("variantId") || ""
                      );

                      const quantity = Number(
                        formData.get("quantity") || 0
                      );

                      await updateOrderItem({
                        orderId: order.id,

                        itemId: item.id,

                        productId,

                        variantId:
                          variantIdValue || null,

                        quantity,
                      });
                    }}
                    className="grid gap-5 lg:grid-cols-[1fr_1fr_auto]"
                  >

                    {/* PRODUCT */}

                    <div>

                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-700">
                        <Package
                          size={16}
                          className="text-[#a3834d]"
                        />

                        المنتج / النسخة
                      </label>

                      <select
                        name="variantId"
                        defaultValue={
                          currentVariant?.id || ""
                        }
                        className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 outline-none transition focus:border-[#a3834d] focus:ring-2 focus:ring-[#a3834d]/10"
                      >

                        <option value="">
                          {item.product.name} — بدون نسخة
                        </option>

                        {item.product.variants.map(
                          (variant) => (
                            <option
                              key={variant.id}
                              value={variant.id}
                            >
                              {item.product.name}
                              {" — "}
                              {variant.color ||
                                "بدون لون"}
                              {" / "}
                              {variant.size ||
                                "بدون مقاس"}
                              {" — المخزون: "}
                              {variant.stock}
                            </option>
                          )
                        )}

                      </select>

                      <p className="mt-2 text-xs text-zinc-400">
                        يمكنك تغيير اللون أو المقاس من خلال النسخة.
                      </p>

                    </div>

                    {/* QUANTITY */}

                    <div>

                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-700">
                        <span>🔢</span>

                        الكمية
                      </label>

                      <input
                        type="number"
                        name="quantity"
                        min="1"
                        defaultValue={item.quantity}
                        className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-800 outline-none transition focus:border-[#a3834d] focus:ring-2 focus:ring-[#a3834d]/10"
                      />

                      <p className="mt-2 text-xs text-zinc-400">
                        السعر الحالي:{" "}

                        <span className="font-semibold text-zinc-600">
                          {formatPrice(
                            item.product.price
                          )}{" "}
                          دج
                        </span>
                      </p>

                    </div>

                    {/* ACTIONS */}

                    <div className="flex items-end gap-2">

                      <input
                        type="hidden"
                        name="productId"
                        value={item.productId}
                      />

                      {/* SAVE */}

                      <button
                        type="submit"
                        className="flex items-center gap-2 rounded-xl bg-blue-100 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-200"
                      >
                        <Save size={17} />

                        حفظ
                      </button>

                      {/* DELETE ITEM */}

                      <button
                        type="submit"
                        formAction={async () => {
                          "use server";

                          await deleteOrderItem(
                            order.id,
                            item.id
                          );
                        }}
                        className="flex items-center gap-2 rounded-xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-200"
                      >
                        <Trash2 size={17} />

                        حذف
                      </button>

                    </div>

                    {/* PRODUCT INFORMATION */}

                    <div className="rounded-xl bg-zinc-50 p-4 lg:col-span-3">

                      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">

                        <div>

                          <span className="text-zinc-400">
                            المنتج:
                          </span>

                          <span className="mr-2 font-semibold text-zinc-800">
                            {item.productName}
                          </span>

                        </div>

                        {item.product?.productCode && (
                          <div>

                            <span className="text-zinc-400">
                              الكود:
                            </span>

                            <span
                              dir="ltr"
                              className="mr-2 font-semibold text-zinc-800"
                            >
                              {item.product.productCode}
                            </span>

                          </div>
                        )}

                        <div>

                          <span className="text-zinc-400">
                            اللون:
                          </span>

                          <span className="mr-2 font-semibold text-zinc-800">
                            {item.color || "غير محدد"}
                          </span>

                        </div>

                        <div>

                          <span className="text-zinc-400">
                            المقاس:
                          </span>

                          <span className="mr-2 font-semibold text-zinc-800">
                            {item.size || "غير محدد"}
                          </span>

                        </div>

                        <div>

                          <span className="text-zinc-400">
                            السعر:
                          </span>

                          <span className="mr-2 font-semibold text-zinc-800">
                            {formatPrice(item.price)} دج
                          </span>

                        </div>

                        <div>

                          <span className="text-zinc-400">
                            الكمية:
                          </span>

                          <span className="mr-2 font-semibold text-zinc-800">
                            {item.quantity}
                          </span>

                        </div>

                        <div>

                          <span className="text-zinc-400">
                            الإجمالي:
                          </span>

                          <span className="mr-2 font-bold text-[#a3834d]">
                            {formatPrice(itemTotal)} دج
                          </span>

                        </div>

                      </div>

                    </div>

                  </form>

                </div>
              );
            })}

          </div>

        </div>

        {/* ================================================= */}
        {/* SUMMARY */}
        {/* ================================================= */}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* ORDER INFORMATION */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-6">

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                <Truck size={21} />
              </div>

              <div>

                <h2 className="font-bold text-zinc-900">
                  معلومات الطلب
                </h2>

                <p className="text-xs text-zinc-500">
                  حالة الطلب الحالية
                </p>

              </div>

            </div>

            <div className="space-y-4">

              <div className="flex items-center justify-between">

                <span className="text-sm text-zinc-500">
                  الحالة
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                    order.status
                  )}`}
                >
                  {getStatusLabel(order.status)}
                </span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-sm text-zinc-500">
                  عدد المنتجات
                </span>

                <span className="font-semibold text-zinc-900">
                  {order.items.length}
                </span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-sm text-zinc-500">
                  تاريخ الإنشاء
                </span>

                <span className="text-left font-semibold text-zinc-900">
                  {new Intl.DateTimeFormat(
                    "ar-DZ",
                    {
                      dateStyle: "medium",
                    }
                  ).format(order.createdAt)}
                </span>

              </div>

            </div>

          </div>

          {/* PRICE SUMMARY */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 lg:col-span-2">

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 size={21} />
              </div>

              <div>

                <h2 className="font-bold text-zinc-900">
                  ملخص المبلغ
                </h2>

                <p className="text-xs text-zinc-500">
                  تفاصيل حساب إجمالي الطلب
                </p>

              </div>

            </div>

            <div className="space-y-4">

              {/* SUBTOTAL */}

              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">

                <span className="text-zinc-500">
                  المجموع الفرعي
                </span>

                <span className="font-semibold text-zinc-900">
                  {formatPrice(order.subtotal)} دج
                </span>

              </div>

              {/* SHIPPING */}

              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">

                <span className="text-zinc-500">
                  تكلفة الشحن
                </span>

                <span className="font-semibold text-zinc-900">
                  {formatPrice(order.shippingCost)} دج
                </span>

              </div>

              {/* DISCOUNT */}

              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">

                <span className="text-zinc-500">
                  الخصم
                </span>

                <span className="font-semibold text-red-600">
                  - {formatPrice(order.discount)} دج
                </span>

              </div>

              {/* TOTAL */}

              <div className="flex items-center justify-between rounded-xl bg-zinc-50 p-4">

                <span className="text-lg font-bold text-zinc-900">
                  الإجمالي النهائي
                </span>

                <span className="text-2xl font-bold text-[#a3834d]">
                  {formatPrice(order.total)} دج
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* FOOTER ACTIONS */}
        {/* ================================================= */}

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-5">

          <div className="flex items-center gap-3 text-sm text-zinc-500">

            <Clock3 size={18} />

            <span>
              آخر تحديث:{" "}
              {formatDate(order.updatedAt)}
            </span>

          </div>

          <div className="flex flex-wrap gap-2">

            {/* INVOICE */}

            <Link
              href={`/invoice/${order.id}`}
              target="_blank"
              className="flex items-center gap-2 rounded-xl bg-amber-100 px-5 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-200"
            >
              <FileText size={18} />

              فتح الفاتورة
            </Link>

            {/* DELETE ORDER */}

            <form
              action={async () => {
                "use server";

                await deleteOrder(order.id);

                redirect("/admin/orders");
              }}
            >
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-red-100 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-200"
              >
                <Trash2 size={18} />

                حذف الطلب بالكامل
              </button>
            </form>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}