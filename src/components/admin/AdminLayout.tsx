import React from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

interface Props {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: Props) {
  return (
    <div className="flex h-screen overflow-hidden bg-white font-[Manrope]">
      <AdminSidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopbar />
        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
