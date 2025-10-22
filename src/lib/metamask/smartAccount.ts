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
    ownerAddress, // ✅ LOG l'adresse reçue
  });

  let accountAddress: Address = ownerAddress;

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

      // ✅ CRITIQUE : Utiliser le compte retourné par Farcaster, pas ownerAddress
      if (accounts && accounts[0]) {
        accountAddress = accounts[0] as Address;
        console.log("📍 Adresse Farcaster utilisée:", accountAddress);
      } else {
        throw new Error("Aucun compte Farcaster disponible");
      }

      // ✅ ÉTAPE 2 : Demander TOUTES les permissions nécessaires
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

      // ✅ ÉTAPE 3 : Attendre un peu pour que tout soit bien initialisé
      await new Promise((resolve) => setTimeout(resolve, 300));
      console.log("✅ Initialisation Farcaster terminée");
    } catch (error: any) {
      console.error("❌ Erreur permissions Farcaster:", error);

      // ✅ Cas spécifique : domaine non autorisé
      if (error.message?.includes("not been authorized")) {
        throw new Error(
          "FARCASTER_NOT_AUTHORIZED: Votre domaine n'est pas autorisé dans la configuration Farcaster Frame. " +
            "Veuillez ajouter votre domaine dans allowedOrigins ou utilisez MetaMask."
        );
      }

      // Pour les autres erreurs Farcaster
      throw new Error(
        `Impossible d'obtenir les permissions Farcaster: ${error.message}`
      );
    }
  } else {
    // Pour les autres wallets
    console.log("🔵 Configuration wallet standard...");
    const accounts = await provider.request({
      method: "eth_requestAccounts",
    });
    console.log("✅ Comptes disponibles:", accounts);

    // Pour les wallets standard, utiliser aussi le compte retourné
    if (accounts && accounts[0]) {
      accountAddress = accounts[0] as Address;
    }
  }

  // ✅ VÉRIFICATION CRITIQUE : L'adresse ne doit jamais être null/undefined
  if (
    !accountAddress ||
    accountAddress === "0x0000000000000000000000000000000000000000"
  ) {
    throw new Error("Adresse de compte invalide ou manquante");
  }

  console.log("📍 Adresse finale utilisée:", accountAddress);

  // ✅ Pour Farcaster : Ne PAS spécifier account dans walletClient
  const walletClientConfig: any = {
    chain: monadTestnet,
    transport: custom(provider),
  };

  // Pour les wallets non-Farcaster, on peut spécifier l'account
  if (!isFarcaster) {
    walletClientConfig.account = accountAddress;
  }

  const walletClient = createWalletClient(walletClientConfig);

  console.log("📦 Création du Smart Account Hybrid...");
  console.log("📍 Signer address:", accountAddress);

  const smartAccount = await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Hybrid,
    deployParams: [accountAddress, [], [], []], // ✅ Utiliser l'adresse correcte
    deploySalt: "0x",
    signer: {
      walletClient: walletClient as any,
      account: { address: accountAddress },
    },
  });

  console.log("✅ Smart Account créé:", smartAccount.address);

  // ✅ VÉRIFICATION FINALE : Le smart account doit avoir une adresse
  if (!smartAccount.address) {
    throw new Error("Smart Account créé mais sans adresse valide");
  }

  return smartAccount;
}
