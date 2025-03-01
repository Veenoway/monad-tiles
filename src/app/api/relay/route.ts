import {
  PIANO_CONTRACT_ABI as CONTRACT_ABI,
  PIANO_CONTRACT_ADDRESS as CONTRACT_ADDRESS,
} from "@/constant/pianoTiles";
import { NextResponse } from "next/server";
import { Chain, createWalletClient, getContract, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const RELAYER_PRIVATE_KEYS = (process.env.RELAYER_PKS || "")
  .split(",")
  .map((pk) => (pk.startsWith("0x") ? pk : `0x${pk}`) as `0x${string}`);

if (RELAYER_PRIVATE_KEYS.length === 0) {
  throw new Error("No relayer private keys configured");
}

const RPC_URL =
  "https://testnet-rpc2.monad.xyz/52227f026fa8fac9e2014c58fbf5643369b3bfc6";
const CHAIN_ID = 10143;

type RelayerState = {
  currentNonce: number | null;
  processing: boolean;
  queue: QueueItem[];
};

const relayers = new Map<string, RelayerState>();
RELAYER_PRIVATE_KEYS.forEach((pk) => {
  relayers.set(pk, {
    currentNonce: null,
    processing: false,
    queue: [],
  });
});

interface QueueItem {
  playerAddress: string;
  action: string;
  score?: number;
  resolve: (txHash: string) => void;
  reject: (error: { message: string }) => void;
}

type TransactionError = {
  message: string;
  code?: string | number;
};

function isInsufficientFundsError(error: TransactionError): boolean {
  return (
    error.message.includes("insufficient funds") ||
    error.message.includes("insufficient balance") ||
    error.code === -32000
  );
}

async function processTransaction(
  relayerPk: `0x${string}`,
  playerAddress: string,
  action: string,
  score?: number,
  retriedRelayers: Set<string> = new Set()
): Promise<string> {
  const relayer = relayers.get(relayerPk)!;
  const account = privateKeyToAccount(relayerPk);

  const fastTransport = http(RPC_URL, {
    timeout: 10000,
    fetchOptions: {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    },
  });

  const walletClient = createWalletClient({
    account,
    chain: { id: CHAIN_ID } as Chain,
    transport: fastTransport,
  });

  const contract = getContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    client: walletClient,
  });

  if (relayer.currentNonce === null) {
    try {
      const nonceHex = await walletClient.request({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        method: "eth_getTransactionCount",
        params: [account.address, "pending"],
      });
      relayer.currentNonce = parseInt(String(nonceHex), 16);
    } catch (error) {
      console.error("Failed to get nonce:", error);
      relayer.currentNonce = 0;
    }
  }

  const txOptions = { nonce: relayer.currentNonce };
  relayer.currentNonce++;

  try {
    if (action === "click") {
      return await contract.write.click(
        [playerAddress as `0x${string}`],
        txOptions
      );
    } else if (action === "submitScore") {
      if (typeof score !== "number") {
        throw new Error(
          "Invalid or missing 'score' parameter for submitScore action."
        );
      }
      return await contract.write.submitScore(
        [score, playerAddress as `0x${string}`],
        txOptions
      );
    }
    throw new Error("Invalid action");
  } catch (error) {
    const txError = error as TransactionError;

    if (isInsufficientFundsError(txError)) {
      retriedRelayers.add(relayerPk);

      const availableRelayer = Array.from(relayers.keys()).find(
        (pk) => !retriedRelayers.has(pk)
      );

      if (availableRelayer) {
        console.log(
          `Relayer ${relayerPk} out of funds, switching to ${availableRelayer}`
        );
        return processTransaction(
          availableRelayer as `0x${string}`,
          playerAddress,
          action,
          score,
          retriedRelayers
        );
      }

      throw new Error("All relayers are out of funds");
    }

    if (txError.message?.includes("Nonce too low")) {
      const nonceHex = await walletClient.request({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        method: "eth_getTransactionCount",
        params: [account.address, "pending"],
      });
      relayer.currentNonce = parseInt(String(nonceHex), 16);
      const newTxOptions = { nonce: relayer.currentNonce };
      relayer.currentNonce++;

      if (action === "click") {
        return await contract.write.click(
          [playerAddress as `0x${string}`],
          newTxOptions
        );
      } else if (action === "submitScore") {
        return await contract.write.submitScore(
          [score, playerAddress as `0x${string}`],
          newTxOptions
        );
      }
    }
    throw error;
  }
}

async function processRelayerQueue(relayerPk: `0x${string}`) {
  const relayer = relayers.get(relayerPk)!;
  if (relayer.processing) return;

  relayer.processing = true;

  const batchSize = 3;

  while (relayer.queue.length > 0) {
    const batch = relayer.queue.splice(0, batchSize);

    await Promise.all(
      batch.map(async (item) => {
        try {
          const txHash = await processTransaction(
            relayerPk,
            item.playerAddress,
            item.action,
            item.score,
            new Set()
          );
          item.resolve(txHash);
        } catch (error) {
          if ((error as Error).message === "All relayers are out of funds") {
            console.error("Critical: All relayers are out of funds");
          }
          item.reject(error as { message: string });
        }
      })
    );
  }

  relayer.processing = false;
}

export async function POST(req: Request) {
  try {
    const { playerAddress, action, score, relayerIndex = 0 } = await req.json();
    if (!playerAddress || !action) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const relayerKeys = Array.from(relayers.keys());

    let selectedRelayer: string;

    if (relayerIndex !== undefined) {
      selectedRelayer = relayerKeys[relayerIndex % relayerKeys.length];
    } else {
      selectedRelayer = Array.from(relayers.entries()).reduce(
        (min, [pk, state]) => {
          return state.queue.length < min[1].queue.length ? [pk, state] : min;
        },
        [relayerKeys[0], relayers.get(relayerKeys[0])!]
      )[0];
    }

    relayers.get(selectedRelayer)!.queue.push({
      playerAddress,
      action,
      score,
      resolve: () => {},
      reject: (error) => console.error("Background processing error:", error),
    });

    setTimeout(() => processRelayerQueue(selectedRelayer as `0x${string}`), 0);

    return NextResponse.json({
      success: true,
      message: `${action} request queued on relayer ${selectedRelayer.slice(
        0,
        6
      )}...`,
      relayerUsed: selectedRelayer.slice(0, 6) + "...",
    });
  } catch (error) {
    console.error("Relayer error:", error);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
