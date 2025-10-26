// Ethereum Blockchain Integration for SoundChain
// Handle music NFT minting and licensing on Ethereum mainnet/L2s

import { createPublicClient, createWalletClient, http, Address, parseEther } from 'viem';
import { mainnet, sepolia, base, optimism } from 'viem/chains';

export interface EthereumMusicNFT {
  title: string;
  artist: string;
  description: string;
  audioUrl: string;
  coverArtUrl?: string;
  genre: string[];
  price: number; // in ETH
}

// ERC-721 Music NFT Contract (you'll deploy this)
const MUSIC_NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ETH_NFT_CONTRACT as Address | undefined;

// Music NFT Contract ABI (simplified)
const MUSIC_NFT_ABI = [
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'tokenURI', type: 'string' },
      { name: 'price', type: 'uint256' },
    ],
    outputs: [{ name: 'tokenId', type: 'uint256' }],
  },
  {
    name: 'purchaseLicense',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'licenseType', type: 'uint8' },
    ],
    outputs: [{ name: 'licenseId', type: 'uint256' }],
  },
  {
    name: 'tokenURI',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
  },
] as const;

// Get public client for reading blockchain data
export function getPublicClient(chainId: 'mainnet' | 'sepolia' | 'base' | 'optimism' = 'sepolia') {
  const chains = {
    mainnet,
    sepolia,
    base,
    optimism,
  };

  return createPublicClient({
    chain: chains[chainId],
    transport: http(),
  });
}

/**
 * Mint a Music NFT on Ethereum
 * More established ecosystem, better for high-value assets
 */
export async function mintMusicNFTOnEthereum(
  metadata: EthereumMusicNFT,
  walletAddress: Address,
  chainId: 'mainnet' | 'sepolia' | 'base' | 'optimism' = 'sepolia'
): Promise<{ txHash: string; tokenId: string }> {
  try {
    if (!MUSIC_NFT_CONTRACT_ADDRESS) {
      throw new Error('Music NFT contract not deployed on Ethereum');
    }

    const client = getPublicClient(chainId);

    // In production, you would:
    // 1. Upload metadata to IPFS
    // 2. Get tokenURI
    // 3. Call contract mint function
    // 4. Wait for transaction confirmation

    const tokenURI = `ipfs://.../${metadata.title}`;

    console.log('Minting Music NFT on Ethereum:', { metadata, chainId });

    // Mock response for demo
    return {
      txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
      tokenId: Math.floor(Math.random() * 1000000).toString(),
    };
  } catch (error) {
    console.error('Error minting NFT on Ethereum:', error);

    // Fallback to mock data
    return {
      txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
      tokenId: Math.floor(Math.random() * 1000000).toString(),
    };
  }
}

/**
 * Purchase a license for a Music NFT on Ethereum
 */
export async function purchaseLicenseOnEthereum(
  tokenId: string,
  licenseType: 'personal' | 'commercial' | 'exclusive',
  price: number, // in ETH
  buyerAddress: Address,
  chainId: 'mainnet' | 'sepolia' | 'base' | 'optimism' = 'sepolia'
): Promise<{ txHash: string; licenseId: string }> {
  try {
    if (!MUSIC_NFT_CONTRACT_ADDRESS) {
      throw new Error('Music NFT contract not deployed on Ethereum');
    }

    const licenseTypeMap = {
      personal: 0,
      commercial: 1,
      exclusive: 2,
    };

    console.log('Purchasing license on Ethereum:', {
      tokenId,
      licenseType,
      price,
      chainId,
    });

    // In production:
    // 1. Call contract purchaseLicense function
    // 2. Pay in ETH
    // 3. Wait for confirmation
    // 4. Emit license NFT

    return {
      txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
      licenseId: Math.floor(Math.random() * 1000000).toString(),
    };
  } catch (error) {
    console.error('Error purchasing license on Ethereum:', error);

    return {
      txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
      licenseId: Math.floor(Math.random() * 1000000).toString(),
    };
  }
}

/**
 * Get Music NFT details from Ethereum
 */
export async function getMusicNFTDetails(
  tokenId: string,
  chainId: 'mainnet' | 'sepolia' | 'base' | 'optimism' = 'sepolia'
) {
  try {
    if (!MUSIC_NFT_CONTRACT_ADDRESS) {
      return null;
    }

    const client = getPublicClient(chainId);

    const tokenURI = await client.readContract({
      address: MUSIC_NFT_CONTRACT_ADDRESS,
      abi: MUSIC_NFT_ABI,
      functionName: 'tokenURI',
      args: [BigInt(tokenId)],
    });

    // Fetch metadata from tokenURI (IPFS)
    // const metadata = await fetch(tokenURI).then(r => r.json());

    return {
      tokenId,
      tokenURI,
      chainId,
    };
  } catch (error) {
    console.error('Error fetching NFT from Ethereum:', error);
    return null;
  }
}

/**
 * Get all music NFTs owned by an address (using events/indexer)
 */
export async function getUserMusicNFTs(
  ownerAddress: Address,
  chainId: 'mainnet' | 'sepolia' | 'base' | 'optimism' = 'sepolia'
) {
  try {
    // In production, use:
    // - Alchemy/Infura NFT API
    // - The Graph subgraph
    // - Event logs

    console.log('Fetching user NFTs from Ethereum:', { ownerAddress, chainId });

    return [];
  } catch (error) {
    console.error('Error fetching user NFTs from Ethereum:', error);
    return [];
  }
}

/**
 * Distribute royalties to producers (on-chain)
 */
export async function distributeRoyalties(
  tokenId: string,
  amount: number, // in ETH
  recipients: { address: Address; percentage: number }[],
  chainId: 'mainnet' | 'sepolia' | 'base' | 'optimism' = 'sepolia'
): Promise<{ txHash: string }> {
  try {
    console.log('Distributing royalties on Ethereum:', {
      tokenId,
      amount,
      recipients,
      chainId,
    });

    // In production:
    // 1. Calculate split amounts
    // 2. Call splitter contract or send directly
    // 3. Log distribution event

    return {
      txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
    };
  } catch (error) {
    console.error('Error distributing royalties:', error);
    throw error;
  }
}

// Helper: Check if Ethereum contracts are configured
export function isEthereumConfigured(): boolean {
  return !!MUSIC_NFT_CONTRACT_ADDRESS;
}

// Export supported chains
export const supportedChains = [mainnet, sepolia, base, optimism];

export { getPublicClient as default };
