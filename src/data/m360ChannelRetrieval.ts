/**
 * Channel retrieval from Sirius (CHDAA) — Iberogast GB BAM, Germany, MAT Jul 2026.
 * Grain: CHANNEL_NAME (Pharmacies | E-commerce). Brand ranks are top-8 by value in each channel.
 * Insights / report must only read CALC exports from this file — no invented channel formulas.
 */

export type ChannelRow = {
  channel: 'Pharmacies' | 'E-commerce';
  localChannel: string;
  valueEurM: number;
  shareOfSetPct: number;
  valueGrowthPct: number;
  unitGrowthPct: number;
  priceContribEurM: number;
  volumeContribEurM: number;
  newPackEurM: number;
  newProductEurM: number;
  intersectionEurM: number;
  absChangeEurM: number;
  pctOfSetAbsGrowth: number;
};

export type ChannelBrandRow = {
  channel: 'Pharmacies' | 'E-commerce';
  rank: number;
  brand: string;
  valueEurM: number;
  shareOfChannelPct: number;
  shareChangePp: number;
  valueGrowthPct: number;
  unitGrowthPct: number;
  isBayer: boolean;
};

export const M360_CHANNEL_META = {
  country: 'Germany',
  scope: 'Iberogast GB BAM',
  matEnd: 'Jul 2026',
  source: 'Sirius / CHDAA v_m360_nrm',
  note: 'Germany has only Pharmacies and E-commerce (Mail Order-Total). No customer / retailer grain.',
};

/** T-channel · channel totals + growth drivers */
export const M360_CHANNELS: ChannelRow[] = [
  {
    channel: 'Pharmacies',
    localChannel: 'Pharmacy-Total',
    valueEurM: 422.7,
    shareOfSetPct: 72.61,
    valueGrowthPct: 1.5,
    unitGrowthPct: -0.8,
    priceContribEurM: 10.8,
    volumeContribEurM: -6.32,
    newPackEurM: 1.3,
    newProductEurM: 0.9,
    intersectionEurM: -0.33,
    absChangeEurM: 6.34,
    pctOfSetAbsGrowth: 24.8,
  },
  {
    channel: 'E-commerce',
    localChannel: 'Mail Order-Total',
    valueEurM: 159.43,
    shareOfSetPct: 27.39,
    valueGrowthPct: 13.7,
    unitGrowthPct: 11.4,
    priceContribEurM: 4.53,
    volumeContribEurM: 13.65,
    newPackEurM: 0.74,
    newProductEurM: 0.18,
    intersectionEurM: 0.11,
    absChangeEurM: 19.21,
    pctOfSetAbsGrowth: 75.2,
  },
];

/** T-channel-brands · top 8 by value in each channel */
export const M360_CHANNEL_BRANDS: ChannelBrandRow[] = [
  { channel: 'Pharmacies', rank: 1, brand: 'IBEROGAST', valueEurM: 106.5, shareOfChannelPct: 25.2, shareChangePp: -0.3, valueGrowthPct: 0.3, unitGrowthPct: -1.3, isBayer: true },
  { channel: 'Pharmacies', rank: 2, brand: 'BUSCOPAN', valueEurM: 44.67, shareOfChannelPct: 10.57, shareChangePp: -0.08, valueGrowthPct: 0.8, unitGrowthPct: -2.4, isBayer: false },
  { channel: 'Pharmacies', rank: 3, brand: 'GAVISCON', valueEurM: 39.07, shareOfChannelPct: 9.24, shareChangePp: 1.08, valueGrowthPct: 14.9, unitGrowthPct: 10.3, isBayer: false },
  { channel: 'Pharmacies', rank: 4, brand: 'LEFAX', valueEurM: 35.18, shareOfChannelPct: 8.32, shareChangePp: -0.08, valueGrowthPct: 0.6, unitGrowthPct: -0.5, isBayer: true },
  { channel: 'Pharmacies', rank: 5, brand: 'KIJIMEA', valueEurM: 29.13, shareOfChannelPct: 6.89, shareChangePp: 0.48, valueGrowthPct: 9.0, unitGrowthPct: 6.7, isBayer: false },
  { channel: 'Pharmacies', rank: 6, brand: 'PANTOPRAZOLE', valueEurM: 26.89, shareOfChannelPct: 6.36, shareChangePp: -0.09, valueGrowthPct: 0.1, unitGrowthPct: 2.3, isBayer: false },
  { channel: 'Pharmacies', rank: 7, brand: 'TALCID', valueEurM: 25.79, shareOfChannelPct: 6.1, shareChangePp: 0.01, valueGrowthPct: 1.7, unitGrowthPct: -3.7, isBayer: true },
  { channel: 'Pharmacies', rank: 8, brand: 'RIOPAN', valueEurM: 16.02, shareOfChannelPct: 3.79, shareChangePp: 0.08, valueGrowthPct: 3.6, unitGrowthPct: -3.5, isBayer: false },
  { channel: 'E-commerce', rank: 1, brand: 'IBEROGAST', valueEurM: 35.18, shareOfChannelPct: 22.06, shareChangePp: 1.04, valueGrowthPct: 19.3, unitGrowthPct: 10.6, isBayer: true },
  { channel: 'E-commerce', rank: 2, brand: 'KIJIMEA', valueEurM: 16.99, shareOfChannelPct: 10.66, shareChangePp: -1.01, valueGrowthPct: 3.8, unitGrowthPct: 5.3, isBayer: false },
  { channel: 'E-commerce', rank: 3, brand: 'GAVISCON', valueEurM: 14.93, shareOfChannelPct: 9.37, shareChangePp: 2.26, valueGrowthPct: 49.9, unitGrowthPct: 32.7, isBayer: false },
  { channel: 'E-commerce', rank: 4, brand: 'LEFAX', valueEurM: 12.59, shareOfChannelPct: 7.9, shareChangePp: -0.41, valueGrowthPct: 8.1, unitGrowthPct: 6.4, isBayer: true },
  { channel: 'E-commerce', rank: 5, brand: 'BUSCOPAN', valueEurM: 10.12, shareOfChannelPct: 6.35, shareChangePp: -0.26, valueGrowthPct: 9.3, unitGrowthPct: 10.4, isBayer: false },
  { channel: 'E-commerce', rank: 6, brand: 'TALCID', valueEurM: 9.71, shareOfChannelPct: 6.09, shareChangePp: -0.42, valueGrowthPct: 6.4, unitGrowthPct: -0.9, isBayer: true },
  { channel: 'E-commerce', rank: 7, brand: 'PANTOPRAZOLE', valueEurM: 6.59, shareOfChannelPct: 4.14, shareChangePp: -0.23, valueGrowthPct: 7.7, unitGrowthPct: 19.8, isBayer: false },
  { channel: 'E-commerce', rank: 8, brand: 'RIOPAN', valueEurM: 5.92, shareOfChannelPct: 3.71, shareChangePp: -0.06, valueGrowthPct: 11.8, unitGrowthPct: 2.4, isBayer: false },
];

