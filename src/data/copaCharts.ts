/**
 * CALC for COPA snapshot. Insights and the report may only read these results.
 *
 * TB4L-001 metrics that this extract can support. 3y CAGR, volume, GTN trade/promo
 * lines are not computed (fields missing).
 */

import { COPA_BRAND_YEARS, COPA_RETRIEVAL_PARAMS, COPA_SKU_YEARS } from './copaRetrieval';

export const COPA_FORMULAS = [
  { metric: 'Net sales growth 1y', formula: 'net sales 2025 / net sales 2024 − 1', from: 'COPA' },
  { metric: 'Gross profit growth 1y', formula: 'gross profit 2025 / gross profit 2024 − 1', from: 'COPA' },
  { metric: 'Gross profit %', formula: 'gross profit / net sales (2025 and 2024)', from: 'COPA' },
  { metric: 'Gross profit % change', formula: 'GP% 2025 − GP% 2024, in points', from: 'COPA' },
  { metric: 'Share of this set · net sales', formula: 'brand net sales / sum of four brands', from: 'COPA' },
  { metric: 'Share of this set · gross profit', formula: 'brand gross profit / sum of four brands', from: 'COPA' },
  {
    metric: 'Contribution to net sales growth',
    formula: '(NS 2025 − NS 2024) / set NS 2024, in points',
    from: 'COPA',
  },
  {
    metric: 'Contribution to gross profit growth',
    formula: '(GP 2025 − GP 2024) / set GP 2024, in points',
    from: 'COPA',
  },
  { metric: 'Marketing % of net sales', formula: 'marketing cost / net sales', from: 'COPA' },
  { metric: 'EBIT margin %', formula: 'cEBIT / Net Sales', from: 'COPA CALC' },
  {
    metric: 'EBITDA',
    formula: 'keyfigure EBITDA / CLEAN EBITDA — not in this brand-year snapshot',
    from: 'COPA (missing in extract)',
  },
  { metric: 'Operating profit %', formula: 'cEBIT / net sales', from: 'COPA' },
  {
    metric: 'Mix effect on GP%',
    formula: '(weight 2025 − weight 2024) × GP% 2024; weight = NS / set NS',
    from: 'COPA',
  },
  {
    metric: 'Rate effect on GP%',
    formula: 'weight 2025 × (GP% 2025 − GP% 2024)',
    from: 'COPA',
  },
  {
    metric: 'SKU revenue contribution %',
    formula: 'material Net Sales / brand Net Sales (same calendar year)',
    from: 'COPA CALC',
  },
  {
    metric: 'Revenue contribution % (this set)',
    formula: 'line Net Sales / four-brand set Net Sales',
    from: 'COPA CALC',
  },
  {
    metric: 'Profit contribution % (this set)',
    formula: 'line Gross Profit / four-brand set Gross Profit',
    from: 'COPA CALC',
  },
  {
    metric: 'Profit share (Profit Pool)',
    formula: 'brand Gross Profit / four-brand set Gross Profit',
    from: 'COPA CALC',
  },
  {
    metric: 'Profit ranking',
    formula: 'rank of Gross Profit descending in this set',
    from: 'COPA CALC',
  },
  {
    metric: 'Revenue share',
    formula: 'brand Net Sales / four-brand set Net Sales (same year)',
    from: 'COPA CALC',
  },
  {
    metric: 'Mix change',
    formula: 'current revenue share − previous revenue share, in points',
    from: 'COPA CALC',
  },
  {
    metric: 'Revenue rank',
    formula: 'rank of Net Sales descending in this set',
    from: 'COPA CALC',
  },
  {
    metric: 'Pareto category',
    formula: 'A until 80% of set Net Sales, B until 95%, C the rest',
    from: 'COPA CALC',
  },
  {
    metric: 'Portfolio scorecard class',
    formula:
      'Declining if growth < 0; else Growth Driver if growth > set growth; else Profit Driver if GM% > set GM%; else Rationalize if revenue contrib < 5% and growth < set growth; else Maintain',
    from: 'COPA CALC',
  },
];

