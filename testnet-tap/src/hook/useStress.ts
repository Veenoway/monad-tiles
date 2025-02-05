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

export function useEnhancedStressTest() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  // Remplace si besoin par la bonne chain
  const REQUIRED_CHAIN_ID = 20143;
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  // Coût par “stress”
  const STRESS_COST = BigInt(16e16);
  // Par défaut, on proposera 10 “stress” si l’utilisateur veut tout payer en une fois
  const BATCH_SIZE = 10;

  // States
  const [globalStressCount, setGlobalStressCount] = useState<bigint>(BigInt(0));
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [topStressers, setTopStressers] = useState<TopStresser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCount, setSelectedCount] = useState(BATCH_SIZE);

  // Vérifie la chaîne et switch si besoin
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

  // READ : Récupère globalStressCount
  const { data: currentGlobalCount, refetch: refetchGlobalCount } =
    useReadContract({
      address: STRESS_CONTRACT_ADDRESS,
      abi: STRESS_CONTRACT_ABI,
      functionName: "getGlobalStressCount",
    });

  // READ : Récupère les stats utilisateur
  const { data: currentUserStats, refetch: refetchUserStats } = useReadContract(
    {
      address: STRESS_CONTRACT_ADDRESS,
      abi: STRESS_CONTRACT_ABI,
      functionName: "getUserStats",
      args: address ? [address] : undefined,
      enabled: Boolean(address),
    }
  );

  // READ : Récupère topStressers
  const { data: currentTopStressers, refetch: refetchTopStressers } =
    useReadContract({
      address: STRESS_CONTRACT_ADDRESS,
      abi: STRESS_CONTRACT_ABI,
      functionName: "getTopStressers",
    });

  // Met à jour nos states quand les reads changent
  useEffect(() => {
    if (currentGlobalCount) setGlobalStressCount(currentGlobalCount);
    if (currentUserStats) setUserStats(currentUserStats as UserStats);
    if (currentTopStressers)
      setTopStressers(currentTopStressers as TopStresser[]);
  }, [currentGlobalCount, currentUserStats, currentTopStressers]);

  // Polling : toutes les 2s, on refresh
  useEffect(() => {
    const interval = setInterval(() => {
      refetchGlobalCount();
      if (address) refetchUserStats();
      refetchTopStressers();
    }, 2000);
    return () => clearInterval(interval);
  }, [refetchGlobalCount, refetchUserStats, refetchTopStressers, address]);

  // Écoute de l'événement StressIncremented
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

      // On met à jour le global
      setGlobalStressCount(newGlobalCount);

      // Si c’est l’utilisateur courant, on met à jour
      if (user === address) {
        setUserStats((prev) => ({
          ...prev!,
          stressCount: userCount,
          remainingAllowance,
          approvedStressCount,
        }));
      }

      // Rafraîchir le classement
      refetchTopStressers();
    },
  });

  // WRITE : wagmi
  const { writeContract } = useWriteContract();

  /**
   * Appelle la fonction "approveAndExecuteStress(count)" de ton SC,
   * qui paie et exécute la boucle 'count' fois en une seule transaction.
   */
  const approveAndExecuteStress = async (count: number = selectedCount) => {
    if (!isConnected) {
      // connecte l'utilisateur si pas déjà fait
      connect({ connector: connectors[1] });
      return;
    }

    try {
      setIsLoading(true);
      await checkAndSwitchNetwork();

      const approvalAmount = BigInt(count);

      // Transaction : on paie STRESS_COST * count en msg.value
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
    // Méthode unique
    approveAndExecuteStress,

    // Données exposées
    globalStressCount: Number(globalStressCount),
    userStats,
    topStressers,
    isLoading,

    // Sélection du batch
    selectedCount,
    setSelectedCount,
  };
}
