'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { useUIDPolling } from '@/hooks/useUIDPolling';

type User = {
  username: string;
  role: 'admin' | 'agen';
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showTappingModal, setShowTappingModal] = useState(false);
  const [uid, setUid] = useState('');
  const inputValue = uid.trim();

  useEffect(() => {
    authService
      .getMe()
      .then((res) => setUser(res.user))
      .catch(() => router.push('/login'));
  }, [router]);

  useUIDPolling(!!user);

  const handleLogout = async () => {
    await authService.logout();
    router.push('/login');
  };

  const handleTappingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue) return;
    router.push(`/tapping/${inputValue}`);
  };

  if (!user) {
    return <div className="p-10">Loading...</div>;
  }

  const isAdmin = user.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ================= HEADER ================= */}
      <header className="grid grid-cols-3 items-center bg-white px-6 py-4 shadow">
        {/* LEFT */}
        <div className="font-medium text-gray-700">
          {user.username} ({user.role})
        </div>

        {/* CENTER */}
        <div className="text-center text-xl font-bold text-gray-800">
          SISTEM PEMBAYARAN RFID
        </div>

        {/* RIGHT */}
        <div className="text-right">
          <button
            onClick={handleLogout}
            className="text-red-600 font-semibold hover:underline"
          >
            Logout
          </button>
        </div>
      </header>

      {/* ================= CONTENT ================= */}
      <main className="p-8 max-w-xl mx-auto">
        {/* TAPPING CARD */}
        <button
          onClick={() => setShowTappingModal(true)}
          className="w-full bg-white rounded-xl shadow hover:shadow-lg transition p-14 mb-8 flex items-center justify-center text-2xl font-bold text-gray-700"
        >
          Tapping Kartu
        </button>

        {/* BUTTON LIST */}
        <div className="space-y-4">
          {isAdmin && (
            <ActionButton
              title="Data Agen"
              color="bg-blue-600"
              onClick={() => router.push('/users')}
            />
          )}

          {isAdmin && (
            <ActionButton
              title="Data Pelanggan"
              color="bg-indigo-600"
              onClick={() => router.push('/pelanggan')}
            />
          )}

          <ActionButton
            title="Biaya Transaksi"
            color="bg-green-600"
            onClick={() => router.push('/biaya-transaksi')}
          />

          <ActionButton
            title="Riwayat Transaksi"
            color="bg-orange-600"
            onClick={() => router.push('/riwayat-transaksi')}
          />
        </div>
      </main>

      {/* ================= MODAL TAPPING ================= */}
      {showTappingModal && (
        <div className="fixed inset-0 bg-black/40 text-gray-900 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl text-gray-600 font-semibold mb-4">
              Input UID / NIK Pelanggan
            </h2>

            <form onSubmit={handleTappingSubmit}>
              <input
                type="text"
                placeholder="Masukkan UID / NIK"
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                className="w-full border rounded px-3 py-2 mb-4"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTappingModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Proses
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= ACTION BUTTON ================= */

function ActionButton({
  title,
  onClick,
  color,
}: {
  title: string;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`${color} w-full text-white py-3 rounded-lg font-semibold hover:opacity-90 transition`}
    >
      {title}
    </button>
  );
}
