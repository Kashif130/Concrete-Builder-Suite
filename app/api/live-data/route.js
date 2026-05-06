// app/api/live-data/route.js
// Fetches real-time Concrete Protocol data from DefiLlama — no API key needed

// Maps DefiLlama pool symbols/metadata to vault display names & links
const VAULT_META = {
  WEETH: {
    name: "WeETH Delta Vault",
    link: "https://app.concrete.xyz/vault/concrete/delta-weeth/0xb9dc54c8261745cb97070cefbe3d3d815aee8f20",
    hasPoints: true,
  },
  USDT: {
    name: "Concrete DeFi USDT",
    link: "https://app.concrete.xyz/vault/concrete/defi-finance-usdt/0x0e609b710da5e0aa476224b6c0e5445ccc21251e",
    hasPoints: true,
  },
  WBTC: {
    name: "WBTC Vault",
    link: "https://wbtc.concrete.xyz/",
    hasPoints: false,
  },
  USDC: {
    name: "Concrete DeFi USDC",
    link: "https://app.concrete.xyz",
    hasPoints: true,
  },
};

// Format raw TVL number → "$720.6M" / "$1.2B"
function fmtTVL(num) {
  if (!num || isNaN(num)) return "—";
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
}

// Format APY number → "8.5%" or "Institutional" for very large values
function fmtAPY(num) {
  if (!num || isNaN(num)) return "—";
  if (num > 500) return "Institutional"; // DefiLlama sometimes returns very high APY for institutional vaults
  return `${num.toFixed(2)}%`;
}

export async function GET() {
  try {
    // Parallel fetch: protocol TVL + yield pools
    const [protocolRes, poolsRes] = await Promise.all([
      fetch("https://api.llama.fi/protocol/concrete", {
        headers: { "Accept": "application/json" },
        next: { revalidate: 300 }, // Next.js cache 5 min
      }),
      fetch("https://yields.llama.fi/pools", {
        headers: { "Accept": "application/json" },
        next: { revalidate: 300 },
      }),
    ]);

    if (!protocolRes.ok) throw new Error(`DefiLlama protocol API error: ${protocolRes.status}`);
    if (!poolsRes.ok) throw new Error(`DefiLlama yields API error: ${poolsRes.status}`);

    const [protocolData, poolsData] = await Promise.all([
      protocolRes.json(),
      poolsRes.json(),
    ]);

    // ── Total TVL from protocol endpoint ──
    const totalTVLRaw = protocolData?.currentChainTvls
      ? Object.values(protocolData.currentChainTvls).reduce((a, b) => a + b, 0)
      : protocolData?.tvl ?? 0;

    // ── Filter only Concrete pools from the yields endpoint ──
    const concretePools = (poolsData?.data || []).filter(
      (p) => p.project?.toLowerCase() === "concrete"
    );

    // ── Build vault list ──
    const vaults = concretePools.map((pool) => {
      const symbol = pool.symbol?.toUpperCase() || "UNKNOWN";
      const meta = VAULT_META[symbol] || {
        name: pool.symbol || pool.pool,
        link: "https://app.concrete.xyz",
        hasPoints: false,
      };

      return {
        name: meta.name,
        asset: pool.symbol || symbol,
        network: pool.chain || "Ethereum",
        tvl: fmtTVL(pool.tvlUsd),
        tvlRaw: pool.tvlUsd || 0,
        apy: fmtAPY(pool.apy ?? pool.apyBase),
        apyRaw: pool.apy ?? pool.apyBase ?? 0,
        link: pool.url || meta.link,
        hasPoints: meta.hasPoints,
      };
    });

    // Sort by TVL descending
    vaults.sort((a, b) => b.tvlRaw - a.tvlRaw);

    // ── Top APY (ignore "Institutional" outliers for display) ──
    const apyValues = vaults
      .map((v) => v.apyRaw)
      .filter((a) => a > 0 && a <= 500);
    const topAPYRaw = apyValues.length ? Math.max(...apyValues) : null;

    return Response.json(
      {
        totalTVL: fmtTVL(totalTVLRaw),
        topAPY: topAPYRaw ? `${topAPYRaw.toFixed(2)}%` : "—",
        lastUpdated: new Date().toISOString(),
        source: "DefiLlama",
        vaults,
      },
      {
        headers: {
          "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
        },
      }
    );
  } catch (e) {
    // Graceful fallback with last-known static data
    return Response.json(
      {
        error: e.message,
        totalTVL: "$780M",
        topAPY: "8.5%",
        lastUpdated: new Date().toISOString(),
        source: "fallback",
        vaults: [
          {
            name: "WeETH Delta Vault",
            asset: "WEETH",
            network: "Ethereum",
            tvl: "$720.6M",
            apy: "Institutional",
            link: "https://app.concrete.xyz/vault/concrete/delta-weeth/0xb9dc54c8261745cb97070cefbe3d3d815aee8f20",
            hasPoints: true,
          },
          {
            name: "Concrete DeFi USDT",
            asset: "USDT",
            network: "Ethereum",
            tvl: "$55.9M",
            apy: "8.5%",
            link: "https://app.concrete.xyz/vault/concrete/defi-finance-usdt/0x0e609b710da5e0aa476224b6c0e5445ccc21251e",
            hasPoints: true,
          },
          {
            name: "WBTC Vault",
            asset: "WBTC",
            network: "Ethereum",
            tvl: "$4.5M",
            apy: "7.00%",
            link: "https://wbtc.concrete.xyz/",
            hasPoints: false,
          },
        ],
      },
      { status: 200 }
    );
  }
}
