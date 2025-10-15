"use client";
import PianoTilesGame from "@/components/music";
import { useFrame } from "@/lib/farcaster/provider";
import { useEffect } from "react";

export const Home = () => {
  const { actions, isSDKLoaded } = useFrame();

  useEffect(() => {
    if (isSDKLoaded && actions) {
      console.log("🟡 SDK loaded, calling ready...");
      actions
        .ready()
        .then(() => {
          console.log("🟢 actions.ready() called!");
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
        <div className="w-full mx-auto">
          <PianoTilesGame />
        </div>
      </div>
    </main>
  );
};
