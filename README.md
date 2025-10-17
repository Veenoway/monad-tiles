# Monad Tiles

**Monad Tiles** is a Farcaster mini app that brings gaming directly into your social feed. Play, compete, and earn — all without leaving Farcaster.

Now featuring **MetaMask Smart Accounts** for seamless onboarding and enhanced user experience.

---

## Features

* **Play in Farcaster** – native mini app integration
* **MetaMask Smart Accounts** – no seed phrases, instant onboarding
* **Mobile-first** – optimized for Farcaster mobile experience

---

## What's New: MetaMask Smart Accounts

We just integrated **MetaMask Smart Accounts**, enabling:

* ✅ **Instant wallet creation** – users can start playing immediately
* ✅ **No seed phrases** – simplified onboarding with account abstraction
* ✅ **Batch transactions** – multiple game actions in a single transaction
* ✅ **Better security** – smart contract-based account protection

---

## Tech Stack

| Layer     | Technology                            |
| --------- | ------------------------------------- |
| Frontend  | Next.js 15, TypeScript, Tailwind CSS  |
| Wallet    | MetaMask SDK, Smart Accounts          |
| Backend   | Next.js API Routes                    |
| Chain     | Monad                                 |
| Mini App  | Farcaster Frames/Mini Apps            |

---

## 📦 Project Structure
```
./
├── src/
│   ├── app/              # Next.js 15 app directory
│   ├── components/       # React components
│   ├── hooks/            # Custom hooks (MetaMask, game logic)
│   └── lib/              # Utilities and helpers
│
├── public/               # Static assets
├── package.json
└── README.md
```

---

## Getting Started

### 1. Clone the Repository
```bash
git clone [your-repo-url]
cd monad-tiles
```

### 2. Install Dependencies
```bash
npm install
# or
bun install
```

### 3. Run Development Server
```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How to Play

1. Open Monad Tiles in Farcaster
2. Connect with MetaMask Smart Account (no seed phrase needed!)
3. Start playing

---

## MetaMask Smart Accounts Integration

Key implementation details:

* **SDK Integration** – MetaMask SDK for wallet connection
* **Smart Account Creation** – automatic account creation on first play
* **Account Abstraction** – simplified UX without manual key management

---

## License

MIT © 2025 Novee

---

## Links

* [Play on Farcaster](https://farcaster.xyz/miniapps/Mxut1X1kcWLu/monad-tiles)
* [Twitter](https://x.com/Novee_VeenoX)
