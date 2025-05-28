import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { FrameProvider } from "@/lib/farcaster/provider";
import WagmiProviders from "@/lib/wagmi/provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Monad Farcaster MiniApp Template",
  description: "A template for building mini-apps on Farcaster and Monad",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WagmiProviders>
          <FrameProvider>{children}</FrameProvider>
        </WagmiProviders>
      </body>
    </html>
  );
}
