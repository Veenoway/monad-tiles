"use client";
import { useSmartAccount } from "@/hook/useSmartAccount";
import {
  deploySmartAccount,
  fundSmartAccount,
} from "@/lib/metamask/transactions";
import Image from "next/image";
import { useState } from "react";
import { parseEther } from "viem";
import { useWalletClient } from "wagmi";

export function SmartAccountManager({
  balance,
  deployed,
  refresh,
}: {
  balance: bigint;
  deployed: boolean;
  refresh: () => Promise<{ balance: bigint; deployed: boolean }>;
}) {
  const { smartAccount, smartAccountAddress } = useSmartAccount();
  const { data: walletClient } = useWalletClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFund = async (amount: string) => {
    if (!walletClient || !smartAccountAddress) return;

    setIsProcessing(true);

    try {
      await fundSmartAccount(walletClient, smartAccountAddress, amount);

      const result = await refresh();

      if (result && result.balance < BigInt(parseEther("0.1"))) {
        throw new Error("Funding did not reach expected amount");
      }
    } catch (error) {
      console.error("Funding failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeploy = async () => {
    if (!walletClient || !smartAccount) return;

    setIsProcessing(true);

    try {
      await deploySmartAccount(smartAccount, walletClient);

      const result = await refresh();

      if (result && !result.deployed) {
        throw new Error("Deployment did not complete");
      }
    } catch (error) {
      console.error("Deployment failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const needsFunding = balance < BigInt(parseEther("0.1"));
  const canDeploy = !needsFunding && !deployed;
  const isReady = deployed && balance > BigInt(0);

  return (
    <div className="w-full h-full  py-10 space-y-6 z-[1000] bg-[url('/bg/main-bg.jpg')] bg-no-repeat bg-bottom absolute flex flex-col items-center">
      <Image src="/logo/new-logo.png" alt="logo" width={300} height={120} />
      <div className="rounded-lg shadow">
        <h3 className="font-bold text-5xl mb-10 mt-20">
          Setup your <br />
          Smart account{" "}
        </h3>

        <div className={``}>
          <div className="flex justify-center space-x-2 mx-auto">
            <button
              onClick={() => {
                if (needsFunding) {
                  handleFund("1");
                } else if (canDeploy && !deployed) {
                  handleDeploy();
                }
              }}
              disabled={isProcessing}
              className="px-3 py-1.5 bg-[#a1055c] text-3xl uppercase text-white rounded-md"
            >
              {isProcessing
                ? "Processing..."
                : needsFunding
                ? "Fund Wallet (1 MON)"
                : canDeploy && !deployed
                ? "Deploy"
                : isReady
                ? "Game on !"
                : "Game not ready"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
