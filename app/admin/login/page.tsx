
"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError(
        "يرجى إدخال البريد الإلكتروني وكلمة المرور."
      );

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/admin/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data?.error ||
            "البريد الإلكتروني أو كلمة المرور غير صحيحة."
        );

        return;
      }

      window.location.href = "/admin/dashboard?login=success";
    } catch (error) {
      console.error(
        "ADMIN LOGIN CLIENT ERROR:",
        error
      );

      setError(
        "حدث خطأ في الاتصال بالخادم. حاول مرة أخرى."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="
        flex
        h-screen
        w-full
        items-center
        justify-center
        overflow-hidden
        bg-zinc-800
        px-4
        sm:px-5
      "
    >
      {/* ================================================= */}
      {/* BACKGROUND DECORATION */}
      {/* ================================================= */}

      <div
        className="
          pointer-events-none
          fixed
          -right-40
          -top-40
          h-96
          w-96
          rounded-full
          bg-[#d6b46a]/10
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          fixed
          -bottom-40
          -left-40
          h-96
          w-96
          rounded-full
          bg-blue-500/5
          blur-3xl
        "
      />

      {/* ================================================= */}
      {/* MAIN CONTENT */}
      {/* ================================================= */}

      <div className="relative w-full max-w-md">

        {/* ================================================= */}
        {/* LOGO / BRAND */}
        {/* ================================================= */}

        <div className="mb-4 text-center sm:mb-5">

          <div
            className="
              mx-auto
              flex
              h-30
              w-30
              items-center
              justify-center
              overflow-hidden
              rounded-full
              border
              border-[#d6b46a]/30
              bg-white
              shadow-[0_0_40px_rgba(214,180,106,0.15)]
            "
          >
            <Image
              src="/icons/log11.svg"
              alt="Boutique Maram"
              width={80}
              height={80}
              className="h-full w-full object-contain"
              priority
            />
          </div>

          <h1 className="mt-3 text-xl font-bold text-white sm:text-2xl">
            لوحة تحكم Boutique Maram
          </h1>

          <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
            تسجيل الدخول إلى لوحة الإدارة
          </p>

        </div>

        {/* ================================================= */}
        {/* LOGIN CARD */}
        {/* ================================================= */}

        <div
          className="
            rounded-[2rem]
            border
            border-white/10
            bg-white/[0.04]
            p-5
            shadow-2xl
            backdrop-blur-xl
            sm:p-7
          "
        >

          
          {/* ================================================= */}
          {/* FORM */}
          {/* ================================================= */}

          <form
            onSubmit={handleSubmit}
            suppressHydrationWarning
            className="space-y-4"
          >

            {/* ================================================= */}
            {/* EMAIL */}
            {/* ================================================= */}

            <div>

              <label
                htmlFor="email"
                className="
                  mb-1.5
                  block
                  text-sm
                  font-medium
                  text-zinc-300
                "
              >
                البريد الإلكتروني
              </label>

              <div className="relative">

                <Mail
                  size={18}
                  className="
                    pointer-events-none
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-zinc-500
                  "
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  suppressHydrationWarning
                  autoComplete="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="البريد الإلكتروني"
                  disabled={loading}
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.04]
                    py-3
                    pr-12
                    pl-4
                    text-sm
                    text-white
                    outline-none
                    transition
                    placeholder:text-zinc-600
                    focus:border-[#d6b46a]/50
                    focus:bg-white/[0.06]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                />

              </div>

            </div>

            {/* ================================================= */}
            {/* PASSWORD */}
            {/* ================================================= */}

            <div>

              <label
                htmlFor="password"
                className="
                  mb-1.5
                  block
                  text-sm
                  font-medium
                  text-zinc-300
                "
              >
                كلمة المرور
              </label>

              <div className="relative">

                <LockKeyhole
                  size={18}
                  className="
                    pointer-events-none
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-zinc-500
                  "
                />

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  suppressHydrationWarning
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="كلمة المرور"
                  disabled={loading}
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.04]
                    py-3
                    pr-12
                    pl-12
                    text-sm
                    text-white
                    outline-none
                    transition
                    placeholder:text-zinc-600
                    focus:border-[#d6b46a]/50
                    focus:bg-white/[0.06]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? "إخفاء كلمة المرور"
                      : "إظهار كلمة المرور"
                  }
                  className="
                    absolute
                    left-3
                    top-1/2
                    flex
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-lg
                    p-2
                    text-zinc-500
                    transition
                    hover:text-[#d6b46a]
                    disabled:opacity-50
                  "
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>

            {/* ================================================= */}
            {/* ERROR */}
            {/* ================================================= */}

            {error && (
              <div
                className="
                  rounded-2xl
                  border
                  border-red-500/20
                  bg-red-500/5
                  px-4
                  py-2.5
                  text-sm
                  leading-6
                  text-red-400
                "
              >
                {error}
              </div>
            )}

            {/* ================================================= */}
            {/* SUBMIT */}
            {/* ================================================= */}

            <button
              type="submit"
              disabled={loading}
              className="
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-[#d6b46a]
                px-5
                py-3.5
                text-sm
                font-bold
                text-[#171717]
                transition
                hover:-translate-y-0.5
                hover:bg-white
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >

              {loading ? (
                <>
                  <span
                    className="
                      h-5
                      w-5
                      animate-spin
                      rounded-full
                      border-2
                      border-[#171717]/20
                      border-t-[#171717]
                    "
                  />

                  جاري تسجيل الدخول...
                </>
              ) : (
                <>
                  تسجيل الدخول

                  <ArrowLeft size={18} />
                </>
              )}

            </button>

          </form>

        </div>

        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <p className="mt-3 text-center text-[11px] text-zinc-500">
          Boutique Maram • Admin Panel
        </p>

      </div>
    </main>
  );
}
