import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-4" aria-label="Go to Guild home page">
      <div className="geometric-logo">
        <div className="geometric-inner" />
      </div>
      <span className="text-2xl font-black uppercase tracking-tight">
        In-<span className="text-primary">Vert</span>
      </span>
    </Link>
  );
}
