"use client";
import { Card } from "@/components/card";
import { useEffect, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { cardsMemory, defaultPairCount, defaultUserSession } from "./constants";
import { CardsType } from "./models";

enum GameStatus {
  INHERT = 0,
  SUCCESS = 1,
  LOSE = 2,
}

type UserSessionType = {
  hearts: number;
  totalSuccess: number;
  guess: string;
  prevGuess: string;
  successCard: string[];
};

const shuffleArray = (cards: CardsType[]) => {
  const cardsBuffer = cards
    ?.map((item) => ({ ...item, random: Math.random() }))
    .sort((a, b) => a.random - b.random)
    .map(({ ...item }) => item);

  return cardsBuffer;
};

export const Home = () => {
  const defaultState = () => shuffleArray([...cardsMemory, ...cardsMemory]);
  const [cards, setCards] = useState(defaultState);
  const [shouldReset, setShouldReset] = useState(false);
  const [userSession, setUserSession] =
    useState<UserSessionType>(defaultUserSession);
  const [tryCount, setTryCount] = useState(defaultPairCount);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.INHERT);

  useEffect(() => {
    if (!userSession.hearts) {
      setTryCount(defaultPairCount);
      setUserSession(defaultUserSession);
      setGameStatus(GameStatus.LOSE);
      setTimeout(() => {
        setGameStatus(GameStatus.LOSE);
      }, 5000);
    } else if (userSession.successCard?.length >= 4) {
      setTryCount(defaultPairCount);
      setUserSession(defaultUserSession);
      setGameStatus(GameStatus.SUCCESS);
      setTimeout(() => {
        setGameStatus(GameStatus.INHERT);
      }, 5000);
    }
  }, [userSession.hearts, userSession.totalSuccess]);

  const handleCardClick = (
    setIsFliped: (value: boolean) => void,
    card: CardsType
  ) => {
    setTimeout(() => {
      if (userSession.successCard.includes(card.src)) {
        setIsFliped(true);
      } else {
        setIsFliped(false);
      }
    }, 1000);
  };

  const checkIfSame = () => {
    if (
      userSession.prevGuess === userSession.guess &&
      userSession.prevGuess &&
      userSession.guess
    ) {
      setUserSession((prev) => ({
        ...prev,
        totalSuccess: prev.totalSuccess + 1,
        successCard: [...prev.successCard, prev.guess],
      }));
    } else if (tryCount.pairCount === 2) {
      setUserSession((prev) => ({
        ...prev,
        hearts: prev.hearts - 1,
      }));
    }
  };

  useEffect(() => {
    if (tryCount.pairCount === 2) {
      checkIfSame();
      setTryCount((prev) => ({
        ...prev,
        pairCount: 0,
      }));
    }
    if (!userSession.hearts) {
    } else {
      setShouldReset(true);
    }
  }, [tryCount.pairCount, userSession.hearts]);

  const handleReset = (callback: () => void) => {
    callback();
    setShouldReset(false);
  };

  const handleShuffle = () => {
    setCards(defaultState);
  };

  return (
    <main className="w-screen min-h-screen pb-[100px] font-poppins">
      <div className="w-[90%] mx-auto pt-[100px] ">
        <h1 className="w-fit text-5xl text-white font-bold mx-auto">
          TESTNET TURBO TAP CHALLENGE: MEMORY
        </h1>
        <div className="py-5 flex items-center justify-between mt-[100px]">
          <button
            className="bg-green-700 px-4 h-[50px] rounded-xl text-white text-xl font-medium"
            onClick={handleShuffle}
          >
            Shuffle
          </button>
          <p className="text-3xl text-white">
            Current Score: {userSession.totalSuccess}/{tryCount.totalCount}
          </p>
        </div>
        <div className="flex items-center gap-5">
          <p className="text-3xl text-white">
            ACTUAL GUESS: {userSession.guess}
          </p>
          <p className="text-3xl text-white">
            PREV GUESS: {userSession.prevGuess}
          </p>{" "}
        </div>
        <div className="flex items-center text-red-600">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="text-4xl">
              {i + 1 <= userSession.hearts ? <FaHeart /> : <FaRegHeart />}
            </div>
          ))}
        </div>

        <div className="mt-5 relative p-2">
          <div
            className={`${
              gameStatus !== GameStatus.INHERT
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }  bg-[rgba(0,0,0,0.4)] backdrop-blur-sm w-full
             h-full flex items-center justify-center transition-all duration-300 z-10 ease-in-out absolute left-0 top-0`}
          >
            {gameStatus === GameStatus.SUCCESS ? (
              <p className="text-6xl font-bold">Congrats, You won</p>
            ) : (
              <p className="text-6xl font-bold">Game Over</p>
            )}
          </div>
          <div
            className="grid grid-cols-6 gap-5"
            onClick={() =>
              setTryCount((prev) => ({
                pairCount: prev.pairCount + 1,
                totalCount: prev.totalCount + 1,
              }))
            }
          >
            {cards?.map((card, i) => (
              <div className="col-span-1" key={i}>
                <Card
                  card={card}
                  shouldReset={shouldReset}
                  handleReset={() => handleReset}
                  setUserSession={setUserSession}
                  userSession={userSession}
                  handleCardClick={handleCardClick}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};