function pct(ratio: number | null): number | null {
  return ratio === null ? null : ratio * 100;
}

function growth(now: number, prior: number): number | null {
  if (!prior) return null;
  return now / prior - 1;
}

export type CopaQuadrant =
  | 'Growing, margin-accretive'
  | 'Growing, margin-dilutive'
  | 'Lagging, margin-accretive'
  | 'Lagging, margin-dilutive';

export type CalcCopaBrand = {
  brand: string;
  netSales: number;
  netSalesPrior: number;
  netSalesM: number;
  growth1yPct: number | null;
  grossProfit: number;
  grossProfitPrior: number;
  grossProfitM: number;
  gpGrowth1yPct: number | null;
  gpPct: number | null;
  gpPctPrior: number | null;
  gpChangePp: number | null;
  ebit: number;
  ebitM: number;
  ebitPct: number | null;
  marketing: number;
  marketingM: number;
  mktPct: number | null;
  cogs: number;
  grossSales: number;
  shareOfSetPct: number;
  shareOfSetPriorPct: number;
  shareOfSetGmPct: number;
  contribNsPp: number | null;
  contribGmPp: number | null;
  mixEffectPp: number;
  rateEffectPp: number;
  quadrant: CopaQuadrant;
};

const latest = COPA_BRAND_YEARS.filter((r) => r.year === COPA_RETRIEVAL_PARAMS.latestYear);
const prior = COPA_BRAND_YEARS.filter((r) => r.year === COPA_RETRIEVAL_PARAMS.priorYear);
const setNet = latest.reduce((s, r) => s + r.netSales, 0);
const setNetPrior = prior.reduce((s, r) => s + r.netSales, 0);
const setGp = latest.reduce((s, r) => s + r.grossProfit, 0);
const setGpPrior = prior.reduce((s, r) => s + r.grossProfit, 0);
const setEbit = latest.reduce((s, r) => s + r.ebit, 0);
const setMkt = latest.reduce((s, r) => s + r.marketing, 0);
const setGs = latest.reduce((s, r) => s + r.grossSales, 0);
const setCogs = latest.reduce((s, r) => s + r.cogs, 0);

const setGrowth = growth(setNet, setNetPrior);
const setGpPct = setNet ? (setGp / setNet) * 100 : null;
const setGpPctPrior = setNetPrior ? (setGpPrior / setNetPrior) * 100 : null;

function quadrant(gPct: number | null, gp: number | null): CopaQuadrant {
  const setG = pct(setGrowth);
  const grow = gPct !== null && setG !== null && gPct >= setG;
  const rich = gp !== null && setGpPct !== null && gp >= setGpPct;
  if (grow && rich) return 'Growing, margin-accretive';
  if (grow && !rich) return 'Growing, margin-dilutive';
  if (!grow && rich) return 'Lagging, margin-accretive';
  return 'Lagging, margin-dilutive';
}

