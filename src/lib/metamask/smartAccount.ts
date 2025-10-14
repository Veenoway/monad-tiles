import {
  Implementation,
  toMetaMaskSmartAccount,
} from "@metamask/delegation-toolkit";
import { createWalletClient, custom, type Address } from "viem";
import { monadTestnet } from "../wagmi/config";
import { publicClient } from "./config";

export async function createHybridSmartAccount(
  provider: any,
  ownerAddress: Address
) {
  const walletClient = createWalletClient({
    account: ownerAddress, // ← CRITIQUE: Spécifier l'account
    chain: monadTestnet,
    transport: custom(provider),
  });

  const smartAccount = await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Hybrid,
    deployParams: [ownerAddress, [], [], []],
    deploySalt: "0x",
    signer: { walletClient },
  });

  return smartAccount;
}
