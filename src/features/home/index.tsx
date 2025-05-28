"use client";
import { FarcasterActions } from "@/components/actions";
import { useFrame } from "@/lib/farcaster/provider";
import { useEffect, useState } from "react";

export const Home = () => {
  const { actions, isSDKLoaded } = useFrame();
  const [readyCalled, setReadyCalled] = useState(false);

  useEffect(() => {
    if (isSDKLoaded && actions) {
      console.log("🟡 SDK loaded, calling ready...");
      actions
        .ready({ disableNativeGestures: true })
        .then(() => {
          console.log("🟢 actions.ready() called!");
          setReadyCalled(true);
        })
        .catch((err) => {
          console.error("🔴 Error calling ready:", err);
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
