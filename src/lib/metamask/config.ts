/* eslint-disable @typescript-eslint/no-explicit-any */
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { createBundlerClient } from "viem/account-abstraction";
import { monadTestnet } from "../wagmi/config";

export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(),
});

export function createWalletClientFromProvider(provider: any) {
  return createWalletClient({
    chain: monadTestnet,
    transport: custom(provider),
  });
}

const PIMLICO_API_KEY = process.env.NEXT_PUBLIC_PIMLICO_API_KEY;

if (!PIMLICO_API_KEY) {
  throw new Error("❌ NEXT_PUBLIC_PIMLICO_API_KEY doit être défini");
}

const PIMLICO_URL = `https://api.pimlico.io/v2/10143/rpc?apikey=${PIMLICO_API_KEY}`;

console.log("🔧 Configuration Pimlico pour Monad Testnet");

// 🔥 CORRECTION : Ajouter client et désactiver paymaster
export const bundlerClient = createBundlerClient({
  client: publicClient, // ✅ IMPORTANT : Ajouter le publicClient
  transport: http(PIMLICO_URL),
  // ❌ Ne pas définir de paymaster pour l'instant
});
