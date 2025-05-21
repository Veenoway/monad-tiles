"use client";
import { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { config } from "./config";

export default function WagmiProviders({ children }: { children: ReactNode }) {
  return <WagmiProvider config={config}>{children}</WagmiProvider>;
}
