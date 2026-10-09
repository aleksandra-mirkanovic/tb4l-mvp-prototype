/**
 * CALC layer — run as code between retrieval and insights.
 * Insights and the report may only read these results. They must not invent formulas.
 *
 * Metric                         Formula                                              From
 * Segment share of category      value_mat / SUM(value_mat)                           T1
 * Segment growth 1y              value_mat / value_ya - 1                             T1
 * Segment unit growth 1y         units_mat / units_ya - 1                             T1
 * Segment 3y CAGR                (value_mat / value_3ya)^(1/3) - 1                    T1 (null if value_3ya null)
 * Category growth 1y             SUM(value_mat) / SUM(value_ya) - 1                   T1
 * Category unit growth 1y        SUM(units_mat) / SUM(units_ya) - 1                   T1
 * Bayer share of segment         bayer_value_mat / value_mat (YA, 3YA same)           T1
 * Bayer share change             share_mat - share_ya, in pp                          T1
 * Bayer € change                 bayer_value_mat - bayer_value_ya                     T1
 * Sub-brand share of segment     value_mat / segment value_mat                        T2 + T1
 * Sub-brand share change         share_mat - share_ya, in pp                          T2 + T1
 * Evolution index                (1 + sub-brand growth) / (1 + segment growth) × 100  T2 + T1
 * Price per unit                 value / units, MAT and YA                            T2
 * White-space flag               Bayer share MAT < 3% AND segment 1y > category 1y    T1
 */

import { M360_METADATA, M360_SEGMENTS, M360_SUBBRANDS } from './m360Retrieval';

export const CALC_FORMULAS: { metric: string; formula: string; from: string }[] = [
  { metric: 'Segment share of category', formula: 'value_mat / SUM(value_mat)', from: 'T1' },
  { metric: 'Segment growth 1y', formula: 'value_mat / value_ya − 1', from: 'T1' },
  { metric: 'Segment unit growth 1y', formula: 'units_mat / units_ya − 1', from: 'T1' },
  {
    metric: 'Segment 3y CAGR',
    formula: '(value_mat / value_3ya)^(1/3) − 1 — null if value_3ya is null',
    from: 'T1',
  },
  { metric: 'Category growth 1y', formula: 'SUM(value_mat) / SUM(value_ya) − 1', from: 'T1' },
  { metric: 'Category unit growth 1y', formula: 'SUM(units_mat) / SUM(units_ya) − 1', from: 'T1' },
  {
    metric: 'Bayer sales growth 1y (set)',
    formula: 'SUM(bayer_value_mat) / SUM(bayer_value_ya) − 1',
    from: 'T1',
  },
  {
    metric: 'Bayer share of segment',
    formula: 'bayer_value_mat / value_mat (and same for YA, 3YA)',
    from: 'T1',
  },
  { metric: 'Bayer share change', formula: 'share_mat − share_ya, in pp', from: 'T1' },
  { metric: 'Bayer € change', formula: 'bayer_value_mat − bayer_value_ya', from: 'T1' },
  { metric: 'Sub-brand share of segment', formula: 'value_mat / segment value_mat', from: 'T2 + T1' },
  { metric: 'Sub-brand share change', formula: 'share_mat − share_ya, in pp', from: 'T2 + T1' },
  {
    metric: 'Evolution index',
    formula: '(1 + sub-brand growth) / (1 + segment growth) × 100',
    from: 'T2 + T1',
  },
  { metric: 'Price per unit', formula: 'value / units, MAT and YA', from: 'T2' },
  {
    metric: 'White-space flag',
    formula: 'Bayer share MAT < 3% AND segment growth 1y > category growth 1y',
    from: 'T1',
  },
];

function n(v: number | null | undefined): number | null {
  return v === null || v === undefined || !Number.isFinite(v) ? null : v;
}

