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

interface FrameContextValue {
  context: FrameContext | null;
  isSDKLoaded: boolean;
  isEthProviderAvailable: boolean;
  error: string | null;
  actions: typeof sdk.actions | null;
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
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeSDK = async () => {
      if (!mounted) return;

      try {
        console.log(
          "Initializing Farcaster SDK... (Attempt",
          retryCount + 1,
          "of",
          MAX_RETRIES,
          ")"
        );

        // Vérifier si le SDK est disponible
        if (!sdk) {
          throw new Error("Farcaster SDK not available");
        }

        // Initialiser le SDK avec un timeout
        const initPromise = new Promise<void>((resolve, reject) => {
          timeoutId = setTimeout(
            () => reject(new Error("SDK initialization timeout")),
            5000
          );

          // Essayer d'obtenir le contexte
          sdk.context
            .then((ctx) => {
              if (!ctx) {
                reject(new Error("No context available"));
                return;
              }
              if (mounted) {
                setContext(ctx as FrameContext);
                setActions(sdk.actions);
                setIsEthProviderAvailable(!!sdk.wallet.ethProvider);
                console.log("SDK context received:", ctx);
              }
              resolve();
            })
            .catch((err) => {
              console.error("Error getting SDK context:", err);
              reject(err);
            });
        });

        await initPromise;
        clearTimeout(timeoutId);

        // Marquer le SDK comme chargé sans appeler ready()
        if (mounted) {
          setIsSDKLoaded(true);
        }
      } catch (err) {
        console.error("SDK initialization error:", err);
        if (mounted) {
          if (retryCount < MAX_RETRIES - 1) {
            console.log("Retrying SDK initialization...");
            setRetryCount((prev) => prev + 1);
            // Attendre 1 seconde avant de réessayer
            await new Promise((resolve) => setTimeout(resolve, 1000));
            initializeSDK();
          } else {
            setError(
              err instanceof Error ? err.message : "Failed to initialize SDK"
            );
            setIsSDKLoaded(true); // Marquer comme chargé même en cas d'erreur
          }
        }
      }
    };

    // Démarrer l'initialisation
    if (!isSDKLoaded) {
      console.log("Starting SDK initialization...");
      initializeSDK();
    }

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [isSDKLoaded, retryCount]);

  const value = {
    context,
    actions,
    isSDKLoaded,
    isEthProviderAvailable,
    error,
  };

  return (
    <FrameProviderContext.Provider value={value}>
      <FrameWalletProvider>{children}</FrameWalletProvider>
    </FrameProviderContext.Provider>
  );
}
