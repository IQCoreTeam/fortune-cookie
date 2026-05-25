# Fortune Cookie

A full-stack fortune cookie web app built on **Next.js 16** with fortunes stored permanently on **Monad Testnet** via IQLabs IQDB. Crack a cookie, get a fortune — every fortune is on-chain and community-contributed.

---

## What It Does

1. **Crack a cookie** — animated 3D CSS cookie splits open with spring physics
2. **Get a fortune** — pulled randomly from IQDB on Monad Testnet (50 starter fortunes seeded, grows as users submit)
3. **Typewriter reveal** — fortune text types out character by character on a paper slip
4. **Confetti burst** — canvas-confetti fires on reveal
5. **Share** — Web Share API on mobile, clipboard fallback on desktop
6. **Fortune history** — last 10 fortunes persisted in localStorage, slide-up drawer
7. **Write your own fortune** — connect MetaMask, write text + category, inscribed on-chain permanently
8. **Inscribe current fortune** — stamp any fortune you receive to your wallet address on Monad
9. **Sound** — synthesized crack + chime via Web Audio API (off by default)

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Animations | Framer Motion + CSS keyframes |
| On-chain DB | IQLabs IQDB (`@iqlabs-official/ethereum-sdk`) |
| Network | Monad Testnet (chainId 10143) |
| Confetti | `canvas-confetti` |
| Icons | `@phosphor-icons/react` |
| Fonts | Fredoka, Nunito, VT323 (Google Fonts) |
| Wallet | MetaMask / any EIP-1193 injected wallet |

---

## Project Structure

```
fortune-cookie/
├── app/
│   ├── layout.tsx          # Fonts, metadata, viewport
│   ├── page.tsx            # Root — renders <CookiePage />
│   ├── globals.css         # CSS vars, keyframes, base
│   └── api/og/route.tsx    # OG image endpoint (edge)
├── components/
│   ├── CookiePage.tsx      # Main state machine (idle→cracking→open→read)
│   ├── FortuneCookie.tsx   # SVG cookie + 3D tilt + crack animation
│   ├── FortuneSlip.tsx     # Paper slip with typewriter effect
│   ├── Sparkles.tsx        # Canvas particle system
│   ├── Confetti.tsx        # canvas-confetti burst wrapper
│   ├── HistoryDrawer.tsx   # Slide-up drawer, last 10 fortunes
│   ├── ShareButton.tsx     # Share / clipboard copy
│   ├── SoundToggle.tsx     # Web Audio API synthesizer + toggle
│   ├── SubmitFortuneModal.tsx  # Write-your-own fortune form
│   └── WalletConnect.tsx   # MetaMask connect + Monad network guard
├── data/
│   └── fortunes.ts         # 50 local fortunes (fallback + seed source)
├── hooks/
│   ├── useFortune.ts       # Async fortune picker (IQDB → local fallback)
│   ├── useTypewriter.ts    # Character-by-character text reveal
│   └── useHistory.ts       # localStorage CRUD for fortune history
├── lib/
│   ├── sdk.ts              # FortuneRow type, fetchFortunes(), writeFortune()
│   ├── fortuneCache.ts     # In-memory cache, 60s refresh, fallback logic
│   ├── monad.ts            # Monad Testnet network config
│   └── wallet.ts           # connectWallet(), ensureMonadTestnet(), inscribeFortuneOnChain()
└── scripts/
    ├── init-table.ts       # One-time: create DB root + fortunes table
    └── seed-fortunes.ts    # One-time: bulk-write 50 starter fortunes
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- MetaMask (or any EIP-1193 wallet) for on-chain features
- Monad Testnet MON for writing fortunes — get free tokens at [faucet.monad.xyz](https://faucet.monad.xyz)

### Install

```bash
cd fortune-cookie
npm install
```

### Environment

Create `.env.local` (already committed as example):

```env
NEXT_PUBLIC_MONAD_RPC_URL=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_CHAIN_ID=10143
```

### Run Dev

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

---

## On-Chain Setup (Admin, One-Time)

You need an admin wallet funded with MON on Monad Testnet.

**Step 1 — Initialize the DB root and create the fortunes table:**

```bash
ADMIN_PRIVATE_KEY=0x... npm run init-table
```

This creates the `fortune-cookie` DB root and `fortunes` table on IQDB.

**Step 2 — Seed the 50 starter fortunes:**

```bash
ADMIN_PRIVATE_KEY=0x... npm run seed-fortunes
```

Writes all 50 fortunes from `data/fortunes.ts` to the on-chain table. Takes ~2–3 minutes (500ms between transactions to avoid nonce collisions). Prints a tx hash per fortune.

> Both scripts are idempotent — if the DB root or table already exists they skip creation.

---

## How the On-Chain Fortune Flow Works

```
App load
  └─► fortuneCache.ts cold-loads up to 200 rows from IQDB (Monad Testnet)
        └─► falls back to local fortunes.ts if RPC fails
        └─► refreshes every 60 seconds in background

User cracks cookie
  └─► useFortune.pickFortune() → getRandomFortune() from cache
        └─► returns FortuneRow from IQDB (or local fallback)

User submits own fortune
  └─► SubmitFortuneModal → ensureMonadTestnet() → writeFortune()
        └─► iqlabs.writer.writeRow() → tx on Monad
        └─► upsertFortune() adds it to local cache immediately
        └─► next cold-load picks it up globally

User inscribes fortune to wallet
  └─► WalletConnect → inscribeFortuneOnChain()
        └─► sends zero-value tx with fortune metadata as calldata
        └─► shows explorer link to testnet.monadexplorer.com/tx/<hash>
```

---

## OG Image

Dynamic OG images at `/api/og`:

```
/api/og?fortune=Your+text&numbers=7+%C2%B7+42+%C2%B7+99&emoji=🌌
```

Returns a 1200×630 edge-rendered image. Used automatically by the `openGraph` metadata in `layout.tsx`.

---

## Fortune Data Schema

```typescript
interface FortuneRow {
  id:           string   // uuid or "{walletPrefix}-{timestamp}"
  text:         string   // max 100 chars
  luckyNumbers: string   // JSON stringified number[]
  luckyColor:   string
  category:     "wisdom" | "humor" | "motivation" | "mystery"
  author:       string   // wallet address or "anonymous"
  timestamp:    number
}
```

The 50 seeded fortunes break down as:
- 20 wisdom — short, poetic
- 15 humor — absurdist
- 10 motivation
- 5 mystery / cosmic

---

## Monad Network Config

```typescript
{
  chainId:     10143,
  chainIdHex:  "0x27A7",
  name:        "Monad Testnet",
  rpcUrl:      "https://testnet-rpc.monad.xyz",
  explorerUrl: "https://testnet.monadexplorer.com",
  currency:    { name: "MON", symbol: "MON", decimals: 18 },
}
```

The app auto-prompts users to switch to Monad Testnet on wallet connect. If the chain is missing it calls `wallet_addEthereumChain` automatically.

---

## Accessibility

- `prefers-reduced-motion` — all animations disabled, fortune reveals instantly without typewriter
- All interactive elements have `focus-visible` ring styles
- Touch targets minimum 44×44px
- `min-h-[100dvh]` used throughout (no `h-screen` iOS Safari bug)
- Semantic `<main>`, `aria-label` on interactive elements

---

## Deployment

Deploy to Vercel with zero config:

```bash
vercel
```

Set the environment variable `NEXT_PUBLIC_MONAD_RPC_URL` in your Vercel project settings. The OG image route uses the edge runtime and works on Vercel's free tier.
