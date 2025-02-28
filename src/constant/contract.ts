export const STRESS_CONTRACT_ADDRESS =
  "0xcd9479b8C4959A476C6e361a5213C165E9236A1C";

export const STRESS_CONTRACT_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "userCount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newGlobalCount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "remainingAllowance",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "approvedStressCount",
        type: "uint256",
      },
    ],
    name: "StressIncremented",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "position",
        type: "uint256",
      },
    ],
    name: "TopStressersUpdated",
    type: "event",
  },
  {
    inputs: [],
    name: "STRESS_COST",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "count",
        type: "uint256",
      },
    ],
    name: "approveAndExecuteStress",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "counts",
        type: "uint256[]",
      },
    ],
    name: "batchApproveAndExecuteStress",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "getGlobalStressCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTopStressers",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "count",
            type: "uint256",
          },
        ],
        internalType: "struct EnhancedStresser.TopStresser[20]",
        name: "",
        type: "tuple[20]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getUserStats",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "stressCount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "lastStressTime",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "remainingAllowance",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "approvedStressCount",
            type: "uint256",
          },
        ],
        internalType: "struct EnhancedStresser.UserStats",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "globalStressCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "topStressers",
    outputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "count",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "userStats",
    outputs: [
      {
        internalType: "uint256",
        name: "stressCount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "lastStressTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "remainingAllowance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "approvedStressCount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
