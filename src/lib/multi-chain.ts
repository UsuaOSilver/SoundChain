// Multi-Chain Manager for SoundChain
// Unified interface for Sui, Ethereum, and Story Protocol

import { Address } from 'viem';
import * as SuiIntegration from './sui';
import * as EthereumIntegration from './ethereum';
import * as StoryIntegration from './story';

export type SupportedChain = 'sui' | 'ethereum' | 'sepolia' | 'base' | 'optimism' | 'story';

export interface MusicNFTMetadata {
  title: string;
  artist: string;
  description: string;
  audioUrl: string;
  coverArtUrl?: string;
  genre: string[];
  bpm?: number;
  key?: string;
  price: number;
}

export interface MintResult {
  chain: SupportedChain;
  txHash: string;
  nftId: string;
  explorerUrl: string;
}

export interface LicenseResult {
  chain: SupportedChain;
  txHash: string;
  licenseId: string;
  explorerUrl: string;
}

/**
 * Mint Music NFT on selected blockchain
 */
export async function mintMusicNFT(
  metadata: MusicNFTMetadata,
  walletAddress: string,
  chain: SupportedChain
): Promise<MintResult> {
  switch (chain) {
    case 'sui':
      const suiResult = await SuiIntegration.mintMusicNFTOnSui(
        metadata,
        walletAddress
      );
      return {
        chain: 'sui',
        txHash: suiResult.digest,
        nftId: suiResult.objectId,
        explorerUrl: `https://testnet.suivision.xyz/txblock/${suiResult.digest}`,
      };

    case 'ethereum':
    case 'sepolia':
    case 'base':
    case 'optimism':
      const ethChain = chain as 'ethereum' | 'sepolia' | 'base' | 'optimism';
      const ethResult = await EthereumIntegration.mintMusicNFTOnEthereum(
        metadata,
        walletAddress as Address,
        ethChain === 'ethereum' ? 'mainnet' : ethChain
      );
      return {
        chain: ethChain,
        txHash: ethResult.txHash,
        nftId: ethResult.tokenId,
        explorerUrl: getEtherscanUrl(ethResult.txHash, ethChain),
      };

    case 'story':
      const storyResult = await StoryIntegration.createMusicNFT(metadata);
      return {
        chain: 'story',
        txHash: storyResult.transactionHash,
        nftId: storyResult.tokenId,
        explorerUrl: `https://testnet.storyscan.xyz/tx/${storyResult.transactionHash}`,
      };

    default:
      throw new Error(`Unsupported chain: ${chain}`);
  }
}

/**
 * Purchase/Mint license NFT on selected blockchain
 */
export async function purchaseLicense(
  nftId: string,
  licenseTerms: {
    usageRights: string[];
    exclusivity: boolean;
    duration?: number;
    price: number;
  },
  buyerAddress: string,
  chain: SupportedChain
): Promise<LicenseResult> {
  switch (chain) {
    case 'sui':
      const suiResult = await SuiIntegration.purchaseLicenseOnSui(
        nftId,
        {
          usageRights: licenseTerms.usageRights,
          duration: licenseTerms.duration || 365,
          price: licenseTerms.price,
        },
        buyerAddress
      );
      return {
        chain: 'sui',
        txHash: suiResult.digest,
        licenseId: suiResult.licenseObjectId,
        explorerUrl: `https://testnet.suivision.xyz/txblock/${suiResult.digest}`,
      };

    case 'ethereum':
    case 'sepolia':
    case 'base':
    case 'optimism':
      const ethChain = chain as 'ethereum' | 'sepolia' | 'base' | 'optimism';
      const licenseType = licenseTerms.exclusivity ? 'exclusive' : 'commercial';
      const ethResult = await EthereumIntegration.purchaseLicenseOnEthereum(
        nftId,
        licenseType,
        licenseTerms.price,
        buyerAddress as Address,
        ethChain === 'ethereum' ? 'mainnet' : ethChain
      );
      return {
        chain: ethChain,
        txHash: ethResult.txHash,
        licenseId: ethResult.licenseId,
        explorerUrl: getEtherscanUrl(ethResult.txHash, ethChain),
      };

    case 'story':
      const storyResult = await StoryIntegration.mintLicenseNFT(
        nftId as Address,
        licenseTerms,
        buyerAddress as Address
      );
      return {
        chain: 'story',
        txHash: storyResult.transactionHash,
        licenseId: storyResult.licenseTokenId,
        explorerUrl: `https://testnet.storyscan.xyz/tx/${storyResult.transactionHash}`,
      };

    default:
      throw new Error(`Unsupported chain: ${chain}`);
  }
}

/**
 * Get chain-specific explorer URL
 */
function getEtherscanUrl(txHash: string, chain: 'ethereum' | 'sepolia' | 'base' | 'optimism'): string {
  const explorers = {
    ethereum: 'https://etherscan.io',
    sepolia: 'https://sepolia.etherscan.io',
    base: 'https://basescan.org',
    optimism: 'https://optimistic.etherscan.io',
  };
  return `${explorers[chain]}/tx/${txHash}`;
}

/**
 * Get chain display information
 */
export function getChainInfo(chain: SupportedChain) {
  const chainInfo = {
    sui: {
      name: 'Sui',
      logo: '🔷',
      description: 'Low gas fees, fast finality',
      bestFor: 'High-volume trading',
    },
    ethereum: {
      name: 'Ethereum',
      logo: '⟠',
      description: 'Most established, highest liquidity',
      bestFor: 'High-value assets',
    },
    sepolia: {
      name: 'Sepolia (Testnet)',
      logo: '⟠',
      description: 'Ethereum testnet',
      bestFor: 'Testing',
    },
    base: {
      name: 'Base',
      logo: '🔵',
      description: 'Ethereum L2, low fees',
      bestFor: 'Cost-effective minting',
    },
    optimism: {
      name: 'Optimism',
      logo: '🔴',
      description: 'Ethereum L2, low fees',
      bestFor: 'Cost-effective minting',
    },
    story: {
      name: 'Story Protocol',
      logo: '📖',
      description: 'Purpose-built for IP licensing',
      bestFor: 'Programmable IP rights',
    },
  };

  return chainInfo[chain];
}

/**
 * Get recommended chain based on use case
 */
export function getRecommendedChain(useCase: 'trading' | 'licensing' | 'highValue'): SupportedChain {
  switch (useCase) {
    case 'trading':
      return 'sui'; // Low fees, fast
    case 'licensing':
      return 'story'; // Purpose-built for IP
    case 'highValue':
      return 'ethereum'; // Most established
    default:
      return 'story';
  }
}

/**
 * Check which chains are configured
 */
export function getConfiguredChains(): SupportedChain[] {
  const configured: SupportedChain[] = [];

  if (SuiIntegration.isSuiConfigured()) {
    configured.push('sui');
  }

  if (EthereumIntegration.isEthereumConfigured()) {
    configured.push('ethereum', 'sepolia', 'base', 'optimism');
  }

  if (StoryIntegration.isStoryConfigured()) {
    configured.push('story');
  }

  return configured;
}

export {
  SuiIntegration,
  EthereumIntegration,
  StoryIntegration,
};
