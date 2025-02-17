"use client";

import { useModalStore } from "@/store/modalStore";
import { FC, PropsWithChildren } from "react";
import { useConnect } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./modal";

export const WalletModal: FC<PropsWithChildren> = ({ children }) => {
  const { connect, connectors } = useConnect();
  const { isOpen, setIsOpen } = useModalStore();
  return (
    <Dialog open={isOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        close={() => setIsOpen(false)}
        className="sm:max-w-[425px] font-boo text-white bg-[#190e59] p-10 rounded-2xl border border-[rgba(255,255,255,0.1)]"
      >
        <DialogHeader>
          <DialogTitle
            className="text-4xl uppercase italic mb-5 text-white"
            style={{
              fontFamily: "Boogaloo",
            }}
          >
            Connect Wallet
          </DialogTitle>
        </DialogHeader>
        <div
          className="flex flex-wrap gap-5 w-full"
          style={{
            fontFamily: "Boogaloo",
          }}
        >
          {connectors?.map((connector, i) => (
            <button
              key={i}
              style={{
                width: "calc(50% - 10px)",
              }}
              onClick={() => {
                connect({ connector });
                setIsOpen(false);
              }}
              className=" bg-[#a1055c]  rounded-lg h-[50px] px-2 font-medium text-xl uppercase"
            >
              {connector.name}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
