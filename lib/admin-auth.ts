import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

// ======================================================
// CONFIG
// ======================================================

const ADMIN_SESSION_COOKIE = "admin_session";

const SESSION_DURATION =
  1000 * 60 * 60 * 24 * 7;

// ======================================================
// LOGIN
// ======================================================

export async function loginAdmin(
  email: string,
  password: string
): Promise<boolean> {
  const normalizedEmail =
    email.toLowerCase().trim();

  const admin = await prisma.admin.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (!admin) {
    return false;
  }

  const validPassword =
    await bcrypt.compare(
      password,
      admin.password
    );

  if (!validPassword) {
    return false;
  }

  const cookieStore = await cookies();

  cookieStore.set(
    ADMIN_SESSION_COOKIE,
    admin.id,
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: Math.floor(
        SESSION_DURATION / 1000
      ),
      expires: new Date(
        Date.now() + SESSION_DURATION
      ),
      path: "/",
    }
  );

  return true;
}

// ======================================================
// LOGOUT
// ======================================================

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(
    ADMIN_SESSION_COOKIE
  );
}

// ======================================================
// GET CURRENT ADMIN
// ======================================================

export async function getCurrentAdmin() {
  const cookieStore = await cookies();

  const adminId = cookieStore.get(
    ADMIN_SESSION_COOKIE
  )?.value;

  if (!adminId) {
    return null;
  }

  const admin = await prisma.admin.findUnique({
    where: {
      id: adminId,
    },
  });

  if (!admin) {
    cookieStore.delete(
      ADMIN_SESSION_COOKIE
    );

    return null;
  }

  return admin;
}

// ======================================================
// REQUIRE ADMIN
// ======================================================

export async function requireAdmin() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}