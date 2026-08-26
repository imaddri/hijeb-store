import type { Metadata } from "next";

import Providers from "@/components/providers/Providers";
import NetworkStatus from "@/components/shared/NetworkStatus";

import "./globals.css";

export const metadata: Metadata = {
  title: "أزياء مرام ",
  description: "لوحة تحكم متجر الأزياء المحتشمة",
  verification: {
    google: "TqIHkXnaRDrpYE53cOdo7uggSDE_EK_qjYytoAmGH8Q",
  },
   icons: {
    icon: "/icons/log11.svg",
  },
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <NetworkStatus />
        </Providers>
      </body>
    </html>
  );
}