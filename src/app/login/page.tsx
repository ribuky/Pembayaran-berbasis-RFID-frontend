'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Perhatikan: next/navigation bukan next/router
import { authService } from '@/services/authService';

export default function LoginPage() {
  const router = useRouter();
  
  // State untuk form dan handling UI
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Memanggil fungsi login dari service yang sudah kita buat sebelumnya
      await authService.login(username, password);
      
      // Jika berhasil, redirect ke halaman Dashboard (Home)
      router.push('/'); 
    } catch (err: unknown) {
      // Menangkap error dari backend
      console.error(err);
      // Narrow the unknown error before accessing nested properties
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const e = err as { response?: { data?: { message?: unknown } } };
        if (e.response?.data?.message) {
          setError(String(e.response.data.message)); // Tampilkan pesan dari Flask (misal: "Username atau password salah")
        } else {
          setError('Terjadi kesalahan saat login. Coba lagi.');
        }
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('Terjadi kesalahan saat login. Coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        
        {/* Header Login */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Login Aplikasi</h1>
          <p className="text-sm text-gray-500">Silakan masuk dengan akun Anda</p>
        </div>

        {/* Alert Error */}
        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Input Username */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Masukkan username"
            />
          </div>

          {/* Input Password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>

          {/* Tombol Login */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full rounded bg-indigo-600 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Memproses...' : 'Login'}
          </button>
        </form>

      </div>
    </div>
  );
}