export const CALC_COPA_BRANDS: CalcCopaBrand[] = latest.map((row) => {
  const p = prior.find((x) => x.brand === row.brand)!;
  const g = growth(row.netSales, p.netSales);
  const gpPct = row.netSales ? (row.grossProfit / row.netSales) * 100 : null;
  const gpPctPrior = p.netSales ? (p.grossProfit / p.netSales) * 100 : null;
  const wMat = setNet ? row.netSales / setNet : 0;
  const wYa = setNetPrior ? p.netSales / setNetPrior : 0;
  const mixEffectPp = (wMat - wYa) * (gpPctPrior ?? 0);
  const rateEffectPp = wMat * ((gpPct ?? 0) - (gpPctPrior ?? 0));
  return {
    brand: row.brand,
    netSales: row.netSales,
    netSalesPrior: p.netSales,
    netSalesM: row.netSales / 1_000_000,
    growth1yPct: pct(g),
    grossProfit: row.grossProfit,
    grossProfitPrior: p.grossProfit,
    grossProfitM: row.grossProfit / 1_000_000,
    gpGrowth1yPct: pct(growth(row.grossProfit, p.grossProfit)),
    gpPct,
    gpPctPrior,
    gpChangePp: gpPct !== null && gpPctPrior !== null ? gpPct - gpPctPrior : null,
    ebit: row.ebit,
    ebitM: row.ebit / 1_000_000,
    ebitPct: row.netSales ? (row.ebit / row.netSales) * 100 : null,
    marketing: row.marketing,
    marketingM: row.marketing / 1_000_000,
    mktPct: row.netSales ? (row.marketing / row.netSales) * 100 : null,
    cogs: row.cogs,
    grossSales: row.grossSales,
    shareOfSetPct: wMat * 100,
    shareOfSetPriorPct: wYa * 100,
    shareOfSetGmPct: setGp ? (row.grossProfit / setGp) * 100 : 0,
    contribNsPp: setNetPrior ? ((row.netSales - p.netSales) / setNetPrior) * 100 : null,
    contribGmPp: setGpPrior ? ((row.grossProfit - p.grossProfit) / setGpPrior) * 100 : null,
    mixEffectPp,
    rateEffectPp,
    quadrant: quadrant(pct(g), gpPct),
  };
});

export const CALC_COPA_SET = {
  netSalesM: setNet / 1_000_000,
  netSalesPriorM: setNetPrior / 1_000_000,
  growth1yPct: pct(setGrowth),
  cagr3yPct: null as number | null,
  grossProfitM: setGp / 1_000_000,
  gpGrowth1yPct: pct(growth(setGp, setGpPrior)),
  gpPct: setGpPct,
  gpPctPrior: setGpPctPrior,
  gpChangePp: setGpPct !== null && setGpPctPrior !== null ? setGpPct - setGpPctPrior : null,
  ebitM: setEbit / 1_000_000,
  ebitPct: setNet ? (setEbit / setNet) * 100 : null,
  marketingM: setMkt / 1_000_000,
  mktPct: setNet ? (setMkt / setNet) * 100 : null,
  cogsM: setCogs / 1_000_000,
  grossSalesM: setGs / 1_000_000,
  nsOfGsPct: setGs ? (setNet / setGs) * 100 : null,
  cogsOfGsPct: setGs ? (setCogs / setGs) * 100 : null,
  gpOfGsPct: setGs ? (setGp / setGs) * 100 : null,
};

const mixSum = CALC_COPA_BRANDS.reduce((s, r) => s + r.mixEffectPp, 0);
const rateSum = CALC_COPA_BRANDS.reduce((s, r) => s + r.rateEffectPp, 0);
const bridgeDelta = mixSum + rateSum;
const gpDelta = CALC_COPA_SET.gpChangePp ?? 0;
const bridgeGap = Math.abs(bridgeDelta - gpDelta);

export const CALC_COPA_BRIDGE = {
  mixSumPp: mixSum,
  rateSumPp: rateSum,
  gpPctPrior: CALC_COPA_SET.gpPctPrior,
  gpPct: CALC_COPA_SET.gpPct,
  checkPass: bridgeGap <= 0.01,
  checkGapPp: bridgeGap,
};

export const CALC_COPA_IBERO = CALC_COPA_BRANDS.find((b) => b.brand === 'Iberogast')!;

export type CalcCopaSku = {
  brand: string;
  year: number;
  material: string;
  materialText: string;
  netSalesM: number;
  brandNetSalesM: number;
  contribPct: number | null;
};

const brandNsByKey = new Map(
  COPA_BRAND_YEARS.map((r) => [`${r.brand}|${r.year}`, r.netSales] as const),
);

