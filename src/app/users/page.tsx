"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { authService } from "@/services/authService";

type User = {
  id: number;
  nik: string;
  nama: string;
  username: string;
  role: "admin" | "agen";
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [form, setForm] = useState({
    nik: "",
    nama: "",
    username: "",
    password: "",
    role: "agen",
  });

  /* =========================
     AUTH & ROLE CHECK
  ========================= */
  useEffect(() => {
    authService
      .getMe()
      .then((res) => {
        if (res.user.role !== "admin") {
          router.push("/");
        }
      })
      .catch(() => router.push("/login"));
  }, [router]);

  /* =========================
     LOAD USERS
  ========================= */
  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      alert("Gagal mengambil data user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* =========================
     HANDLERS
  ========================= */
  const openAddModal = () => {
    setEditingUser(null);
    setForm({
      nik: "",
      nama: "",
      username: "",
      password: "",
      role: "agen",
    });
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setForm({
      nik: user.nik,
      nama: user.nama,
      username: user.username,
      password: "",
      role: user.role,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, form);
      } else {
        await api.post("/users", form);
      }

      setShowModal(false);
      fetchUsers();
    } catch (err: unknown) {
      let message = "Terjadi kesalahan";
      if (typeof err === "object" && err !== null) {
        const e = err as { response?: { data?: { message?: string } } };
        message = e.response?.data?.message || message;
      }
      alert(message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus user ini?")) return;

    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch {
      alert("Gagal menghapus user");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl text-gray-800 font-bold">Data Agen</h1>

        <div className="flex gap-3">
          {/* BUTTON DASHBOARD */}
          <button
            onClick={() => router.push("/")}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Dashboard
          </button>

          {/* BUTTON TAMBAH AGEN */}
          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Tambah Agen
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-200 text-gray-800">
            <tr>
              <th className="p-3 text-left">NIK</th>
              <th className="p-3 text-left">Nama</th>
              <th className="p-3 text-left">Username</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t text-gray-600">
                <td className="p-3">{u.nik}</td>
                <td className="p-3">{u.nama}</td>
                <td className="p-3">{u.username}</td>
                <td className="p-3 capitalize">{u.role}</td>
                <td className="p-3 text-center space-x-2">
                  <button
                    onClick={() => openEditModal(u)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white text-gray-800 rounded w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingUser ? "Edit Agen" : "Tambah Agen"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                placeholder="NIK"
                className="w-full text-gray-600 border p-2 rounded"
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
                placeholder="Username"
                className="w-full border p-2 rounded"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />

              <input
                type="password"
                placeholder={editingUser ? "Password (opsional)" : "Password"}
                className="w-full border p-2 rounded"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required={!editingUser}
              />

              <select
                className="w-full border p-2 rounded"
                value={form.role}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setForm({ ...form, role: e.target.value as User["role"] })
                }
              >
                <option value="agen">Agen</option>
                <option value="admin">Admin</option>
              </select>

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
