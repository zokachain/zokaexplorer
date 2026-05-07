// ─── Zokachain API Service ──────────────────────────────────────
// Central place for ALL network calls.
// When RPC_URL is empty → returns mock data.
// When RPC_URL is set  → hits real network with timeout + retries.

import { config } from "./config";
import type {
  NetworkStats,
  Block,
  Transaction,
  Address,
  SearchResult,
  MetricKey,
  MetricDataPoint,
} from "./types";

// ── Network layer with retries ──────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public retryable = false,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchWithTimeout(url: string, timeoutMs = config.TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      const retryable = res.status >= 500 || res.status === 429;
      throw new ApiError(`HTTP ${res.status}`, res.status, retryable);
    }
    return res;
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new ApiError("Request timeout", undefined, true);
    }
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message ?? "Network error", undefined, true);
  } finally {
    clearTimeout(timer);
  }
}

async function apiFetch<T>(path: string): Promise<T> {
  const url = `${config.RPC_URL}${path}`;
  let lastError: ApiError | null = null;

  for (let attempt = 0; attempt <= config.MAX_RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(url);
      return (await res.json()) as T;
    } catch (err) {
      lastError = err instanceof ApiError ? err : new ApiError(String(err));
      if (!lastError.retryable || attempt === config.MAX_RETRIES) break;
      await new Promise((r) =>
        setTimeout(r, config.RETRY_DELAY_MS * 2 ** attempt),
      );
    }
  }
  throw lastError!;
}

// ── Mock helpers ────────────────────────────────────────────────

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

const randomChars = (rand: () => number, prefix: string, len: number) => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = prefix;
  for (let i = 0; i < len; i++) out += chars[Math.floor(rand() * chars.length)];
  return out;
};

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

// ── Network stats ───────────────────────────────────────────────

export async function getNetworkStats(): Promise<NetworkStats> {
  if (!config.useMock) return apiFetch<NetworkStats>("/stats");
  await delay();
  return {
    height: 482931,
    difficulty: 18432.55,
    hashrate: 312.4,
    emission: 18421003.12,
    lastBlockTime: Date.now() - 14000,
    networkVersion: "0.1.0",
    peerCount: 24,
  };
}

// ── Metric history ──────────────────────────────────────────────

export async function getMetricHistory(
  metric: MetricKey,
  points = 30,
): Promise<MetricDataPoint[]> {
  if (!config.useMock)
    return apiFetch<MetricDataPoint[]>(`/metrics/${metric}?points=${points}`);
  await delay();
  const bases: Record<MetricKey, number> = {
    height: 482900,
    difficulty: 18432,
    hashrate: 312,
    emission: 18421000,
  };
  const now = Date.now();
  return Array.from({ length: points }, (_, i) => ({
    timestamp: now - (points - i) * 60000,
    value: bases[metric] + Math.sin(i * 0.3) * 10 + i,
  }));
}

// ── Blocks ──────────────────────────────────────────────────────

