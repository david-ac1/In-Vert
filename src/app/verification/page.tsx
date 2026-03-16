import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const statuses = [
  { id: "A-000871", type: "Tree Planting", result: "Approved", score: 96 },
  { id: "A-000872", type: "Cleanup", result: "Review", score: 72 },
  { id: "A-000873", type: "Recycling", result: "Approved", score: 91 },
];

export default function VerificationPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-4 py-16 md:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-black uppercase tracking-tight md:text-6xl">
            AI Verification Status
          </h1>
          <p className="mt-4 max-w-2xl text-zinc-600">
            This route is scaffolded from the image-based design source and is
            ready for pixel-parity implementation after visual extraction.
          </p>
        </div>

        <section className="border-2 border-black bg-white shadow-[12px_12px_0_0_#000]">
          <header className="border-b-2 border-black p-6 text-xs font-black uppercase tracking-[0.2em]">
            Verification Queue
          </header>
          <div className="divide-y-2 divide-black">
            {statuses.map((status) => (
              <div key={status.id} className="grid gap-4 p-6 md:grid-cols-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    Action ID
                  </p>
                  <p className="mt-2 text-sm font-bold">{status.id}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    Type
                  </p>
                  <p className="mt-2 text-sm font-bold">{status.type}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    Agent Confidence
                  </p>
                  <p className="mt-2 text-sm font-bold">{status.score}%</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    Result
                  </p>
                  <p className="mt-2 text-sm font-bold">{status.result}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
