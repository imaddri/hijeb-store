import { ReactNode } from "react";

import { requireAdmin } from "@/lib/admin-auth";

interface Props {
  children: ReactNode;
}

export default async function ProtectedAdminLayout({
  children,
}: Props) {
  await requireAdmin();

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-50">
      {children}
    </div>
  );
}