import "server-only";

const BASE_CURRENCY = "USD";
const TARGET_CURRENCY = "NGN";
const CACHE_DURATION_MS = 60 * 60 * 1000;

type RateCache = {
  rate: number;
  timestamp: number;
  source: string;
};

let rateCache: RateCache | null = null;
let inFlightRateRequest: Promise<RateCache> | null = null;

function exchangeRateKeys() {
  return [process.env.EXCHANGERATE_API_ONE, process.env.EXCHANGERATE_API_TWO, process.env.EXCHANGERATE_API_THREE].filter(Boolean) as string[];
}

function fixerKeys() {
  return [process.env.FIXER_API_ONE].filter(Boolean) as string[];
}

async function fetchJson(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, { signal: controller.signal, cache: "no-store" });
    const data = await response.json().catch(() => null);
    return { response, data };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchFromExchangeRateApi() {
  for (const [index, key] of exchangeRateKeys().entries()) {
    try {
      const url = `https://v6.exchangerate-api.com/v6/${key}/latest/${BASE_CURRENCY}`;
      const { response, data } = await fetchJson(url);
      const rate = Number(data?.conversion_rates?.[TARGET_CURRENCY]);

      if (response.ok && data?.result === "success" && Number.isFinite(rate) && rate > 0) {
        return { rate, timestamp: Date.now(), source: `exchangerate-api-${index + 1}` };
      }
    } catch (error) {
      console.error(`Exchangerate-API key #${index + 1} failed:`, error);
    }
  }

  return null;
}

async function fetchFromFixer() {
  for (const [index, key] of fixerKeys().entries()) {
    try {
      const url = `http://data.fixer.io/api/latest?access_key=${key}&symbols=${BASE_CURRENCY},${TARGET_CURRENCY}`;
      const { response, data } = await fetchJson(url);
      const eurToUsd = Number(data?.rates?.[BASE_CURRENCY]);
      const eurToNgn = Number(data?.rates?.[TARGET_CURRENCY]);
      const rate = eurToUsd > 0 ? eurToNgn / eurToUsd : 0;

      if (response.ok && data?.success && Number.isFinite(rate) && rate > 0) {
        return { rate, timestamp: Date.now(), source: `fixer-${index + 1}` };
      }
    } catch (error) {
      console.error(`Fixer API key #${index + 1} failed:`, error);
    }
  }

  return null;
}

async function fetchUsdToNgnRate() {
  const exchangeRate = await fetchFromExchangeRateApi();
  if (exchangeRate) return exchangeRate;

  const fixerRate = await fetchFromFixer();
  if (fixerRate) return fixerRate;

  throw new Error("Failed to fetch USD to NGN rate from all configured providers.");
}

export async function getCachedUsdToNgnRate() {
  const now = Date.now();
  if (rateCache && now - rateCache.timestamp < CACHE_DURATION_MS) {
    return rateCache;
  }

  if (!inFlightRateRequest) {
    inFlightRateRequest = fetchUsdToNgnRate()
      .then((rate) => {
        rateCache = rate;
        return rate;
      })
      .finally(() => {
        inFlightRateRequest = null;
      });
  }

  try {
    return await inFlightRateRequest;
  } catch (error) {
    if (rateCache) {
      console.warn("Using stale USD to NGN rate cache after provider failure.");
      return rateCache;
    }
    throw error;
  }
}

export async function usdToNgn(usdPrice: number) {
  const { rate } = await getCachedUsdToNgnRate();
  return Number((usdPrice * rate).toFixed(2));
}
