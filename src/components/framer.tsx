"use client";
import { sdk } from "@farcaster/frame-sdk";

export default function AddFrameButton() {
  return (
    <button
      onClick={async () => {
        await sdk.actions.addFrame();
      }}
      title="Mini App'i Warpcast'e ekle"
      className="fixed bottom-6 right-6 z-50 bg-[#836EF9] hover:bg-[#A0055D] text-white rounded-full shadow-lg p-3 transition-all duration-200 flex items-center justify-center"
      style={{
        minWidth: 44,
        minHeight: 44,
        boxShadow: "0 4px 16px rgba(32,0,82,0.18)",
      }}
    >
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
        <path
          d="M12 5v14m7-7H5"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
