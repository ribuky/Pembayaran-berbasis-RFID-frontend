"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { authService } from "@/services/authService";

type Riwayat = {
  id: number;
  pelanggan: {
    nama: string;
    nik: string;
  };
  transaksi_masuk: number;
  transaksi_keluar: number;
  waktu: string;
};

export default function RiwayatTransaksiPage() {
  const router = useRouter();

  const [data, setData] = useState<Riwayat[]>([]);
  const [filter, setFilter] = useState<"all" | "today" | "week" | "month">(
    "all"
  );
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* =========================
     AUTH CHECK
  ========================= */
  useEffect(() => {
    authService.getMe().catch(() => router.push("/login"));
  }, [router]);

  /* =========================
     FETCH DATA
  ========================= */
  const fetchRiwayat = async (filterType: string) => {
    try {
      setLoading(true);
      const res = await api.get("/transaksi/riwayat", {
        params: { filter: filterType },
      });
      setData(res.data);
    } catch {
      alert("Gagal mengambil riwayat transaksi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayat(filter);
  }, [filter]);

  /* =========================
     SEARCH DATA
  ========================= */
  const fetchData = async () => {
    const res = await api.get("/transaksi/riwayat", {
      params: { filter, q: search },
    });
    setData(res.data);
  };

  useEffect(() => {
    fetchData();
  }, [filter, search]);

  const exportPDF = async () => {
  const res = await api.get('/transaksi/export/pdf', {
    params: {
      filter,
      q: search
    },
    responseType: 'blob'
  });

  const blob = new Blob([res.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'riwayat_transaksi.pdf';
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const exportExcel = async () => {
  const res = await api.get('/transaksi/export/excel', {
    params: {
      filter,
      q: search
    },
    responseType: 'blob'
  });

  const blob = new Blob([res.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'riwayat_transaksi.xlsx';
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};


  /* =========================
     HELPERS
  ========================= */
  const getJenis = (r: Riwayat) => {
    if (r.transaksi_masuk > 0) return "TopUp";
    if (r.transaksi_keluar > 0) return "Pembelian";
    return "-";
  };

  const getNominal = (r: Riwayat) => {
    return r.transaksi_masuk > 0 ? r.transaksi_masuk : r.transaksi_keluar;
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl text-gray-800 font-bold">Riwayat Transaksi</h1>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/")}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Dashboard
          </button>
        </div>
      </div>

      {/* FILTER */}
      <div className="flex justify-between mb-4">
        <div className="flex gap-2">
          {(["all", "today", "week", "month"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded ${
                filter === f ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {f === "all"
                ? "Semua"
                : f === "today"
                ? "Hari Ini"
                : f === "week"
                ? "Minggu Ini"
                : "Bulan Ini"}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Cari Nama / NIK"
          className="border px-3 py-1 rounded w-64 text-gray-800"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>


      <div className="flex gap-2 mb-4">
  <button
    onClick={exportPDF}
    className="bg-red-600 text-white px-4 py-2 rounded"
  >
    Export PDF
  </button>

  <button
    onClick={exportExcel}
    className="bg-green-600 text-white px-4 py-2 rounded"
  >
    Export Excel
  </button>
</div>



      {/* TABLE */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-200 text-gray-800">
            <tr>
              <th className="p-3 text-left">Pelanggan</th>
              <th className="p-3 text-left">NIK</th>
              <th className="p-3 text-left">Jenis</th>
              <th className="p-3 text-right">Nominal</th>
              <th className="p-3 text-left">Waktu</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.id} className="border-t text-gray-600">
                <td className="p-3">{r.pelanggan.nama}</td>
                <td className="p-3">{r.pelanggan.nik}</td>
                <td className="p-3">{getJenis(r)}</td>
                <td className="p-3 text-right">
                  Rp {getNominal(r).toLocaleString()}
                </td>
                <td className="p-3">{r.waktu}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Tidak ada transaksi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
