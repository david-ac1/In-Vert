"use client";

import { useEffect, useState } from "react";
import { api, type FeedItem, type LeaderboardContributor } from "@/lib/api";

export function ImpactDashboard() {
  const [contributors, setContributors] = useState<LeaderboardContributor[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [leaderboardResult, feedResult] = await Promise.all([
          api.getLeaderboard(),
          api.getFeed(),
        ]);
        if (!active) {
          return;
        }
        setContributors(leaderboardResult.contributors);
        setFeed(feedResult.items);
        setError(null);
      } catch (loadError) {
        if (!active) {
          return;
        }
        setError(loadError instanceof Error ? loadError.message : "Failed to load impact data");
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
    return <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">Loading impact data...</p>;
  }

  if (error) {
    return <p className="border-2 border-black p-4 text-sm font-bold text-red-600">{error}</p>;
  }

  return (
    <div className="grid gap-8 md:grid-cols-5">
      <section className="border-2 border-black bg-white shadow-[10px_10px_0_0_#000] md:col-span-3">
        <header className="border-b-2 border-black p-6 text-xs font-black uppercase tracking-[0.2em]">
          Top Contributors
        </header>
        <div className="divide-y-2 divide-black">
          {contributors.length === 0 ? (
            <p className="p-6 text-sm font-medium text-zinc-500">No contributor data yet.</p>
          ) : (
            contributors.map((item, idx) => (
              <article key={item.id} className="grid gap-3 p-6 md:grid-cols-4">
                <p className="text-lg font-black">#{idx + 1}</p>
                <p className="text-sm font-bold md:col-span-2">{item.username}</p>
                <p className="text-sm font-bold text-zinc-600">
                  {item.actionsSubmitted} actions • {item.totalRewards} IVRT
                </p>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="border-2 border-black bg-white md:col-span-2">
        <header className="border-b-2 border-black p-6 text-xs font-black uppercase tracking-[0.2em]">
          Live Feed
        </header>
        <div className="space-y-4 p-6">
          {feed.length === 0 ? (
            <p className="text-sm font-medium text-zinc-500">No feed activity yet.</p>
          ) : (
            feed.map((item) => (
              <article key={item.id} className="border-2 border-black p-4 text-sm font-medium">
                <p>{item.message}</p>
                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
