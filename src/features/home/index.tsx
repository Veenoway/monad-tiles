"use client";
import { FarcasterActions } from "@/components/actions";
import { WalletConnection } from "@/components/connector";
import PianoTilesGame from "@/components/music";

export const Home = () => {
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
        <div className="absolute right-5 top-5 hidden lg:flex">
          <WalletConnection />
        </div>
        <div className="w-full mx-auto">
          <PianoTilesGame />
        </div>
        <div className="flex lg:hidden items-center justify-center mt-5">
          <WalletConnection />
        </div>{" "}
        <FarcasterActions />
      </div>
    </main>
  );
};