/** Ratio: mat/prior − 1. Null if either side missing or prior is 0. */
function ratioMinusOne(mat: number | null, prior: number | null): number | null {
  if (n(mat) === null || n(prior) === null || prior === 0) return null;
  return mat! / prior! - 1;
}

function cagr(mat: number | null, prior: number | null, years: number): number | null {
  if (n(mat) === null || n(prior) === null || !prior || mat! <= 0 || prior! <= 0) return null;
  return (mat! / prior!) ** (1 / years) - 1;
}

function pct(ratio: number | null): number | null {
  return ratio === null ? null : ratio * 100;
}

const catMat = M360_SEGMENTS.reduce((s, r) => s + (r.value_mat ?? 0), 0);
const catYa = M360_SEGMENTS.reduce((s, r) => s + (r.value_ya ?? 0), 0);
const catUnitsMat = M360_SEGMENTS.reduce((s, r) => s + (r.units_mat ?? 0), 0);
const catUnitsYa = M360_SEGMENTS.reduce((s, r) => s + (r.units_ya ?? 0), 0);
const catBayerMat = M360_SEGMENTS.reduce((s, r) => s + (r.bayer_value_mat ?? 0), 0);
const catBayerYa = M360_SEGMENTS.reduce((s, r) => s + (r.bayer_value_ya ?? 0), 0);

const categoryGrowth1y = ratioMinusOne(catMat, catYa);

export const CAGR_3Y_NOTE = `3y CAGR not available - ${M360_METADATA.months_available_for_3ya} months of history.`;

export type CalcCategory = {
  valueMat: number;
  valueYa: number;
  valueMatM: number;
  bayerValueMat: number;
  bayerValueYa: number;
  bayerValueMatM: number;
  growth1y: number | null;
  growth1yPct: number | null;
  /** Bayer brands sales growth in the same competitive set (value €, not share points). */
  bayerGrowth1yPct: number | null;
  unitGrowth1yPct: number | null;
  bayerShareMatPct: number | null;
  bayerShareYaPct: number | null;
  bayerShareChangePp: number | null;
};

export const CALC_CATEGORY: CalcCategory = {
  valueMat: catMat,
  valueYa: catYa,
  valueMatM: catMat / 1_000_000,
  bayerValueMat: catBayerMat,
  bayerValueYa: catBayerYa,
  bayerValueMatM: catBayerMat / 1_000_000,
  growth1y: categoryGrowth1y,
  growth1yPct: pct(categoryGrowth1y),
  bayerGrowth1yPct: pct(ratioMinusOne(catBayerMat, catBayerYa)),
  unitGrowth1yPct: pct(ratioMinusOne(catUnitsMat, catUnitsYa)),
  bayerShareMatPct: catMat ? (catBayerMat / catMat) * 100 : null,
  bayerShareYaPct: catYa ? (catBayerYa / catYa) * 100 : null,
  bayerShareChangePp:
    catMat && catYa ? (catBayerMat / catMat) * 100 - (catBayerYa / catYa) * 100 : null,
};

export type CalcSegment = {
  segment: string;
  valueMat: number;
  valueYa: number;
  value2ya: number | null;
  value3ya: number | null;
  valueMatM: number;
  shareOfCategoryPct: number;
  growth1y: number | null;
  growth1yPct: number | null;
  unitGrowth1yPct: number | null;
  cagr3yPct: number | null;
  bayerValueMat: number;
  bayerValueYa: number;
  bayerEuroChange: number;
  bayerEuroChangeM: number;
  bayerShareMatPct: number | null;
  bayerShareYaPct: number | null;
  bayerShare3yaPct: number | null;
  bayerShareChangePp: number | null;
  whiteSpaceFlag: boolean;
};

