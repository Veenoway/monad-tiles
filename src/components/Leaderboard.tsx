import React, { useCallback } from "react";
import { formatEther } from "viem";
import { usePianoRelay } from "../hook/usePianoTiles";

const Leaderboard: React.FC = () => {
  const {
    playerStats,
    currentPage,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    canGoToNextPage,
    canGoToPreviousPage,
  } = usePianoRelay();

  const handlePreviousPage = useCallback(() => {
    goToPreviousPage();
  }, [goToPreviousPage]);

  const handleNextPage = useCallback(() => {
    goToNextPage();
  }, [goToNextPage]);

  if (!playerStats || playerStats.length === 0) {
    return <div className="text-center p-4">Chargement du leaderboard...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>

      <div className="flex flex-col gap-4">
        {playerStats.map((player, index) => (
          <div
            key={player.address}
            className="bg-gray-800 p-4 rounded-lg flex justify-between items-center"
          >
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold">
                #{currentPage * 10 + index + 1}
              </span>
              <div>
                <p className="font-medium">{player.address}</p>
                <p className="text-sm text-gray-400">
                  Meilleur score: {formatEther(player.bestScore)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p>Score: {formatEther(player.lastScore)}</p>
              <p className="text-sm text-gray-400">
                Clicks: {formatEther(player.clickCount)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={handlePreviousPage}
            disabled={!canGoToPreviousPage}
            className="px-4 py-2 bg-blue-500 rounded disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {"<"}
          </button>

          <span className="text-lg">
            Page {currentPage + 1}/{totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={!canGoToNextPage}
            className="px-4 py-2 bg-blue-500 rounded disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {">"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
