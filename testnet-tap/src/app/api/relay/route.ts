// app/api/relay/route.ts
import {
  PIANO_CONTRACT_ABI,
  PIANO_CONTRACT_ADDRESS,
} from "@/constant/pianoTiles";
import { NextResponse } from "next/server";
import { Chain, createWalletClient, getContract, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const RELAYER_PRIVATE_KEY =
  "0x1dcf6bcbc3557478e456c215e7c51f836cd41ca65b59f152c80694e7edebb49a";
const RPC_URL =
  "https://rpc-devnet.monadinfra.com/rpc/3fe540e310bbb6ef0b9f16cd23073b0a";
const CHAIN_ID = 20143;

if (!RELAYER_PRIVATE_KEY || !RPC_URL || !PIANO_CONTRACT_ADDRESS) {
  throw new Error("Relayer configuration missing in environment variables");
}

const transport = http(RPC_URL);

/* --- Gestion du nonce et de la file d'attente --- */
let currentNonce: number | null = null;

interface QueueItem {
  playerAddress: string;
  action: string;
  score?: number;
  resolve: (txHash: string) => void;
  reject: (error: any) => void;
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
    address: PIANO_CONTRACT_ADDRESS,
    abi: PIANO_CONTRACT_ABI,
    client: walletClient,
  });

  if (currentNonce === null) {
    const nonceHex = await walletClient.request({
      method: "eth_getTransactionCount",
      params: [account.address, "latest"],
    });
    currentNonce = parseInt(nonceHex, 16);
  }
  const txOptions = { nonce: currentNonce };
  currentNonce++;

  let txHash: string;
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
      item.reject(error);
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
