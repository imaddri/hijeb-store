import { NextResponse } from "next/server";

import { logoutAdmin } from "@/lib/admin-auth";

export async function POST() {
  try {
    await logoutAdmin();

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("ADMIN LOGOUT ERROR:", error);

    return NextResponse.json(
      {
        error: "حدث خطأ أثناء تسجيل الخروج.",
      },
      {
        status: 500,
      }
    );
  }
}