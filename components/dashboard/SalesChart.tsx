"use client";

import {
  BarChart3,
  ShoppingCart,
} from "lucide-react";

// ======================================================
// TYPES
// ======================================================

export type SalesChartData = {
  month: string;
  orders: number;
};

interface Props {
  data: SalesChartData[];
}

// ======================================================
// COMPONENT
// ======================================================

export default function SalesChart({ data }: Props) {
  const maxOrders = Math.max(
    ...data.map((item) => item.orders),
    1
  );

  const totalOrders = data.reduce(
    (total, item) => total + item.orders,
    0
  );

  return (
    <section
      className="
        rounded-2xl
        border
        border-zinc-200
        bg-white
        p-5
        shadow-sm
        sm:p-6
      "
    >
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="mb-8 flex items-center justify-between">

        <div>
          <h2 className="text-lg font-bold text-zinc-900">
            أداء الطلبات
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            نظرة عامة على عدد الطلبات خلال السنة.
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <BarChart3 size={22} />
        </div>

      </div>

      {/* ================================================= */}
      {/* CHART */}
      {/* ================================================= */}

      {data.length === 0 ? (

        <div className="flex h-72 items-center justify-center rounded-2xl bg-zinc-50">
          <div className="text-center">

            <BarChart3
              size={40}
              className="mx-auto text-zinc-300"
            />

            <p className="mt-3 text-sm font-medium text-zinc-500">
              لا توجد بيانات للطلبات بعد
            </p>

          </div>
        </div>

      ) : (

        <div className="flex h-72 items-end gap-2 overflow-x-auto pb-8 sm:gap-4">

          {data.map((item) => {

            const height =
              item.orders > 0
                ? (item.orders / maxOrders) * 100
                : 2;

            return (
              <div
                key={item.month}
                className="
                  flex
                  h-full
                  min-w-[34px]
                  flex-1
                  flex-col
                  items-center
                  justify-end
                  gap-3
                "
              >

                {/* BAR */}

                <div className="relative flex h-full w-full items-end">

                  <div
                    className="
                      group
                      relative
                      w-full
                      rounded-t-lg
                      bg-emerald-500
                      transition-all
                      duration-300
                      hover:bg-emerald-600
                    "
                    style={{
                      height: `${height}%`,
                    }}
                  >

                    {/* TOOLTIP */}

                    <div
                      className="
                        pointer-events-none
                        absolute
                        -top-10
                        left-1/2
                        z-10
                        -translate-x-1/2
                        whitespace-nowrap
                        rounded-lg
                        bg-zinc-900
                        px-2.5
                        py-1.5
                        text-xs
                        font-medium
                        text-white
                        opacity-0
                        shadow-lg
                        transition
                        group-hover:opacity-100
                      "
                    >
                      {item.orders} طلب
                    </div>

                  </div>

                </div>

                {/* MONTH */}

                <span className="whitespace-nowrap text-[10px] font-medium text-zinc-400 sm:text-xs">
                  {item.month}
                </span>

              </div>
            );
          })}

        </div>
      )}

      {/* ================================================= */}
      {/* FOOTER */}
      {/* ================================================= */}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-4">

        <div className="flex items-center gap-2 text-sm text-zinc-500">

          <ShoppingCart size={16} />

          <span>
            إجمالي الطلبات خلال الفترة
          </span>

        </div>

        <span className="font-bold text-zinc-900">
          {totalOrders.toLocaleString("ar-DZ")} طلب
        </span>

      </div>

    </section>
  );
}