"use client";
import PianoTilesGame from "@/components/music";
import { useFrame } from "@/lib/farcaster/provider";
import { useEffect, useState } from "react";

export const Home = () => {
  const { actions, isSDKLoaded } = useFrame();
  const [isGameLoaded, setIsGameLoaded] = useState(false);

  useEffect(() => {
    if (isSDKLoaded && actions && isGameLoaded) {
      console.log("Calling ready() with disableNativeGestures");
      actions.ready({ disableNativeGestures: true }).catch(console.error);
    }
  }, [isSDKLoaded, actions, isGameLoaded]);

  // Marquer le jeu comme chargé après un court délai
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("Game is loaded");
      setIsGameLoaded(true);
    }, 2000); // Attendre 2 secondes pour s'assurer que tout est chargé

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
