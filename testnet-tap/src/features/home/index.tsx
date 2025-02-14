"use client";
import { WalletConnection } from "@/components/connector";
import PianoTilesGame from "@/components/music";

export const Home = () => {
  return (
    <main
      className="w-screen  min-h-screen pb-[100px] font-montserrat"
      style={{
        background: `url('/background/team.png'),#0b0433`,
        backgroundSize: "100%",
        backgroundPosition: "bottom",
        backgroundRepeat: "no-repeat",
        fontFamily: "Boogaloo",
      }}
    >
      <div className="w-full sm:w-[95%] mx-auto sm:pt-10 flex gap-8">
        <div className="absolute right-5 top-5">
          <WalletConnection />{" "}
        </div>
        <div className="w-full mx-auto">
          <PianoTilesGame />
        </div>
      </div>
    </main>
  );
};
