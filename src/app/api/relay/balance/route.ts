import { NextResponse } from "next/server";
import { Chain, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const RELAYER_PRIVATE_KEYS = (process.env.RELAYER_PKS || "")
  .split(",")
  .map((pk) => (pk.startsWith("0x") ? pk : `0x${pk}`) as `0x${string}`);

const RPC_URL =
  "https://testnet-rpc2.monad.xyz/52227f026fa8fac9e2014c58fbf5643369b3bfc6";
const CHAIN_ID = 10143;

export async function GET() {
  try {
    const balances = [];

    for (const relayerPk of RELAYER_PRIVATE_KEYS) {
      try {
        const account = privateKeyToAccount(relayerPk);
        const transport = http(RPC_URL);

        const publicClient = createPublicClient({
          chain: { id: CHAIN_ID } as Chain,
          transport,
        });

        const balance = await publicClient.getBalance({
          address: account.address,
        });

        // Convertir en format lisible (MONAD)
        const balanceInMonad = Number(balance) / 1e18;

        balances.push({
          address: account.address,
          balance: balanceInMonad,
          lowBalance: balanceInMonad < 0.01,
        });
      } catch (error) {
        console.error(`Failed to get balance for relayer`, error);
      }
    }

    return NextResponse.json({ balances });
  } catch (error) {
    console.error("Error checking balances:", error);
    return NextResponse.json(
      { error: "Failed to check balances" },
      { status: 500 }
    );
  }
}
