'use client'

import { WagmiProvider, createConfig, http } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectKitProvider, getDefaultConfig } from 'connectkit'
import { mainnet, sepolia, base, optimism } from 'wagmi/chains'
import { SuiClientProvider, WalletProvider as SuiWalletProvider } from '@mysten/dapp-kit'
import { getFullnodeUrl } from '@mysten/sui/client'
import { createNetworkConfig } from '@mysten/dapp-kit'
import { PrivyProvider } from '@privy-io/react-auth'

// Story Protocol Testnet (Aeneid)
const storyTestnet = {
  id: 1315,
  name: 'Story Aeneid Testnet',
  network: 'story-aeneid',
  nativeCurrency: {
    decimals: 18,
    name: 'IP',
    symbol: 'IP',
  },
  rpcUrls: {
    default: {
      http: ['https://aeneid.storyrpc.io'],
    },
    public: {
      http: ['https://aeneid.storyrpc.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Story Explorer',
      url: 'https://aeneid.storyscan.io',
    },
  },
  testnet: true,
} as const

// EVM chains configuration (Story, Ethereum, L2s)
const evmConfig = createConfig(
  getDefaultConfig({
    chains: [storyTestnet, sepolia, base, optimism, mainnet],
    transports: {
      [storyTestnet.id]: http('https://aeneid.storyrpc.io'),
      [sepolia.id]: http(),
      [base.id]: http(),
      [optimism.id]: http(),
      [mainnet.id]: http(),
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo',
    appName: 'SoundChain',
    appDescription: 'Multi-Chain AI-Powered Music Licensing',
    appUrl: 'https://soundchain.io',
    appIcon: 'https://soundchain.io/logo.png',
  })
)

// Sui network configuration
const { networkConfig: suiNetworkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
  devnet: { url: getFullnodeUrl('devnet') },
});

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'clz28g9ty08o5j2yvz2g3b5u8'}
      config={{
        loginMethods: ['email', 'wallet', 'google', 'spotify'],
        appearance: {
          theme: 'light',
          accentColor: '#6366f1',
          logo: 'https://soundchain.io/logo.png',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },
        externalWallets: {
          coinbaseWallet: { connectionOptions: 'all' },
          metamask: { connectionOptions: 'all' },
          walletConnect: { enabled: true },
        },
        supportedChains: [storyTestnet, sepolia, base, optimism, mainnet],
        defaultChain: storyTestnet,
      }}
    >
      <WagmiProvider config={evmConfig}>
        <QueryClientProvider client={queryClient}>
          <SuiClientProvider networks={suiNetworkConfig} defaultNetwork="testnet">
            <SuiWalletProvider autoConnect>
              <ConnectKitProvider theme="auto">
                {children}
              </ConnectKitProvider>
            </SuiWalletProvider>
          </SuiClientProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
  )
}
