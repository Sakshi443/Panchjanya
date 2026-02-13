import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import TempleForm from "@/components/admin/TempleForm";
import AdminCsvUpload from "./AdminCsvUpload";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function AdminAddTemple() {
  const [isBulkUpload, setIsBulkUpload] = useState(false);

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-end space-x-2">
        <Switch
          id="bulk-mode"
          checked={isBulkUpload}
          onCheckedChange={setIsBulkUpload}
        />
        <Label htmlFor="bulk-mode">Bulk Upload Mode (CSV)</Label>
      </div>

      {isBulkUpload ? <AdminCsvUpload /> : <TempleForm />}
    </AdminLayout>
  );
}
