import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: Props) {
  return (
    <div
      className="min-h-screen bg-zinc-50"
      dir="rtl"
    >
      <div className="flex min-h-screen flex-col md:flex-row">

        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">

          <Topbar />

          <main className="flex-1 p-4 sm:p-6 md:p-8">
            {children}
          </main>

        </div>

      </div>
    </div>
  );
}