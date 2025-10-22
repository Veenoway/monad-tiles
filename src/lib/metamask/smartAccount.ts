/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Implementation,
  toMetaMaskSmartAccount,
} from "@metamask/delegation-toolkit";
import { createWalletClient, custom, type Address } from "viem";
import { monadTestnet } from "../wagmi/config";
import { publicClient } from "./config";

export async function createHybridSmartAccount(
  provider: any,
  ownerAddress: Address
) {
  const isFarcaster = provider.isFarcaster || provider.isFrameProvider;

  console.log("🔍 Provider:", {
    isFarcaster,
    isMetaMask: provider.isMetaMask,
    providerKeys: Object.keys(provider),
  });

  // Pour Farcaster : demander TOUTES les permissions avant de créer le wallet
  if (isFarcaster) {
    console.log("🟣 Configuration Farcaster...");

    try {
      // Demander les permissions d'abord
      await provider.request({
        method: "wallet_requestPermissions",
        params: [
          {
            eth_accounts: {},
          },
        ],
      });

      console.log("✅ Permissions Farcaster accordées");
    } catch (error: any) {
      console.log("⚠️ Permission déjà accordée ou refusée:", error.message);
    }
  }

  // Forcer la connexion des comptes
  const accounts = await provider.request({
    method: "eth_requestAccounts",
  });

  console.log("✅ Comptes disponibles:", accounts);

  const walletClient = createWalletClient({
    account: ownerAddress,
    chain: monadTestnet,
    transport: custom(provider),
  });

  // Utiliser MetaMask Smart Account pour TOUS les providers
  // car il supporte l'Implementation.Hybrid qui est plus permissif
  console.log("📦 Création du Smart Account Hybrid...");

  const smartAccount = await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Hybrid,
    deployParams: [ownerAddress, [], [], []],
    deploySalt: "0x",
    signer: {
      walletClient,
    },
  });

  console.log("✅ Smart Account créé:", smartAccount.address);

  return smartAccount;
}
