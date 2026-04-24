import { Link } from "react-router-dom";

const SiteHeader = () => (
  <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
    <Link to="/" className="flex items-center gap-2.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card">
        <span className="font-mono-tight text-xs font-bold text-foreground">Z</span>
      </div>
      <span className="font-mono-tight text-sm tracking-tight text-foreground">
        zokaexplorer
      </span>
    </Link>

    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span className="hidden items-center gap-2 sm:flex">
        <span className="relative flex h-1.5 w-1.5">
          <span className="pulse-dot absolute inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
        </span>
        <span>Mainnet</span>
      </span>
      <span className="hidden h-4 w-px bg-border sm:block" />
      <span className="font-mono-tight">v0.1.0</span>
    </div>
  </header>
);

export default SiteHeader;
