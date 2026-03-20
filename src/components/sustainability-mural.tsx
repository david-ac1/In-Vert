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

  return (
    <section className="border-2 border-black bg-white p-6 shadow-[8px_8px_0_0_#000] md:p-8">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Living Evidence</p>
      <h2 className="mt-2 text-2xl font-black uppercase tracking-tight md:text-4xl">Sustainability Mural</h2>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600">
        Every tile below is an approved grassroots contribution. This is the visual ledger of community climate action.
      </p>

      {error ? <p className="mt-4 text-sm font-bold text-red-600">{error}</p> : null}
      {loading ? <p className="mt-4 text-sm font-bold">Loading mural...</p> : null}
      {!loading && items.length === 0 ? (
        <p className="mt-4 text-sm font-bold text-zinc-600">No approved evidence yet. Verify actions to grow the mural.</p>
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
                  {item.username} · {item.actionType.replaceAll("_", " ")}
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
          </figure>
        ))}
      </div>
    </section>
  );
}
