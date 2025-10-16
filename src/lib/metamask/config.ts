import {
  Implementation,
  toMetaMaskSmartAccount,
} from "@metamask/delegation-toolkit";
import { createPublicClient, http } from "viem";
import {
  createBundlerClient,
  createPaymasterClient,
} from "viem/account-abstraction";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { monadTestnet } from "../wagmi/config";

export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(),
});

const privateKey = generatePrivateKey();
const account = privateKeyToAccount(privateKey);

export const smartAccount = await toMetaMaskSmartAccount({
  client: publicClient,
  implementation: Implementation.Hybrid,
  deployParams: [account.address, [], [], []],
  deploySalt: "0x",
  signer: { account },
});

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

export const paymasterClient = createPaymasterClient({
  transport: http(PIMLICO_URL),
});
