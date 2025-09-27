"use client";

import { PrivyProvider } from "@privy-io/react-auth";

export let testnet = {
  id: 545,
  name: 'Flow',
  rpcUrls: {
    default: {http:['https://testnet.evm.nodes.onflow.org']}
  },
  nativeCurrency: {
    name: 'Flow',
    symbol: 'FLOW',
    decimals: 18,
  },
  blockExplorers: {
    default: {
      url: 'https://evm-testnet.flowscan.io/',
      name: "Flow EVM Testnet Explorer"
    }
  }
}

export default function PrivyProviders({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID!}
      config={{
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          }
        },
        appearance: { walletChainType: "ethereum-only" },
        defaultChain: testnet,
        supportedChains: [testnet],
      }}
    >
      {children}
    </PrivyProvider>
  );
}