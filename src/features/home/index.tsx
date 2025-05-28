"use client";
import { FarcasterRedirect } from "@/components/farcaster-redirect";
import PianoTilesGame from "@/components/music";
import { useFrame } from "@/lib/farcaster/provider";
import { useEffect, useState } from "react";

export const Home = () => {
  const { actions, isSDKLoaded } = useFrame();
  const [isContentReady, setIsContentReady] = useState(false);

  useEffect(() => {
    if (isSDKLoaded && actions && isContentReady) {
      // Appeler ready() avec disableNativeGestures pour éviter les conflits de gestes
      actions.ready({ disableNativeGestures: true }).catch(console.error);
    }
  }, [isSDKLoaded, actions, isContentReady]);

  // Marquer le contenu comme prêt une fois que tout est chargé
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsContentReady(true);
    }, 1000); // Attendre 1 seconde pour s'assurer que tout est chargé

    return () => clearTimeout(timer);
  }, []);

  return (
    <main
      className="w-screen  min-h-screen pb-[100px] font-montserrat"
      style={{
        background: "url('/background/bg-site.jpg')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        fontFamily: "Boogaloo",
      }}
    >
      <FarcasterRedirect />
      <div className="w-full sm:w-[95%] mx-auto lg:pt-10 gap-8">
        {/* <div className="absolute right-5 top-5 hidden lg:flex">
          <WalletConnection />
        </div> */}
        <div className="w-full mx-auto">
          <PianoTilesGame />
        </div>
        {/* <div className="flex lg:hidden items-center justify-center mt-5">
          <WalletConnection />
        </div>{" "} */}
        {/* <FarcasterActions /> */}
      </div>
    </main>
  );
};
