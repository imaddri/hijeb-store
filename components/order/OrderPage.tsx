"use client";

import { useState } from "react";

import OrderForm from "./OrderForm";

import OrderSummary from "./OrderSummary";

type DeliveryType = "OFFICE" | "HOME";

export default function OrderPage() {
  const [selectedWilaya, setSelectedWilaya] =
    useState("");

  const [deliveryType, setDeliveryType] =
    useState<DeliveryType>("OFFICE");

  return (
    <main className="min-h-screen bg-[#f8f5ef] py-16">
      <div className="mx-auto max-w-7xl px-6">

        {/* HEADER */}

        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-medium tracking-[0.3em] text-[#a3834d]">
            COMPLETE YOUR ORDER
          </p>

          <h1 className="text-4xl font-semibold tracking-tight text-[#1f1f1f] sm:text-5xl">
            إتمام الطلب
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-black/50">
            أدخلي معلوماتك لإتمام طلبك بسهولة وسرعة.
          </p>
        </div>

        {/* ORDER CONTENT */}

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">

          {/* CUSTOMER */}

          <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-8 text-2xl font-semibold text-[#1f1f1f]">
              معلومات العميل
            </h2>

            <OrderForm
              selectedWilaya={selectedWilaya}
              setSelectedWilaya={
                setSelectedWilaya
              }
              deliveryType={deliveryType}
              setDeliveryType={
                setDeliveryType
              }
            />
          </section>

          {/* SUMMARY */}

          <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <OrderSummary
              selectedWilaya={selectedWilaya}
              deliveryType={deliveryType}
            />
          </section>

        </div>
      </div>
    </main>
  );
}