export const CALC_SEGMENTS: CalcSegment[] = M360_SEGMENTS.map((s) => {
  const growth1y = ratioMinusOne(s.value_mat, s.value_ya);
  const growth1yPct = pct(growth1y);
  const bayerShareMat =
    n(s.bayer_value_mat) !== null && s.value_mat ? (s.bayer_value_mat! / s.value_mat) * 100 : null;
  const bayerShareYa =
    n(s.bayer_value_ya) !== null && s.value_ya ? (s.bayer_value_ya! / s.value_ya) * 100 : null;
  const bayerShare3ya =
    n(s.bayer_value_3ya) !== null && n(s.value_3ya) && s.value_3ya
      ? (s.bayer_value_3ya! / s.value_3ya) * 100
      : null;
  const faster = growth1y !== null && categoryGrowth1y !== null && growth1y > categoryGrowth1y;
  const below3 = bayerShareMat !== null && bayerShareMat < 3;
  const bayerEuro = (s.bayer_value_mat ?? 0) - (s.bayer_value_ya ?? 0);
  const shareOfCategoryPct = catMat ? ((s.value_mat ?? 0) / catMat) * 100 : 0;
  return {
    segment: s.segment_name,
    valueMat: s.value_mat ?? 0,
    valueYa: s.value_ya ?? 0,
    value2ya: n(s.value_2ya),
    value3ya: n(s.value_3ya),
    valueMatM: (s.value_mat ?? 0) / 1_000_000,
    shareOfCategoryPct,
    growth1y,
    growth1yPct,
    unitGrowth1yPct: pct(ratioMinusOne(s.units_mat, s.units_ya)),
    cagr3yPct: pct(cagr(s.value_mat, s.value_3ya, 3)),
    bayerValueMat: s.bayer_value_mat ?? 0,
    bayerValueYa: s.bayer_value_ya ?? 0,
    bayerEuroChange: bayerEuro,
    bayerEuroChangeM: bayerEuro / 1_000_000,
    bayerShareMatPct: bayerShareMat,
    bayerShareYaPct: bayerShareYa,
    bayerShare3yaPct: bayerShare3ya,
    bayerShareChangePp:
      bayerShareMat !== null && bayerShareYa !== null ? bayerShareMat - bayerShareYa : null,
    whiteSpaceFlag: below3 && faster,
  };
});

export type CalcSubBrand = {
  segment: string;
  manufacturer: string;
  brand: string;
  subBrand: string;
  label: string;
  isBayer: boolean;
  valueMat: number;
  valueYa: number | null;
  shareMatPct: number;
  shareYaPct: number | null;
  shareChangePp: number | null;
  growth1y: number | null;
  growth1yPct: number | null;
  evolutionIndex: number | null;
  ppuMat: number | null;
  ppuYa: number | null;
};

function subLabel(r: (typeof M360_SUBBRANDS)[number]): string {
  const twins = M360_SUBBRANDS.filter(
    (x) =>
      x.segment_name === r.segment_name &&
      x.sub_brand === r.sub_brand &&
      x.sub_brand !== 'Other (<1%)',
  );
  if (twins.length > 1) return `${r.sub_brand} (${r.manufacturer})`;
  return r.sub_brand;
}

export const CALC_SUBBRANDS: CalcSubBrand[] = M360_SEGMENTS.flatMap((s) => {
  const seg = CALC_SEGMENTS.find((x) => x.segment === s.segment_name)!;
  return M360_SUBBRANDS.filter(
    (r) => r.segment_name === s.segment_name && r.sub_brand !== 'Other (<1%)',
  ).map((r) => {
    const shareMat = seg.valueMat ? ((r.value_mat ?? 0) / seg.valueMat) * 100 : 0;
    const shareYa =
      seg.valueYa && r.value_ya !== null ? (r.value_ya / seg.valueYa) * 100 : null;
    const gSub = ratioMinusOne(r.value_mat, r.value_ya);
    const gSeg = seg.growth1y;
    const ei =
      gSub !== null && gSeg !== null && 1 + gSeg !== 0 ? ((1 + gSub) / (1 + gSeg)) * 100 : null;
    const ppuMat =
      n(r.value_mat) !== null && n(r.units_mat) && r.units_mat ? r.value_mat! / r.units_mat! : null;
    const ppuYa =
      n(r.value_ya) !== null && n(r.units_ya) && r.units_ya ? r.value_ya! / r.units_ya! : null;
    return {
      segment: s.segment_name,
      manufacturer: r.manufacturer,
      brand: r.brand,
      subBrand: r.sub_brand,
      label: subLabel(r),
      isBayer: r.is_bayer === 1,
      valueMat: r.value_mat ?? 0,
      valueYa: n(r.value_ya),
      shareMatPct: shareMat,
      shareYaPct: shareYa,
      shareChangePp: shareYa !== null ? shareMat - shareYa : null,
      growth1y: gSub,
      growth1yPct: pct(gSub),
      evolutionIndex: ei,
      ppuMat,
      ppuYa,
    };
  });
});

