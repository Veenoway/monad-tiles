"use client";
import { useMiniAppContext } from "@/hook/useMiniApp";
import { usePianoGasless } from "@/hook/usePianoTiles";
import { useSmartAccount } from "@/hook/useSmartAccount";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaRankingStar } from "react-icons/fa6";
import { GoMute, GoUnmute } from "react-icons/go";
import { IoSettingsSharp } from "react-icons/io5";
import { monadTestnet } from "viem/chains";
import { useAccount, useConnect, useSwitchChain, useWalletClient } from "wagmi";

import {
  checkSmartAccountBalance,
  fundSmartAccount,
  isSmartAccountDeployed,
} from "@/lib/metamask/transactions";
import { formatEther, parseEther } from "viem";
import { SmartAccountManager } from "./smartAccountDemo";

interface Tile {
  id: number;
  top: number;
  blackColumn: number;
  note: string;
  isBonus: boolean;
  background: string;
  bonusIndex: number | null;
  processed?: boolean;
  specialBonus?: boolean;
}

const melody: string[] = [];

const bgs: string[] = [
  "/background/3.jpg",
  "/background/1.jpg",
  "/background/2.jpg",
  "/background/4.jpg",
];

const bonusBgs: string[] = [
  "/bg/bill.jpg",
  "/bg/port.gif",
  "/bg/eunice.jpg",
  "/bg/papayou.gif",
  "/bg/novee.gif",
  "/bg/tunez.jpg",
  "/bg/mike.jpg",
  "/bg/keone.gif",
  "/bg/linad.gif",
  "/bg/sailornini.jpg",
  "/bg/thisisfin.jpg",
  "/bg/john.jpg",
  "/bg/fitz.jpg",
  "/bg/karma.jpg",
  "/bg/danny.jpg",
  "/bg/berry.gif",
  "/bg/king.jpg",
  "/bg/gizmo.jpg",
  "/bg/intern.gif",
  "/bg/tina.gif",
];

const bonusImages: string[] = [
  "/bonus/pfp-bill.png",
  "/bonus/pfp-port.png",
  "/bonus/pfp-eunice.png",
  "/bonus/pfp-papayou.png",
  "/bonus/pfp-novee.png",
  "/bonus/pfp-tunez.png",
  "/bonus/pfp-mike.png",
  "/bonus/pfp-keone.png",
  "/bonus/pfp-linad.png",
  "/bonus/pfp-thisisfin.png",
  "/bonus/pfp-thisisfin.png",
  "/bonus/pfp-john.png",
  "/bonus/pfp-fitz.png",
  "/bonus/pfp-karma.png",
  "/bonus/pfp-danny.png",
  "/bonus/pfp-berry.png",
  "/bonus/pfp-king.png",
  "/bonus/pfp-gizmo.png",
  "/bonus/pfp-intern.png",
  "/bonus/pfp-tina.png",
];

const bonusSongs: string[] = [
  "/sound/Bill.mp3",
  "/sound/poort.ogg",
  "/sound/Eunice.mp3",
  "/sound/sound-papayou.mp3",
  "/sound/sound-veeno.mp3",
  "/sound/tunez4.mp3",
  "/sound/mike.mp3",
  "/sound/keone.mp3",
  "/sound/linad.mp3",
  "/sound/sailornini.mp3",
  "/sound/thisisfin.mp3",
  "/sound/john.mp3",
  "/sound/fitz.mp3",
  "/sound/karma.mp3",
  "/sound/Danny.mp3",
  "/sound/berry.mp3",
  "/sound/king.mp3",
  "/sound/gizmo.mp3",
  "/sound/intern.mp3",
  "/sound/Tina.mp3",
];

const bgMusics: string[] = [
  "/sound/undertale.mp3",
  "/bloody-tears.mp3",
  "/sound/route.mp3",
  "/sound/sasageyo.mp3",
];

const menuBgMusic: string = "/sound/route.mp3";
const gameOverBgMusics: string[] = ["/sound/tapion.mp3"];
const gameOverSound: string = "/sound/haha.mp3";

type LeaderboardEntry = [string, number, number];

