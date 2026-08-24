"use server";

import { prisma } from "@/lib/prisma";

// ======================================================
// TYPES
// ======================================================

export type TrackOrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type TrackOrderItem = {
  orderNumber: number;
  status: TrackOrderStatus;
  total: number;
  createdAt: Date;
  customerName: string;
};

export type TrackOrderResult =
  | {
      success: true;
      orders: TrackOrderItem[];
    }
  | {
      success: false;
      error: string;
    };

// ======================================================
// HELPERS
// ======================================================

function normalizePhone(phone: string) {
  return phone
    .trim()
    .replace(/\s+/g, "");
}

function normalizeOrderNumber(
  value: string
) {
  const cleaned =
    value
      .trim()
      .toUpperCase()
      .replace(/^ORD[-\s]*/i, "");

  if (!/^\d+$/.test(cleaned)) {
    return null;
  }

  const number = Number(cleaned);

  if (
    !Number.isInteger(number) ||
    number <= 0
  ) {
    return null;
  }

  return number;
}

function isValidAlgerianPhone(
  phone: string
) {
  return /^0[5-7][0-9]{8}$/.test(phone);
}

// ======================================================
// TRACK ORDER
// ======================================================
//
// الحالات المدعومة:
//
// 1. رقم الطلب + الهاتف
//    ORD-8 + 0550123456
//
// 2. الرقم فقط + الهاتف
//    8 + 0550123456
//
// 3. الهاتف فقط
//    0550123456
//
// إذا كان الهاتف لديه عدة طلبات، نعيدها كلها.
// ======================================================

export async function trackOrder(
  orderNumberInput: string,
  phoneInput: string
): Promise<TrackOrderResult> {
  try {
    // ==================================================
    // NORMALIZE INPUTS
    // ==================================================

    const orderNumberText =
      orderNumberInput?.trim() ?? "";

    const phone =
      normalizePhone(
        phoneInput ?? ""
      );

    // ==================================================
    // PHONE REQUIRED
    // ==================================================

    if (!phone) {
      return {
        success: false,
        error:
          "يرجى إدخال رقم الهاتف.",
      };
    }

    if (
      !isValidAlgerianPhone(phone)
    ) {
      return {
        success: false,
        error:
          "يرجى إدخال رقم هاتف جزائري صحيح.",
      };
    }

    // ==================================================
    // ORDER NUMBER
    // ==================================================

    let orderNumber:
      | number
      | null = null;

    if (orderNumberText) {
      orderNumber =
        normalizeOrderNumber(
          orderNumberText
        );

      if (orderNumber === null) {
        return {
          success: false,
          error:
            "رقم الطلب غير صحيح. يمكنك كتابة ORD-8 أو 8.",
        };
      }
    }

    // ==================================================
    // QUERY
    // ==================================================

    const orders =
      await prisma.order.findMany({
        where: {
          customer: {
            phone,
          },

          ...(orderNumber !== null
            ? {
                orderNumber,
              }
            : {}),
        },

        orderBy: {
          createdAt: "desc",
        },

        select: {
          orderNumber: true,
          status: true,
          total: true,
          createdAt: true,

          customer: {
            select: {
              name: true,
            },
          },
        },
      });

    // ==================================================
    // NOT FOUND
    // ==================================================

    if (orders.length === 0) {
      if (orderNumber !== null) {
        return {
          success: false,
          error:
            `لم يتم العثور على الطلب ORD-${orderNumber} بهذا الرقم والهاتف. تأكد من البيانات وحاول مرة أخرى.`,
        };
      }

      return {
        success: false,
        error:
          "لم يتم العثور على أي طلب مرتبط بهذا الرقم. تأكد من رقم الهاتف وحاول مرة أخرى.",
      };
    }

    // ==================================================
    // MAP RESULT
    // ==================================================

    const result: TrackOrderItem[] =
      orders.map((order) => ({
        orderNumber:
          order.orderNumber,

        status:
          order.status as TrackOrderStatus,

        total:
          order.total,

        createdAt:
          order.createdAt,

        customerName:
          order.customer.name,
      }));

    // ==================================================
    // SUCCESS
    // ==================================================

    return {
      success: true,
      orders: result,
    };
  } catch (error) {
    console.error(
      "TRACK ORDER ERROR:",
      error
    );

    return {
      success: false,
      error:
        "حدث خطأ أثناء البحث عن الطلب. حاول مرة أخرى.",
    };
  }
}