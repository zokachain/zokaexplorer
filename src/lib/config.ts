// ─── Network Configuration ──────────────────────────────────────
// Change these values when connecting to the real Zokachain network.
// No UI code needs to be modified — only this file.

export const config = {
  /** Base URL of the Zokachain RPC / REST API */
  RPC_URL: import.meta.env.VITE_RPC_URL || "",

  /** Whether to use mock data (true) or hit the real network (false) */
  get useMock(): boolean {
    return !this.RPC_URL;
  },

  /** Request timeout in milliseconds */
  TIMEOUT_MS: 8000,

  /** Number of retry attempts on network failure */
  MAX_RETRIES: 3,

  /** Base delay between retries in ms (exponential backoff) */
  RETRY_DELAY_MS: 1000,

  /** Network display name */
  NETWORK_NAME: import.meta.env.VITE_NETWORK_NAME || "Mainnet",

  /** Network version */
  NETWORK_VERSION: import.meta.env.VITE_NETWORK_VERSION || "v0.1.0",
} as const;