export async function getBlock(heightOrHash: string | number): Promise<Block | null> {
  if (!config.useMock) {
    try {
      return await apiFetch<Block>(`/block/${heightOrHash}`);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  }
  await delay();
  const seed = String(heightOrHash);
  const rand = seedRand(seed);
  const height =
    typeof heightOrHash === "number"
      ? heightOrHash
      : 482000 + Math.floor(rand() * 5000);
  return {
    height,
    hash: randomChars(rand, "0x", 64),
    previousHash: randomChars(rand, "0x", 64),
    timestamp: Date.now() - Math.floor(rand() * 86400000),
    difficulty: 18000 + rand() * 1000,
    nonce: Math.floor(rand() * 2 ** 32),
    size: 2000 + Math.floor(rand() * 3000),
    txCount: 1 + Math.floor(rand() * 20),
    reward: 2.5,
    minerAddress: randomChars(rand, "zka", 60),
    transactions: Array.from({ length: 1 + Math.floor(rand() * 5) }, () =>
      randomChars(rand, "zka", 60),
    ),
  };
}

export async function getRecentBlocks(count = 10): Promise<Block[]> {
  if (!config.useMock) return apiFetch<Block[]>(`/blocks?limit=${count}`);
  await delay();
  const blocks = await Promise.all(
    Array.from({ length: count }, (_, i) => getBlock(482931 - i)),
  );
  return blocks.filter(Boolean) as Block[];
}

// ── Transactions ────────────────────────────────────────────────

export async function getTransaction(hash: string): Promise<Transaction | null> {
  if (!config.useMock) {
    try {
      return await apiFetch<Transaction>(`/tx/${hash}`);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  }
  await delay();
  const rand = seedRand(hash);
  return {
    hash,
    blockHeight: 482000 + Math.floor(rand() * 5000),
    blockHash: randomChars(rand, "0x", 64),
    timestamp: Date.now() - Math.floor(rand() * 86400000),
    status: "confirmed",
    amount: +(rand() * 50).toFixed(6),
    fee: +(rand() * 0.005).toFixed(6),
    from: randomChars(rand, "zka", 60),
    to: "shielded",
    ringSize: 8 + Math.floor(rand() * 8),
    size: 1800 + Math.floor(rand() * 1200),
    confirmations: Math.floor(rand() * 240) + 1,
    proof: randomChars(rand, "0x", 64),
  };
}

export async function getRecentTransactions(count = 10): Promise<Transaction[]> {
  if (!config.useMock) return apiFetch<Transaction[]>(`/txs?limit=${count}`);
  await delay();
  const rand = seedRand("recent-txs");
  return Array.from({ length: count }, () => {
    const hash = randomChars(rand, "zka", 60);
    return {
      hash,
      blockHeight: 482000 + Math.floor(rand() * 5000),
      blockHash: randomChars(rand, "0x", 64),
      timestamp: Date.now() - Math.floor(rand() * 86400000),
      status: "confirmed" as const,
      amount: +(rand() * 50).toFixed(6),
      fee: +(rand() * 0.005).toFixed(6),
      from: randomChars(rand, "zka", 60),
      to: "shielded",
      ringSize: 8 + Math.floor(rand() * 8),
      size: 1800 + Math.floor(rand() * 1200),
      confirmations: Math.floor(rand() * 240) + 1,
      proof: randomChars(rand, "0x", 64),
    };
  });
}

// ── Addresses ───────────────────────────────────────────────────

export async function getAddress(addr: string): Promise<Address | null> {
  if (!config.useMock) {
    try {
      return await apiFetch<Address>(`/address/${addr}`);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  }
  await delay();
  const rand = seedRand(addr);
  return {
    address: addr,
    balance: +(rand() * 500).toFixed(6),
    totalReceived: +(rand() * 2000).toFixed(6),
    totalSent: +(rand() * 1500).toFixed(6),
    txCount: Math.floor(rand() * 200),
    firstSeen: Date.now() - Math.floor(rand() * 86400000 * 365),
    lastSeen: Date.now() - Math.floor(rand() * 86400000),
    transactions: Array.from({ length: 5 }, () =>
      randomChars(rand, "zka", 60),
    ),
  };
}

// ── Search ──────────────────────────────────────────────────────

export async function search(query: string): Promise<SearchResult | null> {
  if (!config.useMock) {
    try {
      return await apiFetch<SearchResult>(`/search?q=${encodeURIComponent(query)}`);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  }
  await delay();
  const q = query.trim().toLowerCase();

  if (/^\d+$/.test(q))
    return { type: "block", id: q, label: `Block #${q}` };
  if (q.startsWith("zka")) {
    if (q.length > 40)
      return { type: "transaction", id: query.trim(), label: `Tx ${query.trim().slice(0, 12)}…` };
    return { type: "address", id: query.trim(), label: `Address ${query.trim().slice(0, 12)}…` };
  }
  if (q.startsWith("0x"))
    return { type: "block", id: query.trim(), label: `Block ${query.trim().slice(0, 12)}…` };
  return null;
}

// ── Search suggestions (for autocomplete) ───────────────────────

export interface SearchSuggestion {
  type: "transaction" | "block" | "address";
  id: string;
  label: string;
  detail?: string;
}

export async function getSuggestions(query: string): Promise<SearchSuggestion[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  if (!config.useMock) {
    try {
      return await apiFetch<SearchSuggestion[]>(
        `/suggest?q=${encodeURIComponent(q)}`,
      );
    } catch {
      return [];
    }
  }

  // Mock suggestions based on input pattern
  await delay(80);
  const suggestions: SearchSuggestion[] = [];

  if (/^\d+$/.test(q)) {
    suggestions.push(
      { type: "block", id: q, label: `Block #${q}`, detail: "Block height" },
    );
    // Also suggest nearby blocks
    const n = parseInt(q, 10);
    if (n > 0)
      suggestions.push({
        type: "block",
        id: String(n - 1),
        label: `Block #${n - 1}`,
        detail: "Previous block",
      });
    suggestions.push({
      type: "block",
      id: String(n + 1),
      label: `Block #${n + 1}`,
      detail: "Next block",
    });
  } else if (q.toLowerCase().startsWith("zka")) {
    suggestions.push(
      { type: "transaction", id: q, label: `Tx ${q.slice(0, 16)}…`, detail: "Transaction hash" },
      { type: "address", id: q, label: `Address ${q.slice(0, 16)}…`, detail: "Wallet address" },
    );
  } else if (q.toLowerCase().startsWith("0x")) {
    suggestions.push(
      { type: "block", id: q, label: `Block ${q.slice(0, 16)}…`, detail: "Block hash" },
    );
  } else {
    suggestions.push(
      { type: "block", id: q, label: `Search blocks for "${q}"`, detail: "Block" },
      { type: "transaction", id: q, label: `Search txs for "${q}"`, detail: "Transaction" },
      { type: "address", id: q, label: `Search addresses for "${q}"`, detail: "Address" },
    );
  }

  return suggestions;
}
