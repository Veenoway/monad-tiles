/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Implementation,
  toMetaMaskSmartAccount,
} from "@metamask/delegation-toolkit";
import { toSimpleSmartAccount } from "permissionless/accounts";
import { createWalletClient, custom, type Address } from "viem";
import { monadTestnet } from "../wagmi/config";
import { publicClient } from "./config";

export async function createHybridSmartAccount(
  provider: any,
  ownerAddress: Address
) {
  const isFarcaster = provider.isFarcaster || provider.isFrameProvider;

  const walletClient = createWalletClient({
    account: ownerAddress,
    chain: monadTestnet,
    transport: custom(provider),
  });

  if (isFarcaster) {
    console.log("🟣 Création Smart Account compatible Farcaster...");

    // Utiliser un compte local basé sur le walletClient
    const localAccount = {
      address: ownerAddress,
      async signMessage({ message }: any) {
        return await walletClient.signMessage({
          account: ownerAddress,
          message,
        });
      },
      async signTransaction(tx: any) {
        return await walletClient.signTransaction({
          account: ownerAddress,
          ...tx,
        });
      },
      async signTypedData(params: any) {
        return await walletClient.signTypedData({
          account: ownerAddress,
          ...params,
        });
      },
    };

    const smartAccount = await toSimpleSmartAccount({
      client: publicClient,
      owner: localAccount as any, // Force le type
      entryPoint: {
        address: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
        version: "0.7",
      },
    });

    return smartAccount;
  }

  const smartAccount = await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Hybrid,
    deployParams: [ownerAddress, [], [], []],
    deploySalt: "0x",
    signer: { walletClient },
  });

  return smartAccount;
}
