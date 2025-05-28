import { usePianoRelay } from "@/hook/usePianoTiles";

export const GasPaymentInfo = () => {
  const { gameCount, gamesUntilPayment } = usePianoRelay();

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-bold mb-2">Gas fees</h3>
      <p className="text-sm">
        Game played : <span className="font-bold">{gameCount}</span>
      </p>
      <p className="text-sm">
        Next payment in :{" "}
        <span className="font-bold">{gamesUntilPayment} parties</span>
      </p>
      <p className="text-xs mt-2 text-gray-300">
        Gas fees of 0.1 MON every 10 games
      </p>
    </div>
  );
};
