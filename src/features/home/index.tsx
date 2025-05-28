"use client";
import PianoTilesGame from "@/components/music";
import { useFrame } from "@/lib/farcaster/provider";
import { useEffect } from "react";

export const Home = () => {
  const { actions, isSDKLoaded } = useFrame();

  useEffect(() => {
    if (!isSDKLoaded || !actions) return;

    actions.ready({ disableNativeGestures: true }).catch(console.error);
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
