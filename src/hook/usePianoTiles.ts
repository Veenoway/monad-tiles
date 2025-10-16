/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  PIANO_CONTRACT_ABI,
  PIANO_CONTRACT_ADDRESS,
} from "@/constant/pianoTiles";
import {
  isSmartAccountDeployed,
  sendUserOperation,
} from "@/lib/metamask/transactions";
import { useCallback, useMemo, useState } from "react";
import { encodeFunctionData } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { useSmartAccount } from "./useSmartAccount";

type PlayerStats = {
  address: string;
  clickCount: bigint;
  lastScore: bigint;
  bestScore: bigint;
};

type LeaderboardEntry = [string, number, number];

export function usePianoGasless() {
  const { address } = useAccount();
  const { smartAccount, smartAccountAddress } = useSmartAccount();

  const isDeployed = useMemo(() => {
    return isSmartAccountDeployed(smartAccount?.address);
  }, [smartAccount?.address]);

  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [txHashes, setTxHashes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Compteurs locaux pendant le jeu
  const [localClicks, setLocalClicks] = useState(0);
  const [localScore, setLocalScore] = useState(0);

  const pageSize = 10;

  // ===================================
  // Lectures du contrat
  // ===================================

  const { data: totalPlayers } = useReadContract({
    address: PIANO_CONTRACT_ADDRESS,
    abi: PIANO_CONTRACT_ABI,
    functionName: "getTotalPlayers",
  });

  const totalPages = totalPlayers
    ? Math.ceil(Number(totalPlayers) / pageSize)
    : 0;

  const { data: leaderboardData, refetch: refetchLeaderboard } =
    useReadContract({
      address: PIANO_CONTRACT_ADDRESS,
      abi: PIANO_CONTRACT_ABI,
      functionName: "getLeaderboard",
      query: {
        enabled: true,
        refetchInterval: 5000,
        staleTime: 3000,
      },
    }) as {
      data: [string[], bigint[], bigint[]] | undefined;
      refetch: () => void;
    };

  const { data: currentGlobalCount, refetch: refetchGlobalCount } =
    useReadContract({
      address: PIANO_CONTRACT_ADDRESS,
      abi: PIANO_CONTRACT_ABI,
      functionName: "players",
      args: address ? [address] : undefined,
      query: {
        enabled: !!address,
        refetchInterval: 5000,
      },
    });

  const { data: userRank } = useReadContract({
    address: PIANO_CONTRACT_ADDRESS,
    abi: PIANO_CONTRACT_ABI,
    functionName: "getRank",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 5000,
    },
  });

  // ===================================
  // CLICK LOCAL (instant, pas de blockchain)
  // ===================================

  const click = useCallback(() => {
    setLocalClicks((prev) => prev + 1);
    console.log("🎹 Click local");
  }, []);

  // ===================================
  // UPDATE SCORE LOCAL
  // ===================================

  const updateLocalScore = useCallback((newScore: number) => {
    setLocalScore(newScore);
  }, []);

  // ===================================
  // SUBMIT SCORE - Smart Account (UNE signature)
  // ===================================

  const startGameWithGasless = async (address: `0x${string}`) => {
    const callData = encodeFunctionData({
      abi: PIANO_CONTRACT_ABI,
      functionName: "click",
      args: [address as `0x${string}`],
    });

    // Envoyer via Smart Account
    // L'utilisateur signe UNE FOIS ici
    const txHash = await sendUserOperation({
      smartAccount,
      to: PIANO_CONTRACT_ADDRESS,
      value: "0.01",
      data: callData,
    });
    return txHash;
  };

  const payGameFee = useCallback(async () => {
    if (!smartAccount || !isDeployed) {
      setError(
        "⚠️ Smart account non configuré. Allez dans les paramètres pour le configurer."
      );
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("💰 Paiement des frais de jeu via Smart Account");

      const callData = encodeFunctionData({
        abi: PIANO_CONTRACT_ABI,
        functionName: "payGameFee",
        args: [],
      });

      const txHash = await sendUserOperation({
        smartAccount,
        to: PIANO_CONTRACT_ADDRESS,
        value: "0.0001", // Convertit en wei correctement
        data: callData, // Ajoutez le callData ici
      });

      console.log("✅ Frais de jeu payés:", txHash);
      setTxHashes((prev) => [...prev, txHash]);

      return txHash;
    } catch (e: any) {
      console.error("❌ Erreur de paiement:", e);
      setError(e.message || "Erreur lors du paiement des frais");
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [address, smartAccount, isDeployed]);

  // ===================================
  // SUBMIT SCORE - Smart Account (UNE signature)
  // ===================================
  const submitScore = useCallback(
    async (finalScore: number) => {
      if (!smartAccount || !isDeployed) {
        setError(
          "⚠️ Smart account non configuré. Allez dans les paramètres pour le configurer."
        );
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("🎹 Soumission score via Smart Account:", finalScore);

        const callData = encodeFunctionData({
          abi: PIANO_CONTRACT_ABI,
          functionName: "submitScore",
          args: [BigInt(Math.floor(finalScore))],
        });

        const txHash = await sendUserOperation({
          smartAccount,
          to: PIANO_CONTRACT_ADDRESS,
          value: "0",
          data: callData,
        });

        console.log("✅ Score enregistré:", txHash);
        setTxHashes((prev) => [...prev, txHash]);

        setLocalClicks(0);
        setLocalScore(0);

        await refetchLeaderboard();
        await refetchGlobalCount();

        return txHash;
      } catch (e: any) {
        console.error("❌ Submit error:", e);
        setError(e.message || "Erreur lors de la soumission");
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [address, smartAccount, isDeployed, refetchLeaderboard, refetchGlobalCount]
  );

  // ===================================
  // Pagination
  // ===================================

  const setPage = useCallback(
    (page: number) => {
      if (page >= 0 && page < totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  const canGoToNextPage = currentPage < totalPages - 1;
  const canGoToPreviousPage = currentPage > 0;

  const goToNextPage = useCallback(() => {
    if (canGoToNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [canGoToNextPage]);

  const goToPreviousPage = useCallback(() => {
    if (canGoToPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [canGoToPreviousPage]);

  // ===================================
  // Formatage des données
  // ===================================

  const formattedPlayerStats: PlayerStats[] = useMemo(() => {
    if (!leaderboardData || !Array.isArray(leaderboardData[0])) return [];

    return (leaderboardData[0] as string[]).map((address, index) => ({
      address,
      lastScore: (leaderboardData[1] as bigint[])[index],
      bestScore: (leaderboardData[2] as bigint[])[index],
      clickCount: BigInt(0),
    }));
  }, [leaderboardData]);

  const leaderboardFormatted = useMemo(() => {
    if (!leaderboardData || !Array.isArray(leaderboardData[0]))
      return undefined;

    const addresses = leaderboardData[0];
    const scores = leaderboardData[1];
    const txns = leaderboardData[2];

    const finalValues: LeaderboardEntry[] = [];

    if (Array.isArray(addresses)) {
      addresses.forEach((address: string, i: number) => {
        finalValues.push([address, Number(scores[i]), Number(txns[i])]);
      });
    }

    return finalValues;
  }, [leaderboardData]);

  return {
    // Actions de jeu (local)
    click, // Instant
    updateLocalScore, // Instant

    // Action blockchain (une signature)
    submitScore, // Smart Account

    // État
    isLoading,
    error,
    txHashes,

    // Données locales
    localClicks,
    localScore,

    // Smart Account status
    smartAccountReady: !!smartAccount && isDeployed,
    smartAccountAddress,

    // Données blockchain
    playerStats: formattedPlayerStats,
    leaderboardFormatted,
    currentGlobalCount,
    userRank: userRank as bigint,

    // Pagination
    currentPage,
    totalPages,
    pageSize,
    setPage,
    goToNextPage,
    goToPreviousPage,
    canGoToNextPage,
    canGoToPreviousPage,
    startGameWithGasless,
    payGameFee,
  };
}
