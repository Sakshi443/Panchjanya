import React, { useState } from "react";
import Papa from "papaparse";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/contexts/AuthContext";

const AdminCsvUpload = () => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCsvFile(e.target.files?.[0] || null);
  };

  const handleUpload = () => {
    if (!csvFile) return alert("Please select a CSV file.");
    setUploading(true);

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows: any[] = results.data;

          for (const r of rows) {
            const latitude = Number(r.latitude || r.lat || 0);
            const longitude = Number(r.longitude || r.lng || 0);
            const images = r.images ? r.images.split(";").map((x: string) => x.trim()) : [];
            let subTemples = [];
            if (r.sub_temples_json) {
              try { subTemples = JSON.parse(r.sub_temples_json); } catch { console.warn("Invalid sub-temples JSON for:", r.name); }
            }

            const templeData = {
              name: r.name || "",
              city: r.city || "",
              taluka: r.taluka || "",
              district: r.district || "",
              address: r.address || "",
              area: r.area || "",
              state: r.state || "",
              country: r.country || "",
              sthana: r.sthana || "",
              leela: r.leela || "",
              location: { lat: latitude, lng: longitude },
              latitude,
              longitude,
              images,
              sub_temples: subTemples,
              createdAt: new Date().toISOString(),
            };

            try {
              const token = await user?.getIdToken();
              const res = await fetch("/api/admin/data?collection=temples", {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify(templeData)
              });
              if (!res.ok) throw new Error("API failed");
            } catch (err) {
              console.warn("API upload failed, using fallback.");
              await addDoc(collection(db, "temples"), { ...templeData, createdAt: Timestamp.now() });
            }
          }

          alert("CSV upload complete!");
        } catch (err) {
          console.error(err);
          alert("Failed to upload CSV.");
        } finally {
          setUploading(false);
          setCsvFile(null);
        }
      },
    });
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 border rounded shadow-sm">
      <h1 className="text-xl font-semibold mb-4">Admin CSV Upload</h1>
      <p className="mb-2 text-gray-600">
        Upload a CSV file to add multiple temples at once.
      </p>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="border p-2 w-full mb-4"
      />

      <button
        onClick={handleUpload}
        disabled={!csvFile || uploading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {uploading ? "Uploading..." : "Upload CSV"}
      </button>

      <div className="mt-4 text-gray-500 text-sm">
        CSV must have headers like: <br />
        <code>
          name, city, taluka, district, area, state, country, address, sthana,
          leela, latitude, longitude, images, sub_temples_json
        </code>
        <br />
        For `images`, separate URLs by semicolon `;`. <br />
        For `sub_temples_json`, provide JSON array like:
        <br />
        <code>
          {'[{"name":"Sub1","description":"Desc","sthanaNo":1,"image":"url","location":{"lat":0,"lng":0}}]'}
        </code>
      </div>
    </div>
  );
};

export default AdminCsvUpload;
