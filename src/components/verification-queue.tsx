"use client";

import { useEffect, useState } from "react";
import { api, type VerificationQueueItem } from "@/lib/api";

export function VerificationQueue() {
  const [items, setItems] = useState<VerificationQueueItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const result = await api.getVerifications();
        if (!active) {
          return;
        }
        setItems(result.items);
        setError(null);
      } catch (loadError) {
        if (!active) {
          return;
        }
        setError(loadError instanceof Error ? loadError.message : "Failed to load verification queue");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();
    const intervalId = setInterval(() => {
      void load();
    }, 5000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  if (loading) {
    return <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">Loading verification queue...</p>;
  }

  if (error) {
    return <p className="border-2 border-black p-4 text-sm font-bold text-red-600">{error}</p>;
  }

  return (
    <section className="border-2 border-black bg-white shadow-[12px_12px_0_0_#000]">
      <header className="border-b-2 border-black p-6 text-xs font-black uppercase tracking-[0.2em]">
        Verification Queue
      </header>
      <div className="divide-y-2 divide-black">
        {items.length === 0 ? (
          <p className="p-6 text-sm font-medium text-zinc-500">No verification jobs processed yet.</p>
        ) : (
          items.map((status) => (
            <div key={status.id} className="grid gap-4 p-6 md:grid-cols-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Action ID</p>
                <p className="mt-2 text-sm font-bold">{status.id}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Type</p>
                <p className="mt-2 text-sm font-bold">{status.type}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Agent Confidence</p>
                <p className="mt-2 text-sm font-bold">{status.score}%</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Result</p>
                <p className="mt-2 text-sm font-bold capitalize">{status.result}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
