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
  // ---------------------------------------------------------------------------
  // HOOK WAGMI + STRESS
  // ---------------------------------------------------------------------------
  const {
    approveAndExecuteStress,
    globalStressCount,
    userStats,
    topStressers,
    isLoading,
  } = useEnhancedStressTest();

  // ---------------------------------------------------------------------------
  // ÉTATS LOCAUX
  // ---------------------------------------------------------------------------
  // On mélange les cartes
  const [cards, setCards] = useState<CardsType[]>(() =>
    shuffleArray([...cardsMemory, ...cardsMemory])
  );

  // Session du joueur (hearts, flips, etc.)
  const [userSession, setUserSession] = useState<UserSessionType>({
    ...defaultUserSession,
    flippedCards: [],
  });

  // Compteur de flips prépayés (qu’on ne re-déclenchera pas on-chain)
  const [paidFlips, setPaidFlips] = useState(0);

  // État de la partie
  const [gameStatus, setGameStatus] = useState(GameStatus.PLAYING);

  // Pour l’achat de flips “custom”
  const [selectedCount, setSelectedCount] = useState(10);

  // ---------------------------------------------------------------------------
  // BOUTON : BUY X FLIPS (transaction unique)
  // ---------------------------------------------------------------------------
  const handleBuyFlips = async (count: number) => {
    try {
      // 1) On appelle la fonction du smart contract (=> pop-up)
      //    Ça incrémente déjà globalStressCount de 'count' tout de suite
      await approveAndExecuteStress(count);

      // 2) On ajoute 'count' aux flips prépayés locaux
      setPaidFlips((prev) => prev + count);
    } catch (err) {
      console.error("handleBuyFlips error:", err);
    }
  };

  // ---------------------------------------------------------------------------
  // CLIC SUR UNE CARTE
  // ---------------------------------------------------------------------------
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
      // 1) Logique front (flip local)
      const newFlippedCards = [...userSession.flippedCards, index];
      setUserSession((prev) => ({
        ...prev,
        flippedCards: newFlippedCards,
        guess: card.src,
        prevGuess: newFlippedCards.length === 2 ? prev.guess : prev.prevGuess,
      }));

      // 2) Vérifie si on a un flip “prépayé”
      if (paidFlips > 0) {
        // => Pas de transaction => on décrémente localement
        setPaidFlips((prev) => prev - 1);
      } else {
        // => Sinon, transaction “1 par clic”
        await approveAndExecuteStress(1);
      }

      // 3) Si on a 2 cartes retournées, on compare
      if (newFlippedCards.length === 2) {
        setGameStatus(GameStatus.WAITING);
        setTimeout(() => {
          const firstCard = cards[newFlippedCards[0]];
          const secondCard = cards[newFlippedCards[1]];

          if (firstCard.src === secondCard.src) {
            // Succès
            setUserSession((prev) => ({
              ...prev,
              totalSuccess: prev.totalSuccess + 1,
              successCard: [...prev.successCard, firstCard.src],
              flippedCards: [],
            }));
          } else {
            // Échec
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

  // ---------------------------------------------------------------------------
  // CHECK FIN DE PARTIE
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (userSession.hearts === 0) {
      setGameStatus(GameStatus.LOSE);
    } else if (userSession.successCard.length === cardsMemory.length) {
      setGameStatus(GameStatus.SUCCESS);
    }
  }, [userSession.hearts, userSession.successCard.length]);

  // ---------------------------------------------------------------------------
  // RESET GAME
  // ---------------------------------------------------------------------------
  const resetGame = () => {
    setCards(shuffleArray([...cardsMemory, ...cardsMemory]));
    setUserSession({ ...defaultUserSession, flippedCards: [] });
    setGameStatus(GameStatus.PLAYING);
    // Note : paidFlips n’est pas remis à zéro ici, à toi de décider si tu veux le reset
  };

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <main
      className="w-screen min-h-screen pb-[100px] font-montserrat"
      style={{
        backgroundImage: `url('/background/orderly-gradient.png')`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundBlendMode: "overlay",
      }}
    >
      <h1 className="w-fit text-5xl text-white font-montserrat font-bold pl-[2.5%] pt-[50px]">
        MEMORY GAME: STRESS MONAD
      </h1>

      <div className="w-[95%] mx-auto mt-10 flex gap-8">
        {/* PARTIE GAUCHE : Jeu */}
        <div className="w-3/4">
          <div className="flex items-center justify-between mb-5">
            {/* Score & Hearts */}
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

            {/* BOUTONS */}
            <div className="flex flex-col gap-2">
              {/* Nouveau jeu */}
              <button
                className="bg-[#836EF9] px-4 h-[50px] rounded-xl text-white text-xl font-medium"
                onClick={resetGame}
              >
                New Game
              </button>

              {/* Acheter 10 flips d’un coup */}
              <button
                className="bg-[#836EF9] px-4 h-[50px] rounded-xl text-white text-xl font-medium"
                onClick={() => handleBuyFlips(10)}
                disabled={isLoading}
              >
                Buy 10 flips
              </button>
              <p className="text-white">Paid flips: {paidFlips}</p>

              {/* Optionnel : acheter un nombre custom */}
              <div className="flex items-center gap-2 mt-4">
                <input
                  type="number"
                  value={selectedCount}
                  onChange={(e) =>
                    setSelectedCount(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-[70px] px-4 py-2 rounded-xl bg-white/10 text-white"
                  placeholder="Count"
                />
                <button
                  onClick={() => handleBuyFlips(selectedCount)}
                  disabled={isLoading}
                  className="bg-[#836EF9] px-4 h-[50px] rounded-xl text-white text-xl font-medium"
                >
                  Buy {selectedCount}
                </button>
              </div>
            </div>

            {/* Stats utilisateur */}
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

          {/* Plateau de cartes */}
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

        {/* PARTIE DROITE : TOP STRESSERS */}
        <div className="w-1/4 bg-black/20 backdrop-blur-sm p-6 rounded-2xl h-fit ml-5">
          <div className="rounded-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.1)]">
              <h3 className="text-2xl font-bold text-white">Top Stressers</h3>
              <p className="text-2xl font-bold text-white">
                Total: {globalStressCount}
              </p>
            </div>
            <div className="flex flex-col">
              {topStressers?.map((stresser, index) => (
                <div
                  key={`${stresser.user}-${index}`}
                  className="flex justify-between border-b border-[rgba(255,255,255,0.1)] py-2"
                >
                  <span
                    className={`font-bold text-base ${
                      index < 3 ? "text-[#836EF9]" : "text-white"
                    }`}
                  >
                    <span>#{index + 1}</span> {stresser.user.slice(0, 6)}...
                    {stresser.user.slice(-4)}
                  </span>
                  <span
                    className={`font-bold text-base ${
                      index < 3 ? "text-[#836EF9]" : "text-white"
                    }`}
                  >
                    {stresser.count.toString()}
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
