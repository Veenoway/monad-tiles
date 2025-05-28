"use client";

import { useFrame } from "@/lib/farcaster/provider";
import { useEffect, useState } from "react";

export function FarcasterRedirect() {
  const { context, isSDKLoaded } = useFrame();
  const [isWarpcast, setIsWarpcast] = useState(false);

  useEffect(() => {
    // Vérifier si nous sommes dans Warpcast
    const checkWarpcast = () => {
      const isInWarpcast =
        window.location.href.includes("warpcast.com") ||
        window.location.href.includes("warpcast.app") ||
        window.navigator.userAgent.includes("Warpcast");
      setIsWarpcast(isInWarpcast);
    };

    checkWarpcast();
  }, []);

  // Si nous sommes dans Warpcast ou si le SDK est chargé, ne rien afficher
  if (isWarpcast || context || !isSDKLoaded) {
    return null;
  }

  const handleClick = () => {
    window.open("https://warpcast.com", "_blank");
  };

  return (
    <div
      className="fixed inset-0 bg-[rgba(11,4,51,0.95)] flex items-center justify-center z-[9999] cursor-pointer"
      onClick={handleClick}
    >
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          Ouvrir dans Warpcast
        </h1>
        <p className="text-xl text-white mb-8">
          Cliquez n&apos;importe où pour ouvrir l&apos;application dans Warpcast
        </p>
      </div>
    </div>
  );
}
