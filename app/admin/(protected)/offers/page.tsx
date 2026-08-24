import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Tag,
  Percent,
  Clock3,
  CheckCircle2,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

import OfferCreateModal from "./OfferCreateModal";
import OfferEditModal from "./OfferEditModal";
import DeleteOfferButton from "./DeleteOfferButton";

// ======================================================
// HELPERS
// ======================================================

function getOfferStatus(
  startDate: Date,
  endDate: Date,
) {
  const now = new Date();

  if (now < startDate) {
    return "قادم";
  }

  if (now > endDate) {
    return "منتهي";
  }

  return "نشط";
}

// ======================================================
// STATUS STYLE
// ======================================================

function getStatusStyle(status: string) {
  if (status === "نشط") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "منتهي") {
    return "bg-zinc-100 text-zinc-600";
  }

  return "bg-yellow-100 text-yellow-700";
}

// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ar-DZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// ======================================================
// PAGE
// ======================================================

export default async function OffersPage() {
  // ====================================================
  // GET PRODUCTS
  // ====================================================

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },

    select: {
      id: true,
      name: true,
      price: true,
      image: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  // ====================================================
  // GET OFFERS
  // ====================================================

  const offers = await prisma.offer.findMany({
    include: {
      product: {
        select: {
          id: true,
          name: true,
          image: true,

          // مهم جدًا للتعديل
          price: true,
          oldPrice: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  // ====================================================
  // STATISTICS
  // ====================================================

  const activeOffers = offers.filter(
    (offer) =>
      getOfferStatus(
        offer.startDate,
        offer.endDate,
      ) === "نشط",
  ).length;

  const totalProducts = offers.length;

  const averageDiscount =
    offers.length > 0
      ? Math.round(
          offers.reduce(
            (total, offer) =>
              total + offer.discountPercent,
            0,
          ) / offers.length,
        )
      : 0;

  // ====================================================
  // RETURN
  // ====================================================

  return (
    <DashboardLayout>
      {/* ==================================================
          PAGE CONTAINER
      ================================================== */}

      <div className="space-y-8">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">
              إدارة العروض
            </h1>

            <p className="mt-2 text-zinc-500">
              إنشاء وإدارة الخصومات والعروض الخاصة بالمتجر
            </p>
          </div>

          {/* ==================================================
              ADD OFFER
          ================================================== */}

          <OfferCreateModal
            products={products}
          />
        </div>

        {/* ==================================================
            STATS
        ================================================== */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* TOTAL OFFERS */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">
                  إجمالي العروض
                </p>

                <p className="mt-2 text-3xl font-bold text-zinc-900">
                  {offers.length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                <Tag size={24} />
              </div>
            </div>
          </div>

          {/* ACTIVE OFFERS */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">
                  العروض النشطة
                </p>

                <p className="mt-2 text-3xl font-bold text-emerald-600">
                  {activeOffers}
                </p>
              </div>

              <CheckCircle2
                size={28}
                className="text-emerald-600"
              />
            </div>
          </div>

          {/* PRODUCTS */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">
                  المنتجات المشمولة
                </p>

                <p className="mt-2 text-3xl font-bold text-blue-600">
                  {totalProducts}
                </p>
              </div>

              <Tag
                size={28}
                className="text-blue-600"
              />
            </div>
          </div>

          {/* AVERAGE DISCOUNT */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">
                  متوسط الخصم
                </p>

                <p className="mt-2 text-3xl font-bold text-orange-600">
                  {averageDiscount}%
                </p>
              </div>

              <Percent
                size={28}
                className="text-orange-600"
              />
            </div>
          </div>
        </div>

        {/* ==================================================
            OFFERS TABLE
        ================================================== */}

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          {/* TABLE HEADER */}

          <div className="flex flex-col justify-between gap-3 border-b border-zinc-100 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-zinc-900">
                العروض والخصومات
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                جميع العروض الموجودة في المتجر
              </p>
            </div>
          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              {/* ==================================================
                  TABLE HEAD
              ================================================== */}

              <thead className="bg-zinc-50">
                <tr>
                  <th className="p-4 text-right font-semibold text-zinc-900">
                    المنتج
                  </th>

                  <th className="p-4 text-right font-semibold text-zinc-900">
                    السعر القديم
                  </th>

                  <th className="p-4 text-right font-semibold text-zinc-900">
                    الخصم
                  </th>

                  <th className="p-4 text-right font-semibold text-zinc-900">
                    السعر الجديد
                  </th>

                  <th className="p-4 text-right font-semibold text-zinc-900">
                    تاريخ البداية
                  </th>

                  <th className="p-4 text-right font-semibold text-zinc-900">
                    تاريخ النهاية
                  </th>

                  <th className="p-4 text-right font-semibold text-zinc-900">
                    الحالة
                  </th>

                  <th className="p-4 text-right font-semibold text-zinc-900">
                    الإجراءات
                  </th>
                </tr>
              </thead>

              {/* ==================================================
                  TABLE BODY
              ================================================== */}

              <tbody>
                {offers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-12 text-center"
                    >
                      <div className="flex flex-col items-center">
                        <Tag
                          size={40}
                          className="text-zinc-300"
                        />

                        <p className="mt-4 text-lg font-semibold text-zinc-700">
                          لا توجد عروض حاليًا
                        </p>

                        <p className="mt-1 text-sm text-zinc-400">
                          اضغط على "إضافة عرض جديد" لإنشاء أول عرض.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  offers.map((offer) => {
                    const status =
                      getOfferStatus(
                        offer.startDate,
                        offer.endDate,
                      );

                    // ==================================================
                    // OLD PRICE
                    // ==================================================

                    const oldPrice =
                      offer.oldPrice ??
                      offer.product.oldPrice ??
                      offer.product.price ??
                      offer.newPrice;

                    return (
                      <tr
                        key={offer.id}
                        className="border-t border-zinc-100 transition hover:bg-zinc-50"
                      >
                        {/* ==================================================
                            PRODUCT
                        ================================================== */}

                        <td className="p-5">
                          <div className="font-semibold text-zinc-900">
                            {offer.product.name}
                          </div>

                          <p className="mt-1 text-xs text-zinc-400">
                            المنتج المرتبط بالعرض
                          </p>
                        </td>

                        {/* ==================================================
                            OLD PRICE
                        ================================================== */}

                        <td className="p-5">
                          <span className="text-sm font-medium text-zinc-500 line-through">
                            {oldPrice.toLocaleString(
                              "ar-DZ",
                            )}{" "}
                            دج
                          </span>
                        </td>

                        {/* ==================================================
                            DISCOUNT
                        ================================================== */}

                        <td className="p-5">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-orange-50 px-3 py-1.5 text-sm font-bold text-orange-700">
                            <Percent size={14} />

                            {offer.discountPercent}%
                          </span>
                        </td>

                        {/* ==================================================
                            NEW PRICE
                        ================================================== */}

                        <td className="p-5">
                          <span className="text-sm font-bold text-emerald-600">
                            {(offer.newPrice ?? offer.product.price).toLocaleString(
                              "ar-DZ",
                            )}{" "}
                            دج
                          </span>
                        </td>

                        {/* ==================================================
                            START DATE
                        ================================================== */}

                        <td className="p-5 text-sm text-zinc-600">
                          {formatDate(
                            offer.startDate,
                          )}
                        </td>

                        {/* ==================================================
                            END DATE
                        ================================================== */}

                        <td className="p-5 text-sm text-zinc-600">
                          {formatDate(
                            offer.endDate,
                          )}
                        </td>

                        {/* ==================================================
                            STATUS
                        ================================================== */}

                        <td className="p-5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                              status,
                            )}`}
                          >
                            {status === "نشط" && (
                              <CheckCircle2
                                size={13}
                              />
                            )}

                            {status === "منتهي" && (
                              <Clock3
                                size={13}
                              />
                            )}

                            {status === "قادم" && (
                              <Clock3
                                size={13}
                              />
                            )}

                            {status}
                          </span>
                        </td>

                        {/* ==================================================
                            ACTIONS
                        ================================================== */}

                        <td className="p-5">
                          <div className="flex items-center gap-2">
                            {/* EDIT */}

                            <OfferEditModal
                              offer={{
                                id: offer.id,

                                productId:
                                  offer.productId,

                                discountPercent:
                                  offer.discountPercent,

                                newPrice:
                                  offer.newPrice ??
                                  offer.product.price,

                                startDate:
                                  offer.startDate,

                                endDate:
                                  offer.endDate,

                                product: {
                                  id: offer.product.id,

                                  name:
                                    offer.product.name,

                                  // مهم جدًا لـ OfferEditModal
                                  price:
                                    offer.product.price,

                                  oldPrice:
                                    offer.product.oldPrice,
                                },
                              }}
                            />

                            {/* DELETE */}

                            <DeleteOfferButton
                              offerId={offer.id}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}