export const CALC_COPA_SKU: CalcCopaSku[] = COPA_SKU_YEARS.map((r) => {
  const brandNs = brandNsByKey.get(`${r.brand}|${r.year}`) ?? 0;
  return {
    brand: r.brand,
    year: r.year,
    material: r.material,
    materialText: r.materialText,
    netSalesM: r.netSales / 1_000_000,
    brandNetSalesM: brandNs / 1_000_000,
    contribPct: brandNs ? (r.netSales / brandNs) * 100 : null,
  };
}).sort((a, b) => b.year - a.year || b.netSalesM - a.netSalesM);

export const CALC_COPA_SKU_CHECK = {
  formula: 'SKU Net Sales / brand Net Sales',
  rowCount: CALC_COPA_SKU.length,
  year: COPA_RETRIEVAL_PARAMS.latestYear,
};

export type CopaPortfolioRole =
  | 'Growth Driver'
  | 'Profit Driver'
  | 'Declining'
  | 'Rationalize'
  | 'Maintain';

export type CalcCopaScorecard = {
  name: string;
  grain: 'brand';
  /** Net Sales, EUR m — Revenue */
  revenueM: number;
  /** Revenue Growth % */
  revenueGrowthPct: number | null;
  /** Revenue Contribution % = brand NS / set NS */
  revenueContribPct: number;
  /** Profit Contribution % = brand GP / set GP */
  profitContribPct: number;
  /** Gross Margin % = Gross Profit / Net Sales */
  grossMarginPct: number | null;
  /** EBIT Margin % = cEBIT / Net Sales */
  ebitMarginPct: number | null;
  /** Mix Change = current revenue share − prior share, points */
  mixChangePp: number;
  /** Revenue Rank (1 = largest NS) */
  revenueRank: number;
  /** Pareto A until 80% of set NS, B until 95%, C the rest */
  paretoCategory: 'A' | 'B' | 'C';
  role: CopaPortfolioRole;
  roleWhy: string;
};

/**
 * First match:
 * 1. Declining — growth % < 0
 * 2. Growth Driver — growth % > portfolio growth %
 * 3. Profit Driver — gross margin % > portfolio average GM %
 * 4. Rationalize — revenue contrib % < 5% AND growth % < portfolio growth %
 * 5. Maintain — everything else
 */
function classifyBrand(b: CalcCopaBrand): { role: CopaPortfolioRole; why: string } {
  const setG = CALC_COPA_SET.growth1yPct;
  const setGp = CALC_COPA_SET.gpPct;
  const g = b.growth1yPct;
  const gm = b.gpPct;
  const contrib = b.shareOfSetPct;

  if (g !== null && g < 0) {
    return { role: 'Declining', why: `Growth ${g.toFixed(1)}% is below 0.` };
  }
  if (g !== null && setG !== null && g > setG) {
    return {
      role: 'Growth Driver',
      why: `Growth ${g.toFixed(1)}% is above portfolio growth ${setG.toFixed(1)}%.`,
    };
  }
  if (gm !== null && setGp !== null && gm > setGp) {
    return {
      role: 'Profit Driver',
      why: `Gross margin ${gm.toFixed(1)}% is above portfolio average ${setGp.toFixed(1)}%.`,
    };
  }
  if (contrib < 5 && (setG === null || g === null || g < setG)) {
    return {
      role: 'Rationalize',
      why: `Revenue contribution ${contrib.toFixed(1)}% is under 5% and growth is below the portfolio.`,
    };
  }
  return {
    role: 'Maintain',
    why: 'Does not meet Growth Driver, Profit Driver, Declining, or Rationalize rules.',
  };
}

const brandsByRevenue = [...CALC_COPA_BRANDS].sort((a, b) => b.netSalesM - a.netSalesM);
let paretoCum = 0;

export const CALC_COPA_SCORECARD: CalcCopaScorecard[] = brandsByRevenue.map((b, i) => {
  const prev = paretoCum;
  paretoCum += b.shareOfSetPct;
  const { role, why } = classifyBrand(b);
  const paretoCategory: 'A' | 'B' | 'C' = prev < 80 ? 'A' : prev < 95 ? 'B' : 'C';
  return {
    name: b.brand,
    grain: 'brand',
    revenueM: b.netSalesM,
    revenueGrowthPct: b.growth1yPct,
    revenueContribPct: b.shareOfSetPct,
    profitContribPct: b.shareOfSetGmPct,
    grossMarginPct: b.gpPct,
    ebitMarginPct: b.ebitPct,
    mixChangePp: b.shareOfSetPct - b.shareOfSetPriorPct,
    revenueRank: i + 1,
    paretoCategory,
    role,
    roleWhy: why,
  };
});

