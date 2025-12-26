'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';

interface Transaksi {
  id: number;
  transaksi_masuk: number;
  transaksi_keluar: number;
  waktu: string;
  user: string;
}

export default function RiwayatTransaksiPelangganPage() {
  const { id_pelanggan } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Transaksi[]>([]);
  const [error, setError] = useState('');

  // ==============================
  // FETCH RIWAYAT TRANSAKSI
  // ==============================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(
          `/transaksi/pelanggan/${id_pelanggan}`
        );
        setData(res.data);
      } catch {
        setError('Gagal memuat riwayat transaksi');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id_pelanggan]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-8 min-h-screen bg-slate-200">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">
        Riwayat Transaksi Pelanggan
      </h1>

      {error && (
        <div className="mb-4 text-red-600">{error}</div>
      )}

      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Tanggal</th>
              <th className="px-4 py-3 text-right">Masuk</th>
              <th className="px-4 py-3 text-right">Keluar</th>
              <th className="px-4 py-3 text-left">Petugas</th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  Belum ada transaksi
                </td>
              </tr>
            )}

            {data.map((t) => (
              <tr
                key={t.id}
                className="border-t hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-gray-600">
                  {t.waktu}
                </td>

                <td className="px-4 py-3 text-right text-green-600">
                  {t.transaksi_masuk > 0
                    ? `Rp ${t.transaksi_masuk.toLocaleString()}`
                    : '-'}
                </td>

                <td className="px-4 py-3 text-right text-red-600">
                  {t.transaksi_keluar > 0
                    ? `Rp ${t.transaksi_keluar.toLocaleString()}`
                    : '-'}
                </td>

                <td className="px-4 py-3 text-gray-600">
                  {t.user}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ACTION */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 mt-4 bg-gray-400 text-white rounded : hover:bg-gray-600"
        >
          Kembali
        </button>
      </div>
    </div>
  );
}
