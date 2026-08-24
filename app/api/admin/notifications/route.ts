import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

// ======================================================
// GET NEW ORDER NOTIFICATIONS
// ======================================================

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: "PENDING",
      },

      select: {
        id: true,
        orderNumber: true,
        total: true,
        createdAt: true,

        customer: {
          select: {
            name: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 20,
    });

    const notifications = orders.map(
      (order) => ({
        id: order.id,

        orderNumber:
          order.orderNumber,

        customerName:
          order.customer.name,

        total:
          Number(order.total),

        createdAt:
          order.createdAt.toISOString(),
      })
    );

    return NextResponse.json(
      {
        orders: notifications,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );

  } catch (error) {

    console.error(
      "GET /api/admin/notifications error:",
      error
    );

    return NextResponse.json(
      {
        orders: [],
      },
      {
        status: 500,
      }
    );
  }
}