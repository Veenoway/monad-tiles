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

  // Pour Farcaster : demander TOUTES les permissions nécessaires dès le début
  if (isFarcaster) {
    console.log("🟣 Configuration Farcaster...");

    try {
      // ✅ ÉTAPE 1 : Demander eth_accounts
      console.log("1️⃣ Demande des comptes...");
      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });
      console.log("✅ Comptes Farcaster:", accounts);

      // ✅ ÉTAPE 2 : Vérifier que l'adresse correspond
      if (accounts[0]?.toLowerCase() !== ownerAddress.toLowerCase()) {
        console.warn("⚠️ Adresse différente:", {
          expected: ownerAddress,
          got: accounts[0],
        });
      }

      // ✅ ÉTAPE 3 : Demander TOUTES les permissions nécessaires
      console.log("2️⃣ Demande des permissions complètes...");
      await provider.request({
        method: "wallet_requestPermissions",
        params: [
          {
            eth_accounts: {},
          },
        ],
      });

      console.log("✅ Permissions Farcaster accordées");

      // ✅ ÉTAPE 4 : Attendre un peu pour que tout soit bien initialisé
      await new Promise((resolve) => setTimeout(resolve, 300));
      console.log("✅ Initialisation Farcaster terminée");
    } catch (error: any) {
      console.error("❌ Erreur critique permissions Farcaster:", error.message);
      // Pour Farcaster, on DOIT avoir les permissions
      throw new Error(
        "Impossible d'obtenir les permissions Farcaster. Veuillez réessayer."
      );
    }
  } else {
    // Pour les autres wallets
    console.log("🔵 Configuration wallet standard...");
    const accounts = await provider.request({
      method: "eth_requestAccounts",
    });
    console.log("✅ Comptes disponibles:", accounts);
  }

  // ✅ FIX 3 : Ne pas spécifier account si ce n'est pas nécessaire pour Farcaster
  const walletClientConfig: any = {
    chain: monadTestnet,
    transport: custom(provider),
  };

  // Pour les wallets non-Farcaster, on peut spécifier l'account
  if (!isFarcaster) {
    walletClientConfig.account = ownerAddress;
  }

  const walletClient = createWalletClient(walletClientConfig);

  console.log("📦 Création du Smart Account Hybrid...");

  // ✅ FIX 4 : Utiliser l'adresse du walletClient si disponible, sinon ownerAddress
  const signerAddress = isFarcaster
    ? ((await provider.request({ method: "eth_accounts" }))[0] as Address)
    : ownerAddress;

  console.log("👤 Signer address:", signerAddress);

  const smartAccount = await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Hybrid,
    deployParams: [signerAddress, [], [], []], // ✅ Utiliser l'adresse correcte
    deploySalt: "0x",
    signer: {
      walletClient: walletClient as any,
      account: { address: signerAddress },
    },
  });

  console.log("✅ Smart Account créé:", smartAccount.address);

  return smartAccount;
}
