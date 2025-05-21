import { NextResponse } from "next/server";

const appUrl = "https://monadtiles.xyz";

const farcasterConfig = {
  accountAssociation: {
    header:
      "eyJmaWQiOjcwMzEwNSwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweGM3ZUIyQUJkMzZFZjI1NkI3ZEU1MkFjMTAzMkI5RDc3NEFFNGREQjEifQ",
    payload:
      "eyJkb21haW4iOiJhcnRocml0aXMtcm9tLWluc3RhbGxpbmctbXJuYS50cnljbG91ZGZsYXJlLmNvbSJ9",
    signature:
      "MHgzYzU5ZDhiOWM5M2MyOGM4ZjQ4N2RmMDMxNGEyNWRhZTE3MTgwYTM3YTJmMGMyNDIzNGJhYTZlOGEwNTI4Y2IzNTFjODU5NzE4ZWVlNzk1NTg1YzAxNGIyNjBlZWM4MmI5NTdmZjMwMjRhMzQ0NzM0NjVlMGJiYjgxNjA2MjU1ZjFj",
  },
  frame: {
    version: "1",
    name: "Monad Tiles",
    iconUrl: `${appUrl}/MonadTiles.jpg`,
    homeUrl: `${appUrl}`,
    imageUrl: `${appUrl}/MonadTiles.jpg`,
    screenshotUrls: [`${appUrl}/MonadTiles.jpg`],
    tags: ["monad", "farcaster", "miniapp", "game"],
    primaryCategory: "games",
    buttonTitle: "Play Monad Tiles",
    splashImageUrl: `${appUrl}/MonadTiles.jpg`,
    splashBackgroundColor: "#190e59",
  },
};

export async function GET() {
  return NextResponse.json(farcasterConfig);
}
