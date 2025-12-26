'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { authService } from '@/services/authService';

type Biaya = {
  id: number;
  id_agen: number;
  nama_agen: string;
  biaya_topup: number;
  biaya_transaksi: number;
};

type Agen = {
  id: number;
  username: string;
};

export default function BiayaTransaksiPage() {
  const router = useRouter();

  const [userRole, setUserRole] = useState<string>('');
  const [biaya, setBiaya] = useState<Biaya[]>([]);
  const [agen, setAgen] = useState<Agen[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Biaya | null>(null);

  const [form, setForm] = useState({
    id_agen: '',
    biaya_topup: '',
    biaya_transaksi: '',
  });

  /* =========================
     AUTH & ROLE
  ========================= */
  useEffect(() => {
    authService
      .getMe()
      .then((res) => setUserRole(res.user.role))
      .catch(() => router.push('/login'));
  }, [router]);

  /* =========================
     FETCH DATA
  ========================= */
  const fetchBiaya = async () => {
    try {
      const res = await api.get('/biaya-admin');
      setBiaya(res.data);
    } catch {
      alert('Gagal mengambil data biaya transaksi');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgen = async () => {
    try {
      const res = await api.get('/users');
      setAgen(res.data);
    } catch {
      console.error('Gagal mengambil data agen');
    }
  };

  useEffect(() => {
    fetchBiaya();
    fetchAgen();
  }, []);

  /* =========================
     HANDLERS
  ========================= */
  const openAddModal = () => {
    setEditing(null);
    setForm({
      id_agen: '',
      biaya_topup: '',
      biaya_transaksi: '',
    });
    setShowModal(true);
  };

  const openEditModal = (b: Biaya) => {
    setEditing(b);
    setForm({
      id_agen: String(b.id_agen),
      biaya_topup: String(b.biaya_topup),
      biaya_transaksi: String(b.biaya_transaksi),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        id_agen: Number(form.id_agen),
        biaya_topup: Number(form.biaya_topup),
        biaya_transaksi: Number(form.biaya_transaksi),
      };

      if (editing) {
        await api.put(`/biaya-admin/${editing.id}`, payload);
      } else {
        await api.post('/biaya-admin', payload);
      }

      setShowModal(false);
      fetchBiaya();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus biaya ini?')) return;

    try {
      await api.delete(`/biaya-admin/${id}`);
      fetchBiaya();
    } catch {
      alert('Gagal menghapus data');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl text-gray-800 font-bold">Biaya Transaksi</h1>

        <div className="flex gap-3">
          <button
            onClick={() => router.push('/')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Dashboard
          </button>

          {userRole === 'admin' && (
            <button
              onClick={openAddModal}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Tambah Biaya
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="p-3 text-left">Agen</th>
              <th className="p-3 text-right">Biaya TopUp</th>
              <th className="p-3 text-right">Biaya Transaksi</th>
              {userRole === 'admin' && (
                <th className="p-3 text-center">Aksi</th>
              )}
            </tr>
          </thead>
          <tbody>
            {biaya.map((b) => (
              <tr key={b.id} className="border-t text-gray-600">
                <td className="p-3">{b.nama_agen}</td>
                <td className="p-3 text-right">
                  Rp {b.biaya_topup.toLocaleString()}
                </td>
                <td className="p-3 text-right">
                  Rp {b.biaya_transaksi.toLocaleString()}
                </td>
                {userRole === 'admin' && (
                  <td className="p-3 text-center space-x-2">
                    <button
                      onClick={() => openEditModal(b)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded"
                    >
                      Hapus
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {biaya.length === 0 && (
              <tr>
                <td
                  colSpan={userRole === 'admin' ? 4 : 3}
                  className="p-4 text-center text-gray-500"
                >
                  Data biaya belum tersedia
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && userRole === 'admin' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white text-gray-700 rounded w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editing ? 'Edit Biaya Transaksi' : 'Tambah Biaya Transaksi'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <select
                className="w-full border p-2 rounded"
                value={form.id_agen}
                onChange={(e) =>
                  setForm({ ...form, id_agen: e.target.value })
                }
                required
              >
                <option value="">Pilih Agen</option>
                {agen.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.username}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Biaya TopUp"
                className="w-full border p-2 rounded"
                value={form.biaya_topup}
                onChange={(e) =>
                  setForm({ ...form, biaya_topup: e.target.value })
                }
                required
              />

              <input
                type="number"
                placeholder="Biaya Transaksi"
                className="w-full border p-2 rounded"
                value={form.biaya_transaksi}
                onChange={(e) =>
                  setForm({ ...form, biaya_transaksi: e.target.value })
                }
                required
              />

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
