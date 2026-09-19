import "server-only";
import { KiteDataProvider } from "./kite-provider";
import { DataProvider } from "@/lib/types";
import { SyntheticDataProvider } from "@/lib/data/synthetic-provider";

/**
 * Central registry of available data providers. To wire in a real
 * Indian-market data source later, implement `DataProvider` (e.g. in
 * `nse-provider.ts`) and add an instance here — the UI's provider
 * dropdown and the backtest engine both read from this registry, so no
 * other code needs to change.
 */
export const DATA_PROVIDERS: DataProvider[] = [new SyntheticDataProvider(), new KiteDataProvider()];

export function getProvider(providerId: string): DataProvider {
  const provider = DATA_PROVIDERS.find((p) => p.id === providerId);
  if (!provider) throw new Error(`Unknown data provider: ${providerId}`);
  return provider;
}

export const DEFAULT_PROVIDER_ID = DATA_PROVIDERS[0].id;
