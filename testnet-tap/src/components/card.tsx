import { CardsType } from "@/features/home/models";
import { cn } from "@/utils/cn";
import Image from "next/image";
import Tilt from "react-parallax-tilt";

type CardProps = {
  card: CardsType;
  isFlipped: boolean;
  isLoading: boolean;
  onClick: () => void;
  disabled: boolean;
};

export const Card = ({ card, isFlipped, onClick, disabled }: CardProps) => {
  const options = {
    glareEnable: true,
    glareMaxOpacity: 0.4,
    glareColor: "#ccc4fc",
    glarePosition: "all",
    glareBorderRadius: "10px",
    perspective: 2000,
    scale: 1,
    gyroscope: false,
    transitionSpeed: 1000,
    flipHorizontally: isFlipped,
    tiltReverse: false,
  };

  return (
    <Tilt
      {...(options as unknown as Tilt)}
      className={cn(
        " shadow-2xl border-2 bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] rounded-xl relative  h-[25vh] w-auto",
        {
          "cursor-pointer hover:scale-105 transition-transform": !disabled,
          "cursor-not-allowed opacity-70": disabled,
        }
      )}
    >
      <div
        onClick={() => !disabled && onClick()}
        className="w-full relative h-full flex justify-center items-center"
      >
        <div
          className={cn(
            "z-1 rounded-xl flex flex-col justify-center items-center transition-all duration-300",
            {
              "bg-[#FFB200]": isFlipped,
              "bg-[url('/cards/verso.jpg')] bg-right bg-cover": !isFlipped,
            }
          )}
          style={{
            width: "calc(100% - 20px)",
            height: "calc(100% - 20px)",
          }}
        >
          {isFlipped && (
            <Image
              src={card.src}
              alt="Card"
              fill={true}
              className="rounded-lg object-cover"
            />
          )}
        </div>
      </div>
    </Tilt>
  );
};
