const { ethers } = require("ethers");

const PIANO_CONTRACT_ADDRESS = "0xF5A7a8E34738C3e50b300741768De34d29b8FF78";

const PIANO_CONTRACT_ABI = [
  {
    type: "function",
    name: "click",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "_userAddress",
        type: "address",
      },
    ],
    outputs: [],
  },
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
    inputs: [],
    name: "payGameFee",
    outputs: [],
    stateMutability: "payable",
    type: "function",
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

async function getUserData(userAddress) {
  try {
    // Connect to Monad testnet provider
    const provider = new ethers.providers.JsonRpcProvider(
      "https://monad-testnet.blockvision.org/v1/31Ihx9ZHjswZZld678DwIAer7H9"
    );

    // Create contract instance
    const contract = new ethers.Contract(
      PIANO_CONTRACT_ADDRESS,
      PIANO_CONTRACT_ABI,
      provider
    );

    // Get player stats
    const playerStats = await contract.getPlayerStats(userAddress);
    console.log("Player Stats:");
    console.log("Last Score:", playerStats[0].toString());
    console.log("Best Score:", playerStats[1].toString());
    console.log("Total Games:", playerStats[2].toString());
    console.log("Transaction Count:", playerStats[3].toString());

    // Get player rank
    const rank = await contract.getRank(userAddress);
    console.log("Player Rank:", rank.toString());
  } catch (error) {
    console.error("Error getting user data:", error);
  }
}

// Example usage
const userAddress = "0xCFFE10F4058a4a481F5A7EcF01a132963A1916E3"; // Replace with actual address
getUserData(userAddress);
