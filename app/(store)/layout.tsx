import Navbar from "@/components/layout/Navbar";
import { Tajawal } from "next/font/google";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={tajawal.className} dir="rtl">
      <Navbar />
      {children}
    </div>
  );
}