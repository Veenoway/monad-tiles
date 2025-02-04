export const cardsMemory: { src: string; id: number; random?: any }[] = [
  {
    src: "/cards/chog.webp",
    id: 0,
  },
  {
    src: "/cards/moyaki.webp",
    id: 1,
  },
  {
    src: "/cards/molandak.webp",
    id: 2,
  },
  {
    src: "/cards/mike.webp",
    id: 3,
  },
  {
    src: "/cards/portdev.webp",
    id: 4,
  },
  {
    src: "/cards/mouch.png",
    id: 4,
  },
];

export const defaultUserSession = {
  hearts: 5,
  totalSuccess: 0,
  guess: "",
  prevGuess: "",
  successCard: [],
};

export const defaultPairCount = {
  pairCount: 0,
  totalCount: 0,
};