export const CALC_COPA_SCORECARD_NOTE =
  'Portfolio scorecard on OAuth COPA brand grain — split into growth ranking, margin quality, and contribution bars (no bubble matrix). Revenue = Net Sales. Mix change = current revenue share − prior share. Roles: Declining → Growth Driver → Profit Driver → Rationalize → Maintain.';

export const CALC_COPA_SCORECARD_META = {
  portfolioGrowthPct: CALC_COPA_SET.growth1yPct,
  portfolioGmPct: CALC_COPA_SET.gpPct,
  portfolioEbitPct: CALC_COPA_SET.ebitPct,
};

const ROLE_ORDER: CopaPortfolioRole[] = [
  'Growth Driver',
  'Profit Driver',
  'Maintain',
  'Declining',
  'Rationalize',
];

/** Portfolio Classification — same first-match rules as the Bain scorecard. */
export const CALC_COPA_CLASSIFICATION = ROLE_ORDER.map((role) => ({
  role,
  brands: CALC_COPA_SCORECARD.filter((r) => r.role === role),
  rule:
    role === 'Growth Driver'
      ? 'Revenue growth % > portfolio growth %'
      : role === 'Profit Driver'
        ? 'Gross margin % > portfolio average GM %'
        : role === 'Declining'
          ? 'Revenue growth % < 0'
          : role === 'Rationalize'
            ? 'Revenue contrib % < 5% AND growth % < portfolio growth %'
            : 'Everything else',
}));

export const CALC_COPA_CLASSIFICATION_NOTE =
  'First match: Declining → Growth Driver → Profit Driver → Rationalize → Maintain. Role cards only — growth and margin detail sit in the scorecard charts above.';

/** Profit Pool — Gross Profit share of the four-brand set (OAuth COPA). */
export type CalcCopaProfitPool = {
  brand: string;
  /** Gross Profit, EUR m (latest year) */
  grossProfitM: number;
  grossProfitPriorM: number;
  /** Profit Share = brand GP / set GP */
  profitSharePct: number;
  profitSharePriorPct: number;
  /** Profit Ranking (1 = largest GP) */
  profitRank: number;
  /** Contribution to set GP growth, points of prior set GP */
  contribGpPp: number | null;
  deltaGpM: number;
};

const profitByGp = [...CALC_COPA_BRANDS].sort((a, b) => b.grossProfitM - a.grossProfitM);

export const CALC_COPA_PROFIT_POOL: CalcCopaProfitPool[] = profitByGp.map((b, i) => ({
  brand: b.brand,
  grossProfitM: b.grossProfitM,
  grossProfitPriorM: b.grossProfitPrior / 1_000_000,
  profitSharePct: b.shareOfSetGmPct,
  profitSharePriorPct: setGpPrior ? (b.grossProfitPrior / setGpPrior) * 100 : 0,
  profitRank: i + 1,
  contribGpPp: b.contribGmPp,
  deltaGpM: b.grossProfitM - b.grossProfitPrior / 1_000_000,
}));

export const CALC_COPA_PROFIT_POOL_META = {
  totalGpM: CALC_COPA_SET.grossProfitM,
  totalGpPriorM: setGpPrior / 1_000_000,
  gpGrowth1yPct: CALC_COPA_SET.gpGrowth1yPct,
  note: 'Profit Pool uses Gross Profit. Profit Share = brand Gross Profit ÷ set Gross Profit. Ranking is by Gross Profit descending.',
};

