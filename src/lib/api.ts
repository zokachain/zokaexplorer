// ─── Zokachain API Service ──────────────────────────────────────
// Central place for ALL network calls. Currently returns mock data.
//
// TODO: Replace mock implementations with real RPC / REST calls:
//   const BASE_URL = "https://rpc.zokachain.io";  // or your node URL
//
// Every function maps 1:1 to a UI need. Components import from here
// and never talk to the network directly.

import type {
  NetworkStats,
  Block,
  Transaction,
  Address,
  SearchResult,
  MetricKey,
  MetricDataPoint,
} from "./types";

// ── Helpers ─────────────────────────────────────────────────────

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

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms)); // simulate latency

// ── Network stats ───────────────────────────────────────────────

export async function getNetworkStats(): Promise<NetworkStats> {
  // TODO: GET ${BASE_URL}/stats
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

// ── Metric history (for sparklines / charts) ────────────────────

export async function getMetricHistory(
  metric: MetricKey,
  points = 30
): Promise<MetricDataPoint[]> {
  // TODO: GET ${BASE_URL}/metrics/${metric}?points=${points}
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

export async function getBlock(heightOrHash: string | number): Promise<Block> {
  // TODO: GET ${BASE_URL}/block/${heightOrHash}
  await delay();
  const seed = String(heightOrHash);
  const rand = seedRand(seed);
  const height = typeof heightOrHash === "number" ? heightOrHash : 482000 + Math.floor(rand() * 5000);
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
      randomChars(rand, "zka", 60)
    ),
  };
}

export async function getRecentBlocks(count = 10): Promise<Block[]> {
  // TODO: GET ${BASE_URL}/blocks?limit=${count}
  await delay();
  return Promise.all(
    Array.from({ length: count }, (_, i) => getBlock(482931 - i))
  );
}

// ── Transactions ────────────────────────────────────────────────

export async function getTransaction(hash: string): Promise<Transaction> {
  // TODO: GET ${BASE_URL}/tx/${hash}
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
  // TODO: GET ${BASE_URL}/txs?limit=${count}
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

export async function getAddress(addr: string): Promise<Address> {
  // TODO: GET ${BASE_URL}/address/${addr}
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
      randomChars(rand, "zka", 60)
    ),
  };
}

// ── Search ──────────────────────────────────────────────────────

export async function search(query: string): Promise<SearchResult | null> {
  // TODO: GET ${BASE_URL}/search?q=${query}
  // The real API should return the type + id so the frontend can redirect.
  await delay();
  const q = query.trim().toLowerCase();

  // If it looks like a number → block height
  if (/^\d+$/.test(q)) {
    return { type: "block", id: q, label: `Block #${q}` };
  }

  // If starts with "zka" → could be address or tx hash
  if (q.startsWith("zka")) {
    // Heuristic: real API will know the difference
    if (q.length > 40) {
      return { type: "transaction", id: query.trim(), label: `Tx ${query.trim().slice(0, 12)}…` };
    }
    return { type: "address", id: query.trim(), label: `Address ${query.trim().slice(0, 12)}…` };
  }

  // If starts with "0x" → block hash
  if (q.startsWith("0x")) {
    return { type: "block", id: query.trim(), label: `Block ${query.trim().slice(0, 12)}…` };
  }

  return null;
}
