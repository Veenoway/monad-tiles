/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/metamask/transactions.ts - VERSION COMPLÈTE FINALE

import { PIANO_CONTRACT_ABI } from "@/constant/pianoTiles";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { formatEther, http, parseEther, type Address, type Hash } from "viem";
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
  nonce?: bigint;
}

export async function sendUserOperation({
  smartAccount,
  to,
  value,
}: SendUserOperationParams): Promise<Hash> {
  console.log("🔍 Vérifications préalables...");
  await diagnoseSmartAccount(smartAccount.address);
  // 1. Vérifier déploiement
  const deployed = await isSmartAccountDeployed(smartAccount.address);
  if (!deployed) {
    throw new Error("❌ Smart account non déployé");
  }

  // 2. Vérifier le solde
  const balance = await publicClient.getBalance({
    address: smartAccount.address,
  });

  console.log("💰 Solde SA:", formatEther(balance), "MON");

  if (balance < parseEther("0.001")) {
    throw new Error(
      `Solde insuffisant: ${formatEther(
        balance
      )} MON. Minimum requis: 0.001 MON`
    );
  }

  const pimlicoClient = createPimlicoClient({
    transport: http(
      `https://api.pimlico.io/v2/10143/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`
    ),
  });

  try {
    // 3. Récupérer gas prices et BOOSTER
    const gasPrice = await pimlicoClient.getUserOperationGasPrice();
    console.log("⛽ Gas original:", gasPrice.fast);

    // ✅ BOOST x2 pour être sûr que ça mine
    const boostedGas = {
      maxFeePerGas: gasPrice.fast.maxFeePerGas * BigInt(3),
      maxPriorityFeePerGas: gasPrice.fast.maxPriorityFeePerGas * BigInt(3),
    };
    console.log("🚀 Gas boosté x2:", boostedGas);

    const currentNonce = await smartAccount.getNonce();
    // 4. Préparer les calls
    const calls = [
      {
        functionName: "click",
        abi: PIANO_CONTRACT_ABI,
        to,
        value: parseEther(value),
      },
    ];

    // 5. ✅ ENVOYER SANS ESTIMATION - Laisser le bundler gérer
    console.log("📤 Envoi UserOperation...");
    const userOpHash = await bundlerClient.sendUserOperation({
      account: smartAccount,
      calls,
      ...boostedGas,
      nonce: currentNonce,
    });

    console.log("✅ UserOp envoyée:", userOpHash);
    console.log("🔗 Hash:", userOpHash);

    // 6. Attendre avec timeout long et polling fréquent
    console.log("⏳ Attente confirmation (max 2 minutes)...");

    const startTime = Date.now();
    const { receipt } = await bundlerClient.waitForUserOperationReceipt({
      hash: userOpHash,
      timeout: 120000, // ✅ 2 MINUTES
      pollingInterval: 2000, // Vérifier toutes les 2 secondes
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ CONFIRMÉE en ${duration}s !`);
    console.log("📝 Transaction hash:", receipt.transactionHash);
    console.log("🧱 Block:", receipt.blockNumber);

    return receipt.transactionHash;
  } catch (error: any) {
    console.error("❌ Erreur complète:", error);

    // Analyser l'erreur
    if (error.message?.includes("timeout") || error.name === "TimeoutError") {
      // La UserOp a été envoyée mais pas confirmée
      console.error("⏱️ TIMEOUT: Transaction pas confirmée après 2 minutes");
      console.error("💡 Causes possibles:");
      console.error("   - Gas trop bas (même avec boost)");
      console.error("   - Bundler Pimlico surchargé");
      console.error("   - Réseau Monad lent");

      throw new Error(
        "⏱️ Transaction timeout. Le réseau est peut-être surchargé. Réessayez dans 2 minutes."
      );
    }

    if (error.message?.includes("nonce")) {
      const currentNonce = await smartAccount.getNonce();
      console.error("🔢 Nonce actuel:", currentNonce);
      throw new Error("Nonce invalide. Une transaction est déjà en cours.");
    }

    if (error.message?.includes("insufficient")) {
      throw new Error("Fonds insuffisants dans le Smart Account");
    }

    if (error.message?.includes("AA25")) {
      throw new Error("Transaction déjà en cours avec ce nonce");
    }

    // Erreur générique
    throw new Error(`Erreur: ${error.shortMessage || error.message}`);
  }
}

export async function diagnoseSmartAccount(smartAccountAddress: Address) {
  console.log("\n═══════════════════════════════════");
  console.log("🔍 DIAGNOSTIC SMART ACCOUNT");
  console.log("═══════════════════════════════════\n");

  try {
    // 1. Adresse
    console.log("📍 Adresse:", smartAccountAddress);

    // 2. Déploiement
    const code = await publicClient.getCode({ address: smartAccountAddress });
    const deployed = code !== undefined && code !== "0x";
    console.log("📦 Déployé:", deployed ? "✅ OUI" : "❌ NON");

    // 3. Solde
    const balance = await publicClient.getBalance({
      address: smartAccountAddress,
    });
    console.log("💰 Solde:", formatEther(balance), "MON");

    if (balance < parseEther("0.001")) {
      console.log("⚠️  ATTENTION: Solde faible ! Ajoutez au moins 0.01 MON");
    }

    // 4. Nonce
    if (deployed) {
      const nonce = await publicClient.readContract({
        address: smartAccountAddress,
        abi: [
          {
            name: "getNonce",
            type: "function",
            stateMutability: "view",
            inputs: [],
            outputs: [{ type: "uint256" }],
          },
        ],
        functionName: "getNonce",
      });
      console.log("🔢 Nonce:", nonce.toString());
    }

    // 5. Test connexion bundler
    console.log("\n🔌 Test connexion Pimlico...");
    const chainId = await bundlerClient.chain?.id;
    console.log("⛓️  Chain ID:", chainId);

    const entryPoints = await bundlerClient.getSupportedEntryPoints();
    console.log("🚪 Entry Points:", entryPoints);

    console.log("\n═══════════════════════════════════");
    console.log("✅ DIAGNOSTIC TERMINÉ");
    console.log("═══════════════════════════════════\n");

    return {
      deployed,
      balance: formatEther(balance),
      hasEnoughFunds: balance >= parseEther("0.001"),
    };
  } catch (error) {
    console.error("❌ Erreur diagnostic:", error);
    console.log("═══════════════════════════════════\n");
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
