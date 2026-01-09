import React from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import AdminCsvUpload from "./AdminCsvUpload";

export default function AdminCsvImport() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminTopbar />
        <main className="p-6">
          <AdminCsvUpload />
        </main>
      </div>
    </div>
  );
}
