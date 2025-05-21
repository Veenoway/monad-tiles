import { NextResponse } from "next/server";

const appUrl = "https://monadtiles.xyz";

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
    iconUrl: `${appUrl}/MonadTiles.jpg`,
    homeUrl: `${appUrl}`,
    imageUrl: `${appUrl}/MonadTiles.jpg`,
    screenshotUrls: [`${appUrl}/MonadTiles.jpg`],
    tags: ["monad", "farcaster", "miniapp", "game", "tiles"],
    primaryCategory: "games",
    buttonTitle: "Play Monad Tiles",
    splashImageUrl: `${appUrl}/MonadTiles.jpg`,
    splashBackgroundColor: "#190e59",
  },
};

export async function GET() {
  return NextResponse.json(farcasterConfig);
}
