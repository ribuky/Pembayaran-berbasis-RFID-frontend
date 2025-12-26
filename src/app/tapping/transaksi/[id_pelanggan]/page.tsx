"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AxiosError } from "axios";
import api from "@/lib/axios";

interface Pelanggan {
  uid: string;
  id: number;
  nama: string;
  nik: string;
}

export default function TransaksiPembelianPage() {
  const params = useParams();
  const router = useRouter();
  const id_pelanggan = params?.id_pelanggan as string;

  const [loading, setLoading] = useState(true);
  const [saldo, setSaldo] = useState(0);
  const [biayaTransaksi, setBiayaTransaksi] = useState(0);
  const [pelanggan, setPelanggan] = useState<Pelanggan | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [nominal, setNominal] = useState("");
  const [totalBiaya, setTotalBiaya] = useState(0);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pelanggan) return;

    const nominalNumber = parseFloat(nominal);

    // ==============================
    // VALIDASI CLIENT SIDE
    // ==============================
    if (isNaN(nominalNumber) || nominalNumber <= 0) {
      setError("Nominal harus lebih dari 0");
      return;
    }

    if (totalBiaya > saldo) {
      setError("Saldo tidak mencukupi");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await api.post(`/transaksi/pembelian/${pelanggan.id}`, {
        nominal: nominalNumber,
      });

      alert("Transaksi berhasil");

      // Kembali ke tapping detail pelanggan
      router.push(`/tapping/${pelanggan.uid}`);
    } catch (err) {
      if (err instanceof AxiosError) {
        const msg = err.response?.data?.message;
        if (msg) {
          setError(msg);
        } else {
          setError("Terjadi kesalahan saat memproses transaksi");
        }
      } else {
        setError("Terjadi kesalahan saat memproses transaksi");
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!id_pelanggan) return;

    const fetchInfo = async () => {
      try {
        const res = await api.get(`/transaksi/pembelian/${id_pelanggan}`);
        setPelanggan(res.data.pelanggan);
        setSaldo(res.data.saldo);
        setBiayaTransaksi(res.data.biaya_transaksi);
      } catch {
        alert("Gagal memuat data transaksi");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [id_pelanggan, router]);

  useEffect(() => {
    const val = parseFloat(nominal);
    if (isNaN(val) || val <= 0) {
      setTotalBiaya(0);
      setError("");
      return;
    }

    const total = val + biayaTransaksi;
    setTotalBiaya(total);

    if (total > saldo) {
      setError("Saldo tidak mencukupi");
    } else {
      setError("");
    }
  }, [nominal, biayaTransaksi, saldo]);

  if (!id_pelanggan) {
    return <div className="p-6">Parameter tidak valid</div>;
  }

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-8 min-h-screen bg-slate-200">
      <h1 className="text-2xl font-semibold mb-6">Transaksi Pembelian</h1>

      <div className="bg-white shadow rounded p-6">
        {/* INFORMASI PELANGGAN */}
        <p className="mb-4 text-gray-700">
          <strong>Pelanggan:</strong> {pelanggan?.nama}
          <br />
          <strong>NIK:</strong> {pelanggan?.nik}
          <br />
          <strong>Saldo Saat Ini:</strong>{" "}
          <span className="text-green-600 font-semibold">
            Rp {saldo.toLocaleString()}
          </span>
        </p>

        {/* FORM TRANSAKSI */}
        <form onSubmit={handleSubmit}>
          <label className="block mb-4">
            <span className="text-gray-700">Nominal Pembelian</span>
            <input
              type="number"
              step="0.01"
              className="mt-1 block w-full px-3 py-2 text-gray-600 border rounded"
              value={nominal}
              onChange={(e) => setNominal(e.target.value)}
            />
          </label>

          {/* RINGKASAN TRANSAKSI */}
          <div className="mb-4 p-3 bg-gray-100 text-gray-600 rounded text-sm">
            <p>
              Biaya Transaksi:{" "}
              <strong>Rp {biayaTransaksi.toLocaleString()}</strong>
            </p>
            <p>
              Total Dibayar:{" "}
              <strong className="text-red-600">
                Rp {totalBiaya.toLocaleString()}
              </strong>
            </p>

            {error && <p className="text-red-600 mt-2">{error}</p>}
          </div>

          {/* ACTION BUTTON */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-400 text-white rounded mr-2 : hover:bg-gray-600 "
            >
              Kembali
            </button>

            <button
              type="submit"
              disabled={submitting || totalBiaya <= 0 || totalBiaya > saldo}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
            >
              {submitting ? "Memproses..." : "Proses Transaksi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
