/**
 * Multi-Chain Configuration
 *
 * SoundChain's Multi-Layer Architecture:
 * - Ethereum L2s: IP registration, payments, licensing
 * - Sui Network: High-speed license trading marketplace
 */

export type ChainType = 'ethereum-l2' | 'sui';

export interface ChainInfo {
  id: string;
  name: string;
  displayName: string;
  type: ChainType;
  chainId?: number;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  purpose: string;
  features: string[];
  gasEstimate: string;
  speed: string;
  logo: string;
  color: string;
  enabled: boolean;
}

/**
 * All supported chains in SoundChain
 */
export const CHAINS: Record<string, ChainInfo> = {
  // ===========================================
  // ETHEREUM LAYER 2s - IP & Payment Layers
  // ===========================================

  story: {
    id: 'story',
    name: 'Story Protocol',
    displayName: 'Story Protocol L2',
    type: 'ethereum-l2',
    chainId: 1315, // Aeneid testnet
    rpcUrl: process.env.STORY_RPC_URL || 'https://aeneid.storyrpc.io',
    explorerUrl: 'https://aeneid.storyscan.io',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    purpose: 'IP Registration & Licensing',
    features: [
      'Programmable IP Assets',
      'On-chain License Terms',
      'Royalty Distribution',
      'Derivative Tracking',
      'ERC-721 IP NFTs',
    ],
    gasEstimate: '~$0.01',
    speed: '~2-3 seconds',
    logo: '📜',
    color: 'violet',
    enabled: true, // Currently integrated
  },

  base: {
    id: 'base',
    name: 'Base',
    displayName: 'Base L2 (Coinbase)',
    type: 'ethereum-l2',
    chainId: 8453, // Mainnet: 8453, Testnet: 84532
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    purpose: 'Payment Layer',
    features: [
      'Ultra-low fees ($0.001)',
      'Instant finality (2s)',
      'Coinbase ecosystem',
      'License purchases',
      'Royalty claims',
    ],
    gasEstimate: '~$0.001',
    speed: '~2 seconds',
    logo: '🔷',
    color: 'blue',
    enabled: true, // Smart contract ready
  },

  optimism: {
    id: 'optimism',
    name: 'Optimism',
    displayName: 'Optimism L2',
    type: 'ethereum-l2',
    chainId: 10,
    rpcUrl: 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    purpose: 'Alternative Payment Layer',
    features: [
      'Low fees (~$0.01)',
      'OP Stack (EVM equivalent)',
      'Large DeFi ecosystem',
      'Retroactive funding',
    ],
    gasEstimate: '~$0.01',
    speed: '~2 seconds',
    logo: '🔴',
    color: 'red',
    enabled: false, // Future integration
  },

  arbitrum: {
    id: 'arbitrum',
    name: 'Arbitrum',
    displayName: 'Arbitrum One',
    type: 'ethereum-l2',
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    purpose: 'Alternative Payment Layer',
    features: [
      'Low fees (~$0.02)',
      'High throughput',
      'Largest L2 by TVL',
      'Rich DeFi integrations',
    ],
    gasEstimate: '~$0.02',
    speed: '~2 seconds',
    logo: '🔵',
    color: 'cyan',
    enabled: false, // Future integration
  },

  // ===========================================
  // SUI NETWORK - Trading Layer
  // ===========================================

  sui: {
    id: 'sui',
    name: 'Sui',
    displayName: 'Sui Network',
    type: 'sui',
    rpcUrl: 'https://fullnode.mainnet.sui.io',
    explorerUrl: 'https://suiscan.xyz',
    nativeCurrency: {
      name: 'Sui',
      symbol: 'SUI',
      decimals: 9,
    },
    purpose: 'Future: License Trading Marketplace',
    features: [
      'Ultra-fast (400ms finality)',
      'Lowest fees (~$0.0001)',
      'High-volume trading',
      'NFT marketplace',
      'Parallel execution',
    ],
    gasEstimate: '~$0.0001',
    speed: '~0.4 seconds',
    logo: '💧',
    color: 'cyan',
    enabled: false, // Future: Trading layer for secondary license markets
  },
};

