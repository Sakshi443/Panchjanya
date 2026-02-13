import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { addDoc, collection, Timestamp, doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Upload, FileText, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { getSthanTypes } from "@/utils/sthanTypes";
import { SthanType } from "@/types/sthanType";
import { useToast } from "@/hooks/use-toast";

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
      "name", "city", "taluka", "district", "state", "country", "address",
      "sthana", "leela", "latitude", "longitude", "description_title",
      "description_text", "sthana_info_title", "sthana_info_text",
      "directions_title", "directions_text", "images", "sub_temples_json"
    ];
    const data = [
      [
        "Example Temple", "Thanjavur", "Thanjavur", "Thanjavur", "Tamil Nadu", "India",
        "123 Temple St", "Avasthan", "Leela text here", "10.7828", "79.1318",
        "Sthan At Glance", "General description...", "Sthan Description", "Detailed info...",
        "Way to reach", "Bus route X...", "https://example.com/img1.jpg;https://example.com/img2.jpg",
        JSON.stringify([{ name: "Sub Shrine", description: "Desc", image: "url", location: { lat: 10.7, lng: 79.1 } }])
      ]
    ];

    const csv = Papa.unparse({ fields: headers, data });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "temple_upload_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const validateRow = (row: any, rowIndex: number): string | null => {
    if (!row.name) return "Missing 'name'";
    if (!row.city) return "Missing 'city'";

    // Validate Sthan Type
    if (row.sthana) {
      const isValid = sthanTypes.some(t => t.name.toLowerCase() === row.sthana.toLowerCase());
      if (!isValid) return `Invalid sthana type: '${row.sthana}'. Valid types: ${sthanTypes.map(t => t.name).join(", ")}`;
    } else {
      return "Missing 'sthana' type";
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
          const rowNum = i + 2; // +1 for 0-index, +1 for header

          if (!row.name && !row.city && !row.sthana) {
            // Empty row parsing artifact
            continue;
          }

          // Validation
          const errorMsg = validateRow(row, rowNum);
          if (errorMsg) {
            newLogs.push({ row: rowNum, name: row.name || "Unknown", status: "error", message: errorMsg });
            setProgress(prev => ({ ...prev, current: prev.current + 1 }));
            continue;
          }

          try {
            // Prepare Data
            const latitude = parseFloat(row.latitude);
            const longitude = parseFloat(row.longitude);

            // Normalize Sthan Type Case
            const sthanMatch = sthanTypes.find(t => t.name.toLowerCase() === (row.sthana || "").toLowerCase());
            const sthanName = sthanMatch ? sthanMatch.name : row.sthana;

            // Parse Images
            const images = row.images
              ? row.images.split(";").map((url: string) => url.trim()).filter((url: string) => url.length > 0)
              : [];

            // Parse Sub-temples
            let subTemples = [];
            if (row.sub_temples_json) {
              try {
                subTemples = JSON.parse(row.sub_temples_json);
              } catch (e) {
                console.warn(`Row ${rowNum}: Invalid JSON for sub_temples`);
                newLogs.push({ row: rowNum, name: row.name, status: "error", message: "Invalid sub_temples JSON" });
                setProgress(prev => ({ ...prev, current: prev.current + 1 }));
                continue;
              }
            }

            const templeId = doc(collection(db, "temples")).id;
            const templeData = {
              name: row.name,
              city: row.city,
              taluka: row.taluka || "",
              district: row.district || "",
              state: row.state || "",
              country: row.country || "",
              address: row.address || "",

              sthana: sthanName,
              leela: row.leela || "",

              description_title: row.description_title || "Sthan At Glance",
              description_text: row.description_text || "",
              description: row.description_text || "", // Legacy

              sthana_info_title: row.sthana_info_title || "Sthan Description",
              sthana_info_text: row.sthana_info_text || "",

              directions_title: row.directions_title || "Way to reach",
              directions_text: row.directions_text || "",

              latitude,
              longitude,
              location: { lat: latitude, lng: longitude },

              images,
              sub_temples: subTemples,

              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: user.uid
            };

            // Write to Firestore
            // We use direct Firestore access here for bulk speed and simplicity, 
            // verifying it works with the client SDK as per the user's environment
            await setDoc(doc(db, "temples", templeId), templeData);

            newLogs.push({ row: rowNum, name: row.name, status: "success", message: "Imported" });
            successCount++;

          } catch (err: any) {
            console.error(`Error importing row ${rowNum}:`, err);
            newLogs.push({ row: rowNum, name: row.name, status: "error", message: err.message || "Upload failed" });
          }

          setProgress(prev => ({ ...prev, current: prev.current + 1 }));
          // Update logs in chunks to avoid too many renders if needed, but here reasonable
          if (i % 5 === 0) setLogs([...newLogs]);
        }

        setLogs(newLogs);
        setUploading(false);
        setCsvFile(null); // Clear file to prevent double upload

        toast({
          title: "Batch Upload Complete",
          description: `Successfully imported ${successCount} out of ${rows.length} temples.`,
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
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Import Temples from CSV</CardTitle>
          <CardDescription>
            Upload a standard CSV file to add multiple temples.
            Ensure your CSV matches the required format.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-muted/50 p-4 rounded-lg">
            <div className="space-y-1">
              <h3 className="font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" /> CSV Template
              </h3>
              <p className="text-sm text-muted-foreground">
                Download the template to ensure correct column headers.
              </p>
            </div>
            <Button variant="outline" onClick={downloadTemplate} className="shrink-0">
              <Download className="w-4 h-4 mr-2" /> Download Template
            </Button>
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <p className="text-xs text-muted-foreground">
              Max 5MB. Valid Sthan Types: {sthanTypes.map(t => t.name).join(", ")}.
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={!csvFile || uploading}
              className="min-w-[140px]"
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
        </CardContent>
      </Card>

      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Import Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Row</TableHead>
                    <TableHead>Temple Name</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{log.row}</TableCell>
                      <TableCell className="font-medium">{log.name}</TableCell>
                      <TableCell>
                        {log.status === "success" && <span className="flex items-center text-green-600"><CheckCircle className="w-4 h-4 mr-1" /> Success</span>}
                        {log.status === "error" && <span className="flex items-center text-red-600"><XCircle className="w-4 h-4 mr-1" /> Error</span>}
                        {log.status === "skipped" && <span className="flex items-center text-orange-500"><AlertCircle className="w-4 h-4 mr-1" /> Skipped</span>}
                      </TableCell>
                      <TableCell className={log.status === 'error' ? 'text-red-500' : 'text-muted-foreground'}>
                        {log.message}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminCsvUpload;
