"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

import {
  confirmOrder,
  deliverOrder,
  deleteOrder,
  getOrders,
  returnOrderToProcessing,
} from "@/actions/order.actions";

import {
  Clock3,
  CheckCircle2,
  XCircle,
  ShoppingCart,
  Truck,
  PackageCheck,
  Trash2,
  FileText,
  Search,
  RotateCcw,
  Eye,
} from "lucide-react";

// ======================================================
// TYPES
// ======================================================

type Order = Awaited<ReturnType<typeof getOrders>>[number];

type Tab =
  | "pending"
  | "processing"
  | "delivered";

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
// PAGE
// ======================================================

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const [activeTab, setActiveTab] =
    useState<Tab>("pending");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  // ====================================================
  // LOAD ORDERS
  // ====================================================

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await getOrders();

        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  // ====================================================
  // COUNTS
  // ====================================================

  const pendingOrders = useMemo(
    () =>
      orders.filter(
        (order) => order.status === "PENDING"
      ),
    [orders]
  );

  const processingOrders = useMemo(
    () =>
      orders.filter(
        (order) => order.status === "PROCESSING"
      ),
    [orders]
  );

  const deliveredOrders = useMemo(
    () =>
      orders.filter(
        (order) => order.status === "DELIVERED"
      ),
    [orders]
  );

  const cancelledOrders = useMemo(
    () =>
      orders.filter(
        (order) => order.status === "CANCELLED"
      ),
    [orders]
  );

  // ====================================================
  // CURRENT ORDERS
  // ====================================================

  const currentOrders = useMemo(() => {
    let result: Order[] = [];

    if (activeTab === "pending") {
      result = pendingOrders;
    }

    if (activeTab === "processing") {
      result = processingOrders;
    }

    if (activeTab === "delivered") {
      result = deliveredOrders;
    }

    // ==================================================
    // SEARCH
    // ==================================================

    const query = search.trim().toLowerCase();

    if (!query) {
      return result;
    }

    return result.filter((order) => {
      const orderNumber =
        `ORD-${order.orderNumber}`.toLowerCase();

      const numberOnly =
        String(order.orderNumber).toLowerCase();

      const customerName =
        order.customer.name.toLowerCase();

      return (
        orderNumber.includes(query) ||
        numberOnly.includes(query) ||
        customerName.includes(query)
      );
    });
  }, [
    activeTab,
    search,
    pendingOrders,
    processingOrders,
    deliveredOrders,
  ]);

  // ====================================================
  // ACTION HANDLER
  // ====================================================

  async function handleAction(
    action: () => Promise<any>,
    orderId: string
  ) {
    try {
      setActionLoading(orderId);

      await action();

      const updatedOrders = await getOrders();

      setOrders(updatedOrders);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء تنفيذ العملية."
      );
    } finally {
      setActionLoading(null);
    }
  }

  // ====================================================
  // DELETE
  // ====================================================

  async function handleDelete(orderId: string) {
    const confirmed = window.confirm(
      "هل أنت متأكد من حذف هذا الطلب؟"
    );

    if (!confirmed) {
      return;
    }

    await handleAction(
      () => deleteOrder(orderId),
      orderId
    );
  }

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <DashboardLayout>
        <div
          dir="rtl"
          className="flex min-h-[500px] items-center justify-center"
        >
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-blue-600" />

            <p className="mt-4 text-sm text-zinc-500">
              جاري تحميل الطلبات...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div dir="rtl">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-zinc-900">
            إدارة الطلبات
          </h1>

          <p className="mt-2 text-zinc-500">
            متابعة وإدارة طلبات العملاء
          </p>

        </div>

        {/* ================================================= */}
        {/* STATS */}
        {/* ================================================= */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* TOTAL */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-zinc-500">
                  إجمالي الطلبات
                </p>

                <p className="mt-2 text-3xl font-bold text-zinc-900">
                  {orders.length}
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <ShoppingCart size={24} />
              </div>

            </div>

          </div>

          {/* PROCESSING */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-zinc-500">
                  قيد المعالجة
                </p>

                <p className="mt-2 text-3xl font-bold text-yellow-600">
                  {processingOrders.length}
                </p>

              </div>

              <Clock3
                className="text-yellow-600"
                size={28}
              />

            </div>

          </div>

          {/* DELIVERED */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-zinc-500">
                  الطلبات المكتملة
                </p>

                <p className="mt-2 text-3xl font-bold text-emerald-600">
                  {deliveredOrders.length}
                </p>

              </div>

              <CheckCircle2
                className="text-emerald-600"
                size={28}
              />

            </div>

          </div>

          {/* CANCELLED */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-zinc-500">
                  الطلبات الملغاة
                </p>

                <p className="mt-2 text-3xl font-bold text-red-600">
                  {cancelledOrders.length}
                </p>

              </div>

              <XCircle
                className="text-red-600"
                size={28}
              />

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* SEARCH */}
        {/* ================================================= */}

        <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5">

          <div className="relative">

            <Search
              size={20}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="ابحث برقم الطلب أو اسم العميل..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pr-12 pl-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-zinc-400 transition hover:text-zinc-700"
              >
                مسح
              </button>
            )}

          </div>

          {search.trim() && (
            <p className="mt-3 text-sm text-zinc-500">

              نتائج البحث عن:

              <span className="mr-1 font-semibold text-zinc-900">
                {search}
              </span>

              <span className="mr-2">
                ({currentOrders.length} نتيجة)
              </span>

            </p>
          )}

        </div>

        {/* ================================================= */}
        {/* TABS */}
        {/* ================================================= */}

        <div className="mb-6 flex flex-wrap gap-3">

          {/* NEW */}

          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`rounded-xl px-5 py-3 font-semibold transition ${
              activeTab === "pending"
                ? "bg-blue-600 text-white"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
          >
            🆕 الطلبات الجديدة ({pendingOrders.length})
          </button>

          {/* PROCESSING */}

          <button
            type="button"
            onClick={() =>
              setActiveTab("processing")
            }
            className={`rounded-xl px-5 py-3 font-semibold transition ${
              activeTab === "processing"
                ? "bg-yellow-500 text-white"
                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
            }`}
          >
            🚚 قيد المعالجة ({processingOrders.length})
          </button>

          {/* DELIVERED */}

          <button
            type="button"
            onClick={() =>
              setActiveTab("delivered")
            }
            className={`rounded-xl px-5 py-3 font-semibold transition ${
              activeTab === "delivered"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            }`}
          >
            ✅ تم التسليم ({deliveredOrders.length})
          </button>

        </div>

        {/* ================================================= */}
        {/* TABLE */}
        {/* ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">

          {/* HEADER */}

          <div className="border-b border-zinc-100 p-5">

            <h2 className="text-lg font-bold text-zinc-900">

              {activeTab === "pending"
                ? "الطلبات الجديدة"
                : activeTab === "processing"
                  ? "الطلبات قيد المعالجة"
                  : "الطلبات التي تم تسليمها"}

            </h2>

          </div>

          {/* ================================================= */}
          {/* EMPTY */}
          {/* ================================================= */}

          {currentOrders.length === 0 ? (

            <div className="flex min-h-[250px] items-center justify-center">

              <div className="text-center">

                <ShoppingCart
                  size={40}
                  className="mx-auto text-zinc-300"
                />

                <p className="mt-4 font-medium text-zinc-500">

                  {search.trim()
                    ? "لا توجد نتائج مطابقة للبحث"
                    : "لا توجد طلبات في هذه القائمة"}

                </p>

              </div>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1200px]">

                {/* ================================================= */}
                {/* THEAD */}
                {/* ================================================= */}

                <thead className="bg-zinc-50">

                  <tr>

                    <th className="px-6 py-4 text-center text-lg font-bold !text-black">
                      رقم الطلب
                    </th>

                    <th className="px-6 py-4 text-center text-lg font-bold !text-black">
                      العميل
                    </th>

                    <th className="px-6 py-4 text-center text-lg font-bold !text-black">
                      الهاتف
                    </th>

                    <th className="px-6 py-4 text-center text-lg font-bold !text-black">
                      المنتجات
                    </th>

                    <th className="px-6 py-4 text-center text-lg font-bold !text-black">
                      الإجمالي
                    </th>

                    <th className="px-6 py-4 text-center text-lg font-bold !text-black">
                      الحالة
                    </th>

                    <th className="px-6 py-4 text-center text-lg font-bold !text-black">
                      الإجراء
                    </th>

                  </tr>

                </thead>

                {/* ================================================= */}
                {/* TBODY */}
                {/* ================================================= */}

                <tbody>

                  {currentOrders.map((order) => {

                    const isLoading =
                      actionLoading === order.id;

                    return (
                      <tr
                        key={order.id}
                        className="border-t border-zinc-100 transition hover:bg-zinc-50"
                      >

                        {/* ORDER NUMBER */}

                        <td className="p-5 text-center">

                          <div
                            className="font-semibold text-[#a3834d]"
                            dir="ltr"
                          >
                            ORD-{order.orderNumber}
                          </div>

                        </td>

                        {/* CUSTOMER */}

                        <td className="p-5 text-center">

                          <div className="flex flex-col items-center justify-center">

                            <div className="font-semibold text-zinc-900">
                              {order.customer.name}
                            </div>

                            <div className="mt-1 text-xs text-zinc-500">
                              {order.customer.wilaya} -{" "}
                              {order.customer.commune}
                            </div>

                          </div>

                        </td>

                        {/* PHONE */}

                        <td className="p-5 text-center text-sm text-zinc-600">

                          <span dir="ltr">
                            {order.customer.phone}
                          </span>

                        </td>

                        {/* PRODUCTS */}

                        <td className="p-5 text-center text-sm text-zinc-600">

                          {order.items.length}{" "}

                          {order.items.length === 1
                            ? "منتج"
                            : "منتجات"}

                        </td>

                        {/* TOTAL */}

                        <td className="p-5 text-center font-semibold text-zinc-900">

                          {order.total.toLocaleString(
                            "ar-DZ"
                          )}{" "}
                          دج

                        </td>

                        {/* STATUS */}

                        <td className="p-5 text-center">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                              order.status
                            )}`}
                          >
                            {getStatusLabel(
                              order.status
                            )}
                          </span>

                        </td>

                        {/* ACTIONS */}

                        <td className="p-5">

                          <div className="flex items-center justify-center gap-2">

                            {/* ====================================== */}
                            {/* PENDING → PROCESSING */}
                            {/* ====================================== */}

                            {order.status === "PENDING" && (

                              <button
                                type="button"
                                disabled={isLoading}
                                onClick={() =>
                                  handleAction(
                                    () =>
                                      confirmOrder(
                                        order.id
                                      ),
                                    order.id
                                  )
                                }
                                className="flex items-center gap-2 rounded-lg bg-yellow-100 px-3 py-2 text-sm font-medium text-yellow-700 transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-50"
                              >

                                <Truck size={17} />

                                {isLoading
                                  ? "جاري..."
                                  : "توصيل"}

                              </button>

                            )}

                            {/* ====================================== */}
                            {/* PROCESSING → DELIVERED */}
                            {/* ====================================== */}

                            {order.status === "PROCESSING" && (

                              <button
                                type="button"
                                disabled={isLoading}
                                onClick={() =>
                                  handleAction(
                                    () =>
                                      deliverOrder(
                                        order.id
                                      ),
                                    order.id
                                  )
                                }
                                className="flex items-center gap-2 rounded-lg bg-emerald-100 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
                              >

                                <PackageCheck size={17} />

                                {isLoading
                                  ? "جاري..."
                                  : "تم التسليم"}

                              </button>

                            )}

                            {/* ====================================== */}
                            {/* DELIVERED → PROCESSING */}
                            {/* ====================================== */}

                            {order.status === "DELIVERED" && (

                              <button
                                type="button"
                                disabled={isLoading}
                                onClick={() =>
                                  handleAction(
                                    () =>
                                      returnOrderToProcessing(
                                        order.id
                                      ),
                                    order.id
                                  )
                                }
                                className="flex items-center gap-2 rounded-lg bg-orange-100 px-3 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-200 disabled:cursor-not-allowed disabled:opacity-50"
                              >

                                <RotateCcw size={17} />

                                {isLoading
                                  ? "جاري..."
                                  : "إرجاع للمعالجة"}

                              </button>

                            )}

                            {/* ====================================== */}
                            {/* DETAILS */}
                            {/* ====================================== */}

                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-200"
                            >

                              <Eye size={17} />

                              تفاصيل

                            </Link>

                            {/* ====================================== */}
                            {/* INVOICE */}
                            {/* ====================================== */}

                            <Link
                              href={`/invoice/${order.id}`}
                              target="_blank"
                              className="flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-200"
                            >

                              <FileText size={17} />

                              الفاتورة

                            </Link>

                            {/* ====================================== */}
                            {/* DELETE */}
                            {/* ====================================== */}

                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() =>
                                handleDelete(order.id)
                              }
                              className="flex items-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                              <Trash2 size={17} />

                              حذف

                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>
    </DashboardLayout>
  );
}