/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSmartAccount } from "@/hook/useSmartAccount";
import {
  checkSmartAccountBalance,
  deploySmartAccount,
  fundSmartAccount,
  isSmartAccountDeployed,
  sendUserOperation,
  testBundlerConnection,
} from "@/lib/metamask/transactions";
import { useEffect, useState } from "react";
import { formatEther, Hash, parseEther } from "viem";
import { useWalletClient } from "wagmi";

export function SmartAccountManager() {
  const { smartAccount, smartAccountAddress } = useSmartAccount();
  const { data: walletClient } = useWalletClient();

  const [balance, setBalance] = useState(BigInt(0));
  const [deployed, setDeployed] = useState(false);
  const [status, setStatus] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHistory, setTxHistory] = useState<Hash[]>([]);

  // Rafraîchir l'état
  const refresh = async () => {
    if (!smartAccountAddress) return;

    const bal = await checkSmartAccountBalance(smartAccountAddress);
    const dep = await isSmartAccountDeployed(smartAccountAddress);

    setBalance(bal);
    setDeployed(dep);

    console.log("📊 État:", {
      balance: formatEther(bal),
      deployed: dep,
    });
  };

  useEffect(() => {
    refresh();
  }, [smartAccountAddress]);

  // Action 0: Test bundler
  const handleTest = async () => {
    setStatus("🧪 Test du bundler...");
    const result = await testBundlerConnection();

    if (result.success) {
      setStatus(
        "✅ Bundler OK\n" +
          `Chain ID: ${result.chainId}\n` +
          `EntryPoints: ${result?.entryPoints?.join(", ")}`
      );
    } else {
      setStatus("❌ Erreur bundler: " + JSON.stringify(result.error));
    }
  };

  // Action 1: Financer
  const handleFund = async (amount: string) => {
    if (!walletClient || !smartAccountAddress) return;

    setIsProcessing(true);
    setStatus(`💰 Financement de ${amount} MONAD...`);

    try {
      const hash = await fundSmartAccount(
        walletClient,
        smartAccountAddress,
        amount
      );
      setStatus(`✅ Financé !\nHash: ${hash}`);
      setTxHistory((prev) => [...prev, hash]);
      setTimeout(refresh, 2000);
    } catch (err: any) {
      setStatus(`❌ Erreur: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Action 2: Déployer
  const handleDeploy = async () => {
    if (!walletClient || !smartAccount) return;

    setIsProcessing(true);
    setStatus("🚀 Déploiement du smart account...");

    try {
      const hash = await deploySmartAccount(smartAccount, walletClient);
      setStatus(`✅ Déployé !\nHash: ${hash}`);
      setTxHistory((prev) => [...prev, hash]);
      setTimeout(refresh, 2000);
    } catch (err: any) {
      setStatus(`❌ Erreur: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Action 3: Envoyer UserOp
  const handleSendUserOp = async () => {
    if (!smartAccount) return;

    setIsProcessing(true);
    setStatus("📤 Envoi UserOperation...");
    console.log("smartAccount", smartAccount);
    try {
      const hash = await sendUserOperation({
        smartAccount: smartAccount as any,
        to: "0x77A89C51f106D6cD547542a3A83FE73cB4459135",
        value: "0.001",
      });
      setStatus(`✅ UserOp confirmée !\nHash: ${hash}`);
      setTxHistory((prev) => [...prev, hash]);
      setTimeout(refresh, 2000);
    } catch (err: any) {
      setStatus(`❌ Erreur:\n${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!smartAccount || !smartAccountAddress) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-yellow-50 rounded-lg p-6">
          <p className="text-yellow-800">Connectez votre wallet Farcaster</p>
        </div>
      </div>
    );
  }

  const needsFunding = balance < BigInt(parseEther("0.01"));
  const canDeploy = !needsFunding && !deployed;
  const isReady = deployed && balance > BigInt(0);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">🎮 MetaMask Smart Account</h1>
        <p className="text-sm opacity-90">Configuration en 3 étapes</p>
      </div>

      {/* État actuel */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-bold mb-4">📊 État du Smart Account</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span>Address:</span>
            <a
              href={`https://explorer.testnet.monad.xyz/address/${smartAccountAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-blue-600 hover:underline"
            >
              {smartAccountAddress.slice(0, 10)}...
              {smartAccountAddress.slice(-8)}
            </a>
          </div>
          <div className="flex justify-between items-center">
            <span>Balance:</span>
            <span className="font-bold">{formatEther(balance)} MONAD</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Status:</span>
            <span
              className={
                deployed ? "text-green-600 font-bold" : "text-orange-600"
              }
            >
              {deployed ? "✅ Déployé" : "⏳ Non déployé"}
            </span>
          </div>
        </div>
      </div>

      {/* Étapes */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <h3 className="font-bold text-lg">🎯 Actions</h3>

        {/* Étape 0: Test */}
        <div className="border-b pb-4">
          <h4 className="font-medium mb-2">0️⃣ Test (optionnel)</h4>
          <button
            onClick={handleTest}
            disabled={isProcessing}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 text-sm"
          >
            🧪 Tester le Bundler
          </button>
        </div>

        {/* Étape 1: Financement */}
        <div className={`border-b pb-4 ${needsFunding ? "" : "opacity-50"}`}>
          <h4 className="font-medium mb-2">
            1️⃣ Financer {needsFunding && "← Commencer ici"}
          </h4>
          <p className="text-xs text-gray-600 mb-3">
            Envoyez 0.05-0.1 MONAD pour payer les frais de gas
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => handleFund("0.05")}
              disabled={isProcessing}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
            >
              + 0.05 MONAD
            </button>
            <button
              onClick={() => handleFund("0.1")}
              disabled={isProcessing}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
            >
              + 0.1 MONAD
            </button>
          </div>
        </div>

        {/* Étape 2: Déploiement */}
        <div className={`border-b pb-4 ${canDeploy ? "" : "opacity-50"}`}>
          <h4 className="font-medium mb-2">
            2️⃣ Déployer {canDeploy && "← Ensuite"}
          </h4>
          <p className="text-xs text-gray-600 mb-3">
            Activez votre smart account (une seule fois)
          </p>
          <button
            onClick={handleDeploy}
            disabled={isProcessing || deployed || needsFunding}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            🚀 Déployer
          </button>
          {needsFunding && (
            <p className="text-xs text-orange-600 mt-2">
              ⚠️ Financez d&apos;abord (min 0.01 MONAD)
            </p>
          )}
        </div>

        {/* Étape 3: Utilisation */}
        <div className={isReady ? "" : "opacity-50"}>
          <h4 className="font-medium mb-2">
            3️⃣ Envoyer UserOperation {isReady && "← Prêt !"}
          </h4>
          <p className="text-xs text-gray-600 mb-3">
            Testez votre smart account
          </p>
          <button
            onClick={handleSendUserOp}
            disabled={isProcessing || !deployed}
            className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 font-medium"
          >
            💸 Envoyer 0.00001 MONAD
          </button>
          {!deployed && (
            <p className="text-xs text-orange-600 mt-2">
              ⚠️ Déployez d&apos;abord le smart account
            </p>
          )}
        </div>
      </div>

      {/* Status */}
      {status && (
        <div className="bg-gray-900 rounded-lg p-4">
          <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap overflow-auto">
            {status}
          </pre>
        </div>
      )}

      {/* Historique */}
      {txHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold mb-3">📜 Historique</h3>
          <div className="space-y-2">
            {txHistory
              .slice(-5)
              .reverse()
              .map((hash, i) => (
                <a
                  key={i}
                  href={`https://explorer.testnet.monad.xyz/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs font-mono text-blue-600 hover:underline truncate"
                >
                  {hash}
                </a>
              ))}
          </div>
        </div>
      )}

      {/* Guide */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-bold text-blue-900 mb-2">💡 Comment ça marche</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Financez avec 0.05-0.1 MONAD depuis votre wallet Farcaster</li>
          <li>Déployez le smart account (transaction normale, ~0.005 MONAD)</li>
          <li>Envoyez des UserOperations pour jouer (beaucoup moins cher !)</li>
        </ol>
      </div>
    </div>
  );
}
