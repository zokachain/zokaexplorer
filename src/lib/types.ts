// ─── Zokachain Core Types ───────────────────────────────────────
// These types define the shape of data from the real blockchain.
// When connecting to the real network, only the API service layer
// needs to change — components consume these types unchanged.

export interface NetworkStats {
  height: number;
  difficulty: number;
  hashrate: number;        // MH/s
  emission: number;        // total ZKA emitted
  lastBlockTime: number;   // unix ms
  networkVersion: string;
  peerCount: number;
}

export interface Block {
  height: number;
  hash: string;
  previousHash: string;
  timestamp: number;       // unix ms
  difficulty: number;
  nonce: number;
  size: number;            // bytes
  txCount: number;
  reward: number;          // ZKA
  minerAddress: string;
  transactions: string[];  // tx hashes
}

export interface Transaction {
  hash: string;
  blockHeight: number;
  blockHash: string;
  timestamp: number;
  status: "confirmed" | "pending" | "failed";
  amount: number;
  fee: number;
  from: string;
  to: string;              // "shielded" when hidden
  ringSize: number;
  size: number;            // bytes
  confirmations: number;
  proof: string;           // zk-SNARK proof hex
}

export interface Address {
  address: string;
  balance: number;
  totalReceived: number;
  totalSent: number;
  txCount: number;
  firstSeen: number;       // unix ms
  lastSeen: number;        // unix ms
  transactions: string[];  // tx hashes (most recent)
}

export interface SearchResult {
  type: "transaction" | "block" | "address";
  id: string;              // hash, height, or address
  label: string;           // short display text
}

export type MetricKey = "height" | "difficulty" | "hashrate" | "emission";

export interface MetricDataPoint {
  timestamp: number;
  value: number;
}
