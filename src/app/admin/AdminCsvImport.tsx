import React from "react";
import AdminLayout from "@/shared/components/admin/AdminLayout";
import AdminCsvUpload from "./AdminCsvUpload";

export default function AdminCsvImport() {
  return (
    <AdminLayout hideTopbar={true}>
      <AdminCsvUpload />
    </AdminLayout>
  );
}
