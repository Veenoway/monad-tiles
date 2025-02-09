"use client";

import { Card } from "@/components/card";
import PianoTilesGame from "@/components/music";
import { useEnhancedStressTest } from "@/hook/useStress";
import { useEffect, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { cardsMemory, defaultUserSession } from "./constants";
import { CardsType } from "./models";

enum GameStatus {
  PLAYING = 0,
  SUCCESS = 1,
  LOSE = 2,
  WAITING = 3,
}

type UserSessionType = {
  hearts: number;
  totalSuccess: number;
  guess: string;
  prevGuess: string;
  successCard: string[];
  flippedCards: number[];
};

const shuffleArray = (cards: CardsType[]) => {
  return [...cards].sort(() => Math.random() - 0.5);
};

export const Home = () => {
  const {
    approveAndExecuteStress,
    batchApproveAndExecuteStress,
    globalStressCount,
    userStats,
    topStressers,
    isLoading,
    selectedCount,
    setSelectedCount,
  } = useEnhancedStressTest();

  const [cards, setCards] = useState<CardsType[]>(() =>
    shuffleArray([...cardsMemory, ...cardsMemory])
  );

  const [userSession, setUserSession] = useState<UserSessionType>({
    ...defaultUserSession,
    flippedCards: [],
  });

  const [paidFlips, setPaidFlips] = useState(0);

  const [gameStatus, setGameStatus] = useState(GameStatus.PLAYING);

  const handleCardClick = async (index: number, card: CardsType) => {
    if (
      gameStatus === GameStatus.WAITING ||
      userSession.flippedCards.length >= 2 ||
      userSession.flippedCards.includes(index) ||
      userSession.successCard.includes(card.src) ||
      isLoading
    ) {
      return;
    }

    try {
      const newFlippedCards = [...userSession.flippedCards, index];
      setUserSession((prev) => ({
        ...prev,
        flippedCards: newFlippedCards,
        guess: card.src,
        prevGuess: newFlippedCards.length === 2 ? prev.guess : prev.prevGuess,
      }));

      if (paidFlips > 0) {
        setPaidFlips((prev) => prev - 1);
      } else {
        await approveAndExecuteStress(1);
      }

      if (newFlippedCards.length === 2) {
        setGameStatus(GameStatus.WAITING);
        setTimeout(() => {
          const firstCard = cards[newFlippedCards[0]];
          const secondCard = cards[newFlippedCards[1]];

          if (firstCard.src === secondCard.src) {
            setUserSession((prev) => ({
              ...prev,
              totalSuccess: prev.totalSuccess + 1,
              successCard: [...prev.successCard, firstCard.src],
              flippedCards: [],
            }));
          } else {
            setUserSession((prev) => ({
              ...prev,
              hearts: prev.hearts - 1,
              flippedCards: [],
            }));
          }
          setGameStatus(GameStatus.PLAYING);
        }, 1000);
      }
    } catch (err) {
      console.error("Game action failed:", err);
      setGameStatus(GameStatus.PLAYING);
    }
  };

  useEffect(() => {
    if (userSession.hearts === 0) {
      setGameStatus(GameStatus.LOSE);
    } else if (userSession.successCard.length === cardsMemory.length) {
      setGameStatus(GameStatus.SUCCESS);
    }
  }, [userSession.hearts, userSession.successCard.length]);

  const resetGame = () => {
    setCards(shuffleArray([...cardsMemory, ...cardsMemory]));
    setUserSession({ ...defaultUserSession, flippedCards: [] });
    setGameStatus(GameStatus.PLAYING);
  };

  return (
    <main
      className="w-screen min-h-screen pb-[100px] font-montserrat"
      style={{
        backgroundImage: `url('/background/imp-bg.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-[95%] mx-auto pt-10 flex gap-8">
        <div className="w-3/4">
          <div className="flex items-center justify-between mb-5">
            <div className="flex flex-col text-red-600 mb-6 gap-2">
              <p className="text-3xl text-white">
                Score: {userSession.successCard.length}/{cardsMemory.length}
              </p>
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="text-4xl">
                    {i < userSession.hearts ? <FaHeart /> : <FaRegHeart />}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                className="bg-[#836EF9] px-4 h-[50px] rounded-xl text-white text-xl font-medium"
                onClick={resetGame}
              >
                New Game
              </button>
            </div>
            <div className="flex flex-col items-end">
              {userStats && (
                <div className="text-white">
                  <p className="text-3xl">
                    Your Stress: {userStats.stressCount.toString()}
                  </p>
                  <p className="text-xl">
                    Remaining: {Number(userStats.remainingAllowance) / 1e18}{" "}
                    DMON
                  </p>
                  <p className="text-sm">
                    Approved stress: {Number(userStats.approvedStressCount)}
                    {isLoading && " (loading...)"}
                  </p>
                </div>
              )}
            </div>
          </div>
          <PianoTilesGame />
          <div className="relative">
            {(gameStatus === GameStatus.SUCCESS ||
              gameStatus === GameStatus.LOSE) && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="text-center">
                  <p className="text-6xl font-bold text-white mb-8">
                    {gameStatus === GameStatus.SUCCESS
                      ? "You Won! 🎉"
                      : "Game Over 😢"}
                  </p>
                  <button
                    onClick={resetGame}
                    className="bg-green-700 px-8 py-4 rounded-xl text-white text-xl font-medium hover:bg-green-600"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-6 gap-4">
              {cards.map((card, index) => (
                <div key={index} className="col-span-1">
                  <Card
                    card={card}
                    onClick={() => handleCardClick(index, card)}
                    isFlipped={
                      userSession.flippedCards.includes(index) ||
                      userSession.successCard.includes(card.src)
                    }
                    disabled={
                      gameStatus !== GameStatus.PLAYING ||
                      userSession.flippedCards.length >= 2 ||
                      isLoading
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-1/4 bg-black/20 backdrop-blur-sm p-6 rounded-2xl h-fit ml-5">
          <div className="rounded-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.1)]">
              <h3 className="text-2xl font-bold text-white">Top Stressers</h3>
              <p className="text-2xl font-bold text-white">
                Total: {globalStressCount}
              </p>
            </div>
            <div className="flex flex-col">
              <table>
                <thead>
                  <tr>
                    <th className="pl-3 py-2 text-start">Rank</th>
                    <th className="px-3 py-2 text-start">Address</th>
                    <th className="px-3 py-2 text-end">Stress</th>
                    <th className="pr-3 py-2 text-end">W/L Ratio</th>
                  </tr>
                </thead>
                <tbody>
                  {topStressers?.map((stresser, index) => (
                    <tr
                      key={`${stresser.user}-${index}`}
                      className={`text-white font-semibold ${
                        index % 2 === 0 ? "bg-[rgba(255,255,255,0.1)]" : ""
                      }`}
                    >
                      <td className="pl-3 py-2 text-start">#{index + 1}</td>
                      <td className="px-3 text-start">
                        {stresser.user.slice(0, 6)}...
                        {stresser.user.slice(-4)}
                      </td>
                      <td className="px-3 text-end">
                        {" "}
                        {stresser.count.toString()}
                      </td>
                      <td className="pr-3 text-end">1.64</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
