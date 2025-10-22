/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Implementation,
  toMetaMaskSmartAccount,
} from "@metamask/delegation-toolkit";
import { toSimpleSmartAccount } from "permissionless/accounts";
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

  // Forcer la connexion des comptes
  const accounts = await provider.request({
    method: "eth_requestAccounts",
  });

  console.log("✅ Comptes disponibles:", accounts);

  // ========================================
  // FARCASTER : Utiliser SimpleSmartAccount
  // ========================================
  if (isFarcaster) {
    console.log("🟣 Configuration Farcaster avec SimpleSmartAccount...");

    try {
      await provider.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });
      console.log("✅ Permissions Farcaster accordées");
    } catch (error: any) {
      console.log("⚠️ Permission déjà accordée:", error.message);
    }

    // Owner custom qui utilise les méthodes natives de Farcaster
    const owner = {
      address: ownerAddress,

      async signMessage({ message }: any) {
        console.log("📝 Signature via Farcaster personal_sign...");
        const signature = await provider.request({
          method: "personal_sign",
          params: [
            typeof message === "string" ? message : message.raw,
            ownerAddress,
          ],
        });
        return signature as `0x${string}`;
      },

      async signTransaction(tx: any) {
        console.log("📝 Signature transaction via Farcaster...");
        const walletClient = createWalletClient({
          account: ownerAddress,
          chain: monadTestnet,
          transport: custom(provider),
        });
        return await walletClient.signTransaction({
          account: ownerAddress,
          ...tx,
        });
      },

      async signTypedData(typedData: any) {
        console.log("📝 Signature typedData via Farcaster...");
        const signature = await provider.request({
          method: "eth_signTypedData_v4",
          params: [ownerAddress, JSON.stringify(typedData)],
        });
        return signature as `0x${string}`;
      },
    };

    const smartAccount = await toSimpleSmartAccount({
      client: publicClient,
      owner: owner as any,
      entryPoint: {
        address: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
        version: "0.7",
      },
    });

    console.log("✅ SimpleSmartAccount Farcaster créé:", smartAccount.address);
    return smartAccount;
  }

  // ========================================
  // AUTRES WALLETS : Votre code actuel
  // ========================================
  console.log("📦 Création du Smart Account Hybrid pour wallet standard...");

  const walletClient = createWalletClient({
    account: ownerAddress,
    chain: monadTestnet,
    transport: custom(provider),
  });

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
