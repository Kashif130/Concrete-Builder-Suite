"use client";

import { useState, useEffect, useCallback } from "react";

/* ─────────────────────────────────────────
   STYLES
───────────────────────────────────────── */
const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .wrapper {
    background: #030303; min-height: 100vh;
    padding: 32px 20px;
    font-family: var(--font-jetbrains, 'JetBrains Mono', monospace); color: #f0f0f0;
  }

  /* scan line */
  .scan-line {
    position: fixed; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, #00f5c8, transparent);
    animation: scan 5s linear infinite; pointer-events: none; z-index: 999;
  }
  @keyframes scan {
    0% { top: 0%; opacity: 1; } 95% { opacity: 0.4; } 100% { top: 100%; opacity: 0; }
  }

  /* header */
  .header-section {
    max-width: 960px; margin: 0 auto 48px;
    border-bottom: 2px solid #00f5c8; padding-bottom: 32px;
  }
  .header-title {
    font-family: var(--font-orbitron, 'Orbitron', sans-serif);
    font-size: clamp(24px, 5vw, 50px);
    font-weight: 900; font-style: italic; text-transform: uppercase;
    color: #00f5c8; text-shadow: 0 0 24px rgba(0,245,200,0.45); letter-spacing: 2px;
    transition: all 0.1s;
  }
  .header-sub {
    margin-top: 12px; color: #6b7280; font-size: 12px; max-width: 560px; line-height: 1.7;
  }
  .header-sub span { color: #00f5c8; font-weight: bold; }

  /* live data bar */
  .live-bar {
    margin-top: 20px;
    border: 1px solid rgba(0,245,200,0.2);
    background: rgba(0,245,200,0.03);
    border-radius: 4px; overflow: hidden;
  }
  .live-bar-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 16px; border-bottom: 1px solid rgba(0,245,200,0.12);
    flex-wrap: wrap; gap: 8px;
  }
  .live-dot {
    display: flex; align-items: center; gap: 6px; font-size: 10px; color: #00f5c8; font-weight: 900;
  }
  .dot {
    width: 7px; height: 7px; border-radius: 50%; background: #00f5c8;
    animation: pulse 1.4s ease-in-out infinite;
  }
  @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.8); } }
  .last-updated { font-size: 9px; color: #4b5563; }

  .refresh-btn {
    background: none; border: 1px solid rgba(0,245,200,0.3); color: #00f5c8;
    padding: 4px 12px; font-size: 9px; font-family: var(--font-jetbrains, monospace);
    font-weight: 900; cursor: pointer; letter-spacing: 0.05em; transition: all 0.2s;
  }
  .refresh-btn:hover { background: rgba(0,245,200,0.1); border-color: #00f5c8; }
  .refresh-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* stats pills */
  .stats-row {
    display: flex; flex-wrap: wrap; gap: 0;
  }
  .stat-block {
    flex: 1; min-width: 120px;
    padding: 14px 18px; border-right: 1px solid rgba(0,245,200,0.1);
    position: relative; overflow: hidden;
  }
  .stat-block:last-child { border-right: none; }
  .stat-label { font-size: 9px; color: #4b5563; letter-spacing: 0.1em; margin-bottom: 4px; }
  .stat-value {
    font-size: clamp(16px, 2.5vw, 22px); font-weight: 900; color: #00f5c8;
    font-family: var(--font-orbitron, sans-serif);
    transition: all 0.4s;
  }
  .stat-sub { font-size: 9px; color: #4b5563; margin-top: 3px; }

  /* skeleton shimmer */
  .shimmer {
    background: linear-gradient(90deg, #0a0a0a 25%, #111 50%, #0a0a0a 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 2px; height: 22px; width: 80px; display: inline-block;
  }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  /* container */
  .max-container { max-width: 960px; margin: 0 auto; }

  /* section label */
  .section-label {
    display: flex; align-items: center; gap: 8px;
    color: #00f5c8; font-weight: 900; margin-bottom: 20px; font-size: 12px; letter-spacing: 0.05em;
  }
  .section-badge { background: #00f5c8; color: black; padding: 2px 8px; font-size: 10px; font-weight: 900; }

  /* cyber card */
  .cyber-card {
    border: 1px solid rgba(0,245,200,0.18); background: rgba(0,245,200,0.02);
    border-radius: 6px; transition: all 0.28s ease;
  }
  .cyber-card:hover {
    border-color: #00f5c8; background: rgba(0,245,200,0.06);
    transform: translateY(-4px); box-shadow: 0 10px 36px rgba(0,245,200,0.07);
  }

  /* tool grid */
  .grid-3 {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px; margin-bottom: 48px;
  }
  .card-inner { padding: 22px; height: 100%; display: flex; flex-direction: column; }
  .card-icon { font-size: 20px; margin-bottom: 10px; }
  .card-title { font-weight: bold; margin-bottom: 7px; font-size: 14px; }
  .card-desc { font-size: 11px; color: #6b7280; margin-bottom: 12px; line-height: 1.65; flex: 1; }
  .tag-row { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 12px; }
  .tag {
    font-size: 9px; padding: 2px 7px;
    border: 1px solid rgba(0,245,200,0.28); color: #00f5c8;
    background: rgba(0,245,200,0.05); border-radius: 2px; letter-spacing: 0.05em;
  }
  .link-teal { color: #00f5c8; font-size: 11px; font-weight: 900; text-decoration: none; margin-top: auto; }
  .link-teal:hover { text-decoration: underline; }

  /* live vaults section */
  .vaults-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
    gap: 14px; margin-bottom: 48px;
  }
  .vault-card {
    border: 1px solid rgba(0,245,200,0.15); border-radius: 6px;
    padding: 18px; background: rgba(0,0,0,0.4);
    transition: all 0.25s;
  }
  .vault-card:hover {
    border-color: rgba(0,245,200,0.5); background: rgba(0,245,200,0.04);
    transform: translateY(-3px);
  }
  .vault-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
  .vault-name { font-size: 13px; font-weight: bold; }
  .vault-network {
    font-size: 9px; padding: 2px 7px; border-radius: 2px;
    background: rgba(0,245,200,0.08); color: #00f5c8; border: 1px solid rgba(0,245,200,0.2);
  }
  .vault-apy {
    font-family: var(--font-orbitron, sans-serif); font-size: 22px; font-weight: 900;
    color: #00f5c8; margin-bottom: 4px;
  }
  .vault-apy-label { font-size: 9px; color: #4b5563; margin-bottom: 10px; }
  .vault-tvl-row { display: flex; justify-content: space-between; align-items: center; }
  .vault-tvl-label { font-size: 9px; color: #4b5563; }
  .vault-tvl-val { font-size: 13px; font-weight: bold; color: #e5e7eb; }
  .vault-link {
    display: block; margin-top: 14px; text-align: center;
    font-size: 10px; font-weight: 900; color: black;
    background: #00f5c8; padding: 7px; text-decoration: none;
    transition: background 0.2s;
  }
  .vault-link:hover { background: #fff; }
  .vault-points { font-size: 9px; color: #ffd700; margin-top: 6px; text-align: center; }

  /* vault shimmer cards */
  .vault-shimmer { border: 1px solid rgba(0,245,200,0.08); border-radius: 6px; padding: 18px; }
  .sh-line { background: linear-gradient(90deg,#0d0d0d 25%,#1a1a1a 50%,#0d0d0d 75%); background-size:200% 100%; animation: shimmer 1.5s infinite; border-radius:2px; margin-bottom:10px; }

  /* interactive grid */
  .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 48px; }
  .featured-card { padding: 24px; border-left: 4px solid #ffd700; }
  .featured-card-2 { padding: 24px; border-left: 4px solid #00f5c8; }
  .featured-title { font-size: clamp(13px, 2vw, 18px); font-weight: 900; letter-spacing: -0.5px; margin-bottom: 5px; }
  .badge-gold { font-size: 9px; background: #ffd700; color: black; padding: 3px 8px; font-weight: bold; white-space: nowrap; }
  .badge-teal { font-size: 9px; background: #00f5c8; color: black; padding: 3px 8px; font-weight: bold; white-space: nowrap; }
  .featured-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; gap: 10px; flex-wrap: wrap; }
  .featured-desc { font-size: 11px; color: #9ca3af; line-height: 1.65; margin-bottom: 14px; }
  .mech-list { list-style: none; margin-bottom: 18px; }
  .mech-list li { font-size: 10px; color: #6b7280; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.04); display: flex; align-items: center; gap: 8px; }
  .ico { color: #ffd700; min-width: 16px; } .ico.teal { color: #00f5c8; }
  .btn-gold { background: #ffd700; color: black; padding: 9px 22px; font-size: 11px; font-weight: 900; text-decoration: none; display: inline-block; transition: background 0.2s; }
  .btn-gold:hover { background: #fff; }

  /* ecosystem links */
  .links-hub { border: 1px solid rgba(0,245,200,0.15); border-radius: 6px; overflow: hidden; margin-bottom: 48px; }
  .links-hub-header { background: rgba(0,245,200,0.05); padding: 11px 18px; border-bottom: 1px solid rgba(0,245,200,0.15); font-size: 11px; font-weight: 900; color: #00f5c8; letter-spacing: 0.1em; }
  .link-row { display: flex; align-items: center; justify-content: space-between; padding: 13px 18px; border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.2s; gap: 12px; flex-wrap: wrap; }
  .link-row:last-child { border-bottom: none; }
  .link-row:hover { background: rgba(0,245,200,0.04); }
  .link-name { font-size: 12px; font-weight: bold; }
  .link-desc { font-size: 10px; color: #6b7280; margin-top: 2px; max-width: 600px; line-height: 1.5; }
  .link-go { color: #00f5c8; font-size: 10px; font-weight: 900; text-decoration: none; white-space: nowrap; }
  .link-go:hover { text-decoration: underline; }

  /* cta */
  .cta-bottom { background: linear-gradient(135deg, rgba(0,245,200,0.07), rgba(0,245,200,0.02)); border: 1px solid rgba(0,245,200,0.22); border-radius: 6px; padding: 30px; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; margin-bottom: 48px; }
  .cta-text { font-size: clamp(13px,1.8vw,16px); font-weight: 900; line-height: 1.4; }
  .cta-sub { font-size: 10px; color: #6b7280; margin-top: 5px; }
  .cta-moai { background: #00f5c8; color: black; padding: 11px 24px; font-size: 12px; font-weight: 900; text-decoration: none; display: inline-block; font-family: var(--font-orbitron, sans-serif); transition: all 0.2s; white-space: nowrap; }
  .cta-moai:hover { background: #fff; transform: scale(1.04); }

  /* error */
  .err-box { border: 1px solid rgba(255,68,68,0.3); background: rgba(255,68,68,0.05); border-radius:4px; padding:12px 16px; font-size:11px; color:#ff6b6b; margin-bottom:16px; }

  footer { margin-top: 48px; text-align: center; padding: 24px 0; opacity: 0.22; font-size: 10px; letter-spacing: 0.4em; border-top: 1px solid rgba(0,245,200,0.08); }
`;

/* ─────────────────────────────────────────
   STATIC DATA
───────────────────────────────────────── */
const analyticalTools = [
  {
    icon: "🤖",
    title: "Concrete Assistant",
    desc: "AI-powered chatbot for real-time protocol support. Ask about vault APYs, liquidation protection, borrow features, and how to get started — answered instantly.",
    tags: ["AI CHATBOT", "PROTOCOL Q&A", "REAL-TIME"],
    link: "https://concrete-assistant.streamlit.app/",
    cta: "LAUNCH ASSISTANT →",
  },
  {
    icon: "📊",
    title: "Vault Optimizer",
    desc: "Interactive yield dashboard visualizing risk-adjusted returns across Concrete's multi-asset vaults — USDC, USDT, WBTC, weETH and more. Identify optimal deposit strategies.",
    tags: ["YIELD ANALYSIS", "RISK METRICS", "MULTI-ASSET"],
    link: "https://concrete-vault.streamlit.app/",
    cta: "OPEN OPTIMIZER →",
  },
  {
    icon: "📖",
    title: "System Guide",
    desc: "Interactive knowledge base covering all Concrete Protocol mechanics — earn vaults, borrowing, liquidation protection, and Concrete Points. Built for all skill levels.",
    tags: ["DOCUMENTATION", "PROTOCOL GUIDE", "ONBOARDING"],
    link: "https://concrete-guide.streamlit.app/",
    cta: "READ DOCS →",
  },
];

const ecosystemLinks = [
  {
    name: "app.concrete.xyz",
    desc: "Main DeFi platform — deposit into high-yield vaults across Ethereum, Arbitrum, Berachain, Katana & more. Supports 20+ assets.",
    href: "https://app.concrete.xyz",
  },
  {
    name: "points.concrete.xyz",
    desc: "Earn Concrete Points through social quests — follow on X, join Discord, share vault experiences, and climb the leaderboard.",
    href: "https://points.concrete.xyz",
  },
  {
    name: "wbtc.concrete.xyz",
    desc: "Dedicated WBTC vault — earn automated Bitcoin yield with smart compounding. No need to sell your BTC.",
    href: "https://wbtc.concrete.xyz/",
  },
];

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */
export default function ConcreteBuilderSuite() {
  const [glitch, setGlitch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [liveData, setLiveData] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // glitch effect on header
  useEffect(() => {
    const id = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 120);
    }, 7000);
    return () => clearInterval(id);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Call our own server-side API route (keeps API key secret)
      const res = await fetch("/api/live-data");
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLiveData(data);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // fetch on mount + every 5 minutes
  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchData]);

  const fmt = (date) =>
    date
      ? date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      : "—";

  return (
    <>
      <style>{css}</style>
      <div className="scan-line" />

      <div className="wrapper">
        {/* ── HEADER ── */}
        <header className="header-section">
          <h1
            className="header-title"
            style={
              glitch
                ? {
                    textShadow:
                      "3px 0 #ff003c, -3px 0 #00f5c8, 0 0 20px rgba(0,245,200,0.4)",
                    transform: "skewX(-1.5deg)",
                  }
                : {}
            }
          >
            Concrete Builder Suite
          </h1>
          <p className="header-sub">
            Ecosystem tools built for <span>Concrete Protocol 🗿</span> — DeFi tooling,
            interactive onboarding, and arcade-style education. Every build drives adoption
            and community growth.
          </p>

          {/* ── LIVE DATA BAR ── */}
          <div className="live-bar">
            <div className="live-bar-header">
              <div className="live-dot">
                <div className="dot" />
                LIVE_PROTOCOL_DATA
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {lastUpdated && (
                  <span className="last-updated">UPDATED: {fmt(lastUpdated)}</span>
                )}
                <button className="refresh-btn" onClick={fetchData} disabled={loading}>
                  {loading ? "⟳ FETCHING..." : "⟳ REFRESH"}
                </button>
              </div>
            </div>

            {error && (
              <div className="err-box" style={{ margin: "12px 16px" }}>
                ⚠ {error} — showing cached data
              </div>
            )}

            <div className="stats-row">
              {/* TVL */}
              <div className="stat-block">
                <div className="stat-label">TOTAL VALUE LOCKED</div>
                <div className="stat-value" style={loading ? { color: "#1f4a42" } : {}}>
                  {loading ? <span className="shimmer" /> : liveData?.totalTVL || "—"}
                </div>
                <div className="stat-sub">across all vaults</div>
              </div>
              {/* TOP APY */}
              <div className="stat-block">
                <div className="stat-label">TOP VAULT APY</div>
                <div className="stat-value" style={loading ? { color: "#1f4a42" } : {}}>
                  {loading ? (
                    <span className="shimmer" style={{ width: 60 }} />
                  ) : (
                    liveData?.topAPY || "—"
                  )}
                </div>
                <div className="stat-sub">target yield</div>
              </div>
              {/* NETWORKS */}
              <div className="stat-block">
                <div className="stat-label">NETWORKS</div>
                <div
                  className="stat-value"
                  style={{ fontSize: 13, color: "#00f5c8", marginTop: 4 }}
                >
                  ETH · ARB · BERA · KATANA
                </div>
                <div className="stat-sub">multi-chain</div>
              </div>
              {/* LIVE VAULTS */}
              <div className="stat-block">
                <div className="stat-label">LIVE VAULTS</div>
                <div className="stat-value" style={loading ? { color: "#1f4a42" } : {}}>
                  {loading ? (
                    <span className="shimmer" style={{ width: 40 }} />
                  ) : (
                    liveData?.vaults?.length ?? "—"
                  )}
                </div>
                <div className="stat-sub">active vaults</div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-container">

          {/* ── 01 TOOLS ── */}
          <div className="section-label">
            <span className="section-badge">01</span>
            ANALYTICAL_INFRASTRUCTURE
          </div>
          <div className="grid-3">
            {analyticalTools.map((tool, i) => (
              <div className="cyber-card" key={i}>
                <div className="card-inner">
                  <div className="card-icon">{tool.icon}</div>
                  <div className="card-title">{tool.title}</div>
                  <div className="tag-row">
                    {tool.tags.map((t, j) => (
                      <span className="tag" key={j}>{t}</span>
                    ))}
                  </div>
                  <div className="card-desc">{tool.desc}</div>
                  <a href={tool.link} target="_blank" rel="noopener noreferrer" className="link-teal">
                    {tool.cta}
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* ── 02 LIVE VAULTS ── */}
          <div className="section-label" style={{ marginBottom: 0 }}>
            <span className="section-badge">02</span>
            LIVE_VAULTS
            {!loading && liveData?.vaults?.length > 0 && (
              <span style={{ fontSize: 9, color: "#4b5563", marginLeft: 8 }}>
                {liveData.vaults.length} ACTIVE
              </span>
            )}
          </div>

          <div className="vaults-grid" style={{ marginTop: 20 }}>
            {loading ? (
              [1, 2, 3].map((n) => (
                <div className="vault-shimmer" key={n}>
                  <div className="sh-line" style={{ height: 14, width: "60%", marginBottom: 16 }} />
                  <div className="sh-line" style={{ height: 28, width: "40%", marginBottom: 8 }} />
                  <div className="sh-line" style={{ height: 10, width: "30%", marginBottom: 20 }} />
                  <div className="sh-line" style={{ height: 10, width: "80%" }} />
                </div>
              ))
            ) : liveData?.vaults?.length > 0 ? (
              liveData.vaults.map((v, i) => (
                <div className="vault-card" key={i}>
                  <div className="vault-card-top">
                    <div className="vault-name">{v.name}</div>
                    <span className="vault-network">{v.network}</span>
                  </div>
                  <div className="vault-apy">{v.apy}</div>
                  <div className="vault-apy-label">
                    {v.apy === "Institutional" ? "INSTITUTIONAL APY" : "TARGET APY"}
                  </div>
                  <div className="vault-tvl-row">
                    <span className="vault-tvl-label">TVL</span>
                    <span className="vault-tvl-val">{v.tvl}</span>
                  </div>
                  <a href={v.link} target="_blank" rel="noopener noreferrer" className="vault-link">
                    DEPOSIT → {v.asset}
                  </a>
                  {v.hasPoints && (
                    <div className="vault-points">✦ EARNS CONCRETE POINTS</div>
                  )}
                </div>
              ))
            ) : (
              <div
                style={{
                  color: "#4b5563",
                  fontSize: 12,
                  gridColumn: "1/-1",
                  padding: "24px 0",
                }}
              >
                No vault data available —{" "}
                <button
                  onClick={fetchData}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#00f5c8",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                >
                  retry
                </button>
              </div>
            )}
          </div>

          {/* ── 03 INTERACTIVE ── */}
          <div className="section-label">
            <span className="section-badge">03</span>
            INTERACTIVE_CONTRIBUTIONS
          </div>
          <div className="grid-2">
            <div className="cyber-card featured-card">
              <div className="featured-row">
                <div className="featured-title">MOAI SAVES: DEFI RESCUE</div>
                <span className="badge-gold">GAME_LIVE</span>
              </div>
              <p className="featured-desc">
                Browser arcade game teaching Concrete&apos;s DeFi mechanics through gameplay.
                Defend the vault across escalating waves — catch depositors, block liquidators,
                and smash your way to the Hall of Stone leaderboard.
              </p>
              <ul className="mech-list">
                <li><span className="ico">🏦</span> Catch vault depositors to earn score</li>
                <li><span className="ico">💀</span> Block red liquidators to protect vault</li>
                <li><span className="ico">💥</span> Smash enemies for wave bonus multiplier</li>
                <li><span className="ico">🛡️</span> Stone Shield — clutch defense ability</li>
                <li><span className="ico">🏆</span> Hall of Stone — global leaderboard</li>
                <li><span className="ico">☠</span> Degen mode for high-difficulty runs</li>
              </ul>
              <a
                href="https://moai-defi-rescue.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold"
              >
                PLAY_NOW →
              </a>
            </div>

            <div className="cyber-card featured-card-2">
              <div className="featured-row">
                <div className="featured-title">CONCRETE RUN</div>
                <span className="badge-teal">LIVE</span>
              </div>
              <p className="featured-desc">
                Ecosystem navigation hub deployed on Vercel. Aggregates all key Concrete Protocol
                entry points into a single zero-friction portal — ideal for new community members
                discovering the protocol.
              </p>
              <ul className="mech-list">
                <li><span className="ico teal">⬡</span> Direct link to app.concrete.xyz vault platform</li>
                <li><span className="ico teal">⬡</span> Direct link to points.concrete.xyz quests hub</li>
                <li><span className="ico teal">⬡</span> Fast Vercel CDN — globally optimized load</li>
                <li><span className="ico teal">⬡</span> Mobile &amp; desktop responsive layout</li>
                <li><span className="ico teal">⬡</span> Single-click entry to earn or accumulate points</li>
              </ul>
              <a
                href="https://concrete-run.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="link-teal"
              >
                VIEW_LIVE_DEPLOYMENT →
              </a>
            </div>
          </div>

          {/* ── 04 ECOSYSTEM ── */}
          <div className="section-label">
            <span className="section-badge">04</span>
            PROTOCOL_ECOSYSTEM
          </div>
          <div className="links-hub">
            <div className="links-hub-header">OFFICIAL_CONCRETE_LINKS</div>
            {ecosystemLinks.map((l, i) => (
              <div className="link-row" key={i}>
                <div>
                  <div className="link-name">{l.name}</div>
                  <div className="link-desc">{l.desc}</div>
                </div>
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="link-go">
                  VISIT →
                </a>
              </div>
            ))}
          </div>

          {/* ── CTA ── */}
          <div className="cta-bottom">
            <div>
              <div className="cta-text">TARGET DESIGNATION: MOAI 🗿 ROLE</div>
              <div className="cta-sub">
                EVERY LINE OF CODE IS A STEP TOWARDS A MORE STABLE DEFI FUTURE · BUILDER_014321 · 2026
              </div>
            </div>
            <a
              href="https://app.concrete.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-moai"
            >
              ENTER PROTOCOL →
            </a>
          </div>
        </div>

        <footer>
          <p>SYSTEM_UID: BUILDER_014321 | CONCRETE PROTOCOL | 2026</p>
        </footer>
      </div>
    </>
  );
}
