// ─── Network Configuration ──────────────────────────────────────

export type NetworkId = "mainnet" | "testnet";

export interface NetworkConfig {
  id: NetworkId;
  label: string;
  version: string;
  badge?: string; // e.g. "Soon" for mainnet
  rpcUrl: string;
  useMock: boolean;
}

const NETWORKS: Record<NetworkId, NetworkConfig> = {
  mainnet: {
    id: "mainnet",
    label: "Mainnet",
    version: "v0.1.0",
    badge: "Soon",
    rpcUrl: import.meta.env.VITE_RPC_URL_MAINNET || "",
    get useMock() {
      return !this.rpcUrl;
    },
  },
  testnet: {
    id: "testnet",
    label: "Testnet",
    version: "v0.1.0",
    rpcUrl: import.meta.env.VITE_RPC_URL_TESTNET || import.meta.env.VITE_RPC_URL || "",
    get useMock() {
      return !this.rpcUrl;
    },
  },
};

// Reactive network state
let _activeNetwork: NetworkId =
  (localStorage.getItem("zoka_network") as NetworkId) || "testnet";

const listeners = new Set<() => void>();

export function getActiveNetwork(): NetworkId {
  return _activeNetwork;
}

export function setActiveNetwork(id: NetworkId) {
  _activeNetwork = id;
  localStorage.setItem("zoka_network", id);
  listeners.forEach((fn) => fn());
}

export function onNetworkChange(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getNetworkConfig(): NetworkConfig {
  return NETWORKS[_activeNetwork];
}

export function getNetworks(): NetworkConfig[] {
  return Object.values(NETWORKS);
}

// Flat compat export used by api.ts and other code
export const config = {
  get RPC_URL() {
    return getNetworkConfig().rpcUrl;
  },
  get useMock() {
    return getNetworkConfig().useMock;
  },
  TIMEOUT_MS: 8000,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
  get NETWORK_NAME() {
    return getNetworkConfig().label;
  },
  get NETWORK_VERSION() {
    return getNetworkConfig().version;
  },
} as const;
