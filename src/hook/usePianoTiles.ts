import {
  PIANO_CONTRACT_ABI,
  PIANO_CONTRACT_ADDRESS,
} from "@/constant/pianoTiles";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";

type UsePianoRelayReturn = {
  click: (playerAddress: string) => Promise<void>;
  submitScore: (score: number) => Promise<void>;
  leaderboard: unknown | [string[], number[], number[]];
  currentGlobalCount: unknown | [string, number, number];
  isLoading: boolean;
  error: string | null;
  txHashes: string[];
};

export function usePianoRelay(): UsePianoRelayReturn {
  const { address } = useAccount();

  const { data: currentGlobalCount, refetch: refetchGlobalCount } =
    useReadContract({
      address: PIANO_CONTRACT_ADDRESS,
      abi: PIANO_CONTRACT_ABI,
      functionName: "players",
      args: address ? [address] : undefined,
    });

  const { data: leaderboard, refetch: fetchLeaderboard } = useReadContract({
    address: PIANO_CONTRACT_ADDRESS,
    abi: PIANO_CONTRACT_ABI,
    functionName: "getLeaderboard",
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [txHashes, setTxHashes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

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
        refetchGlobalCount();
        fetchLeaderboard();
      }
    },
    [refetchGlobalCount, fetchLeaderboard]
  );

  const submitScore = useCallback(
    async (score: number) => {
      if (!address) return;
      setIsLoading(true);
      setError(null);
      try {
        console.log("score: hook: ", score);
        const response = await fetch("/api/relay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerAddress: address,
            action: "submitScore",
            score,
          }),
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
        refetchGlobalCount();
        fetchLeaderboard();
      }
    },
    [address, refetchGlobalCount, fetchLeaderboard]
  );

  useEffect(() => {
    if (txHashes.length > 0) {
      console.log("Transactions effectuées :", txHashes);
    }
  }, [txHashes]);

  return {
    click,
    submitScore,
    leaderboard,
    currentGlobalCount,
    isLoading,
    error,
    txHashes,
  };
}
