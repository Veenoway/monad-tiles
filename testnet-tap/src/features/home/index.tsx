"use client";

import PianoTilesGame from "@/components/music";

enum GameStatus {
  PLAYING = 0,
  SUCCESS = 1,
  LOSE = 2,
  WAITING = 3,
}

export const Home = () => {
  return (
    <main
      className="w-screen min-h-screen pb-[100px] font-montserrat"
      style={{
        background: `url('/background/team.png'),#0b0433`,
        backgroundSize: "100%",
        backgroundPosition: "bottom",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-full sm:w-[95%] mx-auto sm:pt-10 flex gap-8">
        <div className="w-full mx-auto">
          <PianoTilesGame />
        </div>
      </div>
    </main>
  );
};
