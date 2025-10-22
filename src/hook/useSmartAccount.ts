/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMiniAppContext } from "@/lib/farcaster/context";
import { useFrame } from "@/lib/farcaster/provider";
import { useEffect, useState } from "react";
import type { Address } from "viem";
import { useAccount } from "wagmi";
import { createHybridSmartAccount } from "../lib/metamask/smartAccount";

interface SmartAccountState {
  smartAccount: any | null;
  isLoading: boolean;
  error: Error | null;
  smartAccountAddress: Address | null;
}

export function useSmartAccount() {
  const { address } = useAccount();
  const { isEthProviderAvailable } = useMiniAppContext();
  const [state, setState] = useState<SmartAccountState>({
    smartAccount: null,
    isLoading: false,
    error: null,
    smartAccountAddress: null,
  });
  const { ethProvider } = useFrame();

  useEffect(() => {
    async function initSmartAccount() {
      if (!address || !isEthProviderAvailable) return;

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const provider = ethProvider || (window as any).ethereum;

        if (!provider) {
          throw new Error("Ethereum provider not available");
        }

        const smartAccount = await createHybridSmartAccount(provider, address);

        setState({
          smartAccount,
          smartAccountAddress: (smartAccount as any).address,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        setState({
          smartAccount: null,
          smartAccountAddress: null,
          isLoading: false,
          error:
            err instanceof Error
              ? err
              : new Error("Failed to create smart account"),
        });
      }
    }

    initSmartAccount();
  }, [address, isEthProviderAvailable]);

  return state;
}