/** Portfolio Growth & Margin Mix — OAuth COPA brand grain. */
export type CalcCopaGrowthMargin = {
  brand: string;
  netSalesM: number;
  grossSalesM: number;
  grossProfitM: number;
  /** Gross Profit / Net Sales */
  grossMarginPct: number | null;
  /** EBITDA — not in this brand-year snapshot */
  ebitdaM: null;
  /** cEBIT / Net Sales */
  ebitMarginPct: number | null;
  ebitM: number;
  revenueGrowthPct: number | null;
  revenueContribPct: number;
  profitContribPct: number;
  revenueRank: number;
  paretoClass: 'A' | 'B' | 'C';
};

export const CALC_COPA_GROWTH_MARGIN: CalcCopaGrowthMargin[] = CALC_COPA_SCORECARD.map((s) => {
  const b = CALC_COPA_BRANDS.find((x) => x.brand === s.name)!;
  return {
    brand: s.name,
    netSalesM: b.netSalesM,
    grossSalesM: b.grossSales / 1_000_000,
    grossProfitM: b.grossProfitM,
    grossMarginPct: b.gpPct,
    ebitdaM: null,
    ebitMarginPct: b.ebitPct,
    ebitM: b.ebitM,
    revenueGrowthPct: b.growth1yPct,
    revenueContribPct: b.shareOfSetPct,
    profitContribPct: b.shareOfSetGmPct,
    revenueRank: s.revenueRank,
    paretoClass: s.paretoCategory,
  };
});

export const CALC_COPA_GROWTH_MARGIN_SET = {
  netSalesM: CALC_COPA_SET.netSalesM,
  grossSalesM: CALC_COPA_SET.grossSalesM,
  grossProfitM: CALC_COPA_SET.grossProfitM,
  grossMarginPct: CALC_COPA_SET.gpPct,
  ebitdaM: null as null,
  ebitMarginPct: CALC_COPA_SET.ebitPct,
  ebitM: CALC_COPA_SET.ebitM,
  revenueGrowthPct: CALC_COPA_SET.growth1yPct,
  note: 'EBITDA exists as a COPA keyfigure but was not returned in this brand-year extract. EBIT margin uses cEBIT / Net Sales.',
};

/** Revenue Mix Analysis — who drives the set (OAuth COPA Net Sales). */
export type CalcCopaRevenueMix = {
  brand: string;
  revenueM: number;
  revenuePriorM: number;
  /** Revenue / Total Revenue (current year), % */
  revenueSharePct: number;
  /** Revenue / Total Revenue (prior year), % */
  revenueSharePriorPct: number;
  /** Current share − previous share, points */
  mixChangePp: number;
  /** Cumulative revenue share after ranking by current revenue, % */
  cumSharePct: number;
  /** A until 80% of set revenue, B until 95%, else C */
  paretoCategory: 'A' | 'B' | 'C';
  /** True while cumulative share first crosses / stays within the 80% band */
  inTop80: boolean;
};

const mixByRevenue = [...CALC_COPA_BRANDS].sort((a, b) => b.netSalesM - a.netSalesM);
let mixCum = 0;

export const CALC_COPA_REVENUE_MIX: CalcCopaRevenueMix[] = mixByRevenue.map((b) => {
  const prevCum = mixCum;
  mixCum += b.shareOfSetPct;
  const paretoCategory: 'A' | 'B' | 'C' = prevCum < 80 ? 'A' : prevCum < 95 ? 'B' : 'C';
  return {
    brand: b.brand,
    revenueM: b.netSalesM,
    revenuePriorM: b.netSalesPrior / 1_000_000,
    revenueSharePct: b.shareOfSetPct,
    revenueSharePriorPct: b.shareOfSetPriorPct,
    mixChangePp: b.shareOfSetPct - b.shareOfSetPriorPct,
    cumSharePct: mixCum,
    paretoCategory,
    inTop80: prevCum < 80,
  };
});

