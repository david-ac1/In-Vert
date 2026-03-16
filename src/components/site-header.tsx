import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-black bg-white/95 px-6 py-4 backdrop-blur md:px-10">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm font-black uppercase tracking-widest transition-colors hover:text-primary"
          >
            Guild
          </Link>
          <Link
            href="/impact"
            className="text-sm font-black uppercase tracking-widest transition-colors hover:text-primary"
          >
            Impact
          </Link>
          <Link
            href="/verification"
            className="text-sm font-black uppercase tracking-widest transition-colors hover:text-primary"
          >
            Nodes
          </Link>
          <Link
            href="/attestations"
            className="text-sm font-black uppercase tracking-widest transition-colors hover:text-primary"
          >
            Receipts
          </Link>
        </nav>
        <Link
          href="/submit"
          className="border-2 border-black bg-black px-5 py-2 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-zinc-800"
        >
          Connect Wallet
        </Link>
      </div>
    </header>
  );
}
