'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';

interface Pelanggan {
    id: number;
    nama: string;
    nik: string;
}

export default function TopupPage() {
  const { id_pelanggan } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [pelanggan, setPelanggan] = useState<Pelanggan | null>(null);
  const [biayaAdmin, setBiayaAdmin] = useState<number>(0);
  const [saldo, setSaldo] = useState<number>(0);

  const [nominal, setNominal] = useState('');
  const [error, setError] = useState('');
  const [saldoMasuk, setSaldoMasuk] = useState(0);

  // ==============================
  // FETCH INFO TOPUP
  // ==============================
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await api.get(`/transaksi/topup/${id_pelanggan}`);
        setPelanggan(res.data.pelanggan);
        setBiayaAdmin(res.data.biaya_admin);
        setSaldo(res.data.saldo);
      } catch {
        alert('Gagal memuat data topup');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [id_pelanggan, router]);

  // ==============================
  // HITUNG SALDO MASUK REALTIME
  // ==============================
  useEffect(() => {
    const value = parseFloat(nominal);
    if (isNaN(value) || value <= 0) {
      setSaldoMasuk(0);
      setError('');
      return;
    }

    const hasil = value - biayaAdmin;
    if (hasil < 0) {
      setError('Nominal lebih kecil dari biaya admin');
      setSaldoMasuk(0);
    } else {
      setError('');
      setSaldoMasuk(hasil);
    }
  }, [nominal, biayaAdmin]);

  // ==============================
  // SUBMIT TOPUP
  // ==============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saldoMasuk <= 0) return;

    setSubmitting(true);

    try {
      await api.post(`/transaksi/topup/${id_pelanggan}`, {
        nominal: nominal,
      });

      alert('Topup berhasil');
      router.back();
    } catch (err: unknown) {
      let message = 'Gagal topup';
      if (typeof err === 'string') {
        message = err;
      } else if (err instanceof Error) {
        message = err.message || message;
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        const resp = (err as { response?: { data?: { message?: string } } }).response;
        message = resp?.data?.message || message;
      }
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-8 min-h-screen bg-slate-200">
      <h1 className="text-2xl font-semibold mb-6">Topup Saldo</h1>

      <div className="bg-white shadow rounded p-6">
        <p className="mb-4 text-gray-700">
          <strong>Pelanggan:</strong> {pelanggan?.nama}<br />
          <strong>NIK:</strong> {pelanggan?.nik}<br />
          <strong>Biaya Admin:</strong> Rp {biayaAdmin.toLocaleString()}
        </p>

        <form onSubmit={handleSubmit}>
          <label className="block mb-4">
            <span className="text-gray-700">Nominal Topup</span>
            <input
              type="number"
              step="0.01"
              className="mt-1 block w-full px-3 py-2 text-gray-600 border rounded"
              value={nominal}
              onChange={(e) => setNominal(e.target.value)}
            />
          </label>

          <div className="mb-4 p-3 bg-gray-100 text-gray-600 rounded text-sm">
            <p>
              Biaya admin:{' '}
              <strong>Rp {biayaAdmin.toLocaleString()}</strong>
            </p>
            <p>
              Saldo diterima:{' '}
              <strong className="text-green-600">
                Rp {saldoMasuk.toLocaleString()}
              </strong>
            </p>

            {error && (
              <p className="text-red-600 mt-2">{error}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 bg-red-600 rounded mr-2"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={submitting || saldoMasuk <= 0}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Memproses...' : 'Proses Topup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
