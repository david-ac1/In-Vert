import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ProtocolStatsBar } from "@/components/protocol-stats-bar";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-4 py-16 md:px-8">
        <section className="mb-16 border-2 border-black p-8 md:p-12 shadow-[12px_12px_0_0_#000]">
          <p className="mb-6 inline-flex items-center gap-2 border-2 border-black px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em]">
            Hedera Apex 2026 Sustainability Track
          </p>
          <h1 className="mb-6 text-5xl font-black uppercase tracking-tight md:text-7xl">
            Proof of Sustainability On-Chain
          </h1>
          <p className="max-w-2xl text-lg text-zinc-600">
            In-Vert verifies real-world eco actions, anchors attestations on
            Hedera, and distributes tokenized rewards through a transparent,
            auditable impact loop.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/submit"
              className="border-2 border-black bg-primary px-8 py-4 text-sm font-black uppercase tracking-[0.15em] text-white shadow-[6px_6px_0_0_#000] transition hover:bg-primary-dark"
            >
              Submit Action
            </Link>
            <Link
              href="/impact"
              className="border-2 border-black px-8 py-4 text-sm font-black uppercase tracking-[0.15em] transition hover:bg-zinc-100"
            >
              View Impact
            </Link>
            <Link
              href="/attestations"
              className="border-2 border-black px-8 py-4 text-sm font-black uppercase tracking-[0.15em] transition hover:bg-zinc-100"
            >
              View Receipts
            </Link>
          </div>
        </section>

        <div className="mb-10">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            Protocol Stats — Live
          </p>
          <ProtocolStatsBar />
        </div>

        <section className="grid gap-8 md:grid-cols-4">
          <div className="border-2 border-black p-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">
              01 Submit
            </h2>
            <p className="mt-3 text-sm text-zinc-600">
              Contributors upload eco actions with evidence metadata.
            </p>
          </div>
          <div className="border-2 border-black p-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">
              02 Verify
            </h2>
            <p className="mt-3 text-sm text-zinc-600">
              Agent pipeline validates evidence and action consistency.
            </p>
          </div>
          <div className="border-2 border-black p-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">
              03 Record
            </h2>
            <p className="mt-3 text-sm text-zinc-600">
              Approved actions are attested through Hedera Consensus Service.
            </p>
          </div>
          <div className="border-2 border-black p-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">
              04 Reward
            </h2>
            <p className="mt-3 text-sm text-zinc-600">
              Hedera Token Service rewards verified sustainability effort.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
