import { useEffect, useState, FormEvent } from "react";
import { Search, Github, Twitter, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

type Metric = {
  label: string;
  value: string;
};

const formatNumber = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 2 });

const Index = () => {
  const [query, setQuery] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 4000);
    return () => clearInterval(id);
  }, []);

  const baseHeight = 482931;
  const baseDifficulty = 18432.55;
  const baseHashrate = 312.4;
  const baseEmission = 18421003.12;

  const metrics: Metric[] = [
    { label: "Height", value: formatNumber(baseHeight + tick) },
    { label: "Difficulty", value: formatNumber(baseDifficulty + Math.sin(tick) * 12) },
    { label: "Hashrate", value: `${formatNumber(baseHashrate + Math.cos(tick) * 4)} MH/s` },
    { label: "Emission", value: `${formatNumber(baseEmission + tick * 1.25)} ZKA` },
  ];

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      toast({
        title: "Enter a transaction hash",
        description: "Paste the zka… hash you want to look up.",
      });
      return;
    }
    if (!q.toLowerCase().startsWith("zka") || q.length < 16) {
      toast({
        title: "Invalid Zoka address",
        description: "Zoka hashes start with zka and are long alphanumeric strings.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Searching network…",
      description: `Looking up ${q.slice(0, 10)}…${q.slice(-6)}`,
    });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" aria-hidden />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <a href="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card">
            <span className="font-mono-tight text-xs font-bold text-foreground">Z</span>
          </div>
          <span className="font-mono-tight text-sm tracking-tight text-foreground">
            zokaexplorer
          </span>
        </a>

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

      {/* Metrics on top */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pt-4">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-4">
          {metrics.map(({ label, value }) => (
            <div
              key={label}
              className="bg-card px-5 py-4"
            >
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {label}
              </div>
              <div className="mt-2 font-mono-tight text-lg tracking-tight text-foreground">
                {value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hero / Search */}
      <section className="relative z-10 mx-auto max-w-2xl px-6 pt-20 pb-12 text-center sm:pt-28">
        <h1 className="text-balance text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
          zokaexplorer
        </h1>
        <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground">
          Private zk-SNARK block explorer
        </p>

        <form onSubmit={handleSearch} className="relative mx-auto mt-10">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1.5 pl-4 transition-colors focus-within:border-muted-foreground/40">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="zka185qd6h7w48iBy…"
              spellCheck={false}
              autoComplete="off"
              className="font-mono-tight w-full bg-transparent py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              aria-label="Transaction hash"
            />
            <Button
              type="submit"
              size="sm"
              className="h-9 rounded-lg bg-signal px-4 text-[hsl(var(--signal-foreground))] hover:bg-signal/90"
            >
              Search
              <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </form>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mx-auto max-w-5xl px-6 pb-10">
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-[11px] text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} zokaexplorer</span>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Github className="h-3.5 w-3.5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Twitter className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Index;
