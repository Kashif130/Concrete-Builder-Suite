// app/api/live-data/route.js
// TVL: DefiLlama protocol API (real-time)
// APY + Vaults: Static known values (DefiLlama yield adapter not yet registered for Concrete)

function fmtTVL(num) {
  if (!num || isNaN(num)) return "—";
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
}

// Known vault data — APY sourced from app.concrete.xyz
const STATIC_VAULTS = [
  {
    name: "WeETH Delta Vault",
    asset: "WEETH",
    network: "Ethereum",
    apy: "Institutional",
    link: "https://app.concrete.xyz/vault/concrete/delta-weeth/0xb9dc54c8261745cb97070cefbe3d3d815aee8f20",
    hasPoints: true,
    tvlShare: 0.924, // ~92.4% of total TVL based on known data
  },
  {
    name: "Concrete DeFi USDT",
    asset: "USDT",
    network: "Ethereum",
    apy: "8.50%",
    link: "https://app.concrete.xyz/vault/concrete/defi-finance-usdt/0x0e609b710da5e0aa476224b6c0e5445ccc21251e",
    hasPoints: true,
    tvlShare: 0.071, // ~7.1%
  },
  {
    name: "WBTC Vault",
    asset: "WBTC",
    network: "Ethereum",
    apy: "7.00%",
    link: "https://wbtc.concrete.xyz/",
    hasPoints: false,
    tvlShare: 0.005, // ~0.5%
  },
];

export async function GET() {
  try {
    // Fetch live total TVL from DefiLlama
    const protocolRes = await fetch("https://api.llama.fi/protocol/concrete", {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });

    if (!protocolRes.ok) throw new Error(`DefiLlama error: ${protocolRes.status}`);
    const protocolData = await protocolRes.json();

    // Sum all chain TVLs
    const totalTVLRaw = protocolData?.currentChainTvls
      ? Object.values(protocolData.currentChainTvls).reduce((a, b) => a + (b || 0), 0)
      : protocolData?.tvl ?? 0;

    // Distribute total TVL across vaults by known share
    const vaults = STATIC_VAULTS.map((v) => ({
      name: v.name,
      asset: v.asset,
      network: v.network,
      tvl: fmtTVL(totalTVLRaw * v.tvlShare),
      apy: v.apy,
      link: v.link,
      hasPoints: v.hasPoints,
    }));

    // Top APY = highest numeric APY among vaults
    const numericApys = STATIC_VAULTS.map((v) => parseFloat(v.apy)).filter((n) => !isNaN(n));
    const topAPY = numericApys.length ? `${Math.max(...numericApys).toFixed(2)}%` : "8.50%";

    return Response.json(
      {
        totalTVL: fmtTVL(totalTVLRaw),
        topAPY,
        lastUpdated: new Date().toISOString(),
        source: "DefiLlama",
        vaults,
      },
      {
        headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" },
      }
    );
  } catch (e) {
    // Full static fallback if API fails
    return Response.json(
      {
        error: e.message,
        totalTVL: "$1.07B",
        topAPY: "8.50%",
        lastUpdated: new Date().toISOString(),
        source: "fallback",
        vaults: STATIC_VAULTS.map((v) => ({
          name: v.name,
          asset: v.asset,
          network: v.network,
          tvl: v.asset === "WEETH" ? "$988M" : v.asset === "USDT" ? "$75.9M" : "$5.4M",
          apy: v.apy,
          link: v.link,
          hasPoints: v.hasPoints,
        })),
      },
      { status: 200 }
    );
  }
}
