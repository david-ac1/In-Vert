import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ImpactDashboard } from "@/components/impact-dashboard";
import { ImpactPoolBoard } from "@/components/impact-pool-board";
import { ProtocolStatsBar } from "@/components/protocol-stats-bar";
import Link from "next/link";

export default function ImpactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-4 py-16 md:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-black uppercase tracking-tight md:text-6xl">
            Grassroots Impact Ledger
          </h1>
          <p className="mt-4 max-w-2xl text-zinc-600">
            In-Vert captures informal environmental work, verifies it, and bundles approved actions
            into composable impact assets.
          </p>
        </div>

        <div className="mb-10">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            Protocol Stats — Live
          </p>
          <ProtocolStatsBar />
        </div>

        <ImpactDashboard />

        <div className="mt-12">
          <ImpactPoolBoard />
        </div>

        <div className="mt-12 border-2 border-black bg-white p-6 shadow-[8px_8px_0_0_#000] md:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">3D Experience</p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight md:text-4xl">Proof Forest</h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600">
            Explore the live 3D reforestation simulation powered by approved actions.
          </p>
          <Link
            href="/forest"
            className="mt-4 inline-block border-2 border-black bg-black px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-zinc-800"
          >
            Open Forest
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
