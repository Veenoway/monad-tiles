"use client";
import { CardsType } from "@/features/home/models";
import { cn } from "@/utils/cn";
import Image from "next/image";
import { useEffect, useState } from "react";
import Tilt from "react-parallax-tilt";

type CardType = {
  card: CardsType;
  handleReset: (reset: () => void) => void;
  shouldReset: boolean;
  handleCardClick: (
    setIsFliped: (value: boolean) => void,
    card: CardsType
  ) => void;
};

export const Card = ({
  card,
  handleReset,
  setUserSession,
  shouldReset,
  handleCardClick,
  userSession,
}: CardType) => {
  const [isFliped, setIsFliped] = useState<boolean>(false);

  useEffect(() => {
    console.log("IS CALLED");
    if (isFliped) {
      handleCardClick(setIsFliped, card);
    }
  }, [isFliped]);

  const options = {
    glareEnable: true,
    glareMaxOpacity: 0.4,
    glareColor: "#ccc4fc",
    glarePosition: "all",
    glareBorderRadius: "40px",
    perspective: 2000,
    scale: 1,
    gyroscope: false,
    transitionSpeed: 1000,
    flipHorizontally: isFliped,
    tiltReverse: false,
  };

  return (
    <Tilt
      {...options}
      className={cn(
        "tiltcard cursor-pointer shadow-2xl bg-cover border-2 border-red-dark rounded-2xl relative parallax-effect-glare-scale h-[350px] w-auto"
      )}
    >
      <div
        onClick={() => {
          setUserSession((prev) => ({
            ...prev,
            prevGuess: prev.guess,
            guess: card.src,
          }));
          setIsFliped((prev) => !prev);
        }}
        className="w-full relative h-full flex justify-center items-center idd"
        // onClick={() => {
        //   setTurned(true);
        //   setIsFliped((prev) => !prev);
        //   setTimeout(() => setTurned(false), isFliped ? 1000 : 200);
        // }}
      >
        {isFliped || userSession?.successCard.includes(card.src) ? (
          <div
            className="z-1 rounded-[10px] flex flex-col bg-[#FFB200] justify-center items-center"
            style={{
              width: "calc(100% - 20px)",
              height: "calc(100% - 20px)",
            }}
          >
            <Image
              src={card.src}
              alt="Card name"
              fill={true}
              className="rounded-xl"
            />
          </div>
        ) : (
          <div
            className="z-1 rounded-[10px] bg-red-600 flex justify-center items-center"
            style={{
              width: "calc(100% - 20px)",
              height: "calc(100% - 20px)",
            }}
          ></div>
        )}
      </div>
    </Tilt>
  );
};