export const CALC_COPA_REVENUE_MIX_META = {
  totalRevenueM: CALC_COPA_SET.netSalesM,
  totalRevenuePriorM: CALC_COPA_SET.netSalesPriorM,
  mixChangeSumPp: CALC_COPA_REVENUE_MIX.reduce((s, r) => s + r.mixChangePp, 0),
  top80Brands: CALC_COPA_REVENUE_MIX.filter((r) => r.inTop80).map((r) => r.brand),
  note: 'Revenue = Net Sales. Shares use the four-brand set total. Mix-change points sum to ~0.',
};

const STACK_BRANDS = ['Iberogast', 'Lefax', 'Rennie', 'Talcid'] as const;
const stackYears = [...new Set(COPA_BRAND_YEARS.map((r) => r.year))].sort((a, b) => a - b);

export type CalcCopaStackBrand = {
  brand: string;
  netSalesM: number;
  grossSalesM: number;
  gpPct: number | null;
  shareOfStackPct: number;
  contribNsPp: number | null;
  growth1yPct: number | null;
  gsvGrowth1yPct: number | null;
};

export type CalcCopaStackYear = {
  year: number;
  label: string;
  isYtd: boolean;
  totalNsM: number;
  totalGsM: number;
  growth1yPct: number | null;
  brands: CalcCopaStackBrand[];
};

export const CALC_COPA_STACK: CalcCopaStackYear[] = stackYears.map((year) => {
  const priorYear = year - 1;
  const setPrior = COPA_BRAND_YEARS.filter((r) => r.year === priorYear).reduce((s, r) => s + r.netSales, 0);
  const brands: CalcCopaStackBrand[] = STACK_BRANDS.map((brand) => {
    const row = COPA_BRAND_YEARS.find((r) => r.brand === brand && r.year === year)!;
    const prior = COPA_BRAND_YEARS.find((r) => r.brand === brand && r.year === priorYear);
    return {
      brand,
      netSalesM: row.netSales / 1_000_000,
      grossSalesM: row.grossSales / 1_000_000,
      gpPct: row.netSales ? (row.grossProfit / row.netSales) * 100 : null,
      shareOfStackPct: 0,
      contribNsPp: prior && setPrior ? ((row.netSales - prior.netSales) / setPrior) * 100 : null,
      growth1yPct: prior ? pct(growth(row.netSales, prior.netSales)) : null,
      gsvGrowth1yPct: prior ? pct(growth(row.grossSales, prior.grossSales)) : null,
    };
  });
  const totalNsM = brands.reduce((s, b) => s + b.netSalesM, 0);
  const totalGsM = brands.reduce((s, b) => s + b.grossSalesM, 0);
  const priorTot = COPA_BRAND_YEARS.filter((r) => r.year === priorYear).reduce((s, r) => s + r.netSales, 0);
  return {
    year,
    label: `CY ${year}`,
    isYtd: false,
    totalNsM,
    totalGsM,
    growth1yPct: priorTot ? pct(growth(totalNsM * 1_000_000, priorTot)) : null,
    brands: brands.map((b) => ({
      ...b,
      shareOfStackPct: totalNsM ? (b.netSalesM / totalNsM) * 100 : 0,
    })),
  };
});

const latestStack = CALC_COPA_STACK[CALC_COPA_STACK.length - 1];
const stackDrivers = [...(latestStack?.brands ?? [])]
  .filter((b) => (b.contribNsPp ?? 0) > 0)
  .sort((a, b) => (b.contribNsPp ?? 0) - (a.contribNsPp ?? 0));

export const CALC_COPA_STACK_META = {
  years: stackYears,
  hasCagr: stackYears.includes(2021) && stackYears.includes(2025),
  hasYtd2026: stackYears.includes(2026),
  drivers: stackDrivers.map((b) => b.brand),
  title:
    stackDrivers.length >= 2
      ? `NSV growth mainly driven by ${stackDrivers[0].brand} and ${stackDrivers[1].brand}`
      : stackDrivers[0]
        ? `NSV growth mainly driven by ${stackDrivers[0].brand}`
        : 'Portfolio net sales by year',
};

