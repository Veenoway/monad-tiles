/* eslint-disable @typescript-eslint/no-explicit-any */
import { publicClient } from "@/lib/metamask/config";
import { monadTestnet } from "@/lib/wagmi/config";
import {
  Implementation,
  toMetaMaskSmartAccount,
} from "@metamask/delegation-toolkit";
import { toSimpleSmartAccount } from "permissionless/accounts";
import { createWalletClient, custom, type Address } from "viem";

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

    // Owner custom
    const owner = {
      address: ownerAddress,

      async signMessage({ message }: any) {
        console.log("📝 [FARCASTER] signMessage appelé");

        try {
          let messageToSign: string;

          if (typeof message === "string") {
            messageToSign = message;
          } else if (message.raw) {
            messageToSign =
              typeof message.raw === "string"
                ? message.raw
                : `0x${Buffer.from(message.raw).toString("hex")}`;
          } else {
            messageToSign = JSON.stringify(message);
          }

          console.log("📝 Appel personal_sign avec:", messageToSign);

          const signature = await provider.request({
            method: "personal_sign",
            params: [messageToSign, ownerAddress],
          });

          console.log("✅ Signature obtenue");
          return signature as `0x${string}`;
        } catch (error: any) {
          console.error("❌ Erreur signature:", error);
          throw error;
        }
      },

      async signTransaction() {
        console.log("📝 [FARCASTER] signTransaction appelé");
        throw new Error("signTransaction non supporté");
      },

      async signTypedData(typedData: any) {
        console.log("📝 [FARCASTER] signTypedData appelé");

        try {
          const dataToSign = {
            domain: typedData.domain,
            types: typedData.types,
            primaryType: typedData.primaryType,
            message: typedData.message,
          };

          const signature = await provider.request({
            method: "eth_signTypedData_v4",
            params: [ownerAddress, JSON.stringify(dataToSign)],
          });

          console.log("✅ Signature typedData obtenue");
          return signature as `0x${string}`;
        } catch (error: any) {
          console.error("❌ Erreur signature typedData:", error);
          throw error;
        }
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

    // RETOURNER AUSSI LE TYPE
    return { smartAccount, isFarcaster: true };
  }

  // ========================================
  // AUTRES WALLETS
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

  return { smartAccount, isFarcaster: false };
}
