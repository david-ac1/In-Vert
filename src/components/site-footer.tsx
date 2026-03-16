import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t-2 border-black bg-white py-12">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 px-6 text-center md:flex-row md:justify-between md:text-left">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-black">
          In-Vert Protocol 2026
        </p>
        <div className="flex items-center gap-6">
          <Link
            href="#"
            className="text-[10px] font-black uppercase tracking-[0.25em] transition-colors hover:text-primary"
          >
            GitHub
          </Link>
          <Link
            href="#"
            className="text-[10px] font-black uppercase tracking-[0.25em] transition-colors hover:text-primary"
          >
            Documentation
          </Link>
        </div>
      </div>
    </footer>
  );
}
