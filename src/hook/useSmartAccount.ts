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
  const { ethProvider } = useFrame();

  const [state, setState] = useState<SmartAccountState>({
    smartAccount: null,
    isLoading: false,
    error: null,
    smartAccountAddress: null,
  });

  useEffect(() => {
    async function initSmartAccount() {
      // ✅ Attendre que TOUS les éléments soient prêts
      if (!address) {
        console.log("⏳ Waiting for address...");
        return;
      }

      // Pour Farcaster : attendre explicitement le ethProvider
      const provider = ethProvider || (window as any).ethereum;

      if (!provider) {
        console.log("⏳ Waiting for provider...");
        return;
      }

      // Pour les autres wallets : vérifier isEthProviderAvailable
      if (!ethProvider && !isEthProviderAvailable) {
        console.log("⏳ Waiting for eth provider...");
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        console.log("🚀 Initializing Smart Account...", {
          address,
          hasEthProvider: !!ethProvider,
          hasWindowEthereum: !!(window as any).ethereum,
        });

        const smartAccount = await createHybridSmartAccount(provider, address);

        setState({
          smartAccount,
          smartAccountAddress: smartAccount.address,
          isLoading: false,
          error: null,
        });

        console.log("✅ Smart Account initialized:", smartAccount.address);
      } catch (err) {
        console.error("❌ Smart Account initialization failed:", err);
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
  }, [address, isEthProviderAvailable, ethProvider]); // ✅ Ajouter ethProvider dans les dépendances

  return state;
}
