import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ImpactDashboard } from "@/components/impact-dashboard";
import { ProtocolStatsBar } from "@/components/protocol-stats-bar";

export default function ImpactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-4 py-16 md:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-black uppercase tracking-tight md:text-6xl">
            Impact Leaderboard and Feed
          </h1>
          <p className="mt-4 max-w-2xl text-zinc-600">
            Live protocol metrics from the In-Vert Proof-of-Sustainability network.
          </p>
        </div>

        <div className="mb-10">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            Protocol Stats — Live
          </p>
          <ProtocolStatsBar />
        </div>

        <ImpactDashboard />
      </main>
      <SiteFooter />
    </div>
  );
}