export type CopaObservation = {
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
  headline: string;
  detail: string;
  chart: string;
};

function obsImportance(b: CalcCopaBrand): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (b.shareOfSetPct >= 15) return 'HIGH';
  if (b.gpChangePp !== null && Math.abs(b.gpChangePp) >= 1) return 'HIGH';
  if (b.contribNsPp !== null && Math.abs(b.contribNsPp) >= 1) return 'HIGH';
  if (Math.abs(b.mixEffectPp) >= 0.5 || Math.abs(b.rateEffectPp) >= 0.5) return 'HIGH';
  if (b.gpChangePp !== null && Math.abs(b.gpChangePp) >= 0.5) return 'MEDIUM';
  return 'LOW';
}

const brandObs: CopaObservation[] = CALC_COPA_BRANDS.map((b) => ({
  importance: obsImportance(b),
  headline: `${b.brand}: ${b.quadrant}`,
  detail: `Net sales EUR ${b.netSalesM.toFixed(1)}m (${b.growth1yPct! >= 0 ? '+' : ''}${b.growth1yPct!.toFixed(1)}%). Gross profit ${b.gpPct!.toFixed(1)}% of net sales (${b.gpChangePp! >= 0 ? '+' : ''}${b.gpChangePp!.toFixed(1)} points). Contribution to set net-sales growth ${b.contribNsPp! >= 0 ? '+' : ''}${b.contribNsPp!.toFixed(1)} points.`,
  chart: 'Portfolio map · Who drives growth',
}));

export const CALC_COPA_OBS: CopaObservation[] = [
  {
    importance: 'HIGH',
    headline: `This four-brand set: net sales EUR ${CALC_COPA_SET.netSalesM.toFixed(1)}m, ${CALC_COPA_SET.growth1yPct! >= 0 ? '+' : ''}${CALC_COPA_SET.growth1yPct!.toFixed(1)}% versus 2024`,
    detail: `Gross profit EUR ${CALC_COPA_SET.grossProfitM.toFixed(1)}m, ${CALC_COPA_SET.gpPct!.toFixed(1)}% of net sales, ${CALC_COPA_SET.gpChangePp! >= 0 ? '+' : ''}${CALC_COPA_SET.gpChangePp!.toFixed(1)} points versus 2024.`,
    chart: 'KPI tiles',
  },
  ...brandObs,
  {
    importance: 'HIGH',
    headline: `Gross profit mix ${CALC_COPA_BRIDGE.mixSumPp >= 0 ? '+' : ''}${CALC_COPA_BRIDGE.mixSumPp.toFixed(1)} points, rate ${CALC_COPA_BRIDGE.rateSumPp >= 0 ? '+' : ''}${CALC_COPA_BRIDGE.rateSumPp.toFixed(1)} points`,
    detail: CALC_COPA_BRIDGE.checkPass
      ? `Mix plus rate equals the set gross-profit change (${CALC_COPA_SET.gpChangePp!.toFixed(1)} points). Check passed.`
      : `Mix plus rate is ${(CALC_COPA_BRIDGE.mixSumPp + CALC_COPA_BRIDGE.rateSumPp).toFixed(2)} points versus set change ${CALC_COPA_SET.gpChangePp!.toFixed(2)}. Check failed.`,
    chart: 'Margin mix',
  },
];

export const COPA_MISSING = [
  'Three-year net sales growth (no 3-year window)',
  'Volume / packs sold — no volume vs price split',
  'Conditional and unconditional trade investment',
  'Promo spend and 2-Net Sales vs 3-Net Sales',
  'Other variable cost',
  'Promotions and incentives (no rows in this extract)',
  'Full gross-to-net ladder',
  'Volume, volume contribution %, and volume growth % (no packs in COPA)',
  'Brand margin % of net sales (not in this extract)',
  'SKU-level scorecard — no material rows; brand grain used instead',
  'Quadrant thresholds — every brand is un-thresholded (U0)',
];
