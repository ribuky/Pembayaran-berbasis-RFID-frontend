'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';

type Pelanggan = {
  id: number;
  uid: string;
  nama: string;
  nik: string;
  kelas: string;
  no_hp: string;
};

export default function TappingDetailPage() {
  const { uid } = useParams<{ uid: string }>();
  const router = useRouter();

  const [pelanggan, setPelanggan] = useState<Pelanggan | null>(null);
  const [saldo, setSaldo] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    api
      .get(`/tapping/${uid}`)
      .then((res) => {
        setPelanggan(res.data.pelanggan);
        setSaldo(res.data.saldo);
      })
      .catch(() => {
        alert('Kartu belum terdaftar');
        router.push('/');
      })
      .finally(() => setLoading(false));
  }, [uid, router]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!pelanggan) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* INFORMASI PELANGGAN */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Informasi Pelanggan</h2>

        <div className="grid grid-cols-2 gap-4 text-gray-800">
          <Info label="Nama Pelanggan" value={pelanggan.nama} />
          <Info label="NIK" value={pelanggan.nik} />
          <Info label="Kelas" value={pelanggan.kelas} />
          <Info label="Nomor HP" value={pelanggan.no_hp} />

          <div className="col-span-2">
            <p className="text-gray-600 text-sm">Saldo</p>
            <p className="text-3xl font-bold text-green-600">
              Rp {saldo.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-wrap gap-4">
        <ActionButton
          label="Top Up"
          color="blue"
          onClick={() => router.push(`/tapping/topup/${pelanggan.id}`)}
        />

        <ActionButton
          label="Transaksi Pembelian"
          color="yellow"
          onClick={() => router.push(`/tapping/transaksi/${pelanggan.id}`)}
        />

        <ActionButton
          label="Riwayat Transaksi"
          color="green"
          onClick={() => router.push(`/tapping/riwayat/${pelanggan.id}`)}
        />

        <ActionButton
          label="Dashboard"
          color="slate"
          onClick={() => router.push(`/`)}
        />
      </div>
    </div>
  );
}

/* =================== COMPONENTS =================== */

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-600 text-sm">{label}</p>
      <p className="text-lg font-medium">{value}</p>
    </div>
  );
}

function ActionButton({
  label,
  color,
  onClick,
}: {
  label: string;
  color: 'blue' | 'yellow' | 'green' | 'slate';
  onClick: () => void;
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    yellow: 'bg-yellow-600 hover:bg-yellow-700',
    green: 'bg-green-700 hover:bg-green-800',
    slate: 'bg-slate-600 hover:bg-slate-700',
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-white rounded ${colors[color]}`}
    >
      {label}
    </button>
  );
}
