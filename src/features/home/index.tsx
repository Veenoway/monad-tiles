"use client";
import { FarcasterActions } from "@/components/actions";
import { useFrame } from "@/lib/farcaster/provider";
import { DebugLog } from "@/lib/farcaster/types";
import { useEffect } from "react";

// Déclaration du type pour farcasterDebug
declare global {
  interface Window {
    farcasterDebug: Array<{
      timestamp: string;
      message: string;
      data?: unknown;
      component?: string;
    }>;
  }
}

// Fonction de debug
const debug = (message: string, data?: unknown) => {
  console.warn(`[HOME DEBUG] ${message}`, data || "");
  if (typeof window !== "undefined") {
    window.farcasterDebug = window.farcasterDebug || [];
    window.farcasterDebug.push({
      timestamp: new Date().toISOString(),
      component: "Home",
      message,
      data,
    } as DebugLog);
  }
};

export const Home = () => {
  const { actions, isSDKLoaded } = useFrame();

  useEffect(() => {
    debug("🔄 Home component mounted");
    debug("📦 SDK Loaded status", isSDKLoaded);
    debug("🔧 Actions available", !!actions);

    if (isSDKLoaded && actions) {
      debug("🎮 Calling ready() from Home component");
      actions
        .ready()
        .then(() => {
          debug("✨ ready() called successfully from Home");
        })
        .catch((error) => {
          debug("❌ Error calling ready()", error);
        });
    }
  }, [isSDKLoaded, actions]);

  return (
    <main
      className="w-screen min-h-screen pb-[100px] font-montserrat"
      style={{
        background: "url('/background/bg-site.jpg')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        fontFamily: "Boogaloo",
      }}
    >
      <div className="w-full sm:w-[95%] mx-auto lg:pt-10 gap-8">
        {/* <div className="absolute right-5 top-5 hidden lg:flex">
          <WalletConnection />
        </div> */}
        {/* <div className="w-full mx-auto">
          <PianoTilesGame />
        </div> */}
        {/* <div className="flex lg:hidden items-center justify-center mt-5">
          <WalletConnection />
        </div>{" "} */}
        <FarcasterActions />
      </div>
    </main>
  );
};
