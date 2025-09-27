"use client"

import { createContext, useContext, useEffect, useState } from 'react';
import { createWalletClient, createPublicClient, http, WalletClient, PublicClient, custom, Hex } from 'viem';
import { testnet } from './WalletProvider';
import { useWallets } from '@privy-io/react-auth'

interface ViemContextType {
    walletClient: WalletClient | null;
    publicClient: PublicClient | null;
}

const ViemContext = createContext<ViemContextType>({
    walletClient: null,
    publicClient: null,
});

export const useViem = () => useContext(ViemContext);

export const ViemProvider = ({ children }: { children: React.ReactNode }) => {
    const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
    const [publicClient, setPublicClient] = useState<PublicClient | null>(null);
    const { wallets } = useWallets();
    const wallet = wallets[0]

    useEffect(() => {
        async function getClients () {
            // Use Flow testnet details from WalletProvider
            const public_client = createPublicClient({
                chain: testnet,
                transport: http(testnet.rpcUrls.default.http[0])
            });
            setPublicClient(public_client);

            // Initialize wallet client when wallet is connected
            if (wallet?.address) {
                const wallet_client = createWalletClient({
                    account: wallet.address as Hex,
                    chain: testnet,
                    transport: custom(await wallet.getEthereumProvider())
                });
                setWalletClient(wallet_client);
            } else {
                setWalletClient(null);
            }
        }
        getClients()
    }, [wallet?.address]);

    return (
        <ViemContext.Provider value={{ walletClient, publicClient }}>
            {children}
        </ViemContext.Provider>
    );
};