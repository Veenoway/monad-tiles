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
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";

type TopStresser = {
  user: string;
  count: bigint;
};

type UserStats = {
  stressCount: bigint;
  lastStressTime: bigint;
};

export function useEnhancedStressTest() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const REQUIRED_CHAIN_ID = 20143;
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [globalStressCount, setGlobalStressCount] = useState<bigint>(BigInt(0));
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [topStressers, setTopStressers] = useState<TopStresser[]>([]);

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
      args: [address],
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
    onLogs(logs) {
      const { user, userCount, newGlobalCount } = logs[0].args;
      setGlobalStressCount(newGlobalCount);

      refetchGlobalCount();
      if (user === address) {
        refetchUserStats();
      }
      refetchTopStressers();
    },
  });

  useEffect(() => {
    if (currentGlobalCount) {
      setGlobalStressCount(currentGlobalCount);
    }
    if (currentUserStats) {
      setUserStats(currentUserStats as UserStats);
    }
    if (currentTopStressers) {
      setTopStressers(currentTopStressers as TopStresser[]);
    }
  }, [currentGlobalCount, currentUserStats, currentTopStressers]);

  const { writeContract, data: hash } = useWriteContract();

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
    onSuccess: () => {
      refetchGlobalCount();
      refetchUserStats();
      refetchTopStressers();
    },
  });

  const stressChain = async (times: number = 1) => {
    if (!isConnected) {
      connect({ connector: connectors[1] });
      return;
    }

    try {
      await checkAndSwitchNetwork();
      setGlobalStressCount((prev) => prev + BigInt(times));

      if (userStats) {
        setUserStats((prev) => {
          if (!prev) {
            return {
              stressCount: BigInt(times),
              lastStressTime: BigInt(Date.now()),
            };
          }

          return {
            ...prev,
            stressCount: prev.stressCount + BigInt(times),
          };
        });
      }

      const promises = Array(times)
        .fill(0)
        .map(() =>
          writeContract({
            address: STRESS_CONTRACT_ADDRESS,
            abi: STRESS_CONTRACT_ABI,
            functionName: "stress",
          })
        );

      await Promise.all(promises);
    } catch (e) {
      setGlobalStressCount((prev) => prev - BigInt(times));

      if (userStats) {
        setUserStats((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            stressCount: prev.stressCount - BigInt(times),
          };
        });
      }

      console.error("Stress Error:", e);
      throw e;
    }
  };

  return {
    stressChain,
    globalStressCount: Number(globalStressCount),
    userStats: userStats
      ? {
          stressCount: Number(userStats.stressCount),
          lastStressTime: Number(userStats.lastStressTime),
        }
      : null,
    topStressers: topStressers.map((stresser) => ({
      user: stresser.user,
      count: Number(stresser.count),
    })),
    isLoading,
    isSuccess,
  };
}
