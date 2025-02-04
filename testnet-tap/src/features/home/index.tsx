"use client";
import { Card } from "@/components/card";
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
  const [cards, setCards] = useState(() =>
    shuffleArray([...cardsMemory, ...cardsMemory])
  );
  const [userSession, setUserSession] = useState<UserSessionType>({
    ...defaultUserSession,
    flippedCards: [],
  });
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.PLAYING);
  const { stressChain, globalStressCount, userStats, topStressers, isLoading } =
    useEnhancedStressTest();

  const handleCardClick = async (index: number, card: CardsType) => {
    if (
      gameStatus === GameStatus.WAITING ||
      userSession.flippedCards.length >= 2 ||
      userSession.flippedCards.includes(index) ||
      userSession.successCard.includes(card.src)
    ) {
      return;
    }

    await stressChain(1);

    const newFlippedCards = [...userSession.flippedCards, index];
    setUserSession((prev) => ({
      ...prev,
      flippedCards: newFlippedCards,
      guess: card.src,
      prevGuess: newFlippedCards.length === 2 ? prev.guess : prev.prevGuess,
    }));

    if (newFlippedCards.length === 2) {
      setGameStatus(GameStatus.WAITING);

      const firstCard = cards[newFlippedCards[0]];
      const secondCard = cards[newFlippedCards[1]];

      setTimeout(() => {
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
    setUserSession({
      ...defaultUserSession,
      flippedCards: [],
    });
    setGameStatus(GameStatus.PLAYING);
  };

  return (
    <main
      className="w-screen min-h-screen pb-[100px] font-montserrat"
      style={{
        backgroundImage: `url('/background/layer-4.svg')`,
        backgroundPosition: "center right",
        backgroundSize: "50%",
        backgroundRepeat: "no-repeat, no-repeat",
        backgroundBlendMode: "overlay, overlay",
      }}
    >
      <h1 className="w-fit text-5xl text-white font-bold pl-[2.5%] pt-[50px]">
        TESTNET TURBO TAP CHALLENGE: MEMORY
      </h1>
      <div className="w-[95%] mx-auto mt-10 flex gap-8">
        {/* Game Section - Left Side */}
        <div className="w-3/4">
          <div className="flex items-center justify-between mb-6">
            <button
              className="bg-green-700 px-4 h-[50px] rounded-xl text-white text-xl font-medium"
              onClick={resetGame}
            >
              New Game
            </button>
          </div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center text-red-600 mb-6 gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="text-4xl">
                  {i < userSession.hearts ? <FaHeart /> : <FaRegHeart />}
                </div>
              ))}
            </div>
            <p className="text-3xl text-white">
              Score: {userSession.successCard.length}/{cardsMemory.length}
            </p>
          </div>
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

            {/* Cards Grid */}
            <div className="grid grid-cols-6 gap-4">
              {cards.map((card, index) => (
                <div key={index} className="col-span-1">
                  <Card
                    card={card}
                    isFlipped={
                      userSession.flippedCards.includes(index) ||
                      userSession.successCard.includes(card.src)
                    }
                    onClick={() => handleCardClick(index, card)}
                    disabled={
                      gameStatus !== GameStatus.PLAYING ||
                      userSession.flippedCards.length >= 2
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section - Right Side */}
        <div className="w-1/4 bg-black/20 backdrop-blur-sm p-6 rounded-xl h-fit ml-5">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Global Stats</h2>
            <p className="text-xl text-white mb-2">
              Total Stress: {globalStressCount}
            </p>
            {userStats && (
              <p className="text-xl text-white">
                Your Stress: {userStats.stressCount}
              </p>
            )}
          </div>

          <div className="rounded-lg p-5">
            <h3 className="text-2xl font-bold text-white mb-4">
              Top Stressers
            </h3>
            <div className="flex flex-col gap-2">
              {topStressers.map((stresser, index) => (
                <div
                  key={stresser.user + index}
                  className="flex justify-between bg-black/30 px-3 py-1 rounded-lg"
                >
                  <span className="text-white text-lg">
                    <span className="text-yellow-500 font-bold">
                      #{index + 1}
                    </span>{" "}
                    {stresser.user.slice(0, 6)}...{stresser.user.slice(-4)}
                  </span>
                  <span className="text-white font-bold text-xl">
                    {stresser.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
