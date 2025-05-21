import { MiniAppProvider } from "@/lib/farcaster/context";
import { FrameProvider } from "@/lib/farcaster/provider";
import { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const poppins = Montserrat({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: "500",
});

export const metadata: Metadata = {
  title: "Monad Farcaster MiniApp Template",
  description: "A template for building mini-apps on Farcaster and Monad",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <FrameProvider>
          <MiniAppProvider>{children}</MiniAppProvider>
        </FrameProvider>
      </body>
    </html>
  );
}