/**
 * Get all enabled Ethereum L2s
 */
export function getEthereumL2s(): ChainInfo[] {
  return Object.values(CHAINS).filter(
    (chain) => chain.type === 'ethereum-l2' && chain.enabled
  );
}

/**
 * Get all enabled chains
 */
export function getEnabledChains(): ChainInfo[] {
  return Object.values(CHAINS).filter((chain) => chain.enabled);
}

/**
 * Get chain by ID
 */
export function getChainById(id: string): ChainInfo | undefined {
  return CHAINS[id];
}

/**
 * Get chain by numeric chain ID
 */
export function getChainByChainId(chainId: number): ChainInfo | undefined {
  return Object.values(CHAINS).find((chain) => chain.chainId === chainId);
}

/**
 * Compare gas fees across chains
 */
export function compareGasFees(): Array<{
  chain: string;
  fee: string;
  percentage: number;
}> {
  const chains = getEnabledChains();
  const ethereumMainnetFee = 10; // $10 baseline

  return chains.map((chain) => {
    const feeMatch = chain.gasEstimate.match(/\$([\d.]+)/);
    const fee = feeMatch ? parseFloat(feeMatch[1]) : 0.01;
    const percentage = ((ethereumMainnetFee - fee) / ethereumMainnetFee) * 100;

    return {
      chain: chain.displayName,
      fee: chain.gasEstimate,
      percentage: Math.round(percentage * 100) / 100,
    };
  });
}

/**
 * Architecture layers
 */
export const ARCHITECTURE_LAYERS = {
  ip: {
    name: 'IP Layer',
    description: 'Music IP registration & licensing',
    chains: ['story'],
    color: 'violet',
  },
  payment: {
    name: 'Payment Layer',
    description: 'License purchases & royalties',
    chains: ['base', 'optimism', 'arbitrum'],
    color: 'blue',
  },
  trading: {
    name: 'Trading Layer',
    description: 'High-speed license marketplace',
    chains: ['sui'],
    color: 'cyan',
  },
} as const;

/**
 * Get recommended chain for action
 */
export function getRecommendedChain(action: 'register' | 'purchase' | 'trade'): ChainInfo {
  switch (action) {
    case 'register':
      return CHAINS.story;
    case 'purchase':
      return CHAINS.base;
    case 'trade':
      return CHAINS.sui;
    default:
      return CHAINS.story;
  }
}

/**
 * Format chain badge
 */
export function getChainBadge(chainId: string): {
  label: string;
  color: string;
  icon: string;
} {
  const chain = CHAINS[chainId];
  if (!chain) {
    return { label: 'Unknown', color: 'gray', icon: '❓' };
  }

  return {
    label: chain.type === 'ethereum-l2' ? `${chain.name} L2` : chain.name,
    color: chain.color,
    icon: chain.logo,
  };
}

/**
 * Calculate savings vs Ethereum mainnet
 */
export function calculateSavings(chainId: string, txCount: number = 1): {
  mainnetCost: number;
  l2Cost: number;
  saved: number;
  percentage: number;
} {
  const chain = CHAINS[chainId];
  const mainnetFee = 10; // Average $10 per tx on Ethereum mainnet

  const feeMatch = chain?.gasEstimate.match(/\$([\d.]+)/);
  const l2Fee = feeMatch ? parseFloat(feeMatch[1]) : 0.01;

  const mainnetCost = mainnetFee * txCount;
  const l2Cost = l2Fee * txCount;
  const saved = mainnetCost - l2Cost;
  const percentage = (saved / mainnetCost) * 100;

  return {
    mainnetCost,
    l2Cost,
    saved,
    percentage: Math.round(percentage * 100) / 100,
  };
}
