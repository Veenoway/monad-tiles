import { FarcasterActions } from "@/components/actions";
import AddFrameButton from "@/components/framer";
import { Home as HomeComponent } from "@/features/home";
import { Metadata } from "next";

export default function Home() {
  return (
    <>
      <FarcasterActions />
      <HomeComponent /> <AddFrameButton />
    </>
  );
}

const appUrl = process.env.NEXT_PUBLIC_URL;

export const metadata: Metadata = {
  title: "Monad Tiles",
  description: "Monad tiles is a web3 game aiming to stress the Monad testnet.",
  other: {
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: `${appUrl}/MonadTiles.jpg`, // Embed image URL (3:2 image ratio)
      button: {
        title: "Monad Tiles", // Text on the embed button
        action: {
          type: "launch_frame",
          name: "Monad Tiles",
          url: appUrl, // URL that is opened when the embed button is tapped or clicked.
          splashImageUrl: `${appUrl}/MonadTiles.jpg`,
          splashBackgroundColor: "#050505",
        },
      },
    }),
  },
};
