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
  const wagmiAccount = useAccount();
  const { isEthProviderAvailable } = useMiniAppContext();
  const { ethProvider } = useFrame();

  const [state, setState] = useState<SmartAccountState>({
    smartAccount: null,
    isLoading: false,
    error: null,
    smartAccountAddress: null,
  });

  // ✅ DEBUG : Logger tous les states
  useEffect(() => {
    console.log("🔍 useSmartAccount - État actuel:", {
      wagmiAddress: wagmiAccount.address,
      wagmiIsConnected: wagmiAccount.isConnected,
      wagmiIsConnecting: wagmiAccount.isConnecting,
      wagmiConnector: wagmiAccount.connector?.name,
      hasEthProvider: !!ethProvider,
      isEthProviderAvailable,
      ethProviderType: ethProvider?.isFarcaster
        ? "Farcaster"
        : ethProvider?.isMetaMask
        ? "MetaMask"
        : "Unknown",
    });
  }, [wagmiAccount, ethProvider, isEthProviderAvailable]);

  useEffect(() => {
    async function initSmartAccount() {
      // ✅ VÉRIFICATION 1 : wagmi address
      if (!wagmiAccount.address) {
        console.log("⏳ Waiting for wagmi address...", {
          isConnected: wagmiAccount.isConnected,
          isConnecting: wagmiAccount.isConnecting,
        });
        return;
      }

      console.log("✅ Wagmi address available:", wagmiAccount.address);

      // ✅ VÉRIFICATION 2 : Provider
      const provider = ethProvider || (window as any).ethereum;

      if (!provider) {
        console.log("⏳ Waiting for provider...");
        return;
      }

      console.log("✅ Provider available:", {
        isFarcaster: provider.isFarcaster || provider.isFrameProvider,
        isMetaMask: provider.isMetaMask,
      });

      // ✅ VÉRIFICATION 3 : Pour les wallets non-Farcaster, vérifier isEthProviderAvailable
      if (!ethProvider && !isEthProviderAvailable) {
        console.log("⏳ Waiting for eth provider availability...");
        return;
      }

      // ✅ VÉRIFICATION 4 : Pour Farcaster, attendre que eth_accounts soit disponible
      if (provider.isFarcaster || provider.isFrameProvider) {
        try {
          const accounts = await provider.request({
            method: "eth_accounts",
          });
          console.log("✅ Farcaster accounts:", accounts);

          if (!accounts || accounts.length === 0) {
            console.log("⏳ Waiting for Farcaster accounts...");
            return;
          }
        } catch (error: any) {
          console.log("⚠️ Cannot check Farcaster accounts:", error.message);
          // Continuer quand même
        }
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        console.log("🚀 Initializing Smart Account...", {
          address: wagmiAccount.address,
          hasEthProvider: !!ethProvider,
          hasWindowEthereum: !!(window as any).ethereum,
          isFarcaster: provider?.isFarcaster || provider?.isFrameProvider,
        });

        // ✅ CRITIQUE : Passer l'adresse de wagmi
        const smartAccount = await createHybridSmartAccount(
          provider,
          wagmiAccount.address
        );

        // ✅ VÉRIFICATION 5 : Le smart account doit avoir une adresse
        if (!smartAccount || !smartAccount.address) {
          throw new Error("Smart Account créé sans adresse valide");
        }

        setState({
          smartAccount,
          smartAccountAddress: smartAccount.address,
          isLoading: false,
          error: null,
        });

        console.log("✅ Smart Account initialized:", smartAccount.address);
      } catch (err: any) {
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
  }, [
    wagmiAccount.address,
    wagmiAccount.isConnected,
    isEthProviderAvailable,
    ethProvider,
  ]);

  return state;
}
