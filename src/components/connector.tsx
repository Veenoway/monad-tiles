"use client";

import { useEffect, useState } from "react";
import { useAccount, useDisconnect, useSwitchChain } from "wagmi";
import { WalletModal } from "./connector-modal";

export function WalletConnection() {
  const [open, setOpen] = useState(false);
  const { address, isConnecting, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    if (address) {
      setIsInitialLoading(false);
    }
  }, [address]);

  const getDisplayText = () => {
    if (isConnecting || isInitialLoading) return "Loading...";
    return `${address?.slice(0, 6)}...${address?.slice(-4)}`;
  };
  console.log("chainID;", chainId);
  const isWrongNetwork = chainId !== 10143;

  const handleSwitchNetwork = async () => {
    try {
      await switchChainAsync({
        chainId: 10143,
      });
    } catch (err) {
      console.error("Failed to switch network:", err);
    }
  };

  const handleDisconnect = async () => {
    try {
      disconnect();
    } catch (err) {
      console.error("Failed to disconnect:", err);
    }
  };

  if (address && isWrongNetwork) {
    return (
      <button
        onClick={handleSwitchNetwork}
        className="bg-[url('/assets/orderly-gradient.png')] bg-center hover:bg-top bg-no-repeat bg-cover
          flex items-center rounded-full w-fit h-[50px] border border-borderColor px-8 py-5
          text-lg text-white font-medium transition-all duration-300 ease-in-out
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Switch to Monad Devnet
      </button>
    );
  }

  return (
    <div>
      {!address && (
        <WalletModal open={open} setOpen={setOpen}>
          <button
            onClick={() => setOpen(true)}
            className=" bg-[#a1055c] rounded-lg h-[50px] px-2 font-bold text-xl uppercase min-w-[170px]"
          >
            Connect Wallet
          </button>
        </WalletModal>
      )}

      {address && !isWrongNetwork && (
        <div className="flex items-center gap-4">
          <button
            onClick={handleDisconnect}
            className={`bg-[url('/assets/orderly-gradient.png')] bg-center hover:bg-top bg-no-repeat bg-cover
                flex items-center rounded-full mx-auto w-fit h-[50px] border border-borderColor px-8 py-5
                text-lg text-white font-semibold transition-all duration-300 ease-in-out
                ${isConnecting || isInitialLoading ? "animate-pulse" : ""}`}
          >
            {getDisplayText()}
          </button>
        </div>
      )}
    </div>
  );
}
