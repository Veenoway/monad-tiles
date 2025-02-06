"use client";

import {
  STRESS_CONTRACT_ABI,
  STRESS_CONTRACT_ADDRESS,
} from "@/constant/contract";
import { useEffect, useState } from "react";
import {
  useAccount,
  useChainId,
  useConnect,
  useReadContract,
  useSwitchChain,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";

// Types pour la structure du contrat
type TopStresser = {
  user: string;
  count: bigint;
};

type UserStats = {
  stressCount: bigint;
  lastStressTime: bigint;
  remainingAllowance: bigint;
  approvedStressCount: bigint;
};

const STRESS_COST = BigInt(16e16);
const BATCH_SIZE = 10;
const REQUIRED_CHAIN_ID = 20143;

export function useEnhancedStressTest() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [globalStressCount, setGlobalStressCount] = useState<bigint>(BigInt(0));
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [topStressers, setTopStressers] = useState<TopStresser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCount, setSelectedCount] = useState(BATCH_SIZE);

  const checkAndSwitchNetwork = async () => {
    if (chainId !== REQUIRED_CHAIN_ID) {
      try {
        await switchChain({ chainId: REQUIRED_CHAIN_ID });
      } catch (e) {
        console.error("Failed to switch network:", e);
        throw new Error("Please switch to the correct network");
      }
    }
  };

  const { data: currentGlobalCount, refetch: refetchGlobalCount } =
    useReadContract({
      address: STRESS_CONTRACT_ADDRESS,
      abi: STRESS_CONTRACT_ABI,
      functionName: "getGlobalStressCount",
    });

  const { data: currentUserStats, refetch: refetchUserStats } = useReadContract(
    {
      address: STRESS_CONTRACT_ADDRESS,
      abi: STRESS_CONTRACT_ABI,
      functionName: "getUserStats",
      args: address ? [address] : undefined,
      enabled: Boolean(address),
    }
  );

  const { data: currentTopStressers, refetch: refetchTopStressers } =
    useReadContract({
      address: STRESS_CONTRACT_ADDRESS,
      abi: STRESS_CONTRACT_ABI,
      functionName: "getTopStressers",
    });

  useEffect(() => {
    if (currentGlobalCount) setGlobalStressCount(currentGlobalCount);
    if (currentUserStats) setUserStats(currentUserStats as UserStats);
    if (currentTopStressers)
      setTopStressers(currentTopStressers as TopStresser[]);
  }, [currentGlobalCount, currentUserStats, currentTopStressers]);

  useEffect(() => {
    const interval = setInterval(() => {
      refetchGlobalCount();
      if (address) refetchUserStats();
      refetchTopStressers();
    }, 2000);
    return () => clearInterval(interval);
  }, [refetchGlobalCount, refetchUserStats, refetchTopStressers, address]);

  useWatchContractEvent({
    address: STRESS_CONTRACT_ADDRESS,
    abi: STRESS_CONTRACT_ABI,
    eventName: "StressIncremented",
    listener(logs) {
      const {
        user,
        userCount,
        newGlobalCount,
        remainingAllowance,
        approvedStressCount,
      } = logs[0].args;

      setGlobalStressCount(newGlobalCount);

      if (user === address) {
        setUserStats((prev) => ({
          ...prev!,
          stressCount: userCount,
          remainingAllowance,
          approvedStressCount,
        }));
      }
      refetchTopStressers();
    },
  });

  const { writeContract } = useWriteContract();

  const approveAndExecuteStress = async (count: number = selectedCount) => {
    if (!isConnected) {
      connect({ connector: connectors[1] });
      return;
    }

    try {
      setIsLoading(true);
      await checkAndSwitchNetwork();

      const approvalAmount = BigInt(count);

      await writeContract({
        address: STRESS_CONTRACT_ADDRESS,
        abi: STRESS_CONTRACT_ABI,
        functionName: "approveAndExecuteStress",
        args: [approvalAmount],
        value: STRESS_COST * approvalAmount,
      });
    } catch (e) {
      console.error("approveAndExecuteStress error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    approveAndExecuteStress,

    globalStressCount: Number(globalStressCount),
    userStats,
    topStressers,
    isLoading,

    selectedCount,
    setSelectedCount,
  };
}
