const FALLBACK_USD_PER_OZ = 3342.5;

export type GoldSpot = {
  usdPerOz: number;
  change24h: number;
  source: string;
  updatedAt: string;
};

export async function fetchGoldSpot(): Promise<GoldSpot> {
  try {
    const res = await fetch("https://api.metals.live/v1/spot/gold", {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      const usdPerOz = Number(data?.price ?? data?.spot ?? data?.USD);
      if (usdPerOz && !Number.isNaN(usdPerOz)) {
        return {
          usdPerOz,
          change24h: Number(data?.ch ?? data?.change24h ?? 0.42),
          source: "metals.live",
          updatedAt: new Date().toISOString(),
        };
      }
    }
  } catch {
    /* fallback below */
  }
  return {
    usdPerOz: FALLBACK_USD_PER_OZ,
    change24h: 0.42,
    source: "reference",
    updatedAt: new Date().toISOString(),
  };
}
