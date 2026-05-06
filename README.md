# Concrete Builder Suite

A Next.js 14 app for Concrete Protocol — live vault data, DeFi tools, and onboarding resources.

## Features

- **Live Vault Data** — Real-time TVL + APY via DefiLlama's free public API (no API key needed)
- **Auto-refresh** every 5 minutes with manual refresh button
- **Shimmer loading states** and graceful error fallback with static data
- **Vercel-optimized** with 5-min CDN caching on the API route

## Tech Stack

- Next.js 14 (App Router)
- React 18
- **DefiLlama Public API** — free, no API key required
  - `https://api.llama.fi/protocol/concrete` → Total TVL
  - `https://yields.llama.fi/pools` → Per-vault APY + TVL (filtered to `project=concrete`)

---

## Local Development

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) — no \`.env\` setup needed!

---

## Deploy to Vercel

### 1. Push to GitHub

\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/concrete-builder.git
git push -u origin main
\`\`\`

### 2. Import on Vercel

- Go to [vercel.com/new](https://vercel.com/new)
- Import your GitHub repo
- **No environment variables needed**
- Click **Deploy** ✅

That's it — Vercel auto-detects Next.js and handles everything else.

---

## Project Structure

\`\`\`
concrete-builder/
├── app/
│   ├── layout.js                # Root layout + Google Fonts
│   ├── page.js                  # Home page
│   ├── ConcreteBuilderSuite.js  # Main UI (client component)
│   └── api/
│       └── live-data/
│           └── route.js         # DefiLlama fetch + transform
├── next.config.js
└── package.json
\`\`\`

## Data Sources

| Endpoint | Data |
|---|---|
| `api.llama.fi/protocol/concrete` | Protocol-level TVL by chain |
| `yields.llama.fi/pools` | Per-pool APY + TVL (filtered to `project=concrete`) |

Both APIs are **free**, open, and require no authentication.
