"use client";

import { useModalStore } from "@/store/modalStore";
import { useEffect, useState } from "react";
import { useAccount, useDisconnect, useSwitchChain } from "wagmi";
import { WalletModal } from "./connector-modal";

export function WalletConnection() {
  const { setIsOpen } = useModalStore();
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
        className=" bg-[#a1055c] rounded-lg h-[50px] px-4 font-bold text-xl uppercase min-w-[170px]"
      >
        Switch to Monad Testnet
      </button>
    );
  }

  return (
    <div>
      {!address && (
        <WalletModal>
          <button
            onClick={() => setIsOpen(true)}
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
            className=" bg-[#a1055c] rounded-lg h-[50px] px-2 font-bold text-xl uppercase min-w-[170px]"
          >
            {getDisplayText()}
          </button>
        </div>
      )}
    </div>
  );
}
