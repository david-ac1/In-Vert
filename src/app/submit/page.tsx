import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SubmitActionForm } from "@/components/submit-action-form";

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

        <SubmitActionForm />
      </main>
      <SiteFooter />
    </div>
  );
}
