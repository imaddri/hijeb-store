"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    setError("");
    setLoading(true);

    try {

      const response = await fetch(
        "/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
          "بيانات الدخول غير صحيحة"
        );

        return;
      }

      router.replace("/admin");

      router.refresh();

    } catch {

      setError(
        "حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى."
      );

    } finally {

      setLoading(false);

    }
  }

  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-[#f8f5ef] px-6"
    >

      <div className="w-full max-w-md">

        <div className="mb-8 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#d6b46a]/40 bg-[#1f1f1f] text-xl font-semibold text-[#d6b46a]">
            BM
          </div>

          <h1 className="mt-6 text-3xl font-semibold text-[#1f1f1f]">
            لوحة الإدارة
          </h1>

          <p className="mt-2 text-sm text-black/45">
            تسجيل الدخول إلى لوحة التحكم
          </p>

        </div>


        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-black/5 bg-white p-7 shadow-xl sm:p-9"
        >

          <div>

            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[#1f1f1f]"
            >
              البريد الإلكتروني
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="البريد الإلكتروني"
              required
              autoComplete="email"
              className="w-full rounded-xl border border-black/10 bg-[#faf9f7] px-4 py-3.5 text-sm text-[#1f1f1f] outline-none transition focus:border-[#d6b46a]"
            />

          </div>


          <div className="mt-5">

            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-[#1f1f1f]"
            >
              كلمة المرور
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="كلمة المرور"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-black/10 bg-[#faf9f7] px-4 py-3.5 text-sm text-[#1f1f1f] outline-none transition focus:border-[#d6b46a]"
            />

          </div>


          {error && (

            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>

          )}


          <button
            type="submit"
            disabled={loading}
            className="mt-7 w-full rounded-xl bg-[#1f1f1f] px-5 py-4 text-sm font-medium text-white transition hover:bg-[#a3834d] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "جارٍ تسجيل الدخول..."
              : "تسجيل الدخول"}
          </button>

        </form>

      </div>

    </main>
  );
}