export const CALC_CHANNELS = M360_CHANNELS;
export const CALC_CHANNEL_BRANDS = M360_CHANNEL_BRANDS;

/** Channel metrics used by AI Assistant v2 · Channel dynamics. Append-only for the appendix. */
export const CALC_CHANNEL_FORMULAS: { metric: string; formula: string; from: string }[] = [
  {
    metric: 'Channel share of set',
    formula: 'channel value EUR / SUM(channel value EUR)',
    from: 'T-ch',
  },
  {
    metric: 'Channel value growth 1y',
    formula: 'value_mat / value_ya − 1 (Sirius channel grain)',
    from: 'T-ch',
  },
  {
    metric: 'Channel unit growth 1y',
    formula: 'units_mat / units_ya − 1 (Sirius channel grain)',
    from: 'T-ch',
  },
  {
    metric: 'Absolute EUR change',
    formula: 'value_mat − value_ya, in EUR m',
    from: 'T-ch',
  },
  {
    metric: '% of set absolute EUR growth',
    formula: 'channel abs Δ EUR / SUM(channel abs Δ EUR)',
    from: 'T-ch',
  },
  {
    metric: 'Price contribution EUR m',
    formula: 'Sirius price effect on channel value change (EUR m)',
    from: 'T-ch',
  },
  {
    metric: 'Volume contribution EUR m',
    formula: 'Sirius volume effect on channel value change (EUR m)',
    from: 'T-ch',
  },
  {
    metric: 'New pack / new product / intersection EUR m',
    formula: 'Sirius innovation decomposition on channel value change (EUR m)',
    from: 'T-ch',
  },
  {
    metric: 'Brand share of channel',
    formula: 'brand value EUR / channel value EUR',
    from: 'T-ch-b',
  },
  {
    metric: 'Brand share change',
    formula: 'share_mat − share_ya, in pp',
    from: 'T-ch-b',
  },
  {
    metric: 'Brand value / unit growth 1y',
    formula: 'value_mat / value_ya − 1 · units_mat / units_ya − 1',
    from: 'T-ch-b',
  },
];

export function channelBrands(channel: 'Pharmacies' | 'E-commerce'): ChannelBrandRow[] {
  return CALC_CHANNEL_BRANDS.filter((r) => r.channel === channel);
}

/** Sorted by share change — gainers first (dynamics). */
export function channelBrandsByShareChange(channel: 'Pharmacies' | 'E-commerce'): ChannelBrandRow[] {
  return [...channelBrands(channel)].sort((a, b) => b.shareChangePp - a.shareChangePp);
}

export const CALC_CHANNEL_PHARMA = CALC_CHANNELS.find((c) => c.channel === 'Pharmacies')!;
export const CALC_CHANNEL_ECOMM = CALC_CHANNELS.find((c) => c.channel === 'E-commerce')!;
