import { usePianoRelay } from "@/hook/usePianoTiles";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { GoMute, GoUnmute } from "react-icons/go";
import { useAccount } from "wagmi";

// Transcription simplifiée pour "Bloody Tears in Synthesia"
// (À partir de 0:32 de la vidéo, en boucle)
const melody = [
  // Section 1: Intro
  "F#4",
  "G#4",
  "A4",
  "B4",
  "A4",
  "G#4",
  "F#4",
  "E4",
  "F#4",
  "G#4",
  "A4",
  "B4",
  "C#5",
  "B4",
  "A4",
  "G#4",
  // Section 2: Main Theme
  "F#4",
  "E4",
  "F#4",
  "G#4",
  "A4",
  "B4",
  "A4",
  "G#4",
  "F#4",
  "E4",
  "D4",
  "E4",
  "F#4",
  "G#4",
  "A4",
  "G#4",
  // Section 3: Bridge / Variation
  "F#4",
  "G#4",
  "A4",
  "B4",
  "C#5",
  "B4",
  "A4",
  "G#4",
  "F#4",
  "G#4",
  "A4",
  "B4",
  "C#5",
  "B4",
  "A4",
  "G#4",
];

const bgs = [
  "/background/1.jpg",
  "/background/2.jpg",
  "/background/3.jpg",
  "/background/4.jpg",
];

const bonusBgs = [
  "/bg/bill.jpg",
  "/bg/port.gif",
  "/bg/eunice.jpg",
  "/bg/tunez.jpg",
  "/bg/mike.jpg",
  "/bg/keone.gif",
  "/bg/sailornini.jpg",
  "/bg/thisisfin.jpg",
  "/bg/john.jpg",
  "/bg/fitz.jpg",
];

const bonusImages = [
  "/bonus/pfp-bill.png",
  "/bonus/pfp-port.png",
  "/bonus/pfp-eunice.png",
  "/bonus/pfp-tunez.png",
  "/bonus/pfp-mike.png",
  "/bonus/pfp-keone.png",
  "/bonus/pfp-sailornini.png",
  "/bonus/pfp-thisisfin.png",
  "/bonus/pfp-john.png",
  "/bonus/pfp-fitz.png",
];

