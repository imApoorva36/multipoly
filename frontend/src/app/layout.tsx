import type { Metadata } from "next";
import "./globals.css";
import PrivyProviders, { testnet } from "@/providers/WalletProvider";
import HuddleProviders from "@/providers/HuddleProvider";
import QueryProvider from "@/providers/QueryProvider";
import { ViemProvider } from "@/providers/ViemProvider"
import { WagmiProvider } from "wagmi"

export const metadata: Metadata = {
  title: "Multipoly",
  description: "A multiplayer educational gaming platform on blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
        suppressHydrationWarning={true}
      >
        <PrivyProviders>
          <QueryProvider>
            <HuddleProviders>
              <ViemProvider>
                {children}
              </ViemProvider>
            </HuddleProviders>
          </QueryProvider>
        </PrivyProviders>
      </body>
    </html>
  );
}
