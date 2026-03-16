import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const leaderboard = [
  { name: "GreenNode", actions: 42, rewards: 720 },
  { name: "EcoGuild", actions: 35, rewards: 610 },
  { name: "PlanetOps", actions: 29, rewards: 500 },
];

const feed = [
  "GreenNode verified 5 trees planted in Lagos",
  "EcoGuild cleanup action recorded to HCS",
  "PlanetOps earned 40 IVRT from recycling verification",
];

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
            This route is scaffolded from the image-based design source and is
            structured for rapid conversion to full visual parity.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-5">
          <section className="md:col-span-3 border-2 border-black bg-white shadow-[10px_10px_0_0_#000]">
            <header className="border-b-2 border-black p-6 text-xs font-black uppercase tracking-[0.2em]">
              Top Contributors
            </header>
            <div className="divide-y-2 divide-black">
              {leaderboard.map((item, idx) => (
                <article key={item.name} className="grid gap-3 p-6 md:grid-cols-4">
                  <p className="text-lg font-black">#{idx + 1}</p>
                  <p className="md:col-span-2 text-sm font-bold">{item.name}</p>
                  <p className="text-sm font-bold text-zinc-600">
                    {item.actions} actions • {item.rewards} IVRT
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="md:col-span-2 border-2 border-black bg-white">
            <header className="border-b-2 border-black p-6 text-xs font-black uppercase tracking-[0.2em]">
              Live Feed
            </header>
            <div className="space-y-4 p-6">
              {feed.map((item) => (
                <article key={item} className="border-2 border-black p-4 text-sm font-medium">
                  {item}
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
