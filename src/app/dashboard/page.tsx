"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, logout } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    const checkAuth = async () => {
      try {
        const res = await fetch(
          `/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Unauthorized");
        }
        console.log("TOKEN:", token);


        // jika sukses → user valid
        setLoading(false);
      } catch (err) {
        console.error("AUTH ERROR:", err);
        logout();
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <button
        onClick={() => {
          logout();
          router.push("/login");
        }}
        className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}
