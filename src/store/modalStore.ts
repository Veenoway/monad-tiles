import { create } from "zustand";

interface ModalStoreType {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export const useModalStore = create<ModalStoreType>((set) => ({
  isOpen: false,
  setIsOpen: (value) => set({ isOpen: value }),
}));
