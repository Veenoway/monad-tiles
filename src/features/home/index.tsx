"use client";
import PianoTilesGame from "@/components/music";
import { useFrame } from "@/lib/farcaster/provider";
import { useEffect, useState } from "react";

export const Home = () => {
  const { actions, isSDKLoaded } = useFrame();
  const [isGameLoaded, setIsGameLoaded] = useState(false);

  // Gérer le chargement initial
  useEffect(() => {
    const loadGame = async () => {
      try {
        // Attendre que le SDK soit chargé
        if (!isSDKLoaded || !actions) return;

        console.log("SDK loaded, waiting for game to be ready...");

        // Attendre que le jeu soit chargé
        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log("Game is loaded, calling ready()");

        // Appeler ready() avec les options appropriées
        await actions.ready({
          disableNativeGestures: true,
          // Désactiver les gestes natifs pour éviter les conflits
          // avec les interactions du jeu
        });

        console.log("ready() called successfully");
        setIsGameLoaded(true);
      } catch (error) {
        console.error("Error during initialization:", error);
      }
    };

    loadGame();
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
