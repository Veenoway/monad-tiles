"use client";

import { FrameContext } from "@farcaster/frame-core/dist/context";
import sdk from "@farcaster/frame-sdk";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import FrameWalletProvider from "./frame";
import { DebugLog } from "./types";

// Déclaration du type pour farcasterDebug
declare global {
  interface Window {
    farcasterDebug: DebugLog[];
  }
}

// Fonction de debug
const debug = (message: string, data?: unknown) => {
  // Log dans la console
  console.warn(`[FARCASTER DEBUG] ${message}`, data || "");

  // Stocker dans window pour debug
  if (typeof window !== "undefined") {
    window.farcasterDebug = window.farcasterDebug || [];
    window.farcasterDebug.push({
      timestamp: new Date().toISOString(),
      message,
      data,
    } as DebugLog);
  }
};

interface FrameContextValue {
  context: FrameContext | null;
  isSDKLoaded: boolean;
  isEthProviderAvailable: boolean;
  error: string | null;
  actions: typeof sdk.actions | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ethProvider: any | null;
}

const FrameProviderContext = createContext<FrameContextValue | undefined>(
  undefined
);

export function useFrame() {
  const context = useContext(FrameProviderContext);
  if (context === undefined) {
    throw new Error("useFrame must be used within a FrameProvider");
  }
  return context;
}

interface FrameProviderProps {
  children: ReactNode;
}

export function FrameProvider({ children }: FrameProviderProps) {
  const [context, setContext] = useState<FrameContext | null>(null);
  const [actions, setActions] = useState<typeof sdk.actions | null>(null);
  const [isEthProviderAvailable, setIsEthProviderAvailable] =
    useState<boolean>(false);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ethProvider, setEthProvider] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      debug("🚀 Starting SDK initialization");
      debug("🌐 Current URL", window.location.href);
      debug("👤 User Agent", window.navigator.userAgent);

      try {
        debug("📦 Waiting for SDK context...");
        const context = await sdk.context;
        console.log("context", context);
        console.log("sdk.wallet.ethProvider", sdk.wallet);
        if (context) {
          debug("✅ SDK context received", context);
          setContext(context as FrameContext);
          setActions(sdk.actions);
          setIsEthProviderAvailable(sdk.wallet.ethProvider ? true : false);
          debug("🔧 Actions available", !!sdk.actions);
          debug("💰 ETH Provider available", !!sdk.wallet.ethProvider);
        } else if (sdk.wallet.ethProvider) {
          setEthProvider(sdk.wallet.ethProvider);
          setIsEthProviderAvailable(true);
        } else {
          const error = "Failed to load Farcaster context";
          debug("❌ " + error);
          setError(error);
        }

        debug("🎮 Calling ready()...");
        await sdk.actions.ready();
        debug("✨ ready() called successfully");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to initialize SDK";
        debug("❌ SDK initialization error", err);
        setError(errorMessage);
      }
    };

    if (sdk && !isSDKLoaded) {
      load().then(() => {
        setIsSDKLoaded(true);
        debug("✅ SDK loaded and initialized");
      });
    }
  }, [isSDKLoaded]);

  return (
    <FrameProviderContext.Provider
      value={{
        context,
        actions,
        isSDKLoaded,
        isEthProviderAvailable,
        error,
        ethProvider,
      }}
    >
      <FrameWalletProvider>{children}</FrameWalletProvider>
    </FrameProviderContext.Provider>
  );
}