export function largestBayerSubBrand(segment: string): CalcSubBrand | undefined {
  return CALC_SUBBRANDS.filter((r) => r.segment === segment && r.isBayer).sort(
    (a, b) => b.valueMat - a.valueMat,
  )[0];
}

export const CALC_IBEROGAST = CALC_SUBBRANDS.filter((r) => r.brand === 'IBEROGAST').sort(
  (a, b) => b.valueMat - a.valueMat,
);

/** Brand-level value growth inside the competitive set (sum of sub-brands). */
export function brandValueGrowth1yPct(brand: string): number | null {
  const rows = CALC_SUBBRANDS.filter((r) => r.brand === brand);
  if (rows.length === 0) return null;
  const mat = rows.reduce((s, r) => s + r.valueMat, 0);
  const ya = rows.reduce((s, r) => s + (r.valueYa ?? 0), 0);
  return pct(ratioMinusOne(mat, ya));
}

export const TOP_SUBBRANDS_PER_SEGMENT = CALC_SEGMENTS.map((seg) => ({
  segment: seg.segment,
  rows: CALC_SUBBRANDS.filter((r) => r.segment === seg.segment)
    .sort((a, b) => b.valueMat - a.valueMat)
    .slice(0, 5),
}));

export type StackShareRow = {
  segment: string;
  bayerPct: number;
  competitorLabel: string;
  competitorPct: number;
  restPct: number;
};

export const STACK_SHARE_ROWS: StackShareRow[] = CALC_SEGMENTS.map((s) => {
  const others = CALC_SUBBRANDS.filter((r) => r.segment === s.segment && !r.isBayer).sort(
    (a, b) => b.valueMat - a.valueMat,
  );
  const top = others[0];
  const comp = top?.valueMat ?? 0;
  const rest = Math.max(0, s.valueMat - s.bayerValueMat - comp);
  return {
    segment: s.segment,
    bayerPct: s.valueMat ? (s.bayerValueMat / s.valueMat) * 100 : 0,
    competitorLabel: top?.label ?? 'N/A',
    competitorPct: s.valueMat ? (comp / s.valueMat) * 100 : 0,
    restPct: s.valueMat ? (rest / s.valueMat) * 100 : 0,
  };
});

export const WHITE_SPACE_CANDIDATES = CALC_SEGMENTS.filter((s) => s.whiteSpaceFlag);

export const CALC = {
  formulas: CALC_FORMULAS,
  category: CALC_CATEGORY,
  segments: CALC_SEGMENTS,
  subBrands: CALC_SUBBRANDS,
  iberogast: CALC_IBEROGAST,
  stacks: STACK_SHARE_ROWS,
  topSubBrands: TOP_SUBBRANDS_PER_SEGMENT,
  whiteSpaceCandidates: WHITE_SPACE_CANDIDATES,
  cagr3yNote: CAGR_3Y_NOTE,
};

export const CATEGORY_GROWTH_1Y_PCT = CALC_CATEGORY.growth1yPct;
export const CATEGORY_VALUE_MAT_M = CALC_CATEGORY.valueMatM;
export const SEGMENT_CHART_ROWS = CALC_SEGMENTS;
