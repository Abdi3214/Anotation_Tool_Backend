// ====== app/home/annotation/export/page.js (Front‑End Export Component) ======
"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ExportData() {
  const [startDate, setStartDate] = useState("2024-04-01");
  const [endDate, setEndDate] = useState("2024-04-15");
  const [format, setFormat] = useState("CSV");
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.push("/login");
    }
  }, []);
  const handleDownload = async () => {
    const query = `?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}&format=${format.toLowerCase()}`;
    try {
      const res = await fetch(`https://anotationtoolbackend-production.up.railway.app/api/annotation/export${query}`, {
        method: 'GET'
      });
      if (!res.ok) throw new Error(`Export failed: ${res.status} ${res.statusText} `);

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `annotations_${startDate}_to_${endDate}.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 my-10 text-center">
      <h2 className="text-3xl font-bold mb-6">Export Data</h2>

      <div className="mb-6">
        <label className="block font-medium mb-2">Date Range</label>
        <div className="flex items-center justify-center space-x-4">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border px-3 py-2 rounded"/>
          <span className="text-xl">→</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border px-3 py-2 rounded"/>
        </div>
      </div>

      <div className="mb-6">
        <label className="block font-medium mb-2">Export Format</label>
        <div className="flex justify-center space-x-6">
          {['CSV', 'JSON', 'XLSX'].map((opt) => (
            <label key={opt} className="flex items-center space-x-2">
              <input type="radio" value={opt} checked={format === opt} onChange={(e) => setFormat(e.target.value)} />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      </div>

      <button onClick={handleDownload} className="bg-blue-600 text-white px-6 py-2 rounded">
        Download
      </button>
    </div>
  );
}