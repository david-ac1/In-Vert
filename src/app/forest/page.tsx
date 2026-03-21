import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ForestExperience } from "@/components/forest-experience";

export default function ForestPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-4 py-16 md:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-black uppercase tracking-tight md:text-6xl">Forest</h1>
          <p className="mt-4 max-w-2xl text-zinc-600">
            A 3D reforestation simulation where each approved action creates one tree in a living ecosystem.
          </p>
        </div>

        <ForestExperience />
      </main>
      <SiteFooter />
    </div>
  );
}
