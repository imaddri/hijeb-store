import {
  Activity,
  ArrowUpLeft,
  BarChart3,
  CheckCircle2,
  Clock3,
  PackageCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Truck,
  Wallet,
} from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import QuickActions from "@/components/dashboard/QuickActions";
import SalesChart from "@/components/dashboard/SalesChart";
import LoginSuccessToast from "@/components/dashboard/LoginSuccessToast";
import { getDashboardData } from "@/actions/order.actions";
import { prisma } from "@/lib/prisma";

// ======================================================
// HELPERS
// ======================================================

function formatDZD(value: number) {
  return new Intl.NumberFormat("ar-DZ", {
    maximumFractionDigits: 0,
  }).format(value);
}

function getStatusInfo(status: string) {
  switch (status) {
    case "PENDING":
      return {
        label: "قيد الانتظار",
        className: "bg-yellow-50 text-yellow-700",
      };

    case "CONFIRMED":
      return {
        label: "مؤكد",
        className: "bg-indigo-50 text-indigo-700",
      };

    case "PROCESSING":
      return {
        label: "قيد المعالجة",
        className: "bg-blue-50 text-blue-700",
      };

    case "SHIPPED":
      return {
        label: "تم الشحن",
        className: "bg-purple-50 text-purple-700",
      };

    case "DELIVERED":
      return {
        label: "مكتمل",
        className: "bg-emerald-50 text-emerald-700",
      };

    case "CANCELLED":
      return {
        label: "ملغى",
        className: "bg-red-50 text-red-700",
      };

    default:
      return {
        label: status,
        className: "bg-zinc-100 text-zinc-700",
      };
  }
}

// ======================================================
// TODAY RANGE
// ======================================================

function getTodayRange() {
  const now = new Date();

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  return {
    start,
    end,
  };
}

// ======================================================
// PAGE
// ======================================================

