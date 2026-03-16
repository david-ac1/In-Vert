"use client";

import { useEffect, useState } from "react";
import { api, type ProtocolStats } from "@/lib/api";

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-2 border-2 border-black bg-white p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <p className="text-3xl font-black leading-none">{value}</p>
      {sub ? (
        <p className="text-xs font-bold text-zinc-500">{sub}</p>
      ) : null}
    </div>
  );
}

export function ProtocolStatsBar() {
  const [stats, setStats] = useState<ProtocolStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const next = await api.getProtocolStats();
        if (active) setStats(next);
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    const id = setInterval(() => { void load(); }, 8000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  if (loading || !stats) {
    return (
      <div className="grid animate-pulse grid-cols-2 gap-4 md:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 border-2 border-black bg-zinc-100" />
        ))}
      </div>
    );
  }

  const rejectionRate =
    stats.approvedActions + stats.rejectedActions > 0
      ? Math.round(
          (stats.rejectedActions / (stats.approvedActions + stats.rejectedActions)) * 100,
        )
      : 0;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
      <StatCard label="Actions Submitted" value={stats.totalActions} />
      <StatCard label="Verified" value={stats.approvedActions} sub="approved on-chain" />
      <StatCard label="Rejected" value={stats.rejectedActions} sub={`${rejectionRate}% rejection rate`} />
      <StatCard label="On-Chain Proofs" value={stats.totalAttestations} sub="HCS attestations" />
      <StatCard label="IVRT Rewarded" value={stats.totalRewardsIssued} sub="tokens issued" />
      <StatCard label="Contributors" value={stats.totalContributors} sub="unique wallets" />
    </div>
  );
}
