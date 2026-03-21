"use client";

import { useEffect, useMemo, useState } from "react";
import { api, type SustainabilityMuralItem } from "@/lib/api";

function asColumns(items: SustainabilityMuralItem[], columnCount: number) {
  const columns: SustainabilityMuralItem[][] = Array.from({ length: columnCount }, () => []);
  items.forEach((item, index) => {
    columns[index % columnCount].push(item);
  });
  return columns;
}

export function SustainabilityMural() {
  const [items, setItems] = useState<SustainabilityMuralItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        const response = await api.getSustainabilityMural();
        setItems(response.items);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load mural");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const columns = useMemo(() => asColumns(items, 4), [items]);

  function badgeClass(status: string) {
    if (status === "approved") return "bg-emerald-100 text-emerald-900 border-emerald-700";
    if (status === "rejected") return "bg-rose-100 text-rose-900 border-rose-700";
    if (status === "processing") return "bg-amber-100 text-amber-900 border-amber-700";
    return "bg-zinc-100 text-zinc-800 border-zinc-400";
  }

  return (
    <section className="border-2 border-black bg-white p-6 shadow-[8px_8px_0_0_#000] md:p-8">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Living Evidence</p>
      <h2 className="mt-2 text-2xl font-black uppercase tracking-tight md:text-4xl">Sustainability Mural</h2>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600">
        Every tile below is a submitted grassroots contribution. Approved entries represent verified impact, while queued and rejected entries preserve transparent history.
      </p>

      {error ? <p className="mt-4 text-sm font-bold text-red-600">{error}</p> : null}
      {loading ? <p className="mt-4 text-sm font-bold">Loading mural...</p> : null}
      {!loading && items.length === 0 ? (
        <p className="mt-4 text-sm font-bold text-zinc-600">No submitted evidence yet. Start by submitting an action.</p>
      ) : null}

      <div className="mt-6 hidden gap-4 md:grid md:grid-cols-4">
        {columns.map((column, columnIndex) => (
          <div key={`col-${columnIndex}`} className="space-y-4">
            {column.map((item) => (
              <figure key={item.actionId} className="overflow-hidden border-2 border-black bg-zinc-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.photoUrl}
                  alt={`${item.actionType} by ${item.username}`}
                  className="h-44 w-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <figcaption className="border-t-2 border-black p-2 text-[10px] font-black uppercase tracking-wide text-zinc-700">
                  <div className="flex items-center justify-between gap-2">
                    <span>{item.username} · {item.actionType.replaceAll("_", " ")}</span>
                    <span className={`border px-1.5 py-0.5 text-[9px] ${badgeClass(item.status)}`}>
                      {item.verificationResult ?? item.status}
                    </span>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:hidden">
        {items.slice(0, 24).map((item) => (
          <figure key={item.actionId} className="overflow-hidden border-2 border-black bg-zinc-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.photoUrl}
              alt={`${item.actionType} by ${item.username}`}
              className="h-28 w-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <figcaption className="border-t-2 border-black p-1.5 text-[9px] font-black uppercase tracking-wide text-zinc-700">
              <span className={`border px-1 py-0.5 ${badgeClass(item.status)}`}>
                {item.verificationResult ?? item.status}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
