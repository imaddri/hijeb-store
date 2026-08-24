import { NextResponse } from "next/server";

import { loginAdmin } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    // ======================================================
    // READ REQUEST
    // ======================================================

    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    // ======================================================
    // VALIDATION
    // ======================================================

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error:
            "البريد الإلكتروني وكلمة المرور مطلوبان.",
        },
        {
          status: 400,
        }
      );
    }

    // ======================================================
    // LOGIN
    // ======================================================

    const success = await loginAdmin(
      email,
      password
    );

    // ======================================================
    // INVALID LOGIN
    // ======================================================

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error:
            "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
        },
        {
          status: 401,
        }
      );
    }

    // ======================================================
    // SUCCESS
    // ======================================================

    return NextResponse.json(
      {
        success: true,
        message: "مرحبًا بعودتك 👋",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "ADMIN LOGIN ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "حدث خطأ في الخادم. حاول مرة أخرى.",
      },
      {
        status: 500,
      }
    );
  }
}