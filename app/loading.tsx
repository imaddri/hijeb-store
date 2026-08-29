import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/icons/log11.svg"
          alt="Hijab Store"
          width={200}
          height={200}
          className="animate-pulse rounded-full"
        />

        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-black" />
        </div>

        <p className="text-sm text-gray-500">جاري تحميل لوحة التحكم...</p>
      </div>
    </div>
  );
}