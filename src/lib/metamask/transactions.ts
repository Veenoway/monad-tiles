/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/metamask/transactions.ts - VERSION COMPLÈTE FINALE

import { createPimlicoClient } from "permissionless/clients/pimlico";
import { http, parseEther, type Address, type Hash } from "viem";
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
  nonce,
}: SendUserOperationParams): Promise<Hash> {
  console.log("📤 Envoi UserOperation...", { to, value, data });

  console.log("smartAccount", smartAccount);

  // IMPORTANT: Vérifier que le smart account est déployé
  const deployed = await isSmartAccountDeployed(smartAccount.address);

  if (!deployed) {
    throw new Error(
      "❌ Smart account non déployé. " +
        "Utilisez deploySmartAccount() d'abord."
    );
  }

  console.log("✅ Smart account déployé, envoi UserOp...");

  const pimlicoClient = createPimlicoClient({
    transport: http(
      `https://api.pimlico.io/v2/10143/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`
    ), // You can get the API Key from the Pimlico dashboard.
  });
  console.log("currentNonce", nonce);
  const { fast: fee } = await pimlicoClient.getUserOperationGasPrice();
  try {
    const userOpHash = await bundlerClient.sendUserOperation({
      account: smartAccount,
      calls: [
        {
          to: to,
          value: parseEther("0.0001"),
          data: data ? (data as `0x${string}`) : "0x",
        },
      ],
      ...fee,
    });

    console.log("✅ UserOperation envoyée:", userOpHash);

    // Attendre la confirmation
    console.log("⏳ Attente de confirmation...");
    const receipt = await bundlerClient.waitForUserOperationReceipt({
      hash: userOpHash,
    });

    console.log("✅ Transaction confirmée:", receipt.receipt.transactionHash);
    return receipt.receipt.transactionHash;
  } catch (error: any) {
    console.error("❌ Erreur UserOperation:", error);
    throw new Error(
      `Erreur UserOperation: ${error.shortMessage || error.message}`
    );
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
