import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Copy, Wallet, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getAddress } from "@/lib/api";
import type { Address } from "@/lib/types";

const truncate = (s: string, head = 10, tail = 8) =>
  s.length > head + tail + 1 ? `${s.slice(0, head)}…${s.slice(-tail)}` : s;

const Field = ({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) => (
  <div className="grid grid-cols-1 gap-1 border-b border-border px-5 py-4 last:border-b-0 sm:grid-cols-[180px_1fr] sm:gap-4 sm:items-center">
    <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
    <div className={`text-sm text-foreground ${mono ? "font-mono-tight" : ""}`}>{value}</div>
  </div>
);

const AddressDetail = () => {
  const { address: addr = "" } = useParams();
  const [data, setData] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAddress(addr).then((a) => { setData(a); setLoading(false); });
  }, [addr]);

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" aria-hidden />
      <SiteHeader />

      <section className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-6 pt-4 pb-12">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to search
        </Link>

        {loading || !data ? (
          <div className="mt-12 text-center text-muted-foreground text-sm">Loading address…</div>
        ) : (
          <>
            <div className="mt-6 rounded-xl border border-border bg-card p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    <Wallet className="h-3 w-3 text-signal" /> Address
                  </div>
                  <p className="font-mono-tight mt-3 break-all text-base text-foreground">{data.address}</p>
                </div>
                <Button variant="outline" size="sm" className="h-9 rounded-lg border-border bg-background text-xs" onClick={() => { navigator.clipboard.writeText(data.address); toast({ title: "Address copied" }); }}>
                  <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
                </Button>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-4">
                {[
                  { label: "Balance", value: `${data.balance} ZKA` },
                  { label: "Total Received", value: `${data.totalReceived} ZKA` },
                  { label: "Total Sent", value: `${data.totalSent} ZKA` },
                  { label: "Transactions", value: data.txCount.toString() },
                ].map((m) => (
                  <div key={m.label} className="bg-card px-4 py-3">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{m.label}</div>
                    <div className="font-mono-tight mt-1.5 text-sm text-foreground">{m.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-border bg-card">
              <div className="border-b border-border px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Details</div>
              <Field label="First Seen" value={new Date(data.firstSeen).toUTCString()} />
              <Field label="Last Seen" value={new Date(data.lastSeen).toUTCString()} />
              <Field label="Tx Count" value={data.txCount.toLocaleString()} mono />
            </div>

            <div className="mt-6 rounded-xl border border-border bg-card">
              <div className="border-b border-border px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Recent Transactions
              </div>
              {data.transactions.map((txHash) => (
                <Link key={txHash} to={`/tx/${txHash}`} className="flex items-center gap-2 border-b border-border px-5 py-3 last:border-b-0 hover:bg-accent/40 transition-colors">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="font-mono-tight text-sm text-signal truncate">{truncate(txHash, 16, 10)}</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>

      <SiteFooter />
    </main>
  );
};

export default AddressDetail;
