import Link from "next/link";

type SuccessPageProps = {
  searchParams: Promise<{
    orderNumber?: string;
  }>;
};

export default async function OrderSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const params = await searchParams;

  const orderNumber = params.orderNumber;

  return (
    <main
      className="min-h-screen bg-[#f8f5ef] px-6 py-20"
      dir="rtl"
    >
      <div className="mx-auto max-w-2xl">
        <div className="rounded-[2rem] bg-white px-6 py-14 text-center shadow-sm sm:px-10">

          {/* SUCCESS ICON */}

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-3xl text-green-600">
            ✓
          </div>

          {/* TITLE */}

          <h1 className="mt-7 text-3xl font-semibold text-[#1f1f1f] sm:text-4xl">
            تم تأكيد طلبك بنجاح
          </h1>

          {/* DESCRIPTION */}

          <p className="mx-auto mt-4 max-w-lg text-sm leading-8 text-black/50">
            شكرًا لك على طلبك. سنقوم بالتواصل معك قريبًا
            لتأكيد الطلب وترتيب عملية التوصيل.
          </p>

          {/* ORDER NUMBER */}

          {orderNumber && (
            <div className="mx-auto mt-7 max-w-md rounded-2xl bg-[#f8f5ef] px-5 py-5">
              <p className="text-xs text-black/40">
                رقم الطلب
              </p>

              <p
                className="mt-2 text-2xl font-bold tracking-wide text-[#a3834d]"
                dir="ltr"
              >
                ORD-{orderNumber}
              </p>
            </div>
          )}

          {/* ACTIONS */}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">

            <Link
              href="/"
              className="
                rounded-2xl
                bg-[#1f1f1f]
                px-8
                py-4
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-[#a3834d]
              "
            >
              العودة إلى المتجر
            </Link>

            <Link
              href="/cart"
              className="
                rounded-2xl
                border
                border-black/10
                bg-white
                px-8
                py-4
                text-sm
                font-semibold
                text-[#1f1f1f]
                transition
                hover:border-[#a3834d]
                hover:text-[#a3834d]
              "
            >
              سلة التسوق
            </Link>

          </div>
        </div>
      </div>
    </main>
  );
}