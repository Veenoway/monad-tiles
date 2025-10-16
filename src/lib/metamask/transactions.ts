/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/metamask/transactions.ts - VERSION COMPLÈTE FINALE

import { parseEther, type Address, type Hash } from "viem";
import { bundlerClient, publicClient } from "./config";

// ===================================
// 1. VÉRIFICATIONS
// ===================================

export async function checkSmartAccountBalance(
  smartAccountAddress: Address
): Promise<bigint> {
  return await publicClient.getBalance({ address: smartAccountAddress });
}

export async function isSmartAccountDeployed(
  smartAccountAddress: Address
): Promise<boolean> {
  const code = await publicClient.getCode({ address: smartAccountAddress });
  return code !== undefined && code !== "0x";
}

// ===================================
// 2. FINANCEMENT
// ===================================

export async function fundSmartAccount(
  walletClient: any,
  smartAccountAddress: Address,
  amount: string
): Promise<Hash> {
  console.log(`💰 Envoi de ${amount} MONAD au smart account...`);

  const hash = await walletClient.sendTransaction({
    to: smartAccountAddress,
    value: parseEther(amount),
  });

  console.log("✅ Transaction de financement envoyée:", hash);

  // Attendre la confirmation
  await publicClient.waitForTransactionReceipt({ hash });
  console.log("✅ Financement confirmé");

  return hash;
}

// ===================================
// 3. DÉPLOIEMENT
// ===================================

export async function deploySmartAccount(
  smartAccount: any,
  walletClient: any
): Promise<Hash> {
  console.log("🚀 Déploiement du smart account...");

  // Vérifier si déjà déployé
  const alreadyDeployed = await isSmartAccountDeployed(smartAccount.address);
  if (alreadyDeployed) {
    console.log("✅ Smart account déjà déployé");
    return "0x" as Hash; // Déjà déployé
  }

  // Récupérer les paramètres de factory
  const { factory, factoryData } = await smartAccount.getFactoryArgs();

  console.log("Factory:", factory);
  console.log("FactoryData length:", factoryData.length);

  // Envoyer la transaction de déploiement
  const hash = await walletClient.sendTransaction({
    to: factory,
    data: factoryData,
    value: BigInt(0),
  });

  console.log("✅ Transaction de déploiement envoyée:", hash);

  // Attendre la confirmation
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("✅ Smart account déployé à:", smartAccount.address);

  return receipt.transactionHash;
}

// ===================================
// 4. ENVOYER UNE USEROPERATION
// ===================================

interface SendUserOperationParams {
  smartAccount: any;
  to: Address;
  value: string;
  data?: `0x${string}`;
  nonce?: bigint;
}

export async function sendUserOperation({
  smartAccount,
  to,
  value,
  data,
}: SendUserOperationParams): Promise<Hash> {
  try {
    const calls = [
      {
        to,
        value: parseEther(value),
        data: data || ("0x" as `0x${string}`),
      },
    ];

    const userOpHash = await bundlerClient.sendUserOperation({
      account: smartAccount,
      calls,
    });

    console.log("✅ Envoyée:", userOpHash);

    const { receipt } = await bundlerClient.waitForUserOperationReceipt({
      hash: userOpHash,
    });

    return receipt.transactionHash;
  } catch (error: any) {
    console.error("❌ Erreur:", error.message);
    throw error;
  }
}

// ===================================
// 5. TEST DU BUNDLER
// ===================================

export async function testBundlerConnection() {
  try {
    console.log("🧪 Test de connexion bundler...");

    const chainId = await bundlerClient.chain.id;
    console.log("✅ Chain ID:", chainId);

    const entryPoints = await bundlerClient.getSupportedEntryPoints();
    console.log("✅ EntryPoints:", entryPoints);

    return {
      success: true,
      chainId,
      entryPoints,
    };
  } catch (error) {
    console.error("❌ Erreur test bundler:", error);
    return {
      success: false,
      error,
    };
  }
}
