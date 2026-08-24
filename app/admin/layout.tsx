import type { Metadata } from "next";

import Providers from "@/components/providers/Providers";
import NetworkStatus from "@/components/shared/NetworkStatus";

export const metadata: Metadata = {
  title: "أزياء مرام - Admin",
  description: "لوحة تحكم متجر الأزياء المحتشمة",
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