export default async function DashboardPage() {
  // ====================================================
  // DASHBOARD DATA
  // ====================================================

  const data = await getDashboardData();

  // ====================================================
  // TODAY
  // ====================================================

  const { start, end } = getTodayRange();

  const [
    todaySalesAggregate,
    todayOrders,
    todayDeliveredOrders,
    todayProcessingOrders,
    todayPendingOrders,
    todayShippedOrders,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: {
        status: "DELIVERED",

        createdAt: {
          gte: start,
          lte: end,
        },
      },

      _sum: {
        total: true,
      },

      _count: {
        id: true,
      },
    }),

    prisma.order.count({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    }),

    prisma.order.count({
      where: {
        status: "DELIVERED",

        createdAt: {
          gte: start,
          lte: end,
        },
      },
    }),

    prisma.order.count({
      where: {
        status: "PROCESSING",

        createdAt: {
          gte: start,
          lte: end,
        },
      },
    }),

    prisma.order.count({
      where: {
        status: "PENDING",

        createdAt: {
          gte: start,
          lte: end,
        },
      },
    }),

    prisma.order.count({
      where: {
        status: "SHIPPED",

        createdAt: {
          gte: start,
          lte: end,
        },
      },
    }),
  ]);

  const todaySales =
    todaySalesAggregate._sum.total ?? 0;

  const todayDeliveredCount =
    todaySalesAggregate._count.id ?? 0;

  const todayAverageOrder =
    todayDeliveredCount > 0
      ? todaySales / todayDeliveredCount
      : 0;

  // ====================================================
  // DATE LABEL
  // ====================================================

  const todayLabel = new Intl.DateTimeFormat(
    "ar-DZ",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
    }
  ).format(new Date());

  return (
    <DashboardLayout>
      <LoginSuccessToast />

      <div
        className="space-y-8"
        dir="rtl"
      >
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <DashboardHeader />

        {/* ================================================= */}
        {/* QUICK ACTIONS */}
        {/* ================================================= */}

        <QuickActions />

        {/* ================================================= */}
        {/* TODAY SALES */}
        {/* ================================================= */}

        <section>
          <div
            className="
              relative
              overflow-hidden
              rounded-[2rem]
              border
              border-emerald-100
              bg-gradient-to-br
              from-emerald-600
              via-emerald-600
              to-teal-700
              p-6
              shadow-[0_20px_60px_-20px_rgba(16,185,129,0.35)]
              sm:p-8
            "
          >
            {/* Background decorations */}

            <div
              className="
                pointer-events-none
                absolute
                -right-16
                -top-20
                h-56
                w-56
                rounded-full
                bg-white/10
                blur-2xl
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                -bottom-24
                -left-16
                h-64
                w-64
                rounded-full
                bg-teal-300/10
                blur-3xl
              "
            />

            <div className="relative z-10">
              {/* Top */}

              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-2xl
                        bg-white/15
                        text-white
                        ring-1
                        ring-white/20
                      "
                    >
                      <Wallet size={23} />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-emerald-50">
                        المبيعات الفعلية اليوم
                      </p>

                      <p className="mt-1 text-xs text-emerald-100/80">
                        {todayLabel}
                      </p>
                    </div>
                  </div>

                  <div className="mt-7">
                    <p className="text-sm font-medium text-emerald-50/80">
                      إجمالي مبيعات اليوم
                    </p>

                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                        {formatDZD(todaySales)}
                      </span>

                      <span className="mb-1 text-lg font-semibold text-emerald-100">
                        دج
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-emerald-50/80">
                      من{" "}
                      <span className="font-bold text-white">
                        {todayDeliveredCount}
                      </span>{" "}
                      طلبًا تم تسليمه اليوم
                    </p>
                  </div>
                </div>

                {/* Main badge */}

                <div
                  className="
                    flex
                    w-full
                    flex-col
                    rounded-3xl
                    border
                    border-white/15
                    bg-white/10
                    p-5
                    backdrop-blur-md
                    lg:w-[270px]
                  "
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-emerald-50/80">
                      الحالة
                    </span>

                    <span
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-full
                        bg-white/15
                        px-3
                        py-1.5
                        text-xs
                        font-bold
                        text-white
                      "
                    >
                      <span className="h-2 w-2 rounded-full bg-emerald-300" />
                      محدث الآن
                    </span>
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <div
                      className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-xl
                        bg-white
                        text-emerald-600
                      "
                    >
                      <TrendingUp size={21} />
                    </div>

                    <div>
                      <p className="text-xs text-emerald-50/70">
                        متوسط الطلب
                      </p>

                      <p className="mt-1 text-lg font-bold text-white">
                        {formatDZD(todayAverageOrder)} دج
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom metrics */}

              <div className="mt-8 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-3">
                <div className="rounded-2xl bg-black/10 p-4">
                  <div className="flex items-center gap-3">
                    <ShoppingBag
                      size={19}
                      className="text-emerald-100"
                    />

                    <div>
                      <p className="text-xs text-emerald-50/70">
                        طلبات اليوم
                      </p>

                      <p className="mt-1 text-lg font-bold text-white">
                        {todayOrders}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-black/10 p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2
                      size={19}
                      className="text-emerald-100"
                    />

                    <div>
                      <p className="text-xs text-emerald-50/70">
                        تم التسليم
                      </p>

                      <p className="mt-1 text-lg font-bold text-white">
                        {todayDeliveredOrders}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-black/10 p-4">
                  <div className="flex items-center gap-3">
                    <Activity
                      size={19}
                      className="text-emerald-100"
                    />

                    <div>
                      <p className="text-xs text-emerald-50/70">
                        معدل التحويل
                      </p>

                      <p className="mt-1 text-lg font-bold text-white">
                        {todayOrders > 0
                          ? Math.round(
                              (todayDeliveredCount /
                                todayOrders) *
                                100
                            )
                          : 0}
                        %
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* RECENT ORDERS + TOP PRODUCTS */}
        {/* ================================================= */}

        <div className="grid gap-6 xl:grid-cols-2">
          {/* ================================================= */}
          {/* RECENT ORDERS */}
          {/* ================================================= */}

          <section
            className="
              rounded-3xl
              border
              border-zinc-200
              bg-white
              p-6
              shadow-sm
            "
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">
                  أحدث الطلبات
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  آخر الطلبات التي وصلت إلى المتجر.
                </p>
              </div>

              <span
                className="
                  rounded-full
                  bg-blue-50
                  px-3
                  py-1
                  text-xs
                  font-semibold
                  text-blue-600
                "
              >
                {data.stats.orders} طلب
              </span>
            </div>

            <div className="overflow-x-auto">
              {data.recentOrders.length === 0 ? (
                <div className="py-10 text-center text-sm text-zinc-400">
                  لا توجد طلبات حتى الآن.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      className="
                        border-b
                        border-zinc-100
                        text-right
                        text-zinc-400
                      "
                    >
                      <th className="pb-4 font-medium">
                        العميل
                      </th>

                      <th className="pb-4 font-medium">
                        المبلغ
                      </th>

                      <th className="pb-4 font-medium">
                        الحالة
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.recentOrders
                      .slice(0, 4)
                      .map((order) => {
                        const status =
                          getStatusInfo(order.status);

                        return (
                          <tr
                            key={order.id}
                            className="
                              border-b
                              border-zinc-100
                              last:border-0
                            "
                          >
                            <td className="py-4">
                              <p className="font-medium text-zinc-900">
                                {order.customer.name}
                              </p>

                              <p className="mt-1 text-xs text-zinc-400">
                                #{order.orderNumber}
                              </p>
                            </td>

                            <td className="py-4 text-zinc-600">
                              {formatDZD(order.total)} دج
                            </td>

                            <td className="py-4">
                              <span
                                className={`
                                  rounded-full
                                  px-3
                                  py-1
                                  text-xs
                                  font-medium
                                  ${status.className}
                                `}
                              >
                                {status.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {/* ================================================= */}
          {/* TOP PRODUCTS */}
          {/* ================================================= */}

          <section
            className="
              rounded-3xl
              border
              border-zinc-200
              bg-white
              p-6
              shadow-sm
            "
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-zinc-900">
                المنتجات الأكثر مبيعًا
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                المنتجات التي حققت أكبر عدد من المبيعات المسلّمة.
              </p>
            </div>

            <div className="space-y-4">
              {data.topProducts.length === 0 ? (
                <div className="py-10 text-center text-sm text-zinc-400">
                  لا توجد مبيعات مسلّمة حتى الآن.
                </div>
              ) : (
                data.topProducts
                  .slice(0, 4)
                  .map((product, index) => (
                    <div
                      key={product.productId}
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        rounded-2xl
                        bg-zinc-50
                        p-4
                      "
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-white
                            text-sm
                            font-bold
                            text-zinc-500
                            shadow-sm
                          "
                        >
                          {index + 1}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-zinc-900">
                            {product.productName}
                          </p>

                          <p className="mt-1 text-xs text-zinc-400">
                            {product.quantity} عملية بيع
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 font-bold text-emerald-600">
                        {formatDZD(product.sales)} دج
                      </span>
                    </div>
                  ))
              )}
            </div>
          </section>
        </div>

        {/* ================================================= */}
        {/* STORE PULSE - BOTTOM PREMIUM SECTION */}
        {/* ================================================= */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[2rem]
            border
            border-zinc-200
            bg-zinc-950
            p-6
            shadow-xl
            sm:p-8
          "
        >
          {/* Decorative elements */}

          <div
            className="
              pointer-events-none
              absolute
              -right-24
              -top-24
              h-72
              w-72
              rounded-full
              bg-emerald-500/10
              blur-3xl
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-32
              left-0
              h-72
              w-72
              rounded-full
              bg-blue-500/10
              blur-3xl
            "
          />

          <div className="relative z-10">
            {/* Header */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    bg-white/10
                    text-emerald-400
                    ring-1
                    ring-white/10
                  "
                >
                  <Sparkles size={23} />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    Store Pulse
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-white">
                    نبض المتجر
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    نظرة سريعة على حركة المتجر اليوم.
                  </p>
                </div>
              </div>

              <div
                className="
                  inline-flex
                  w-fit
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-white/10
                  bg-white/5
                  px-4
                  py-2
                  text-xs
                  font-medium
                  text-zinc-300
                "
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                البيانات مباشرة
              </div>
            </div>

            {/* Metrics */}

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {/* Pending */}

              <div
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.04]
                  p-5
                  transition
                  hover:bg-white/[0.07]
                "
              >
                <div className="flex items-center justify-between">
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      bg-yellow-400/10
                      text-yellow-400
                    "
                  >
                    <Clock3 size={19} />
                  </div>

                  <ArrowUpLeft
                    size={17}
                    className="text-zinc-600"
                  />
                </div>

                <p className="mt-5 text-sm text-zinc-400">
                  طلبات قيد الانتظار
                </p>

                <p className="mt-1 text-2xl font-bold text-white">
                  {todayPendingOrders}
                </p>
              </div>

              {/* Processing */}

              <div
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.04]
                  p-5
                  transition
                  hover:bg-white/[0.07]
                "
              >
                <div className="flex items-center justify-between">
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      bg-blue-400/10
                      text-blue-400
                    "
                  >
                    <Activity size={19} />
                  </div>

                  <ArrowUpLeft
                    size={17}
                    className="text-zinc-600"
                  />
                </div>

                <p className="mt-5 text-sm text-zinc-400">
                  قيد المعالجة
                </p>

                <p className="mt-1 text-2xl font-bold text-white">
                  {todayProcessingOrders}
                </p>
              </div>

              {/* Shipped */}

              <div
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.04]
                  p-5
                  transition
                  hover:bg-white/[0.07]
                "
              >
                <div className="flex items-center justify-between">
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      bg-purple-400/10
                      text-purple-400
                    "
                  >
                    <Truck size={19} />
                  </div>

                  <ArrowUpLeft
                    size={17}
                    className="text-zinc-600"
                  />
                </div>

                <p className="mt-5 text-sm text-zinc-400">
                  تم الشحن
                </p>

                <p className="mt-1 text-2xl font-bold text-white">
                  {todayShippedOrders}
                </p>
              </div>

              {/* Delivered */}

              <div
                className="
                  rounded-2xl
                  border
                  border-emerald-400/10
                  bg-emerald-400/[0.05]
                  p-5
                  transition
                  hover:bg-emerald-400/[0.08]
                "
              >
                <div className="flex items-center justify-between">
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      bg-emerald-400/10
                      text-emerald-400
                    "
                  >
                    <PackageCheck size={19} />
                  </div>

                  <ArrowUpLeft
                    size={17}
                    className="text-emerald-700"
                  />
                </div>

                <p className="mt-5 text-sm text-zinc-400">
                  تم التسليم اليوم
                </p>

                <p className="mt-1 text-2xl font-bold text-white">
                  {todayDeliveredOrders}
                </p>
              </div>
            </div>

            {/* Bottom message */}

            <div
              className="
                mt-5
                flex
                flex-col
                gap-3
                rounded-2xl
                border
                border-white/10
                bg-white/[0.03]
                p-4
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-white/5
                    text-zinc-300
                  "
                >
                  <TrendingUp size={17} />
                </div>

                <p className="text-sm text-zinc-400">
                  استمر في متابعة الطلبات لضمان سير عمليات المتجر
                  بسلاسة.
                </p>
              </div>

              <span className="text-xs font-medium text-zinc-500">
                Attar Store
              </span>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* SALES CHART - LAST SECTION */}
        {/* ================================================= */}

        <section>
          <div className="mb-5">
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-50
                  text-blue-600
                "
              >
                <BarChart3 size={20} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-zinc-900">
                  نظرة عامة على المبيعات
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  متابعة أداء الطلبات المسلّمة خلال الأشهر الماضية.
                </p>
              </div>
            </div>
          </div>

          <div
            className="
              rounded-3xl
              border
              border-zinc-200
              bg-white
              p-5
              shadow-sm
              sm:p-6
            "
          >
            <SalesChart data={data.monthlySales} />
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}