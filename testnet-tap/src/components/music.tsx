import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";

const melody = [
  // Section A (ouverture)
  "E5",
  "D#5",
  "E5",
  "D#5",
  "E5",
  "B4",
  "D5",
  "C5",
  "A4",
  "C4",
  "E4",
  "A4",
  "B4",
  "E4",
  "E4",
  "E5",
  "D#5",
  "E5",
  "D#5",
  "E5",
  "B4",
  "D5",
  "C5",
  "A4",
  "C4",
  "E4",
  "A4",
  "B4",
  "E4",
  "G#4",
  "B4",
  "C5",

  // Section B (partie centrale)
  "E5",
  "E5",
  "E5",
  "E5",
  "F5",
  "G5",
  "G#5",
  "A5",
  "F5",
  "G5",
  "A5",
  "B5",
  "C6",
  "B5",
  "A5",
  "G#5",

  // Section A (retour)
  "E5",
  "D#5",
  "E5",
  "D#5",
  "E5",
  "B4",
  "D5",
  "C5",
  "A4",
  "C4",
  "E4",
  "A4",
  "B4",
  "E4",
  "E4",
  "E5",
  "D#5",
  "E5",
  "D#5",
  "E5",
  "B4",
  "D5",
  "C5",
  "A4",
  "C4",
  "E4",
  "A4",
  "B4",
  "E4",
  "G#4",
  "B4",
  "C5",

  // Section C (pont / bridge)
  "A4",
  "C5",
  "E5",
  "A5",
  "G#5",
  "E5",
  "A4",
  "C5",
  "E5",
  "A5",
  "G#5",
  "E5",

  // Section A (finale / coda)
  "E5",
  "D#5",
  "E5",
  "D#5",
  "E5",
  "B4",
  "D5",
  "C5",
  "A4",
  "C4",
  "E4",
  "A4",
  "B4",
  "E4",
  "E4",
  "E5",
  "D#5",
  "E5",
  "D#5",
  "E5",
  "B4",
  "D5",
  "C5",
  "A4",
  "C4",
  "E4",
  "A4",
  "B4",
  "E4",
  "G#4",
  "B4",
  "C5",
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

  const animTimerRef = useRef(null);
  const spawnTimerRef = useRef(null);
  const accelTimerRef = useRef(null);

  const synthRef = useRef(null);
  const lastScheduledTimeRef = useRef(0);

  const spawnIndexRef = useRef(0);

  const startGame = async () => {
    setRows([]);
    setScore(0);
    setMissedCount(0);
    setGameOver(false);
    setTileSpeed(computedInitialSpeed);
    setSpawnInterval(600);
    spawnIndexRef.current = 0;
    lastScheduledTimeRef.current = 0;
    setIsPlaying(true);
    await Tone.start();
  };

  const endGame = (message) => {
    setIsPlaying(false);
    setGameOver(true);
    clearInterval(animTimerRef.current);
    clearInterval(spawnTimerRef.current);
    clearInterval(accelTimerRef.current);
    alert(message);
  };

  useEffect(() => {
    if (!isPlaying) return;
    animTimerRef.current = setInterval(() => {
      setRows((prevRows) => {
        let missIncrement = 0;
        const updatedRows = prevRows
          .map((row) => ({
            ...row,
            top: row.top + tileSpeed,
          }))
          .filter((row) => {
            if (row.top >= containerHeight) {
              missIncrement++;
              return false;
            }
            return true;
          });
        if (missIncrement > 0) {
          setMissedCount((prev) => {
            const newCount = prev + missIncrement;
            if (newCount >= 5) {
              endGame("Game Over ! Vous avez raté 5 tuiles.");
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
      const newTile = {
        id: Date.now() + Math.random(),
        top: -rowHeight,
        blackColumn: Math.floor(Math.random() * columns),
        note: noteValue,
      };
      setRows((prev) => [...prev, newTile]);
      spawnIndexRef.current = (spawnIndexRef.current + 1) % melody.length;
    }, spawnInterval);
    return () => clearInterval(spawnTimerRef.current);
  }, [isPlaying, spawnInterval, rowHeight]);

  useEffect(() => {
    if (!isPlaying) return;
    accelTimerRef.current = setInterval(() => {
      setTileSpeed((prev) => prev * 1.1);
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
        if (synthRef.current && tile.note) {
          const scheduledTime = Math.max(
            Tone.now() + 0.05,
            lastScheduledTimeRef.current + 0.01
          );
          lastScheduledTimeRef.current = scheduledTime;
          synthRef.current.triggerAttackRelease(tile.note, "8n", scheduledTime);
        }
        setScore((prev) => prev + 1);
        const newRows = [...prevRows];
        newRows.splice(tileIndex, 1);
        return newRows;
      }
      return prevRows;
    });
  };

  useEffect(() => {
    synthRef.current = new Tone.Synth().toDestination();
  }, []);

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "20px auto",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Piano Tiles</h1>
      <p style={{ fontSize: "20px" }}>Score : {score}</p>
      <p style={{ fontSize: "16px" }}>Ratés : {missedCount} / 5</p>
      {isPlaying ? (
        <button
          onClick={() => setIsPlaying(false)}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            background: "#e74c3c",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginBottom: "10px",
          }}
        >
          Pause
        </button>
      ) : (
        <button
          onClick={startGame}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            background: "#27ae60",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginBottom: "10px",
          }}
        >
          {gameOver ? "Rejouer" : "Start"}
        </button>
      )}

      {/* Zone de jeu */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: containerHeight + "px",
          background: "#fff",
          border: "2px solid #000",
          margin: "0 auto",
          overflow: "hidden",
        }}
      >
        {/* Zone de hit (barre verte) fixe en bas */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: rowHeight + "px",
            background: "rgba(0,255,0,0.3)",
            pointerEvents: "none",
            zIndex: 5,
          }}
        ></div>

        {rows.map((tile) => (
          <div
            key={tile.id}
            style={{
              position: "absolute",
              top: tile.top + "px",
              left: `${(tile.blackColumn * 100) / columns}%`,
              width: `${100 / columns}%`,
              height: rowHeight + "px",
              background: "#000",
              zIndex: 4,
              border: "1px solid #000",
              boxSizing: "border-box",
              boxShadow: "0px 4px 6px rgba(0,0,0,0.3)",
            }}
          ></div>
        ))}

        {[...Array(columns)].map((_, colIndex) => (
          <div
            key={colIndex}
            onClick={() => handleClick(colIndex)}
            style={{
              position: "absolute",
              top: 0,
              left: `${(colIndex * 100) / columns}%`,
              width: `${100 / columns}%`,
              height: "100%",
              cursor: "pointer",
              zIndex: 10,
              border: "1px solid #000",
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default PianoTilesGame;
