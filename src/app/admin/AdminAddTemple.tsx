import { useState } from "react";
import AdminLayout from "@/shared/components/admin/AdminLayout";
import TempleForm from "@/shared/components/admin/TempleForm";
import AdminCsvUpload from "./AdminCsvUpload";
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";

import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export default function AdminAddTemple() {
  const [isBulkUpload, setIsBulkUpload] = useState(false);
  const navigate = useNavigate();

  return (
    <AdminLayout hideTopbar={true}>
      <div className="min-h-screen bg-[#F9F6F0] -m-6 p-6">
        <div className="max-w-7xl mx-auto space-y-8">

          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/admin/sthana-directory")}
              className="group flex items-center gap-2 hover:bg-white/50 text-slate-600 font-bold rounded-xl px-4"
            >
              <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200 group-hover:bg-blue-900 group-hover:text-white transition-all">
                <ArrowLeft className="w-4 h-4" />
              </div>
              Back to Directory
            </Button>

            {/* Mode Switcher */}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              <Switch
                id="bulk-mode"
                checked={isBulkUpload}
                onCheckedChange={setIsBulkUpload}
                className="data-[state=checked]:bg-amber-600"
              />
              <Label htmlFor="bulk-mode" className="text-xs font-black uppercase tracking-widest text-slate-500 cursor-pointer">
                Bulk Upload Mode (CSV)
              </Label>
            </div>
          </div>

          {isBulkUpload ? <AdminCsvUpload /> : <TempleForm />}
        </div>
      </div>
    </AdminLayout>
  );
}
