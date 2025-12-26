"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { authService } from "@/services/authService";

type Pelanggan = {
  id: number;
  uid: string;
  nik: string;
  nama: string;
  kelas: string;
  no_hp: string;
};

export default function PelangganPage() {
  const router = useRouter();

  const [pelanggan, setPelanggan] = useState<Pelanggan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Pelanggan | null>(null);
  const [polling, setPolling] = useState<NodeJS.Timeout | null>(null);

  const [form, setForm] = useState({
    uid: "",
    nik: "",
    nama: "",
    kelas: "",
    no_hp: "",
  });

  /* =========================
     POLLING
  ========================= */
  const startPollingUID = () => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get("/last_uid");
        if (res.data.uid) {
          setForm((prev) => ({
            ...prev,
            uid: res.data.uid,
          }));
          clearInterval(interval);
          setPolling(null);
        }
      } catch (err) {
        console.error("Gagal mengambil UID");
      }
    }, 1000);

    setPolling(interval);
  };

  const closeModal = async () => {
    if (polling) clearInterval(polling);
    setPolling(null);
    setShowModal(false);

    try {
      await api.get("/clear_uid");
    } catch {}
  };

  /* =========================
     AUTH CHECK
  ========================= */
  useEffect(() => {
    authService.getMe().catch(() => router.push("/login"));
  }, [router]);

  /* =========================
     FETCH DATA
  ========================= */
  const fetchPelanggan = async (q = "") => {
    try {
      const res = await api.get("/pelanggan", {
        params: q ? { q } : {},
      });
      setPelanggan(res.data);
    } catch {
      alert("Gagal mengambil data pelanggan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPelanggan();
  }, []);

  /* =========================
     HANDLERS
  ========================= */
  const openAddModal = () => {
    setEditing(null);
    setForm({
      uid: "",
      nik: "",
      nama: "",
      kelas: "",
      no_hp: "",
    });
    setShowModal(true);
    startPollingUID();
  };

  const openEditModal = (p: Pelanggan) => {
    setEditing(p);
    setForm({
      uid: p.uid,
      nik: p.nik,
      nama: p.nama,
      kelas: p.kelas,
      no_hp: p.no_hp,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editing) {
        await api.put(`/pelanggan/${editing.id}`, form);
      } else {
        await api.post("/pelanggan", form);
      }

      closeModal();
      fetchPelanggan(search);
    } catch (err: unknown) {
      const message = (() => {
        if (!err) return "Terjadi kesalahan";
        if (typeof err === "string") return err;
        if (err instanceof Error) return err.message;
        if (typeof err === "object" && err !== null && "response" in err) {
          const r = err as { response?: { data?: { message?: string } } };
          return r.response?.data?.message || "Terjadi kesalahan";
        }
        return "Terjadi kesalahan";
      })();
      alert(message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus pelanggan ini?")) return;

    try {
      await api.delete(`/pelanggan/${id}`);
      fetchPelanggan(search);
    } catch {
      alert("Gagal menghapus pelanggan");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPelanggan(search);
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl text-gray-800 font-bold">Data Pelanggan</h1>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/")}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Dashboard
          </button>

          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Tambah Pelanggan
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <form onSubmit={handleSearch} className="mb-4 flex gap-3">
        <input
          type="text"
          placeholder="Cari NIK atau UID"
          className="border p-2 rounded w-64 text-gray-700"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white px-4 rounded">
          Cari
        </button>
      </form>

      {/* TABLE */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-200 text-gray-800">
            <tr>
              <th className="p-3 text-left">UID</th>
              <th className="p-3 text-left">NIK</th>
              <th className="p-3 text-left">Nama</th>
              <th className="p-3 text-left">Kelas</th>
              <th className="p-3 text-left">No HP</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pelanggan.map((p) => (
              <tr key={p.id} className="border-t text-gray-600">
                <td className="p-3">{p.uid || "-"}</td>
                <td className="p-3">{p.nik}</td>
                <td className="p-3">{p.nama}</td>
                <td className="p-3 text-center">{p.kelas}</td>
                <td className="p-3">{p.no_hp}</td>
                <td className="p-3 text-center space-x-2">
                  <button
                    onClick={() => router.push(`/tapping/${p.uid}`)}
                    className="px-3 py-1 bg-green-600 text-white rounded"
                  >
                    Detail
                  </button>
                  <button
                    onClick={() => openEditModal(p)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {pelanggan.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  Data tidak ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white text-gray-700 rounded w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editing ? "Edit Pelanggan" : "Tambah Pelanggan"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                placeholder="Tap kartu untuk mendapatkan UID"
                className="w-full border p-2 rounded bg-gray-100"
                value={form.uid}
                readOnly
              />

              <input
                placeholder="NIK"
                className="w-full border p-2 rounded"
                value={form.nik}
                onChange={(e) => setForm({ ...form, nik: e.target.value })}
                required
              />

              <input
                placeholder="Nama"
                className="w-full border p-2 rounded"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                required
              />

              <input
                placeholder="Kelas"
                className="w-full border p-2 rounded"
                value={form.kelas}
                onChange={(e) => setForm({ ...form, kelas: e.target.value })}
                required
              />

              <input
                placeholder="No HP"
                className="w-full border p-2 rounded"
                value={form.no_hp}
                onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
                required
              />

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
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
