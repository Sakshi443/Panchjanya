// /src/components/admin/AdminLayout.tsx
import React from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

interface Props {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: Props) {
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminTopbar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
