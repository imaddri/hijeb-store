import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ShoppingCart,
  TrendingUp,
  Wallet,
  PackageCheck,
} from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PrintSalesButton from "@/components/dashboard/PrintSalesButton";
import { getSalesSummary } from "@/actions/order.actions";

function formatDZD(value: number) {
  return new Intl.NumberFormat("ar-DZ", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ar-DZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export default async function SettingsPage() {
  const sales = await getSalesSummary();

  const {
    totalSales = 0,
    deliveredOrders = 0,
    totalOrders = 0,
    recentSales = [],
  } = sales ?? {};

  // ======================================================
  // CALCULATIONS
  // ======================================================

  const averageOrder =
    deliveredOrders > 0
      ? totalSales / deliveredOrders
      : 0;

  const deliveryRate =
    totalOrders > 0
      ? (deliveredOrders / totalOrders) * 100
      : 0;

  return (
    <DashboardLayout>
      <div
        dir="rtl"
        className="min-h-screen bg-zinc-50"
      >
        <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">

          {/* ================================================== */}
          {/* PRINT HEADER */}
          {/* ================================================== */}

          <div className="hidden print:block">
            <div className="mb-6 border-b-2 border-zinc-900 pb-4 text-center">

              <h1 className="text-2xl font-bold text-zinc-950">
                تقرير المبيعات
              </h1>

              <p className="mt-2 text-sm text-zinc-500">
                جميع الطلبات المسلّمة
              </p>

              <p className="mt-1 text-xs text-zinc-400">
                تاريخ الطباعة:{" "}
                {new Intl.DateTimeFormat("ar-DZ", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(new Date())}
              </p>

            </div>
          </div>

          {/* ================================================== */}
          {/* HEADER */}
          {/* ================================================== */}

          <section className="print:hidden relative overflow-hidden rounded-3xl bg-zinc-950 p-6 text-white shadow-xl sm:p-8">

            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="absolute -bottom-24 right-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <div className="mb-3 flex items-center gap-2">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15">

                    <BarChart3
                      size={18}
                      className="text-emerald-400"
                    />

                  </div>

                  <span className="text-sm font-medium text-emerald-400">
                    تحليلات المتجر
                  </span>

                </div>

                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  المبيعات والإيرادات
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                  نظرة شاملة على أداء مبيعات المتجر
                  والطلبات التي تم تسليمها فعليًا.
                </p>

              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">

                  <CheckCircle2
                    size={20}
                    className="text-emerald-400"
                  />

                </div>

                <div>

                  <p className="text-xs text-zinc-500">
                    مصدر البيانات
                  </p>

                  <p className="text-sm font-semibold text-white">
                    الطلبات المسلّمة
                  </p>

                </div>

              </div>

            </div>
          </section>

          {/* ================================================== */}
          {/* MAIN STAT CARDS */}
          {/* ================================================== */}

          <section className="print:hidden grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {/* TOTAL SALES */}

            <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

              <div className="absolute -left-10 -top-10 h-28 w-28 rounded-full bg-emerald-50 transition group-hover:scale-150" />

              <div className="relative">

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-sm font-medium text-zinc-500">
                      إجمالي المبيعات
                    </p>

                    <div className="mt-3 flex items-end gap-2">

                      <span className="text-2xl font-bold tracking-tight text-zinc-950">
                        {formatDZD(totalSales)}
                      </span>

                      <span className="mb-1 text-xs font-medium text-emerald-600">
                        دج
                      </span>

                    </div>

                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">

                    <Wallet size={21} />

                  </div>

                </div>

                <div className="mt-5 flex items-center gap-2 text-xs text-zinc-500">

                  <TrendingUp
                    size={14}
                    className="text-emerald-600"
                  />

                  <span>
                    من الطلبات المسلّمة فقط
                  </span>

                </div>

              </div>

            </div>

            {/* DELIVERED ORDERS */}

            <div className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

              <div className="absolute -left-10 -top-10 h-28 w-28 rounded-full bg-blue-50 transition group-hover:scale-150" />

              <div className="relative">

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-sm font-medium text-zinc-500">
                      الطلبات المسلّمة
                    </p>

                    <div className="mt-3 flex items-end gap-2">

                      <span className="text-2xl font-bold tracking-tight text-zinc-950">
                        {deliveredOrders}
                      </span>

                      <span className="mb-1 text-xs text-zinc-500">
                        طلب
                      </span>

                    </div>

                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">

                    <PackageCheck size={21} />

                  </div>

                </div>

                <div className="mt-5 text-xs text-zinc-500">
                  الطلبات التي أصبحت DELIVERED
                </div>

              </div>

            </div>

            {/* AVERAGE ORDER */}

            <div className="group relative overflow-hidden rounded-2xl border border-violet-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

              <div className="absolute -left-10 -top-10 h-28 w-28 rounded-full bg-violet-50 transition group-hover:scale-150" />

              <div className="relative">

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-sm font-medium text-zinc-500">
                      متوسط قيمة الطلب
                    </p>

                    <div className="mt-3 flex items-end gap-2">

                      <span className="text-2xl font-bold tracking-tight text-zinc-950">
                        {formatDZD(averageOrder)}
                      </span>

                      <span className="mb-1 text-xs font-medium text-violet-600">
                        دج
                      </span>

                    </div>

                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">

                    <ShoppingCart size={21} />

                  </div>

                </div>

                <div className="mt-5 text-xs text-zinc-500">
                  متوسط قيمة الطلب المسلّم
                </div>

              </div>

            </div>

            {/* DELIVERY RATE */}

            <div className="group relative overflow-hidden rounded-2xl border border-amber-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

              <div className="absolute -left-10 -top-10 h-28 w-28 rounded-full bg-amber-50 transition group-hover:scale-150" />

              <div className="relative">

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-sm font-medium text-zinc-500">
                      نسبة التسليم
                    </p>

                    <div className="mt-3 flex items-end gap-2">

                      <span className="text-2xl font-bold tracking-tight text-zinc-950">
                        {deliveryRate.toFixed(1)}
                      </span>

                      <span className="mb-1 text-xs font-medium text-amber-600">
                        %
                      </span>

                    </div>

                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700">

                    <CheckCircle2 size={21} />

                  </div>

                </div>

                <div className="mt-5 text-xs text-zinc-500">
                  من إجمالي {totalOrders} طلب
                </div>

              </div>

            </div>

          </section>

          {/* ================================================== */}
          {/* SALES TABLE */}
          {/* ================================================== */}

          <section
            id="sales-report"
            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm print:overflow-visible print:border-0 print:shadow-none"
          >

            {/* SECTION HEADER */}

            <div className="border-b border-zinc-100 p-5 sm:p-6 print:border-zinc-300 print:p-0 print:pb-4">

              <div className="flex items-center justify-between">

                <div>

                  <div className="flex items-center gap-2">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 print:hidden">

                      <Wallet size={18} />

                    </div>

                    <h2 className="font-bold text-zinc-950">
                      سجل المبيعات
                    </h2>

                  </div>

                  <p className="mt-2 text-xs text-zinc-500 print:hidden">
                    سجل الطلبات المسلّمة.
                  </p>

                </div>

                <div className="flex items-center gap-2">

                  <div className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 print:hidden">
                    {deliveredOrders} طلب مسلّم
                  </div>

                  <PrintSalesButton
  sales={recentSales.map((sale) => ({
    orderNumber: sale.orderNumber,
    createdAt: new Date(sale.createdAt).toISOString(),
    total: sale.total,
    items:
      sale.items?.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
      })) ?? [],
  }))}
  totalSales={totalSales}
/>

                </div>

              </div>

            </div>

            {/* ================================================== */}
            {/* TABLE */}
            {/* ================================================== */}

            {recentSales.length > 0 ? (

              <div className="w-full overflow-x-auto print:overflow-visible">

                <div className="min-w-[900px] print:min-w-0">

                  {/* TABLE HEADER */}

                  <div className="grid grid-cols-[1.1fr_2fr_0.8fr_1.3fr_1.5fr_1.3fr] items-center gap-4 border-b border-zinc-100 bg-zinc-50 px-5 py-4 text-xs font-bold text-zinc-500 print:border-zinc-300 print:bg-zinc-100 print:px-3 print:py-3">

                    <div>
                      رقم الطلب
                    </div>

                    <div>
                      المنتجات
                    </div>

                    <div>
                      العدد
                    </div>

                    <div>
                      تاريخ الطلب
                    </div>

                    <div>
                      سعر كل منتج
                    </div>

                    <div>
                      المجموع
                    </div>

                  </div>

                  {/* TABLE ROWS */}

                  <div className="divide-y divide-zinc-100 print:divide-zinc-200">

                    {recentSales.map((sale) => {

                      const totalQuantity =
                        sale.items?.reduce(
                          (sum, item) =>
                            sum + item.quantity,
                          0
                        ) ?? 0;

                      return (
                        <div
                          key={sale.id}
                          className="grid grid-cols-[1.1fr_2fr_0.8fr_1.3fr_1.5fr_1.3fr] items-center gap-4 px-5 py-4 transition hover:bg-zinc-50 print:px-3 print:py-3 print:hover:bg-transparent"
                        >

                          {/* ORDER NUMBER */}

                          <div className="flex items-center gap-2">

                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 print:hidden">

                              <CheckCircle2 size={15} />

                            </div>

                            <span className="text-sm font-bold text-zinc-900">
                              #{sale.orderNumber}
                            </span>

                          </div>

                          {/* PRODUCTS */}

                          <div className="min-w-0">

                            {sale.items &&
                            sale.items.length > 0 ? (

                              <div className="flex flex-wrap gap-1.5">

                                {sale.items.map(
                                  (item) => (
                                    <span
                                      key={item.id}
                                      className="inline-flex max-w-[180px] items-center truncate rounded-lg bg-zinc-100 px-2.5 py-1.5 text-xs font-medium text-zinc-700 print:max-w-none print:rounded-none print:bg-transparent print:p-0"
                                      title={
                                        item.productName
                                      }
                                    >
                                      {item.productName}
                                    </span>
                                  )
                                )}

                              </div>

                            ) : (

                              <span className="text-xs text-zinc-400">
                                لا توجد منتجات
                              </span>

                            )}

                          </div>

                          {/* QUANTITY */}

                          <div>

                            <span className="text-sm font-bold text-zinc-800">
                              {totalQuantity}
                            </span>

                            <span className="mr-1 text-xs text-zinc-400">
                              قطعة
                            </span>

                          </div>

                          {/* DATE */}

                          <div>

                            <span className="whitespace-nowrap text-xs font-medium text-zinc-600">
                              {formatDate(
                                sale.createdAt
                              )}
                            </span>

                          </div>

                          {/* PRODUCT PRICES */}

                          <div>

                            {sale.items &&
                            sale.items.length > 0 ? (

                              <div className="flex flex-wrap gap-1.5">

                                {sale.items.map(
                                  (item) => (
                                    <span
                                      key={item.id}
                                      className="whitespace-nowrap rounded-lg bg-zinc-50 px-2 py-1 text-xs font-semibold text-zinc-700 print:rounded-none print:bg-transparent print:p-0"
                                    >
                                      {formatDZD(
                                        item.price
                                      )}{" "}
                                      <span className="text-[9px] font-medium text-emerald-600">
                                        دج
                                      </span>
                                    </span>
                                  )
                                )}

                              </div>

                            ) : (

                              <span className="text-xs text-zinc-400">
                                —
                              </span>

                            )}

                          </div>

                          {/* TOTAL */}

                          <div>

                            <span className="text-base font-bold text-emerald-700">
                              {formatDZD(
                                sale.total
                              )}
                            </span>

                            <span className="mr-1 text-xs font-medium text-emerald-600">
                              دج
                            </span>

                          </div>

                        </div>
                      );
                    })}

                  </div>

                  {/* ================================================== */}
                  {/* PRINT TOTAL */}
                  {/* ================================================== */}

                  <div className="hidden print:flex items-center justify-between border-t-2 border-zinc-900 bg-zinc-100 px-4 py-5">

                    <span className="text-base font-bold text-zinc-900">
                      إجمالي المبيعات
                    </span>

                    <span className="text-xl font-bold text-zinc-950">
                      {formatDZD(totalSales)}{" "}
                      <span className="text-sm font-semibold">
                        دج
                      </span>
                    </span>

                  </div>

                </div>

              </div>

            ) : (

              <div className="flex min-h-[220px] flex-col items-center justify-center p-6 text-center">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-50">

                  <Wallet
                    size={25}
                    className="text-zinc-300"
                  />

                </div>

                <h3 className="mt-4 font-semibold text-zinc-800">
                  لا توجد مبيعات بعد
                </h3>

                <p className="mt-2 max-w-md text-xs leading-6 text-zinc-500">
                  عند تغيير حالة أحد الطلبات إلى
                  "تم التسليم"، سيظهر هنا رقم الطلب
                  والمنتجات والعدد والتاريخ والأسعار
                  والمجموع.
                </p>

              </div>

            )}

          </section>

          {/* ================================================== */}
          {/* SALES RULES */}
          {/* ================================================== */}

          <section className="print:hidden grid grid-cols-1 gap-6 lg:grid-cols-2">

            {/* HOW SALES ARE CALCULATED */}

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">

                  <BarChart3 size={19} />

                </div>

                <div>

                  <h2 className="font-bold text-zinc-950">
                    طريقة احتساب المبيعات
                  </h2>

                  <p className="mt-1 text-xs text-zinc-500">
                    قواعد الحساب المعتمدة في النظام
                  </p>

                </div>

              </div>

              <div className="mt-6 space-y-5">

                <div className="flex items-start gap-3">

                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">

                    <CheckCircle2 size={14} />

                  </div>

                  <p className="text-sm leading-6 text-zinc-600">

                    الطلب يدخل في المبيعات فقط
                    بعد تحويل حالته إلى{" "}

                    <strong className="font-semibold text-zinc-900">
                      تم التسليم
                    </strong>
                    .

                  </p>

                </div>

                <div className="flex items-start gap-3">

                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">

                    <Clock3 size={14} />

                  </div>

                  <p className="text-sm leading-6 text-zinc-600">

                    الطلبات قيد الانتظار أو المعالجة
                    لا تدخل ضمن إجمالي المبيعات.

                  </p>

                </div>

                <div className="flex items-start gap-3">

                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">

                    <ShoppingCart size={14} />

                  </div>

                  <p className="text-sm leading-6 text-zinc-600">

                    الطلبات الملغاة أو التي لم يتم
                    تسليمها لا يتم احتسابها ضمن
                    الإيرادات.

                  </p>

                </div>

              </div>

            </div>

            {/* DATABASE */}

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm sm:p-6">

              <div className="flex items-start gap-3">

                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">

                  <CalendarDays size={19} />

                </div>

                <div>

                  <p className="font-bold text-emerald-950">
                    البيانات مباشرة من قاعدة البيانات
                  </p>

                  <p className="mt-2 text-sm leading-6 text-emerald-700">

                    لا يتم تخزين إجمالي المبيعات
                    أو الأشهر بشكل منفصل؛ يتم
                    حسابها تلقائيًا اعتمادًا على
                    الطلبات المسلّمة الموجودة في
                    النظام.

                  </p>

                </div>

              </div>

              <div className="mt-6 rounded-xl border border-emerald-100 bg-white/70 p-4">

                <div className="flex items-center justify-between">

                  <span className="text-xs text-emerald-700">
                    حالة المبيعات
                  </span>

                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">

                    <span className="h-2 w-2 rounded-full bg-emerald-500" />

                    مباشر

                  </span>

                </div>

                <div className="mt-3 flex items-center justify-between">

                  <span className="text-sm font-medium text-zinc-700">
                    إجمالي المبيعات
                  </span>

                  <span className="text-lg font-bold text-zinc-950">

                    {formatDZD(totalSales)}{" "}

                    <span className="text-xs text-emerald-700">
                      دج
                    </span>

                  </span>

                </div>

              </div>

            </div>

          </section>

          {/* ================================================== */}
          {/* FOOTER NOTE */}
          {/* ================================================== */}

          <section className="print:hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">

            <div className="flex items-start gap-3">

              <CalendarDays
                size={19}
                className="mt-0.5 shrink-0 text-zinc-500"
              />

              <div>

                <p className="text-sm font-semibold text-zinc-800">
                  آخر تحديث
                </p>

                <p className="mt-1 text-xs leading-6 text-zinc-500">

                  يتم تحديث هذه البيانات تلقائيًا
                  عند تغيير حالة الطلب. عند تحويل
                  الطلب من{" "}

                  <strong className="text-zinc-700">
                    DELIVERED
                  </strong>

                  {" "}إلى{" "}

                  <strong className="text-zinc-700">
                    PROCESSING
                  </strong>

                  ، تتم إزالته تلقائيًا من إجمالي
                  المبيعات.

                </p>

              </div>

            </div>

          </section>

        </div>
      </div>
    </DashboardLayout>
  );
}