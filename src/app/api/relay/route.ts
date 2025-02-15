import {
  PIANO_CONTRACT_ABI as CONTRACT_ABI,
  PIANO_CONTRACT_ADDRESS as CONTRACT_ADDRESS,
} from "@/constant/pianoTiles";
import { NextResponse } from "next/server";
import { Chain, createWalletClient, getContract, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const RELAYER_PRIVATE_KEY =
  "0x1dcf6bcbc3557478e456c215e7c51f836cd41ca65b59f152c80694e7edebb49a";
const RPC_URL =
  "https://testnet-rpc2.monad.xyz/52227f026fa8fac9e2014c58fbf5643369b3bfc6";
const CHAIN_ID = 10143;

if (!RELAYER_PRIVATE_KEY || !RPC_URL || !CONTRACT_ADDRESS) {
  throw new Error("Relayer configuration missing in environment variables");
}

const transport = http(RPC_URL);

let currentNonce: number | null = null;

interface QueueItem {
  playerAddress: string;
  action: string;
  score?: number;
  resolve: (txHash: string) => void;
  reject: (error: { message: string }) => void;
}

const transactionQueue: QueueItem[] = [];
let processing = false;

async function processTransaction(
  playerAddress: string,
  action: string,
  score?: number
): Promise<string> {
  const account = privateKeyToAccount(
    RELAYER_PRIVATE_KEY.startsWith("0x")
      ? RELAYER_PRIVATE_KEY
      : `0x${RELAYER_PRIVATE_KEY}`
  );

  const walletClient = createWalletClient({
    account,
    chain: { id: CHAIN_ID } as Chain,
    transport,
  });

  const contract = getContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    client: walletClient,
  });

  if (currentNonce === null) {
    const nonceHex = await walletClient.request({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      method: "eth_getTransactionCount",
      params: [account.address, "pending"],
    });
    currentNonce = parseInt(String(nonceHex), 16);
  }
  const txOptions = { nonce: currentNonce };
  currentNonce++;

  let txHash: string;
  try {
    if (action === "click") {
      txHash = await contract.write.click([playerAddress], txOptions);
    } else if (action === "submitScore") {
      if (typeof score !== "number") {
        throw new Error(
          "Invalid or missing 'score' parameter for submitScore action."
        );
      }
      txHash = await contract.write.submitScore(
        [score, playerAddress],
        txOptions
      );
    } else {
      throw new Error(
        "Invalid action. Supported actions: 'click', 'submitScore'."
      );
    }
  } catch (error) {
    if (
      (error as { message: string }).message &&
      (error as { message: string }).message.includes("Nonce too low")
    ) {
      const nonceHex = await walletClient.request({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        method: "eth_getTransactionCount",
        params: [account.address, "pending"],
      });
      currentNonce = parseInt(String(nonceHex), 16);
      const newTxOptions = { nonce: currentNonce };
      currentNonce++;
      if (action === "click") {
        txHash = await contract.write.click([playerAddress], newTxOptions);
      } else if (action === "submitScore") {
        txHash = await contract.write.submitScore(
          [score, playerAddress],
          newTxOptions
        );
      } else {
        throw new Error("Invalid action on retry.");
      }
    } else {
      throw error;
    }
  }
  return txHash;
}

async function processQueue() {
  if (processing) return;
  processing = true;
  while (transactionQueue.length > 0) {
    const item = transactionQueue.shift()!;
    try {
      const txHash = await processTransaction(
        item.playerAddress,
        item.action,
        item.score
      );
      item.resolve(txHash);
    } catch (error) {
      item.reject(error as unknown as never);
    }
  }
  processing = false;
}

export async function POST(req: Request) {
  try {
    const { playerAddress, action, score } = await req.json();
    if (!playerAddress || !action) {
      return NextResponse.json(
        {
          error: "Invalid request. 'playerAddress' and 'action' are required.",
        },
        { status: 400 }
      );
    }
    const txPromise = new Promise<string>((resolve, reject) => {
      transactionQueue.push({ playerAddress, action, score, resolve, reject });
    });
    processQueue();
    const txHash = await txPromise;
    return NextResponse.json({
      success: true,
      txHash,
    });
  } catch (error) {
    console.error("Relayer error:", error);
    return NextResponse.json({ error: "Transaction failed" }, { status: 500 });
  }
}
