import {
  PIANO_CONTRACT_ABI,
  PIANO_CONTRACT_ADDRESS,
} from "@/constant/pianoTiles";
import { useCallback, useMemo, useState } from "react";
import { useAccount, useReadContract } from "wagmi";

type PlayerStats = {
  address: string;
  clickCount: bigint;
  lastScore: bigint;
  bestScore: bigint;
};

type LeaderboardEntry = [string, number, number];

type UsePianoRelayReturn = {
  click: (playerAddress: string) => Promise<void>;
  submitScore: (score: number) => Promise<void>;
  playerStats: PlayerStats[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  currentGlobalCount: unknown | [bigint, bigint, bigint, boolean];
  isLoading: boolean;
  error: string | null;
  txHashes: string[];
  userRank: bigint;
  setPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  canGoToNextPage: boolean;
  canGoToPreviousPage: boolean;
  leaderboardFormatted: LeaderboardEntry[] | undefined;
};

export function usePianoRelay(): UsePianoRelayReturn {
  const { address } = useAccount();
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

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
        gcTime: 5000,
        placeholderData: "previousData",
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
        enabled: true,
        refetchInterval: 5000,
      },
    });

  const { data: userRank } = useReadContract({
    address: PIANO_CONTRACT_ADDRESS,
    abi: PIANO_CONTRACT_ABI,
    functionName: "getRank",
    args: [address],
    query: {
      enabled: true,
      refetchInterval: 5000,
    },
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [txHashes, setTxHashes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const formattedPlayerStats: PlayerStats[] = useMemo(() => {
    if (!leaderboardData || !Array.isArray(leaderboardData[0])) return [];

    return (leaderboardData[0] as string[]).map((address, index) => ({
      address,
      lastScore: (leaderboardData[1] as bigint[])[index],
      bestScore: (leaderboardData[2] as bigint[])[index],
      clickCount: BigInt(0),
    }));
  }, [leaderboardData]);

  const setPage = useCallback(
    (page: number) => {
      if (page >= 0 && page < totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  const click = useCallback(
    async (playerAddress: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/relay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerAddress, action: "click" }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Transaction failed");
        }
        setTxHashes((prev) => [...prev, data.txHash]);
      } catch (e) {
        setError((e as { message: string }).message);
      } finally {
        setIsLoading(false);
        refetchLeaderboard();
      }
    },
    [refetchLeaderboard]
  );

  const submitScore = useCallback(
    async (score: number) => {
      if (!address) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/relay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "submitScore",
            score: Math.floor(score),
            playerAddress: address,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Transaction failed");
        }
        setTxHashes((prev) => [...prev, data.txHash]);

        await refetchLeaderboard();
        await refetchGlobalCount();
      } catch (e) {
        console.error("Submit score error:", e);
        setError((e as { message: string }).message);
      } finally {
        setIsLoading(false);
      }
    },
    [address, refetchLeaderboard, refetchGlobalCount]
  );

  console.log("leaderboard", leaderboardData);

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
    click,
    submitScore,
    playerStats: formattedPlayerStats,
    currentPage,
    totalPages,
    pageSize,
    currentGlobalCount,
    isLoading,
    error,
    txHashes,
    userRank: userRank as bigint,
    setPage,
    goToNextPage,
    goToPreviousPage,
    canGoToNextPage,
    canGoToPreviousPage,
    leaderboardFormatted,
  };
}
