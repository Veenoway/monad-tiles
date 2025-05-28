"use client";
import PianoTilesGame from "@/components/music";
import { useFrame } from "@/lib/farcaster/provider";
import { useEffect } from "react";

export const Home = () => {
  const { actions, isSDKLoaded } = useFrame();

  useEffect(() => {
    const initializeApp = async () => {
      if (!isSDKLoaded || !actions) {
        console.log("Waiting for SDK to load...");
        return;
      }

      try {
        console.log("SDK loaded, initializing app...");

        // Attendre que le contenu soit chargé
        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log("Content loaded, calling ready()");
        await actions.ready({ disableNativeGestures: true });
        console.log("ready() called successfully");
      } catch (error) {
        console.error("Error during app initialization:", error);
      }
    };

    initializeApp();
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
