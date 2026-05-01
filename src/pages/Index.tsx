import { useEffect, useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowUpRight, ShieldCheck, Lock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

type Metric = {
  label: string;
  value: string;
};

const formatNumber = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 2 });

const Index = () => {
  const [query, setQuery] = useState("");
  const [tick, setTick] = useState(0);
  const navigate = useNavigate();

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
    navigate(`/tx/${encodeURIComponent(q)}`);
  };

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      {/* Subtle radial glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[800px] rounded-full opacity-[0.03]"
        style={{ background: "radial-gradient(circle, hsl(var(--signal)), transparent 70%)" }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" aria-hidden />

      <SiteHeader />

      {/* Metrics */}
      <section className="relative z-10 mx-auto w-full max-w-5xl px-6 pt-4">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-4">
          {metrics.map(({ label, value }) => (
            <div key={label} className="group bg-card px-5 py-4 transition-colors hover:bg-accent/50">
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

      {/* Search Section */}
      <section className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-16">
        {/* Decorative icons */}
        <div className="mx-auto mb-8 flex items-center gap-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card">
            <Lock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card shadow-lg shadow-black/40">
            <ShieldCheck className="h-6 w-6 text-signal" />
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card">
            <Eye className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Private zk-SNARK block explorer
        </p>

        <div className="mx-auto mt-1 h-px w-12 bg-border" />

        <form onSubmit={handleSearch} className="relative mx-auto mt-8 w-full">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1.5 pl-4 shadow-lg shadow-black/30 transition-all focus-within:border-muted-foreground/40 focus-within:shadow-black/50">
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
          <p className="mt-3 text-center text-[11px] text-muted-foreground/70">
            Only the owner of a transaction can decrypt it.
          </p>
        </form>
      </section>

      <SiteFooter />
    </main>
  );
};

export default Index;
