"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function useUIDPolling(enabled: boolean) {
  const router = useRouter();
  const lastUID = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let isActive = true;

    const pollUID = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const res = await fetch(`/api/last_uid`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const data = await res.json();

        if (data.uid && data.uid !== lastUID.current) {
          lastUID.current = data.uid;

          await fetch(`/api/clear_uid`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          router.push(`/tapping/${data.uid}`);
        }
      } catch (err) {
        console.error("Error polling UID:", err);
      }

      if (isActive) {
        setTimeout(pollUID, 1000);
      }
    };

    pollUID();

    return () => {
      isActive = false;
    };
  }, [enabled, router]);
}
