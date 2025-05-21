import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Frame action received:", body);

    // Retourner une réponse avec un nouveau frame
    return NextResponse.json({
      version: "vNext",
      image: "https://monadtiles.xyz/images/feed.png",
      buttons: [
        {
          label: "Play Again",
          action: "post",
        },
      ],
      postUrl: "https://monadtiles.xyz/api/frame",
    });
  } catch (error) {
    console.error("Error handling frame action:", error);
    return NextResponse.json(
      { error: "Failed to process frame action" },
      { status: 500 }
    );
  }
}
