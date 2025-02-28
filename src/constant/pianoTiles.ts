export const PIANO_CONTRACT_ADDRESS =
  "0xcd9479b8C4959A476C6e361a5213C165E9236A1C";

export const PIANO_CONTRACT_ABI = [
  {
    type: "event",
    name: "Click",
    inputs: [
      {
        name: "player",
        type: "address",
        indexed: true,
      },
      {
        name: "newTxCount",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "NewLeaderboardEntry",
    inputs: [
      {
        name: "player",
        type: "address",
        indexed: true,
      },
      {
        name: "score",
        type: "uint256",
        indexed: false,
      },
      {
        name: "rank",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ScoreSubmitted",
    inputs: [
      {
        name: "player",
        type: "address",
        indexed: true,
      },
      {
        name: "lastScore",
        type: "uint256",
        indexed: false,
      },
      {
        name: "bestScore",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: "function",
    name: "AUTHORIZED_ADDRESS",
    inputs: [],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "MAX_LEADERBOARD_SIZE",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "click",
    inputs: [{ type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getAllPlayersStats",
    inputs: [],
    outputs: [
      { type: "address[]" },
      { type: "uint256[]" },
      { type: "uint256[]" },
      { type: "uint256[]" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getLeaderboard",
    inputs: [],
    outputs: [
      { type: "address[]" },
      { type: "uint256[]" },
      { type: "uint256[]" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPlayerStats",
    inputs: [{ type: "address" }],
    outputs: [
      { type: "uint256" },
      { type: "uint256" },
      { type: "uint256" },
      { type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPlayersStatsPaginated",
    inputs: [{ type: "uint256" }, { type: "uint256" }],
    outputs: [
      { type: "address[]" },
      { type: "uint256[]" },
      { type: "uint256[]" },
      { type: "uint256[]" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRank",
    inputs: [{ type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTotalPlayers",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "leaderboard",
    inputs: [{ type: "uint256" }],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "players",
    inputs: [{ type: "address" }],
    outputs: [
      { type: "uint256" },
      { type: "uint256" },
      { type: "uint256" },
      { type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "playersList",
    inputs: [{ type: "uint256" }],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "submitScore",
    inputs: [{ type: "uint256" }, { type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
];