const PianoTilesGame = () => {
  const containerHeight = 600;
  const rowHeight = 150;
  const columns = 4;
  const updateInterval = 30;
  const computedInitialSpeed =
    (containerHeight + rowHeight) / (2000 / updateInterval);

  const [rows, setRows] = useState([]);
  const [score, setScore] = useState(0);
  const [missedCount, setMissedCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [tileSpeed, setTileSpeed] = useState(computedInitialSpeed);
  const [spawnInterval, setSpawnInterval] = useState(600);
  const [feedbacks, setFeedbacks] = useState([]);

  const animTimerRef = useRef(null);
  const spawnTimerRef = useRef(null);
  const accelTimerRef = useRef(null);

  const audioRef = useRef(null);
  const bgMusicRef = useRef(null);

  const spawnIndexRef = useRef(0);
  const bgIndexRef = useRef(0);
  const bonusBgIndexRef = useRef(0);
  const normalTileCountRef = useRef(0);

  const [bonusFeedbackIndex, setBonusFeedbackIndex] = useState(0);

  const { address } = useAccount();
  const { click, submitScore } = usePianoRelay();

  // Préchargement du son de clic
  useEffect(() => {
    audioRef.current = new Audio("/bloop-1.mp3");
  }, []);

  // Préchargement de la musique de fond
  useEffect(() => {
    // bgMusicRef.current = new Audio("/bloody-tears.mp3");
    // bgMusicRef.current.loop = true;
  }, []);

  useEffect(() => {
    [...bonusBgs, ...bonusImages].forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    rows.forEach((tile) => {
      console.log("tile", tile.background);
      const img = new window.Image();
      img.src = tile.background;
    });
  }, [rows]);

  useEffect(() => {
    const allBonusImages = [...bonusBgs, ...bonusImages];
    allBonusImages.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  // Lecture/arrêt de la musique de fond
  useEffect(() => {
    // if (isPlaying) {
    //   bgMusicRef.current
    //     .play()
    //     .catch((err) => console.log("Erreur musique:", err));
    // } else {
    //   if (bgMusicRef.current) {
    //     bgMusicRef.current.pause();
    //     bgMusicRef.current.currentTime = 0;
    //   }
    // }
  }, [isPlaying]);

  const handlePlayerClick = async () => {
    if (address) await click(address);
  };

  const addFeedback = (message, color, bgImage = null) => {
    const id = Date.now() + Math.random();
    const newFeedback = { id, message, color, bgImage };
    setFeedbacks((prev) => [...prev, newFeedback]);
    setTimeout(() => {
      setFeedbacks((prev) => prev.filter((fb) => fb.id !== id));
    }, 1000);
  };

  const startGame = async () => {
    clearInterval(animTimerRef.current);
    clearInterval(spawnTimerRef.current);
    clearInterval(accelTimerRef.current);
    setRows([]);
    setScore(0);
    setMissedCount(0);
    setGameOver(false);
    setTileSpeed(computedInitialSpeed);
    setSpawnInterval(600);
    spawnIndexRef.current = 0;
    bgIndexRef.current = 0;
    bonusBgIndexRef.current = 0;
    normalTileCountRef.current = 0;
    setBonusFeedbackIndex(0);
    setIsPlaying(true);
  };

  const endGame = async (message) => {
    await submitScore(score);
    setIsPlaying(false);
    setGameOver(true);
    clearInterval(animTimerRef.current);
    clearInterval(spawnTimerRef.current);
    clearInterval(accelTimerRef.current);
  };

  useEffect(() => {
    if (!isPlaying) return;
    animTimerRef.current = setInterval(() => {
      setRows((prevRows) => {
        let missIncrement = 0;
        const updatedRows = prevRows
          .map((row) => ({ ...row, top: row.top + tileSpeed }))
          .filter((row) => {
            if (row.top >= containerHeight) {
              missIncrement++;
              return false;
            }
            return true;
          });
        if (missIncrement > 0) {
          for (let i = 0; i < missIncrement; i++) {
            addFeedback("-1", "#FF0000");
          }
          setMissedCount((prev) => {
            const newCount = prev + missIncrement;
            if (newCount >= 10) {
              endGame("Game Over ! Vous avez raté 10 tuiles.");
            }
            return newCount;
          });
        }
        return updatedRows;
      });
    }, updateInterval);
    return () => clearInterval(animTimerRef.current);
  }, [isPlaying, tileSpeed, containerHeight]);

  useEffect(() => {
    if (!isPlaying) return;
    spawnTimerRef.current = setInterval(() => {
      const noteValue = melody[spawnIndexRef.current];
      let isBonus;
      if (normalTileCountRef.current >= 10) {
        isBonus = true;
        normalTileCountRef.current = 0;
      } else {
        if (Math.random() < 0.1) {
          isBonus = true;
        } else {
          isBonus = false;
          normalTileCountRef.current += 1;
        }
      }
      let background;
      let bonusIndex = null;
      if (isBonus) {
        bonusIndex = bonusBgIndexRef.current;
        background = bonusBgs[bonusIndex];
        console.log("Spawn bonus tile:", bonusIndex, background);
        bonusBgIndexRef.current =
          (bonusBgIndexRef.current + 1) % bonusBgs.length;
      } else {
        background = bgs[bgIndexRef.current];
        bgIndexRef.current = (bgIndexRef.current + 1) % bgs.length;
      }
      const newTile = {
        id: Date.now() + Math.random(),
        top: -rowHeight,
        blackColumn: Math.floor(Math.random() * columns),
        note: noteValue,
        isBonus: isBonus,
        background: background,
        bonusIndex: bonusIndex,
      };
      setRows((prev) => [...prev, newTile]);
      spawnIndexRef.current = (spawnIndexRef.current + 1) % melody.length;
    }, spawnInterval);
    return () => clearInterval(spawnTimerRef.current);
  }, [isPlaying, spawnInterval, rowHeight]);

  useEffect(() => {
    if (!isPlaying) return;
    accelTimerRef.current = setInterval(() => {
      setTileSpeed((prev) => prev * 1.05);
      setSpawnInterval((prev) => Math.max(300, prev - 50));
    }, 10000);
    return () => clearInterval(accelTimerRef.current);
  }, [isPlaying]);

  const handleClick = (colIndex) => {
    setRows((prevRows) => {
      const tolerance = 30;
      const hitZoneStart = containerHeight - rowHeight - tolerance;
      const hitZoneEnd = containerHeight + tolerance;
      const tileIndex = prevRows.findIndex(
        (tile) =>
          tile.blackColumn === colIndex &&
          tile.top >= hitZoneStart &&
          tile.top <= hitZoneEnd
      );
      if (tileIndex !== -1) {
        const tile = prevRows[tileIndex];
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
        if (address) {
          handlePlayerClick();
        }
        const scoreToAdd = tile.isBonus ? 4 : 1;
        if (tile.isBonus) {
          const bonusFeedbackBg = bonusImages[tile.bonusIndex];
          addFeedback(`+${scoreToAdd}`, "#FFF", bonusFeedbackBg);
        } else {
          addFeedback(scoreToAdd > 1 ? `+${scoreToAdd}` : "+1", "#FFF");
        }
        setScore((prev) => prev + scoreToAdd);
        const newRows = [...prevRows];
        newRows.splice(tileIndex, 1);
        return newRows;
      }
      return prevRows;
    });
  };

  return (
    <div
      className="rounded-2xl relative overflow-hidden shadow-lg shadow-[rgba(0,0,0,0.2)]"
      style={{
        maxWidth: "400px",
        margin: "20px auto",
        textAlign: "center",
        fontFamily: "Boogaloo",
      }}
    >
      {!isPlaying && !gameOver && (
        <div className="absolute z-50 inset-0 py-10 flex flex-col items-center bg-[url('/bg/main-bg.jpg')] bg-bottom">
          <Image
            src="/logo/logo-monad-tiles.png"
            alt="lose message"
            width={300}
            height={120}
          />
          <div className="flex items-center gap-10 mt-[90px]">
            <Link
              href="https://x.com/Novee_VeenoX"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex flex-col items-center justify-center hover:scale-95 transition-all duration-200 ease-in-out">
                <Image
                  src="/logo/novee.png"
                  alt="Novee pfp"
                  width={80}
                  height={120}
                />
                <p className="text-base text-white font-medium uppercase mt-2">
                  @Novee_VeenoX
                </p>
              </div>
            </Link>
            <Link
              href="https://x.com/papayouleouf"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex flex-col items-center justify-center hover:scale-95 transition-all duration-200 ease-in-out">
                <Image
                  src="/logo/papayou.png"
                  alt="Papayou pfp"
                  width={80}
                  height={120}
                />
                <p className="text-base text-white font-medium uppercase mt-2">
                  @papayouleouf
                </p>
              </div>
            </Link>
          </div>

          <button
            onClick={startGame}
            className="font-bold uppercase text-3xl mt-[120px] bg-[#a1055c] rounded-md text-white px-4 py-2  hover:scale-95 transition-all duration-200 ease-in-out"
          >
            Start
          </button>
        </div>
      )}
      {/* Écran de Game Over distinct */}
      {gameOver && (
        <div className="absolute z-50 inset-0 flex flex-col items-center pt-[60px] bg-[rgba(11,4,51,0.9)]">
          <Image
            src="/game/lost.png"
            alt="lose message"
            width={300}
            height={120}
            unoptimized
          />
          <div className="flex flex-col justify-center items-center mt-10">
            <p className="text-xl text-white mb-0 leading-[18px] uppercase">
              Your score
            </p>
            <p className="text-5xl text-cyan-300 mt-2 font-bold">{score}</p>
          </div>

          <button
            onClick={startGame}
            className="font-bold uppercase text-3xl mt-[50px] bg-[#a1055c] rounded-md text-white px-4 py-2"
          >
            Replay
          </button>
          <div className="flex flex-col justify-center items-center mt-[80px]">
            <p className="text-lg text-white mb-0 leading-[18px] uppercase">
              Your best score
            </p>
            <p className="text-3xl text-cyan-300 mt-2 font-bold">{score}</p>
          </div>
        </div>
      )}
      <div className="w-full justify-between flex items-center bg-[#190e59] py-5 px-5 relative">
        <div className="flex flex-col justify-center items-center">
          <p className="text-lg text-cyan-300 mb-0 leading-[18px]">
            Best Score
          </p>
          <p className="text-2xl text-white font-bold mt-0">{score}</p>
        </div>
        <Image
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          src="/logo/logo-monad-tiles.png"
          alt="lose message"
          width={150}
          height={130}
        />
        <div className="text-2xl bg-[rgba(255,255,255,0.1)] z-40 rounded-md p-2">
          {true ? <GoMute /> : <GoUnmute />}{" "}
        </div>
        <div className="">
          <div className="bg-[#190e59] h-[30px] w-[120px] left-1/2 -translate-x-1/2 bottom-[-30px] absolute z-30 rounded-b-[10px] text-white text-base uppercase">
            Score
          </div>
          <div className="left-1/2 -translate-x-1/2 bottom-[-75px] absolute z-30 font-bold text-4xl text-white uppercase">
            {score}
          </div>
        </div>
      </div>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: containerHeight + "px",
          backgroundImage: "url('/bg/main-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "top",
          backgroundRepeat: "no-repeat",
          margin: "0 auto",
          overflow: "hidden",
        }}
      >
        {feedbacks.map((fb) => (
          <div
            key={fb.id}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              color: fb.color,
              fontSize: "32px",
              fontWeight: "bold",
              pointerEvents: "none",
              zIndex: 400,
              animation: "popUp 1s ease-out forwards",
              backgroundRepeat: "no-repeat",
            }}
          >
            {fb.bgImage && (
              <Image
                src={fb.bgImage}
                alt="bonus feedback"
                height={120}
                width={120}
                unoptimized
                className="mb-6"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/bonus/default.png";
                }}
              />
            )}
            {fb.message}
          </div>
        ))}

        <div
          className="border-t border-dashed border-[rgba(255,255,255,0.4)] bg-[#836EF9] bg-opacity-20"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: rowHeight + "px",
            pointerEvents: "none",
            zIndex: 5,
          }}
        ></div>

        {rows.map((tile, i) => (
          <img
            alt="dede"
            key={i + tile.background}
            src={tile.background || "/cards/versoo.jpg"}
            style={{
              position: "absolute",
              top: tile.top + "px",
              left: `${(tile.blackColumn * 100) / columns}%`,
              width: `${100 / columns}%`,
              height: rowHeight + "px",
              zIndex: 4,
              borderRadius: "4px",
              backgroundSize: "cover",
            }}
          />
        ))}

        {[...Array(columns)].map((_, colIndex) => (
          <div
            key={colIndex}
            onClick={() => handleClick(colIndex)}
            className={`border border-[rgba(255,255,255,0.1)]`}
            style={{
              position: "absolute",
              top: 0,
              left: `${(colIndex * 100) / columns}%`,
              width: `${100 / columns}%`,
              height: "100%",
              cursor: "pointer",
              zIndex: 10,
            }}
          ></div>
        ))}
      </div>
      <style jsx>{`
        @keyframes popUp {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -100%) scale(1.5);
          }
        }
      `}</style>
    </div>
  );
};

export default PianoTilesGame;
