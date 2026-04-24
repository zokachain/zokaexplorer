import { useEffect, useState, FormEvent } from "react";
import { Search, Activity, Layers, Cpu, Sparkles, ShieldCheck, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

type Metric = {
  label: string;
  value: string;
  hint: string;
  Icon: typeof Activity;
};

const formatNumber = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 2 });

const Index = () => {
  const [query, setQuery] = useState("");
  const [tick, setTick] = useState(0);

  // Simulated live metrics — replace with real RPC later.
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 4000);
    return () => clearInterval(id);
  }, []);

  const baseHeight = 482931;
  const baseDifficulty = 18432.55;
  const baseHashrate = 312.4;
  const baseEmission = 18421003.12;

  const metrics: Metric[] = [
    {
      label: "Height",
      value: formatNumber(baseHeight + tick),
      hint: "Latest block",
      Icon: Layers,
    },
    {
      label: "Difficulty",
      value: formatNumber(baseDifficulty + Math.sin(tick) * 12),
      hint: "Network",
      Icon: Activity,
    },
    {
      label: "Hashrate",
      value: `${formatNumber(baseHashrate + Math.cos(tick) * 4)} MH/s`,
      hint: "Aggregate",
      Icon: Cpu,
    },
    {
      label: "Emission",
      value: `${formatNumber(baseEmission + tick * 1.25)} ZKA`,
      hint: "Circulating",
      Icon: Sparkles,
    },
  ];

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      toast({
        title: "Enter a transaction hash",
        description: "Paste the tx hash you want to look up.",
      });
      return;
    }
    if (q.length < 16) {
      toast({
        title: "Hash looks too short",
        description: "Zoka tx hashes are long hex strings.",
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
      {/* Ambient layers */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--gradient-radial)" }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-60" aria-hidden />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.6), transparent)",
        }}
        aria-hidden
      />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <a href="/" className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card">
            <span className="font-mono-tight text-sm font-bold text-primary">Z</span>
            <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]" />
          </div>
          <span className="font-mono-tight text-sm tracking-tight text-foreground">
            zoka<span className="text-primary">explorer</span>
          </span>
        </a>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="hidden items-center gap-2 sm:flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="pulse-dot absolute inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            <span>Mainnet · Online</span>
          </span>
          <span className="hidden h-4 w-px bg-border sm:block" />
          <span className="font-mono-tight">v0.1.0</span>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 pt-16 pb-12 text-center sm:pt-24">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
          <ShieldCheck className="h-3 w-3 text-primary" />
          zk-SNARK · privacy first
        </div>

        <h1 className="text-gradient text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          Look up a private
          <br />
          transaction on Zoka.
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-balance text-sm text-muted-foreground sm:text-base">
          A minimal explorer for a zero-knowledge network. You can only see what
          you already know — paste a tx hash you own to reveal it.
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative mx-auto mt-10 max-w-2xl">
          <div className="group relative">
            <div
              className="absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-focus-within:opacity-100"
              style={{
                background:
                  "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.45), transparent)",
              }}
              aria-hidden
            />
            <div className="relative flex items-center gap-2 rounded-2xl border border-border bg-card/80 p-2 pl-4 backdrop-blur transition-colors focus-within:border-primary/60">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="0x… paste your transaction hash"
                spellCheck={false}
                autoComplete="off"
                className="font-mono-tight w-full bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
                aria-label="Transaction hash"
              />
              <Button
                type="submit"
                size="sm"
                className="h-10 rounded-xl bg-primary px-4 text-primary-foreground hover:bg-primary/90"
              >
                Search
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Only the owner of a transaction can decrypt it. No browsing. No
            tracing.
          </p>
        </form>
      </section>

      {/* Metrics */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-sm font-medium tracking-tight text-foreground">
              Network
            </h2>
            <p className="text-xs text-muted-foreground">
              Live indicators · refreshed every 4s
            </p>
          </div>
          <span className="font-mono-tight text-[11px] text-muted-foreground">
            zoka · mainnet
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {metrics.map(({ label, value, hint, Icon }) => (
            <article
              key={label}
              className="group relative overflow-hidden rounded-2xl border border-border p-5 transition-colors hover:border-primary/40"
              style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-card)" }}
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-60"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.5), transparent)",
                }}
                aria-hidden
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  {label}
                </span>
                <Icon className="h-3.5 w-3.5 text-primary/80 transition-transform group-hover:scale-110" />
              </div>
              <div className="mt-5 font-mono-tight text-2xl tracking-tight text-foreground">
                {value}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>
            </article>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-[11px] text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} ZokaExplorer · Privacy by zk-SNARK</span>
          <span className="font-mono-tight">built for the noir network</span>
        </div>
      </section>
    </main>
  );
};

export default Index;
