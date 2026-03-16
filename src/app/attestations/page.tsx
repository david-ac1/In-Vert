import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AttestationReceipt } from "@/components/attestation-receipt";

export default async function AttestationsPage({
  searchParams,
}: {
  searchParams: Promise<{ actionId?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-4 py-16 md:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-black uppercase tracking-tight md:text-6xl">
            Proof Receipt Explorer
          </h1>
          <p className="mt-4 max-w-2xl text-zinc-600">
            Publicly inspect protocol attestations and verification traces for any action submitted
            through In-Vert.
          </p>
        </div>
        <AttestationReceipt initialActionId={params.actionId ?? ""} />
      </main>
      <SiteFooter />
    </div>
  );
}
