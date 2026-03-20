"use client";

import { useEffect, useState } from "react";
import { api, type ImpactPoolSummary } from "@/lib/api";

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export function ImpactPoolBoard() {
  const [items, setItems] = useState<ImpactPoolSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedExport, setSelectedExport] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      const response = await api.getImpactPools();
      setItems(response.items);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load impact pools");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function createPool() {
    setCreating(true);
    setError(null);
    try {
      await api.createImpactPool({ targetActions: 3 });
      await load();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create impact pool");
    } finally {
      setCreating(false);
    }
  }

  async function exportPool(poolId: string) {
    setSelectedExport(null);
    setError(null);
    try {
      const result = await api.exportImpactPool(poolId);
      setSelectedExport(JSON.stringify(result, null, 2));
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Failed to export pool proof");
    }
  }

  return (
    <section id="impact-pools" className="border-2 border-black bg-white p-6 md:p-8 shadow-[8px_8px_0_0_#000]">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Composability Layer</p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight md:text-4xl">Impact Pools</h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600">
            Convert many small verified actions into a single reusable impact asset for NGOs,
            sponsors, and future carbon-linked workflows.
          </p>
        </div>
        <button
          onClick={() => {
            void createPool();
          }}
          disabled={creating}
          className="border-2 border-black bg-black px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {creating ? "Building Pool..." : "Build Impact Pool"}
        </button>
      </div>

      {error ? <p className="mb-4 text-sm font-bold text-red-600">{error}</p> : null}
      {loading ? <p className="text-sm font-bold">Loading pools...</p> : null}
      {!loading && items.length === 0 ? (
        <p className="text-sm font-bold text-zinc-600">
          No pools yet. Build the first pool from approved grassroots actions.
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((pool) => (
          <article key={pool.id} className="border-2 border-black bg-zinc-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{pool.id}</p>
            <h3 className="mt-2 text-lg font-black uppercase">{pool.title}</h3>
            <div className="mt-3 space-y-1 text-sm font-medium">
              <p>Status: <span className="font-black uppercase">{pool.status}</span></p>
              <p>Actions bundled: <span className="font-black">{pool.totalActions}</span></p>
              <p>Total quantity: <span className="font-black">{pool.totalQuantity}</span></p>
              <p>Average confidence: <span className="font-black">{pool.avgConfidence}%</span></p>
              <p>Geo spread: <span className="font-black">{pool.geoCount} locations</span></p>
              <p className="break-all">Pool hash: <span className="font-black">{pool.poolHash}</span></p>
              <p>Created: <span className="font-black">{formatDate(pool.createdAt)}</span></p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  void exportPool(pool.id);
                }}
                className="border-2 border-black px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-colors hover:bg-white"
              >
                Export Proof JSON
              </button>
            </div>
          </article>
        ))}
      </div>

      {selectedExport ? (
        <div className="mt-6 border-2 border-black bg-white p-4">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Exported Impact Asset</p>
          <pre className="max-h-64 overflow-auto bg-zinc-100 p-3 text-xs">{selectedExport}</pre>
        </div>
      ) : null}
    </section>
  );
}
