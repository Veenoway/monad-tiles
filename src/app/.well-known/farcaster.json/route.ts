import { NextResponse } from "next/server";

const appUrl = process.env.NEXT_PUBLIC_URL || "https://monadtiles.xyz/";

export async function GET() {
  const farcasterConfig = {
    accountAssociation: {
      header:
        "eyJmaWQiOjcwMzEwNSwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweGM3ZUIyQUJkMzZFZjI1NkI3ZEU1MkFjMTAzMkI5RDc3NEFFNGREQjEifQ",
      payload: "eyJkb21haW4iOiJtb25hZHRpbGVzLnh5eiJ9",
      signature:
        "MHgyZmNkMzdkZGM4MjhhNDQ1ZmRjMTMwZTRjY2UyNTEyNjZiYTllY2VlMjBkMDA3ODE0NDBjMTBhNTQwNTdhMzY5MWI5MTZhOWQ3M2I5MmFjYzI4NDJiNDM1ZGEwNjVmZjViMDVlYjU0ODE1NzgzZjAxNzE1MmYxOWY3NjI2NmFlMzFj",
    },
    frame: {
      version: "1",
      name: "Monad Tiles",
      iconUrl: `${appUrl}/logo.png`,
      homeUrl: `${appUrl}`,
      imageUrl: `${appUrl}/logo-m.jpg`,
      screenshotUrls: [`${appUrl}/MonadTiles.jpg`],
      tags: ["monad", "farcaster", "miniapp", "game", "tiles"],
      primaryCategory: "games",
      buttonTitle: "Play Monad Tiles",
      splashImageUrl: `${appUrl}/pfp-port.png`,
      splashBackgroundColor: "#190e59",
      disableNativeGestures: true,
      allowFullscreen: true,
    },
  };
  return NextResponse.json(farcasterConfig);
}
