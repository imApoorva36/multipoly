import type { Metadata } from "next";
import "./globals.css";
import PrivyProviders from "@/providers/WalletProvider";

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
      >
        <PrivyProviders>{children}</PrivyProviders>
      </body>
    </html>
  );
}