const PianoTilesGame: React.FC = () => {
  const { isConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { switchChain } = useSwitchChain();
  const { actions, isEthProviderAvailable } = useMiniAppContext();
  const {
    userRank,
    currentGlobalCount,
    leaderboardFormatted,
    click,
    submitScore,
    startGameWithGasless,
    error,
    payGameFee,
  } = usePianoGasless();
  const { smartAccount, smartAccountAddress } = useSmartAccount();
  const address = smartAccount?.address;

  // Vérifier si nous sommes dans Warpcast
  const isInWarpcast =
    typeof window !== "undefined" &&
    (window.location.href.includes("warpcast.com") ||
      window.location.href.includes("warpcast.app") ||
      window.navigator.userAgent.includes("Warpcast"));

  // Changer automatiquement vers Monad Testnet si nécessaire
  useEffect(() => {
    if (isConnected && chainId !== monadTestnet.id) {
      switchChain({ chainId: monadTestnet.id });
    }
  }, [isConnected, chainId, switchChain]);

  console.log("🌐 Environment:", isInWarpcast ? "Warpcast" : "Web");
  console.log(
    "💰 ETH Provider:",
    isEthProviderAvailable ? "Available" : "Not available"
  );

  const containerHeight = 600;
  const rowHeight = 150;
  const columns = 4;
  const updateInterval = 30;
  const computedInitialSpeed =
    (containerHeight + rowHeight) / (2000 / updateInterval);

  const baselineSpawnIntervalRef = useRef<number>(600);

  const gap = 60;
  const [rows, setRows] = useState<Tile[]>([]);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(10);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [tileSpeed, setTileSpeed] = useState<number>(computedInitialSpeed);
  const [, setSpawnInterval] = useState<number>(600);
  const [feedbacks, setFeedbacks] = useState<
    { id: number; message: string; color: string; bgImage: string | null }[]
  >([]);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [bgMusicIndex, setBgMusicIndex] = useState<number>(0);
  const [bgVolume, setBgVolume] = useState<number>(0.3);
  const [sfxVolume, setSfxVolume] = useState<number>(0.3);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [scoreMultiplier, setScoreMultiplier] = useState<number>(1);
  const [currentBonusImage, setCurrentBonusImage] = useState<string>("");
  const [txCount, setTxCount] = useState<number>(0);

  const animTimerRef = useRef<NodeJS.Timeout | null>(null);
  const accelTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bonusTimerRef = useRef<NodeJS.Timeout | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bonusAudioRefs = useRef<HTMLAudioElement[]>([]);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const menuBgMusicRef = useRef<HTMLAudioElement | null>(null);
  const gameOverBgMusicRef = useRef<HTMLAudioElement | null>(null);

  const spawnIndexRef = useRef<number>(0);
  const bgIndexRef = useRef<number>(0);
  const bonusBgIndexRef = useRef<number>(0);
  const normalTileCountRef = useRef<number>(0);
  const totalTileCountRef = useRef<number>(0);

  const specialBonusSoundPath = "/sound/bonus.mp3";
  const specialBonusAudioRef = useRef<HTMLAudioElement | null>(null);

  const [clickedTile, setClickedTile] = useState<Tile | null>(null);

  const [gameStarted, setGameStarted] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment] = useState(false);
  const [highestScore, setHighestScore] = useState<number>(0);
  useEffect(() => {
    const highestScore = localStorage.getItem("highestScore");
    if (highestScore) {
      setHighestScore(Number(highestScore));
    }
  }, []);

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  useEffect(() => {
    // Initialiser le son de clic
    audioRef.current = new Audio("/bloop-1.mp3");
    audioRef.current.volume = sfxVolume;
    audioRef.current.muted = isMuted;
    console.log("🎵 Son de clic initialisé:", {
      volume: audioRef.current.volume,
      muted: audioRef.current.muted,
    });

    // Initialiser les sons de bonus
    bonusAudioRefs.current = bonusSongs.map((song) => {
      const audio = new Audio(song);
      audio.volume = sfxVolume;
      audio.muted = isMuted;
      return audio;
    });

    // Initialiser le son de bonus spécial
    specialBonusAudioRef.current = new Audio(specialBonusSoundPath);
    specialBonusAudioRef.current.volume = sfxVolume;
    specialBonusAudioRef.current.muted = isMuted;
  }, [sfxVolume, isMuted]);

  const updateAllAudioVolumes = useCallback(() => {
    const allAudios = [
      bgMusicRef.current,
      menuBgMusicRef.current,
      gameOverBgMusicRef.current,
      audioRef.current,
      specialBonusAudioRef.current,
      ...bonusAudioRefs.current,
    ];

    allAudios.forEach((audio) => {
      if (!audio) return;

      audio.muted = isMuted;

      if (
        audio === bgMusicRef.current ||
        audio === menuBgMusicRef.current ||
        audio === gameOverBgMusicRef.current
      ) {
        audio.volume = bgVolume;
      } else {
        audio.volume = sfxVolume;
      }
    });
  }, [isMuted, bgVolume, sfxVolume]);

  useEffect(() => {
    updateAllAudioVolumes();
  }, [isMuted, bgVolume, sfxVolume, updateAllAudioVolumes]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newMuted = !prev;

      if (bgMusicRef.current) bgMusicRef.current.muted = newMuted;
      if (menuBgMusicRef.current) menuBgMusicRef.current.muted = newMuted;
      if (gameOverBgMusicRef.current)
        gameOverBgMusicRef.current.muted = newMuted;
      if (audioRef.current) audioRef.current.muted = newMuted;
      if (specialBonusAudioRef.current)
        specialBonusAudioRef.current.muted = newMuted;

      bonusAudioRefs.current.forEach((audio) => {
        audio.muted = newMuted;
      });

      return newMuted;
    });
  }, []);

  console.log("txCount", txCount);

  useEffect(() => {
    if (bgMusicRef.current) bgMusicRef.current.pause();
    bgMusicRef.current = new Audio(bgMusics[bgMusicIndex]);
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = isMuted ? 0 : bgVolume;
    if (isPlaying) {
      bgMusicRef.current
        .play()
        .catch((err) => console.log("Erreur musique de fond:", err));
    }
  }, [bgMusicIndex, isPlaying, isMuted, bgVolume]);

  useEffect(() => {
    if (!isPlaying && !gameOver) {
      if (menuBgMusicRef.current) menuBgMusicRef.current.pause();
      menuBgMusicRef.current = new Audio(menuBgMusic);
      menuBgMusicRef.current.loop = true;
      menuBgMusicRef.current.volume = isMuted ? 0 : bgVolume;
      menuBgMusicRef.current.muted = true;
      menuBgMusicRef.current
        .play()
        .then(() => {
          setTimeout(() => {
            if (menuBgMusicRef.current) menuBgMusicRef.current.muted = false;
          }, 500);
        })
        .catch((err) => console.log("Erreur musique menu:", err));
    } else {
      if (menuBgMusicRef.current) {
        menuBgMusicRef.current.pause();
        menuBgMusicRef.current.currentTime = 0;
      }
    }
  }, [isPlaying, gameOver, isMuted, bgVolume]);

  const stopAllSounds = useCallback(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.pause();
      bgMusicRef.current.currentTime = 0;
    }
    if (menuBgMusicRef.current) {
      menuBgMusicRef.current.pause();
      menuBgMusicRef.current.currentTime = 0;
    }
    if (gameOverBgMusicRef.current) {
      gameOverBgMusicRef.current.pause();
      gameOverBgMusicRef.current.currentTime = 0;
    }
    bonusAudioRefs.current.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    if (specialBonusAudioRef.current) {
      specialBonusAudioRef.current.pause();
      specialBonusAudioRef.current.currentTime = 0;
    }
  }, []);

  useEffect(() => {
    if (gameOver) {
      stopAllSounds();
      gameOverBgMusicRef.current = new Audio(gameOverBgMusics[0]);
      gameOverBgMusicRef.current.loop = true;
      gameOverBgMusicRef.current.volume = isMuted ? 0 : bgVolume;
      gameOverBgMusicRef.current
        .play()
        .catch((err) => console.log("Erreur musique Game Over:", err));

      const goSound = new Audio(gameOverSound);
      goSound.volume = isMuted ? 0 : sfxVolume;
      goSound
        .play()
        .catch((err) => console.log("Erreur Game Over sound:", err));
    }
  }, [gameOver, isMuted, bgVolume, sfxVolume, stopAllSounds]);

  useEffect(() => {
    [...bonusBgs, ...bonusImages].forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    rows.forEach((tile) => {
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

  useEffect(() => {
    if (isPlaying) {
      bgMusicRef.current
        ?.play()
        .catch((err) => console.log("Erreur musique de fond:", err));
    } else {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current.currentTime = 0;
      }
    }
  }, [isPlaying]);

  const spawnTile = () => {
    const currentMinTop =
      rows.length > 0 ? Math.min(...rows.map((tile) => tile.top)) : 0;
    const newTileTop =
      rows.length > 0 ? currentMinTop - (rowHeight + gap) : -(rowHeight + gap);

    const noteValue = melody[spawnIndexRef.current];
    totalTileCountRef.current++;

    let newTile: Tile;
    if (totalTileCountRef.current % 40 === 0) {
      newTile = {
        id: Date.now() + Math.random(),
        top: newTileTop,
        blackColumn: Math.floor(Math.random() * columns),
        note: noteValue,
        isBonus: false,
        specialBonus: true,
        background: "/bonus/star.gif",
        bonusIndex: null,
      };
    } else {
      let isBonus: boolean;
      if (normalTileCountRef.current >= 10) {
        isBonus = true;
        normalTileCountRef.current = 0;
      } else {
        isBonus = Math.random() < 0.1;
        if (!isBonus) normalTileCountRef.current += 1;
      }
      let background: string;
      let bonusIndex: number | null = null;
      if (isBonus) {
        bonusIndex = bonusBgIndexRef.current;
        background = bonusBgs[bonusIndex];
        bonusBgIndexRef.current =
          (bonusBgIndexRef.current + 1) % bonusBgs.length;
      } else {
        background = bgs[bgIndexRef.current];
        bgIndexRef.current = (bgIndexRef.current + 1) % bgs.length;
      }
      newTile = {
        id: Date.now() + Math.random(),
        top: newTileTop,
        blackColumn: Math.floor(Math.random() * columns),
        note: noteValue,
        isBonus,
        background,
        bonusIndex,
      };
    }
    spawnIndexRef.current = (spawnIndexRef.current + 1) % melody.length;
    setRows((prev) => [...prev, newTile]);
  };

  useEffect(() => {
    if (!isPlaying) return;
    const target = Math.ceil(containerHeight / (rowHeight + gap)) + 2;
    if (rows.length < target) {
      spawnTile();
    }
  }, [rows, isPlaying, containerHeight, rowHeight, gap]);

  const addFeedback = (
    message: string,
    color: string,
    bgImage: string | null = null
  ) => {
    const id = Date.now() + Math.random();
    const newFeedback = { id, message, color, bgImage };
    setFeedbacks((prev) => [...prev, newFeedback]);
    setTimeout(() => {
      setFeedbacks((prev) => prev.filter((fb) => fb.id !== id));
    }, 1000);
  };

  const showNotification = (
    message: string,
    type: "success" | "error" | "info"
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const [isGameOverLoading, setIsGameOverLoading] = useState(false);

  const handleGameOver = useCallback(async () => {
    setIsGameOverLoading(true);
    setIsPlaying(false);
    if (score > 0 && address) {
      try {
        const txHash = await submitScore(score, () =>
          setIsGameOverLoading(false)
        );
        const highestScore = localStorage.getItem("score");
        console.log("highestScore", highestScore);
        console.log("score", score);
        console.log(
          "Number(highestScore) < score",
          Number(highestScore) < score
        );
        if (!highestScore || Number(highestScore) < score) {
          localStorage.setItem("highestScore", score.toString());
          setHighestScore(score);
        }
        if (txHash) {
          setIsGameOverLoading(false);
        }
      } catch (error) {
        console.error("Error submitting score:", error);
        showNotification("Failed to submit score.", "error");
        setIsGameOverLoading(false);
      }
    }
  }, [score, submitScore, address]);

  const [isInitialisingGame, setIsInitialisingGame] = useState(false);

  const startGame = useCallback(async () => {
    setIsInitialisingGame(true);
    if (!isConnected && !smartAccount) {
      if (isEthProviderAvailable) {
        connect({ connector: farcasterFrame() });
      } else {
        showNotification("Wallet connection only via Warpcast", "error");
      }
      setIsInitialisingGame(false);
      return;
    }

    const txHash = await payGameFee();
    console.log("txHash", txHash);
    if (!txHash) {
      setIsInitialisingGame(false);
      return;
    }

    try {
      console.log("🎮 Starting game...");
      setGameStarted(true);
      setIsPlaying(true);
      setScore(0);
      setLives(10);
      setGameOver(false);
      setRows([]);
      setTileSpeed(computedInitialSpeed);
      setSpawnInterval(600);
      setIsInitialisingGame(false);
    } catch (error) {
      console.error("❌ Error starting game:", error);
      showNotification("Failed to start game. Please try again.", "error");
      setIsInitialisingGame(false);
    }
  }, [
    isConnected,
    connect,
    isEthProviderAvailable,
    computedInitialSpeed,
    startGameWithGasless,
    smartAccount,
  ]);

  useEffect(() => {
    if (!isPlaying) return;

    let gameEnded = false;

    animTimerRef.current = setInterval(() => {
      setRows((prevRows) => {
        let missedCount = 0;
        const updatedRows = prevRows
          .map((row) => {
            if (row.top >= containerHeight && !row.processed) {
              row.processed = true;
              if (!row.isBonus && !row.specialBonus) missedCount++;
            }
            return { ...row, top: row.top + tileSpeed };
          })
          .filter((row) => row.top < containerHeight + rowHeight);

        if (missedCount > 0) {
          for (let i = 0; i < missedCount; i++) {
            addFeedback("-1", "#FF0000");
          }

          const remainingLives = lives - missedCount;
          if (remainingLives <= 0 && !gameEnded) {
            gameEnded = true;
            setLives(0);

            setTimeout(() => {
              setGameOver(true);
              setIsPlaying(false);
              if (animTimerRef.current) {
                clearInterval(animTimerRef.current);
              }
              handleGameOver();
            }, 100);

            return updatedRows;
          }

          setLives(remainingLives);
        }

        return updatedRows;
      });
    }, updateInterval);

    return () => {
      if (animTimerRef.current) {
        clearInterval(animTimerRef.current);
      }
    };
  }, [isPlaying, tileSpeed, containerHeight, lives, handleGameOver]);

  useEffect(() => {
    if (!isPlaying) return;
    accelTimerRef.current = setInterval(() => {
      setTileSpeed((prev) => prev * 1.1);
      setSpawnInterval((prev) =>
        Math.max(baselineSpawnIntervalRef.current, prev - 50)
      );
    }, 10000);
    return () => clearInterval(accelTimerRef.current as NodeJS.Timeout);
  }, [isPlaying]);

  const handleClick = (
    e: React.MouseEvent<HTMLDivElement>,
    colIndex: number
  ) => {
    e.stopPropagation();
    setRows((prevRows) => {
      const tolerance = 50;
      const hitZoneStart = containerHeight - rowHeight - tolerance;
      const hitZoneEnd = containerHeight + tolerance;
      const tileIndex = prevRows.findIndex(
        (tile) =>
          tile.blackColumn === colIndex &&
          tile.top >= hitZoneStart &&
          tile.top <= hitZoneEnd &&
          !tile.processed
      );
      if (tileIndex !== -1) {
        const tile = prevRows[tileIndex];
        const newTile = { ...tile, processed: true };
        const newRows = [...prevRows];
        newRows.splice(tileIndex, 1);
        setClickedTile(newTile);
        if (smartAccount) {
          click();
        }

        if (audioRef.current) {
          console.log("🎵 Tentative de lecture du son:", {
            volume: audioRef.current.volume,
            muted: audioRef.current.muted,
            readyState: audioRef.current.readyState,
          });
          audioRef.current.currentTime = 0;
          audioRef.current
            .play()
            .then(() => console.log("✅ Son joué avec succès"))
            .catch((err) => console.log("❌ Erreur lecture son:", err));
        }

        return newRows;
      }
      return prevRows;
    });
  };

  const sendTransaction = useCallback(
    async (count: number = 1) => {
      if (!address) return;

      setTxCount((prev) => prev + count);
    },
    [address]
  );

  useEffect(() => {
    if (clickedTile) {
      let txCount = 0;
      if (clickedTile.specialBonus) {
        const bonusTypes = ["multiplier", "slower"];
        const chosenType =
          bonusTypes[Math.floor(Math.random() * bonusTypes.length)];
        if (bonusTimerRef.current) {
          clearTimeout(bonusTimerRef.current);
          bonusTimerRef.current = null;
        }
        if (specialBonusAudioRef.current) {
          specialBonusAudioRef.current.currentTime = 0;
          specialBonusAudioRef.current.play();
        }
        if (chosenType === "multiplier") {
          const newMultiplier = Math.random() < 0.5 ? 2 : 4;
          setScoreMultiplier(newMultiplier);
          setCurrentBonusImage(
            newMultiplier === 2
              ? "/bonus/bonus-danny.png"
              : "/bonus/bonus-3.png"
          );
          addFeedback(`x${newMultiplier} Multiplier Activated!`, "#FFD700");
          bonusTimerRef.current = setTimeout(() => {
            setScoreMultiplier(1);
            setCurrentBonusImage("");
            addFeedback("Bonus ", "#FF4500");
            bonusTimerRef.current = null;
          }, 30000);
          txCount = newMultiplier === 2 ? 1 : 1;
        } else {
          setTileSpeed((prev) => prev * 0.9);
          setSpawnInterval((prev) => prev / 0.9);
          setCurrentBonusImage("/bonus/bonus-fin-2.png");
          addFeedback("Slower!", "#00FF00");
          txCount = 1;
        }
        handleClicks();
      } else if (clickedTile.isBonus) {
        const bonusAudio = bonusAudioRefs.current[clickedTile.bonusIndex || 0];
        bonusAudio.currentTime = 0;
        bonusAudio.play();
        if (clickedTile.bonusIndex === 2 || clickedTile.bonusIndex === 6) {
          if (lives < 10) {
            setLives((prev) => prev + 1);
            addFeedback("+1 Life", "#00FF00");
          }
        }
        txCount = 1;
      } else {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
        txCount = 1;
      }
      txCount *= scoreMultiplier;
      console.log("txCount", txCount);
      sendTransaction(txCount);
      const baseScore = clickedTile.isBonus ? 4 : 1;
      const finalScore = baseScore * scoreMultiplier;
      if (clickedTile.isBonus) {
        const bonusFeedbackBg = bonusImages[clickedTile.bonusIndex || 0];
        addFeedback(`+${finalScore}`, "#FFF", bonusFeedbackBg);
      } else {
        addFeedback(finalScore > 1 ? `+${finalScore}` : "+1", "#FFF");
      }
      setScore((prev) => prev + finalScore);
      setClickedTile(null);
    }
  }, [
    clickedTile,
    address,
    scoreMultiplier,
    currentBonusImage,
    sendTransaction,
  ]);

  const addressSlicer = (address?: string, endCut = 4) => {
    if (!address) return "...";
    return `${address.slice(0, 4)}...${address.slice(-endCut)}`;
  };

  const renderSettings = () => {
    return (
      <div className="absolute z-[11000] inset-0 bg-[rgba(11,4,51,0.95)] flex flex-col items-center justify-center p-4">
        <h2 className="text-3xl text-white font-bold uppercase italic mb-6">
          Settings
        </h2>
        <div className="mb-6 flex items-center justify-center w-full">
          <button
            onClick={toggleMute}
            className="flex items-center gap-2 px-4 py-2 bg-[#a1055c] rounded-xl text-white"
          >
            {isMuted ? (
              <>
                <GoMute size={24} /> <span>Unmute All Sounds</span>
              </>
            ) : (
              <>
                <GoUnmute size={24} /> <span>Mute All Sounds</span>
              </>
            )}
          </button>
        </div>
        <div className="mb-4 flex flex-col w-full">
          <label className="text-white text-2xl mb-4 text-start ml-[5%]">
            Gameplay BG Music:
          </label>
          <div className="grid grid-cols-2 w-[90%] mx-auto gap-3">
            {bgMusics.map((music, index) => (
              <button
                key={index}
                onClick={() => setBgMusicIndex(index)}
                className={`col-span-1 uppercase rounded-xl h-[40px] text-xl ${
                  bgMusicIndex === index
                    ? "border-2 border-double border-transparent bg-[#a1055c]"
                    : "border-2 border-double border-[#a1055c]"
                }`}
              >
                {music?.includes("/sound/")
                  ? music?.split("/sound/")[1]?.split(".mp3")?.[0]
                  : music?.split("/")[1]?.split(".mp3")?.[0]}
              </button>
            ))}
          </div>
        </div>
        {isMuted && (
          <div className="text-yellow-300 text-center mb-4">
            Note: Volume settings will take effect when sounds are unmuted
          </div>
        )}
        <div className="mb-2 flex flex-col w-full mt-6">
          <label className="text-white text-2xl mb-2 text-start ml-[5%]">
            BG Music Volume:
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={bgVolume}
            onChange={(e) => setBgVolume(Number(e.target.value))}
            className="w-[90%] mx-auto"
          />
          <span className="text-white ml-2">{bgVolume}</span>
        </div>
        <div className="mb-4 flex flex-col w-full">
          <label className="text-white text-2xl mb-2 text-start ml-[5%]">
            SFX Volume:
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={sfxVolume}
            onChange={(e) => setSfxVolume(Number(e.target.value))}
            className="w-[90%] mx-auto"
          />
          <span className="text-white ml-2">{sfxVolume}</span>
        </div>
        <button
          onClick={() => setShowSettings(false)}
          className="mt-4 px-4 py-2 uppercase text-2xl hover:scale-95 transition-all duration-200 ease-in-out bg-[#a1055c] text-white rounded-md"
        >
          Save & Close
        </button>
      </div>
    );
  };

  const renderLeaderboard = () => {
    console.log("Rendering leaderboard with data:", leaderboardFormatted);
    return (
      <div className="absolute z-[11000] inset-0 bg-[rgba(11,4,51,0.95)] flex flex-col items-center justify-center p-4 overflow-y-auto">
        <h2 className="text-4xl text-white font-bold uppercase italic mb-3">
          Leaderboard
        </h2>

        <div className="text-yellow-300 text-center mb-4 text-sm">
          Leaderboard updates once every 2 hours
        </div>

        <div className="w-full max-h-[470px] overflow-y-auto hide-scrollbar rounded-md p-4">
          <div className="w-full max-h-[470px]">
            <table className="min-w-full text-left text-xl">
              <thead className="border-b-2 border-[#a1055c]">
                <tr>
                  <th className="px-4 py-2 font-thin text-white">Rank</th>
                  <th className="px-4 py-2 font-thin text-white">Address</th>
                  <th className="px-4 py-2 font-thin text-white">Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardFormatted && leaderboardFormatted.length > 0 ? (
                  leaderboardFormatted.map(
                    ([userAddress, score]: LeaderboardEntry, index: number) => (
                      <tr
                        key={index}
                        className={`border-b border-white/10 text-lg ${
                          address === userAddress ? "bg-[#a1055b76]" : ""
                        }`}
                      >
                        <td
                          className={`px-4 py-1.5 font-bold ${
                            index + 1 < 4
                              ? "text-[rgb(199,199,64)]"
                              : "text-white/70"
                          }`}
                        >
                          {index + 1}
                        </td>
                        <td className="px-4 py-1.5 text-white">
                          {userAddress ? addressSlicer(userAddress) : "Anon"}
                        </td>
                        <td className="px-4 py-1.5  font-bold  text-white">
                          {score}
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td className="px-4 py-2 text-gray-500" colSpan={4}>
                      No leaderboard data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {leaderboardFormatted?.find(
          ([userAddress]: [string, ...unknown[]]) => address === userAddress
        )?.[0] ? null : (
          <div className="w-full mt-3 px-4 bg-[#a1055b76] border-t border-white/10 rounded-md">
            <div className="flex justify-between  text-lg">
              <span className={`px-4 py-1.5 font-bold text-white/70`}>
                {userRank || ""}
              </span>
              <span className="px-4 py-1.5 text-white">
                {address ? addressSlicer(address) : "Anon"}
              </span>
              <span className="px-4 py-1.5 font-bold  text-white">
                {(currentGlobalCount as [number])?.[0]}
              </span>
              <span className="px-4 py-1.5 text-end  text-white">
                {(currentGlobalCount as [number, number, number])?.[2]}
              </span>
            </div>
          </div>
        )}
        <button
          onClick={() => setShowLeaderboard(false)}
          className="mt-10 px-4 py-2 uppercase text-2xl hover:scale-95 transition-all duration-200 ease-in-out bg-[#a1055c] text-white rounded-md"
        >
          Close
        </button>
      </div>
    );
  };

  const [animate, setAnimate] = useState(false);
  const handleClicks = () => {
    setAnimate(false);
    setTimeout(() => {
      setAnimate(true);
    }, 50);
  };

  const renderGameOver = () => {
    return (
      <div className="absolute z-50 inset-0 flex flex-col items-center pt-[60px] bg-[rgba(11,4,51,0.9)]">
        <img src="/game/lost.png" alt="lose message" width={300} height={100} />
        <div className="flex justify-center gap-10 items-center mt-[60px] mb-[50px] relative">
          <div className="flex flex-col items-center">
            <p className="text-xl text-white mb-0 leading-[18px] uppercase">
              Your score
            </p>
            <p className="text-6xl text-cyan-300 mt-2 font-bold">{score}</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-xl text-white mb-0 leading-[18px] uppercase">
              Highest Score
            </p>
            <p className="text-6xl text-yellow-300 mt-2 font-bold">
              {highestScore?.toString()}
            </p>
          </div>
          {isGameOverLoading && (
            <div className="mt-4 absolute flex items-center w-fit -bottom-10">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#a1055c]"></div>
              <p className="text-white ml-4">Submitting score...</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-5 mt-[30px]">
          <button
            onClick={() => setShowSettings(true)}
            className="px-3 py-1.5 bg-[#a1055c] text-3xl h-[50px] uppercase text-white rounded-md"
            disabled={isGameOverLoading}
          >
            <IoSettingsSharp />
          </button>
          <div className="flex flex-col items-center gap-5">
            <button
              onClick={startGame}
              className={`font-bold uppercase text-3xl -mt-5 h-[55px] bg-[#a1055c] rounded-md text-white px-4 py-2 hover:scale-95 transition-all duration-200 ease-in-out `}
              disabled={isInitialisingGame}
            >
              {isInitialisingGame ? "Initialising..." : "REPLAY"}
            </button>
            <button
              className="px-3 py-1.5 bg-[#a1055c] text-4xl h-[50px] uppercase text-white rounded-md"
              onClick={() =>
                actions?.composeCast({
                  text: `I just scored ${score} points in Monad Tiles!`,
                  embeds: [`https://monadtiles.xyz`],
                })
              }
            >
              CAST
            </button>{" "}
          </div>
          <button
            onClick={() => {
              setShowLeaderboard(true);
            }}
            className="px-3 py-1.5 bg-[#a1055c] text-4xl uppercase text-white rounded-md"
          >
            <FaRankingStar />
          </button>
        </div>
      </div>
    );
  };

  const renderPaymentModal = () => {
    if (!showPaymentModal) return null;

    return (
      <div className="absolute z-[12000] inset-0 bg-[rgba(11,4,51,0.95)] flex flex-col items-center justify-center p-4">
        <h2 className="text-3xl text-white font-bold uppercase italic mb-6">
          Payment Required
        </h2>
        <p className="text-white text-xl mb-8 text-center">
          To play the game, you need to pay 0.2 MON for gas fees.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => setShowPaymentModal(false)}
            className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:scale-95 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            // onClick={handlePayment}
            disabled={isProcessingPayment}
            className="px-6 py-3 bg-[#a1055c] text-white rounded-xl hover:scale-95 transition-all duration-200 disabled:opacity-50"
          >
            {isProcessingPayment ? "Processing..." : "Pay 0.2 MON"}
          </button>
        </div>
      </div>
    );
  };

  const { switchChainAsync } = useSwitchChain();

  const [balance, setBalance] = useState(BigInt(0));
  const [deployed, setDeployed] = useState(false);

  const refresh = useCallback(async () => {
    if (!smartAccountAddress) return;

    try {
      const [bal, dep] = await Promise.all([
        checkSmartAccountBalance(smartAccountAddress),
        isSmartAccountDeployed(smartAccountAddress),
      ]);

      setBalance(bal);
      setDeployed(dep);

      return { balance: bal, deployed: dep };
    } catch (error) {
      console.error("Error refreshing account status:", error);
    }
  }, [smartAccountAddress]);

  useEffect(() => {
    refresh();
  }, [smartAccountAddress]);

  const { data: walletClient } = useWalletClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFundWallet = async () => {
    if (!walletClient || !smartAccountAddress) return;

    setIsProcessing(true);

    try {
      const currentChain = await walletClient.getChainId();

      if (currentChain !== monadTestnet.id) {
        console.log("Switching to Base...");
        await switchChainAsync({ chainId: monadTestnet.id });

        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      await fundSmartAccount(walletClient, smartAccountAddress, "1");

      const result = await refresh();

      if (result && result.balance < BigInt(parseEther("0.1"))) {
        throw new Error("Funding did not reach expected amount");
      }
    } catch (error) {
      console.error("Funding failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  console.log("smartAccount", smartAccount);
  console.log("isConnected", isConnected);
  console.log("address", address);
  console.log("smartAccountAddress", smartAccountAddress);
  console.log("deployed", deployed);
  console.log("balance", balance);

  return (
    <div
      className="sm:rounded-2xl relative overflow-hidden shadow-lg shadow-[rgba(0,0,0,0.2)] mx-auto lg:mt-[60px]"
      style={{
        maxWidth: "400px",
        textAlign: "center",
        fontFamily: "Boogaloo",
      }}
    >
      {notification && (
        <div
          className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-[13000] px-6 py-3 rounded-xl text-white font-bold ${
            notification.type === "success"
              ? "bg-green-500"
              : notification.type === "error"
              ? "bg-red-500"
              : "bg-blue-500"
          }`}
        >
          {notification.message}
        </div>
      )}
      {((!smartAccount && isConnected) || (!deployed && isConnected)) && (
        <SmartAccountManager
          balance={balance}
          deployed={deployed}
          refresh={
            refresh as () => Promise<{ balance: bigint; deployed: boolean }>
          }
        />
      )}
      {showPaymentModal && renderPaymentModal()}
      {showSettings && renderSettings()}
      {showLeaderboard && renderLeaderboard()}
      {!gameStarted && (
        <div className="absolute z-50 inset-0 py-10 flex flex-col items-center bg-[url('/bg/main-bg.jpg')] bg-no-repeat bg-bottom">
          <Image src="/logo/new-logo.png" alt="logo" width={300} height={120} />
          <div className="flex items-center gap-10 mt-[50px]">
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
          </div>{" "}
          <p className="text-white text-base mt-[65px]">
            Balance: {formatEther(balance) || 0}{" "}
            <span className="text-xs">MON</span>
          </p>
          <div className="flex gap-4 mt-5">
            <button
              onClick={() => {
                if (!isConnected && !smartAccount) {
                  connect({ connector: connectors[0] });
                  return;
                }
                setShowSettings(true);
              }}
              className="px-3 py-1.5 bg-[#a1055c] text-3xl uppercase text-white rounded-md"
            >
              <IoSettingsSharp />
            </button>
            <div className="flex items-center gap-5">
              <button
                onClick={startGame}
                className="font-bold uppercase text-3xl -mt-5 h-[55px] bg-[#a1055c] rounded-md text-white px-4 py-2 hover:scale-95 transition-all duration-200 ease-in-out"
                disabled={isInitialisingGame}
              >
                {!isConnected
                  ? "Connect Wallet"
                  : isInitialisingGame
                  ? "Initialising..."
                  : "Start"}
              </button>
            </div>
            <button
              onClick={() => {
                if (!isConnected) {
                  connect({ connector: connectors[0] });
                  return;
                }
                setShowLeaderboard(true);
              }}
              className="px-3 py-1.5 bg-[#a1055c] text-4xl uppercase text-white rounded-md disabled:opacity-50"
            >
              <FaRankingStar />
            </button>
          </div>
          {smartAccount ? (
            <button
              onClick={handleFundWallet}
              disabled={isProcessing}
              className="font-bold uppercase text-3xl mt-2.5 h-[55px] bg-[#a1055c] rounded-md text-white px-4 mx-auto py-2 hover:scale-95 transition-all duration-200 ease-in-out disabled:opacity-50"
            >
              {isProcessing ? "Funding..." : "Fund Wallet"}
            </button>
          ) : null}
          {error && <p className="text-red-500 text-sm mt-[20px]">{error}</p>}
        </div>
      )}
      {gameOver && renderGameOver()}
      <div className="w-full justify-between flex items-center bg-[#190e59] py-5 px-5 relative">
        <div className="flex flex-col items-center">
          <p className="text-lg text-cyan-300 mb-0 leading-[18px]">
            {/* Best Score */}
            {highestScore?.toString()}
          </p>
          {/* <p className="text-2xl text-white font-bold mt-0">
            {Number((currentGlobalCount as [bigint])?.[0] as bigint) || 0}
          </p> */}
        </div>
        <Image
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          src="/logo/new-logo.png"
          alt="logo"
          width={150}
          height={130}
        />
        <div className="flex items-center space-x-2 ml-auto">
          <div
            className="text-2xl bg-[rgba(255,255,255,0.1)] rounded-md p-2 cursor-pointer"
            onClick={toggleMute}
          >
            {isMuted ? <GoMute /> : <GoUnmute />}
          </div>
        </div>
        <div className="">
          <div className="flex flex-col left-2 bottom-[-210px] h-[200px] gap-1 items-start absolute z-30 max-w-[20px] flex-wrap">
            {Array.from({ length: lives }).map((_, i) => (
              <span key={i} className="text-lg ml-1">
                <img src="/logo/life.png" alt="life logo" />
              </span>
            ))}
          </div>
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
          backgroundImage: "url('/background/dede.png')",
          backgroundSize: "cover",
          backgroundPosition: "top",
          backgroundRepeat: "no-repeat",
          margin: "0 auto",
          overflow: "hidden",
        }}
      >
        <div
          className={`absolute top-[60px] z-[20] w-[350px] ${
            animate ? "animate-bonus" : "offscreen"
          }`}
        >
          {currentBonusImage && <img src={currentBonusImage} alt="Bonus" />}
        </div>

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
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/bonus/default.png";
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
            alt="tile"
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
            onClick={(e) => handleClick(e, colIndex)}
            style={{
              position: "absolute",
              top: 0,
              left: `${2 + colIndex * 24}%`,
              width: "22%",
              height: "100%",
              cursor: "pointer",
              zIndex: 10,
              border: "1px solid transparent",
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
