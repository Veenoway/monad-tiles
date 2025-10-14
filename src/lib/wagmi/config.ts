import { farcasterFrame as miniAppConnector } from "@farcaster/frame-wagmi-connector";
import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";

export const monadTestnet = {
  id: 10143,
  name: "Monad Testnet",
  network: "monad-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Monad",
    symbol: "MONAD",
  },
  rpcUrls: {
    default: {
      http: [
        "https://monad-testnet.blockvision.org/v1/31Ihx9ZHjswZZld678DwIAer7H9",
      ],
    },
    public: {
      http: [
        "https://monad-testnet.blockvision.org/v1/31Ihx9ZHjswZZld678DwIAer7H9",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: "https://explorer.testnet.monad.xyz",
    },
  },
} as const;

export const config = createConfig({
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http(),
  },
  connectors: [
    miniAppConnector(),
    injected({
      shimDisconnect: true,
      target: "metaMask",
    }),
  ],
});

export const METAMASK_DELEGATOR_CONTRACT =
  "0x63c0c19a282a1b52b07dd5a65b58948a07dae32b";
