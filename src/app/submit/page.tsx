import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const vectors = ["Nature", "Circularity", "Energy"];

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto flex max-w-[1200px] flex-col items-center px-4 py-16">
        <div className="mb-16 text-center">
          <div className="mb-6 inline-flex items-center gap-2 border-2 border-black bg-white px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em]">
            Verified Action Protocol
          </div>
          <h1 className="mb-6 text-5xl font-black uppercase tracking-tight md:text-7xl">
            Submit Action
          </h1>
          <p className="mx-auto max-w-xl text-xl font-medium text-zinc-500">
            Contribute to the inverted sustainability model with high-impact
            verified data submission.
          </p>
        </div>

        <div className="w-full max-w-2xl overflow-hidden border-2 border-black bg-white shadow-[12px_12px_0_0_#000]">
          <div className="p-8 md:p-12">
            <div className="mb-12">
              <label className="mb-6 block text-xs font-black uppercase tracking-[0.25em] text-black">
                01. Select Vector
              </label>
              <div className="grid grid-cols-3 gap-1">
                {vectors.map((vector, i) => (
                  <button
                    key={vector}
                    className={`flex flex-col items-center justify-center gap-4 border-2 border-black p-6 text-xs font-black uppercase tracking-widest transition-all ${
                      i === 0
                        ? "bg-primary text-white"
                        : "text-zinc-400 hover:bg-zinc-50 hover:text-black"
                    }`}
                  >
                    {vector}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="md:col-span-1">
                <label className="mb-4 block text-xs font-black uppercase tracking-[0.25em] text-black">
                  02. Magnitude
                </label>
                <input
                  className="h-14 w-full border-2 border-black px-4 text-center text-xl font-black focus:outline-none"
                  type="number"
                  defaultValue={1}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-4 block text-xs font-black uppercase tracking-[0.25em] text-black">
                  03. Specification
                </label>
                <input
                  className="h-14 w-full border-2 border-black px-4 text-sm font-bold placeholder:text-zinc-300 focus:outline-none"
                  placeholder="Brief metadata description..."
                  type="text"
                />
              </div>
            </div>

            <div className="mb-14">
              <label className="mb-4 block text-xs font-black uppercase tracking-[0.25em] text-black">
                04. Evidence Protocol
              </label>
              <label className="flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-zinc-300 p-12 text-center transition-all hover:border-black hover:bg-zinc-50">
                <span className="text-sm font-black uppercase tracking-widest text-zinc-500">
                  Upload proof of impact
                </span>
                <span className="mt-3 text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                  Assets: JPG, PNG, PDF (Max 15MB)
                </span>
                <input type="file" className="mt-4 w-full max-w-xs text-xs" />
              </label>
            </div>

            <div className="space-y-6">
              <button className="flex w-full items-center justify-center gap-4 border-2 border-black bg-primary py-5 text-xl font-black uppercase tracking-widest text-white shadow-[6px_6px_0_0_#000] transition-all hover:bg-primary-dark active:translate-y-1 active:shadow-none">
                Transmit Submission
              </button>
              <div className="flex flex-col items-center justify-between gap-4 px-1 md:flex-row">
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  <div className="border border-zinc-200 px-3 py-2">
                    Gas: <span className="text-black">0.0004 HBAR</span>
                  </div>
                  <div className="border border-zinc-200 px-3 py-2">
                    Yield: <span className="text-black">120 IVRT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t-2 border-black bg-zinc-50 p-6 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="size-2.5 animate-pulse bg-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black">
                In-Vert Mainnet Node Active
              </span>
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-black">
              Block #19284756 • Secured by Proof-of-Eco
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
