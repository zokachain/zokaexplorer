import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Copy, ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

// Deterministic mock generator from a string seed.
const seedRand = (seed: string) => {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const truncate = (s: string, head = 10, tail = 8) =>
  s.length > head + tail + 1 ? `${s.slice(0, head)}…${s.slice(-tail)}` : s;

const Field = ({
  label,
  value,
  mono = false,
  copyable = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  copyable?: boolean;
}) => {
  const onCopy = () => {
    if (typeof value === "string") {
      navigator.clipboard.writeText(value);
      toast({ title: "Copied", description: truncate(value) });
    }
  };
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-border px-5 py-4 last:border-b-0 sm:grid-cols-[180px_1fr] sm:gap-4 sm:items-center">
      <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <div className="flex items-center gap-2">
        <div
          className={`min-w-0 flex-1 truncate text-sm text-foreground ${
            mono ? "font-mono-tight" : ""
          }`}
        >
          {value}
        </div>
        {copyable && (
          <button
            onClick={onCopy}
            className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Copy"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

const TxDetail = () => {
  const { hash = "" } = useParams();

  const data = useMemo(() => {
    const rand = seedRand(hash);
    const block = 482000 + Math.floor(rand() * 5000);
    const confirmations = Math.floor(rand() * 240) + 1;
    const amount = (rand() * 50).toFixed(6);
    const fee = (rand() * 0.005).toFixed(6);
    const ringSize = 8 + Math.floor(rand() * 8);
    const sizeBytes = 1800 + Math.floor(rand() * 1200);
    const ts = new Date(Date.now() - Math.floor(rand() * 1000 * 60 * 60 * 24));
    const mkAddr = (p: string) => {
      let a = p;
      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      for (let i = 0; i < 60; i++) a += chars[Math.floor(rand() * chars.length)];
      return a;
    };
    return {
      block,
      confirmations,
      amount,
      fee,
      ringSize,
      sizeBytes,
      ts,
      from: mkAddr("zka"),
      to: mkAddr("zka"),
      proof: mkAddr("0x").slice(0, 66),
    };
  }, [hash]);

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" aria-hidden />

      <SiteHeader />

      <section className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-6 pt-4 pb-12">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to search
        </Link>

        {/* Summary */}
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <ShieldCheck className="h-3 w-3 text-signal" />
                Confirmed · zk-SNARK verified
              </div>
              <h1 className="mt-3 text-sm font-medium text-muted-foreground">
                Transaction
              </h1>
              <p className="font-mono-tight mt-1 break-all text-base text-foreground sm:text-lg">
                {hash}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-lg border-border bg-background text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(hash);
                  toast({ title: "Hash copied" });
                }}
              >
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                Copy
              </Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-4">
            {[
              { label: "Amount", value: `${data.amount} ZKA` },
              { label: "Fee", value: `${data.fee} ZKA` },
              { label: "Block", value: data.block.toLocaleString() },
              { label: "Confirmations", value: data.confirmations.toLocaleString() },
            ].map((m) => (
              <div key={m.label} className="bg-card px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {m.label}
                </div>
                <div className="font-mono-tight mt-1.5 text-sm text-foreground">
                  {m.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card lg:col-span-2">
            <div className="border-b border-border px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Details
            </div>
            <Field label="Status" value={<span className="text-signal">Confirmed</span>} />
            <Field label="Timestamp" value={data.ts.toUTCString()} />
            <Field label="Block height" value={data.block.toLocaleString()} mono />
            <Field
              label="From"
              value={truncate(data.from, 14, 10)}
              mono
              copyable
            />
            <Field
              label="To"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="h-3 w-3 text-muted-foreground" />
                  shielded
                </span>
              }
            />
            <Field label="Amount" value={`${data.amount} ZKA`} mono />
            <Field label="Fee" value={`${data.fee} ZKA`} mono />
            <Field label="Size" value={`${data.sizeBytes} bytes`} mono />
            <Field label="Ring size" value={data.ringSize} mono />
          </div>

          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              zk-SNARK proof
            </div>
            <div className="px-5 py-4">
              <p className="text-xs text-muted-foreground">
                Cryptographic commitment proving validity without revealing
                inputs.
              </p>
              <pre className="font-mono-tight mt-3 overflow-hidden rounded-lg border border-border bg-background p-3 text-[11px] leading-relaxed text-foreground">
                {data.proof}
              </pre>
              <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-signal" />
                Verified on-chain
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
};

export default TxDetail;
