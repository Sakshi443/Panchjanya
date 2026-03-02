import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/auth/firebase";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Download, Upload, FileText, CheckCircle, XCircle, AlertCircle, Loader2, ArrowLeft, Save } from "lucide-react";
import { getSthanTypes } from "@/shared/utils/sthanTypes";
import { SthanType } from "@/shared/types/sthanType";
import { useToast } from "@/shared/hooks/use-toast";
import { Separator } from "@/shared/components/ui/separator";

interface LogEntry {
  row: number;
  name: string;
  status: "success" | "error" | "skipped";
  message: string;
}

const AdminCsvUpload = () => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sthanTypes, setSthanTypes] = useState<SthanType[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadSthanTypes = async () => {
      const types = await getSthanTypes();
      setSthanTypes(types);
    };
    loadSthanTypes();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
      setLogs([]);
      setProgress({ current: 0, total: 0 });
    }
  };

  const downloadTemplate = () => {
    const headers = [
      "name", "todaysName", "todaysNameTitle", "address", "taluka", "district",
      "sthan", "latitude", "longitude", "locationLink"
    ];
    const data = [
      [
        "Example Sthana", "Patan, Gujarat", "Todays Name", "123 Temple St", "Sidhpur", "Patan",
        "Avasthan", "23.8506", "72.1154", "https://goo.gl/maps/..."
      ]
    ];

    const csv = Papa.unparse({ fields: headers, data });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sthana_upload_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const validateRow = (row: any): string | null => {
    if (!row.name) return "Missing 'name'";

    // Validate Sthan Type
    if (row.sthan) {
      const isValid = sthanTypes.some(t => t.name.toLowerCase() === row.sthan.toLowerCase());
      if (!isValid) return `Invalid sthan type: '${row.sthan}'.`;
    } else {
      return "Missing 'sthan' type";
    }

    // Validate Coordinates
    const lat = parseFloat(row.latitude);
    const lng = parseFloat(row.longitude);
    if (isNaN(lat) || isNaN(lng)) return "Invalid latitude/longitude";

    return null;
  };

  const handleUpload = () => {
    if (!csvFile || !user) return;
    setUploading(true);
    setLogs([]);

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[];
        setProgress({ current: 0, total: rows.length });

        const newLogs: LogEntry[] = [];
        let successCount = 0;

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const rowNum = i + 2;

          if (!row.name && !row.sthan) continue;

          const errorMsg = validateRow(row);
          if (errorMsg) {
            newLogs.push({ row: rowNum, name: row.name || "Unknown", status: "error", message: errorMsg });
            setProgress(prev => ({ ...prev, current: prev.current + 1 }));
            continue;
          }

          try {
            const latitude = parseFloat(row.latitude);
            const longitude = parseFloat(row.longitude);
            const sthanMatch = sthanTypes.find(t => t.name.toLowerCase() === (row.sthan || "").toLowerCase());
            const sthanName = sthanMatch ? sthanMatch.name : row.sthan;

            const templeId = doc(collection(db, "temples")).id;
            const templeData = {
              name: row.name,
              todaysName: row.todaysName || "",
              todaysNameTitle: row.todaysNameTitle || "Todays Name",
              address: row.address || "",
              taluka: row.taluka || "",
              district: row.district || "",
              sthan: sthanName,
              latitude,
              longitude,
              location: { lat: latitude, lng: longitude },
              locationLink: row.locationLink || "",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: user.uid,
              updatedBy: user.uid,
            };

            await setDoc(doc(db, "temples", templeId), templeData);

            newLogs.push({ row: rowNum, name: row.name, status: "success", message: "Imported successfully" });
            successCount++;

          } catch (err: any) {
            console.error(`Error importing row ${rowNum}:`, err);
            newLogs.push({ row: rowNum, name: row.name, status: "error", message: err.message || "Upload failed" });
          }

          setProgress(prev => ({ ...prev, current: prev.current + 1 }));
          if (i % 5 === 0) setLogs([...newLogs]);
        }

        setLogs(newLogs);
        setUploading(false);
        setCsvFile(null);

        toast({
          title: "Batch Upload Complete",
          description: `Successfully imported ${successCount} out of ${rows.length} sthanas.`,
          variant: successCount === rows.length ? "default" : "destructive",
        });
      },
      error: (err) => {
        console.error("CSV Parse Error:", err);
        setUploading(false);
        toast({ title: "CSV Parsing Error", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32 space-y-8">

      {/* ── Top Navigation ── */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between z-10 transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-amber-900 text-white shadow-lg">
            <FileText className="w-4 h-4" />
            Bulk CSV Import
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3 pr-2">
          <div className="w-1.5 h-6 bg-amber-200 rounded-full" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">
            Batch Registry
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-bold text-primary tracking-tight">Bulk Import Sthanas</h1>
          <p className="text-sm text-slate-500 font-medium">Upload multiple heritage sites using a standard CSV file.</p>
        </div>
        <Button
          onClick={handleUpload}
          disabled={!csvFile || uploading}
          className="bg-amber-600 text-white hover:bg-amber-700 rounded-xl px-8 h-12 shadow-lg shadow-amber-900/20 font-bold"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing {progress.current}/{progress.total}
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" /> Start Import
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Import Configuration</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 font-medium">
            Download our standard template, populate it with your data, and upload it here.
          </p>

          <div className="mt-8 p-6 bg-amber-50/50 rounded-3xl border border-amber-100 shadow-sm space-y-4">
            <div className="space-y-1">
              <h3 className="font-bold text-amber-900 flex items-center gap-2">
                <Download className="w-5 h-5" /> CSV Template
              </h3>
              <p className="text-xs text-amber-700/70 font-medium">
                Ensure headers match precisely for successful data mapping.
              </p>
            </div>
            <Button variant="outline" onClick={downloadTemplate} className="w-full h-11 rounded-xl border-amber-200 bg-white text-amber-700 hover:bg-amber-50 font-bold">
              Download Template
            </Button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-lg font-bold">Upload File</CardTitle>
              <CardDescription>Select your populated .csv file to begin processing.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid w-full items-center gap-4">
                <div className="relative group">
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="h-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-center cursor-pointer hover:bg-white hover:border-blue-400 transition-all p-4"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 group-hover:text-blue-500">
                    {csvFile ? (
                      <span className="font-bold">{csvFile.name}</span>
                    ) : (
                      <span className="font-medium">Drag & drop or click to select CSV file</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 px-2">
                  <AlertCircle className="w-4 h-4 text-slate-400" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Max 5MB. Valid Types: {sthanTypes.slice(0, 5).map(t => t.name).join(", ")}...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {logs.length > 0 && (
            <div className="space-y-4 animate-in fade-in duration-500">
              <div className="flex items-center gap-4">
                <Separator className="flex-1 opacity-50" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">Import Results Log</span>
                <Separator className="flex-1 opacity-50" />
              </div>

              <Card className="rounded-3xl border-slate-200 shadow-md overflow-hidden bg-white">
                <ScrollArea className="h-[400px] w-full">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow className="border-slate-100">
                        <TableHead className="w-[80px] font-black uppercase tracking-widest text-[10px]">Row</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px]">Sthana Name</TableHead>
                        <TableHead className="w-[120px] font-black uppercase tracking-widest text-[10px]">Status</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px]">Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log, idx) => (
                        <TableRow key={idx} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <TableCell className="font-medium text-slate-500">{log.row}</TableCell>
                          <TableCell className="font-bold text-slate-900">{log.name}</TableCell>
                          <TableCell>
                            {log.status === "success" && (
                              <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold bg-green-50 text-green-700 border border-green-100">
                                <CheckCircle className="w-3 h-3 mr-1" /> SUCCESS
                              </span>
                            )}
                            {log.status === "error" && (
                              <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">
                                <XCircle className="w-3 h-3 mr-1" /> ERROR
                              </span>
                            )}
                          </TableCell>
                          <TableCell className={`text-xs font-medium ${log.status === 'error' ? 'text-red-500' : 'text-slate-500'}`}>
                            {log.message}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCsvUpload;
