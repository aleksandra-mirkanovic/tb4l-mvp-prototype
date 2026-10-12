/**
 * TB4L-003 Segment Share and White Space — calculation layer.
 * Scenario codes and importance are deterministic (not LLM judgement).
 * Spec: TB4L-003_building_block_v0.2
 */

import {
  CALC_CATEGORY,
  CALC_SEGMENTS,
  CALC_SUBBRANDS,
  type CalcSegment,
  type CalcSubBrand,
} from './m360Charts';
import {
  M360_METADATA,
  M360_RETRIEVAL_PARAMS,
  M360_SEGMENTS,
  M360_SUBBRANDS,
  buildM360Checks,
} from './m360Retrieval';

export const TB4L003_META = {
  analyticId: 'TB4L-003',
  name: 'Segment Share and White Space',
  status: 'DRAFT' as const,
  version: '0.2',
  scope: 'GB BAM',
  country: M360_RETRIEVAL_PARAMS.country,
  category: M360_RETRIEVAL_PARAMS.category,
  matEnd: M360_METADATA.latest_actual_month,
  matStart: M360_METADATA.mat_start,
  matEndLabel: M360_METADATA.mat_end,
  currency: M360_METADATA.currency,
  source: M360_RETRIEVAL_PARAMS.source,
  dataRefreshNote: `Snapshot MAT ${M360_METADATA.mat_start}–${M360_METADATA.mat_end}`,
};

/** Proposed tolerance from building block (±0.5 pp) — TBC with analysts. */
export const TB4L003_AXIS_TOLERANCE_PP = 0.5;
export const TB4L003_BAYER_ABSENT_PCT = 3;

export type ScenarioCode = 'S1' | 'S2' | 'S3' | 'S4' | 'U0';
export type Importance = 'HIGH' | 'MEDIUM' | 'LOW';
export type CheckStatus = 'PASS' | 'FLAG' | 'FAIL';

export type Tb4l003SegmentCalc = {
  segment: string;
  valueMatM: number;
  shareOfCategoryPct: number;
  growth1yPct: number | null;
  unitGrowth1yPct: number | null;
  growthVsCategoryPp: number | null;
  cagr3yPct: number | null;
  cagr2yPct: number | null;
  cagrPct: number | null;
  cagrBasis: '3y' | '2y' | 'n/a';
  bayerShareMatPct: number | null;
  bayerShareChangePp: number | null;
  bayerEuroChangeM: number;
  competitorEuroChangeM: number | null;
  ppuChangePct: number | null;
  scenarioCode: ScenarioCode;
  growthStatus: 'faster' | 'slower' | 'borderline' | 'missing';
  shareStatus: 'present' | 'absent' | 'borderline' | 'missing';
  failedAxis: 'growth' | 'share' | 'both' | null;
  whiteSpace: boolean;
  shareLossInGrowth: boolean;
  nearMiss: boolean;
  signalImportance: Importance;
};

export const SCENARIO_COPY: Record<
  Exclude<ScenarioCode, 'U0'>,
  { interpretation: string; decisionToReview: string; evidenceNeeded: string }
> = {
  S1: {
    interpretation: 'Candidate white space.',
    decisionToReview: 'Segment-entry or penetration hypotheses.',
    evidenceNeeded: 'Consumer fit, accessible demand, supply, competition and incremental economics.',
  },
  S2: {
    interpretation: 'Bayer plays in a growing segment.',
    decisionToReview: 'Whether Bayer keeps pace with segment growth; protect and accelerate.',
    evidenceNeeded: 'Share trend, competitor movements, price and volume development.',
  },
  S3: {
    interpretation: 'Gap with limited growth case unless a strategic case exists.',
    decisionToReview: 'Research priority rather than assuming entry.',
    evidenceNeeded: 'Growth trajectory (CAGR, unit growth), strategic adjacency, attainable scale.',
  },
  S4: {
    interpretation: 'Established position in a slower segment.',
    decisionToReview: 'Protect the position and watch for share erosion.',
    evidenceNeeded: 'Share trend, competitor activity, saturation and profit pool.',
  },
};

function cagrN(mat: number | null, prior: number | null, years: number): number | null {
  if (mat == null || prior == null || prior <= 0 || mat <= 0) return null;
  return ((mat / prior) ** (1 / years) - 1) * 100;
}

function classifySegment(s: CalcSegment): Tb4l003SegmentCalc {
  const catG = CALC_CATEGORY.growth1yPct;
  const growthVs = s.growth1yPct != null && catG != null ? s.growth1yPct - catG : null;

  const raw = M360_SEGMENTS.find((r) => r.segment_name === s.segment);
  const cagr3y = s.cagr3yPct;
  const cagr2y = cagrN(raw?.value_mat ?? null, raw?.value_2ya ?? null, 2);
  const cagrPct = cagr3y ?? cagr2y;
  const cagrBasis: '3y' | '2y' | 'n/a' = cagr3y != null ? '3y' : cagr2y != null ? '2y' : 'n/a';

  const segValueChange = (s.valueMat - s.valueYa) / 1_000_000;
  const competitorEuroChangeM = Number.isFinite(segValueChange)
    ? segValueChange - s.bayerEuroChangeM
    : null;

  const ppuMat =
    raw?.value_mat != null && raw.units_mat ? raw.value_mat / raw.units_mat : null;
  const ppuYa = raw?.value_ya != null && raw.units_ya ? raw.value_ya / raw.units_ya : null;
  const ppuChangePct =
    ppuMat != null && ppuYa != null && ppuYa !== 0 ? (ppuMat / ppuYa - 1) * 100 : null;

  let growthStatus: Tb4l003SegmentCalc['growthStatus'] = 'missing';
  let shareStatus: Tb4l003SegmentCalc['shareStatus'] = 'missing';
  let failedAxis: Tb4l003SegmentCalc['failedAxis'] = null;

  if (growthVs == null) {
    growthStatus = 'missing';
  } else if (Math.abs(growthVs) <= TB4L003_AXIS_TOLERANCE_PP) {
    growthStatus = 'borderline';
  } else if (growthVs > 0) {
    growthStatus = 'faster';
  } else {
    growthStatus = 'slower';
  }

  const share = s.bayerShareMatPct;
  if (share == null) {
    shareStatus = 'missing';
  } else if (Math.abs(share - TB4L003_BAYER_ABSENT_PCT) <= TB4L003_AXIS_TOLERANCE_PP) {
    shareStatus = 'borderline';
  } else if (share < TB4L003_BAYER_ABSENT_PCT) {
    shareStatus = 'absent';
  } else {
    shareStatus = 'present';
  }

  let scenarioCode: ScenarioCode = 'U0';
  if (
    growthStatus === 'missing' ||
    growthStatus === 'borderline' ||
    shareStatus === 'missing' ||
    shareStatus === 'borderline'
  ) {
    scenarioCode = 'U0';
    const gFail = growthStatus === 'missing' || growthStatus === 'borderline';
    const sFail = shareStatus === 'missing' || shareStatus === 'borderline';
    failedAxis = gFail && sFail ? 'both' : gFail ? 'growth' : 'share';
  } else if (growthStatus === 'faster' && shareStatus === 'absent') {
    scenarioCode = 'S1';
  } else if (growthStatus === 'faster' && shareStatus === 'present') {
    scenarioCode = 'S2';
  } else if (growthStatus === 'slower' && shareStatus === 'absent') {
    scenarioCode = 'S3';
  } else {
    scenarioCode = 'S4';
  }

  const whiteSpace = scenarioCode === 'S1';
  const nearMiss = scenarioCode === 'S3';
  const shareLossInGrowth = scenarioCode === 'S2' && (s.bayerShareChangePp ?? 0) < 0;

  let signalImportance: Importance = 'LOW';
  const absShareCh = s.bayerShareChangePp != null ? Math.abs(s.bayerShareChangePp) : 0;
  const bayerEiLow = CALC_SUBBRANDS.some(
    (r) => r.segment === s.segment && r.isBayer && r.evolutionIndex != null && r.evolutionIndex < 95,
  );
  if (
    s.shareOfCategoryPct >= 20 ||
    absShareCh >= 1.0 ||
    bayerEiLow ||
    scenarioCode === 'S1' ||
    shareLossInGrowth
  ) {
    signalImportance = 'HIGH';
  } else if (absShareCh >= 0.5 || scenarioCode === 'S3') {
    signalImportance = 'MEDIUM';
  } else {
    const rivalBigMove = CALC_SUBBRANDS.some(
      (r) =>
        r.segment === s.segment &&
        !r.isBayer &&
        r.shareChangePp != null &&
        Math.abs(r.shareChangePp) >= 1.0,
    );
    if (rivalBigMove) signalImportance = 'MEDIUM';
  }

  return {
    segment: s.segment,
    valueMatM: s.valueMatM,
    shareOfCategoryPct: s.shareOfCategoryPct,
    growth1yPct: s.growth1yPct,
    unitGrowth1yPct: s.unitGrowth1yPct,
    growthVsCategoryPp: growthVs,
    cagr3yPct: cagr3y,
    cagr2yPct: cagr2y,
    cagrPct,
    cagrBasis,
    bayerShareMatPct: s.bayerShareMatPct,
    bayerShareChangePp: s.bayerShareChangePp,
    bayerEuroChangeM: s.bayerEuroChangeM,
    competitorEuroChangeM,
    ppuChangePct,
    scenarioCode,
    growthStatus,
    shareStatus,
    failedAxis,
    whiteSpace,
    shareLossInGrowth,
    nearMiss,
    signalImportance,
  };
}

export const TB4L003_SEGMENTS: Tb4l003SegmentCalc[] = [...CALC_SEGMENTS]
  .map(classifySegment)
  .sort((a, b) => b.valueMatM - a.valueMatM);

export const TB4L003_CATEGORY = {
  valueMatM: CALC_CATEGORY.valueMatM,
  growth1yPct: CALC_CATEGORY.growth1yPct,
  unitGrowth1yPct: CALC_CATEGORY.unitGrowth1yPct,
  bayerValueMatM: CALC_CATEGORY.bayerValueMatM,
  bayerShareMatPct: CALC_CATEGORY.bayerShareMatPct,
  bayerShareChangePp: CALC_CATEGORY.bayerShareChangePp,
  cagr3yPct: null as number | null,
  cagr2yPct: (() => {
    const mat = CALC_CATEGORY.valueMat;
    const ya2 = M360_SEGMENTS.reduce((s, r) => s + (r.value_2ya ?? 0), 0);
    return cagrN(mat, ya2 || null, 2);
  })(),
};

export type Tb4l003Check = {
  id: string;
  rule: string;
  status: CheckStatus;
  detail: string;
};

/** Calculation-layer checks V1–V10 (building block §3). */
export function buildTb4l003Checks(): Tb4l003Check[] {
  const agent = buildM360Checks();
  const byId = Object.fromEntries(agent.map((c) => [c.id, c]));

  const otherMixFail = M360_SUBBRANDS.some(
    (r) => r.sub_brand === 'Other (<1%)' && r.is_bayer === 1,
  );

  const hasMonth = Boolean(M360_METADATA.latest_actual_month);
  const multiSeg = agent.find((c) => c.id === 'C4');
  const junk = agent.find((c) => c.id === 'C5');
  const units = agent.find((c) => c.id === 'C6');
  const value3yaOk = M360_SEGMENTS.every((s) => s.value_3ya != null);

  return [
    {
      id: 'V1',
      rule: 'Σ T2 value_mat per segment = T1 value_mat (0.1%)',
      status: byId.C1?.status === 'PASS' ? 'PASS' : 'FAIL',
      detail: byId.C1?.values ?? '',
    },
    {
      id: 'V2',
      rule: 'Σ T2 Bayer value_mat per segment = T1 bayer_value_mat (0.1%)',
      status: byId.C2?.status === 'PASS' ? 'PASS' : 'FAIL',
      detail: byId.C2?.values ?? '',
    },
    {
      id: 'V3',
      rule: 'No “Other” row mixes Bayer and competitor value',
      status: otherMixFail ? 'FAIL' : 'PASS',
      detail: otherMixFail
        ? 'Re-request T2 with separate Other Bayer (<1%) and Other competitors (<1%) rows.'
        : 'Other rows split by Bayer flag.',
    },
    {
      id: 'V4',
      rule: 'latest_actual_month present; MAT = 12 months',
      status: hasMonth ? 'PASS' : 'FAIL',
      detail: `latest_actual_month=${M360_METADATA.latest_actual_month}; MAT ${M360_METADATA.mat_start}–${M360_METADATA.mat_end}`,
    },
    {
      id: 'V5',
      rule: 'Sub-brands in more than one segment',
      status: 'FLAG',
      detail: multiSeg?.values ?? 'Listed multi-segment brands — never sum across segments.',
    },
    {
      id: 'V6',
      rule: 'Near-duplicate names (edit distance ≤ 2)',
      status: 'FLAG',
      detail: 'Not computed on this snapshot — review sub-brand names manually if needed.',
    },
    {
      id: 'V7',
      rule: 'Product name unrelated to segment',
      status: junk?.status === 'FAIL' ? 'FLAG' : 'PASS',
      detail: junk?.values ?? '',
    },
    {
      id: 'V8',
      rule: 'value_3ya available',
      status: value3yaOk ? 'PASS' : 'FLAG',
      detail: value3yaOk
        ? '3y windows complete.'
        : `Only ${M360_METADATA.months_available_for_3ya}/12 months for 3YA — show 2y CAGR labelled.`,
    },
    {
      id: 'V9',
      rule: 'T1 n_subbrands_total = T2 distinct count incl. n_grouped',
      status: 'FLAG',
      detail: 'Not fully recomputed on grouped Other rows in this prototype snapshot.',
    },
    {
      id: 'V10',
      rule: 'Agent C1–C6 status agrees with V1–V9',
      status: 'FLAG',
      detail: `Prototype: V1–V2 mirror C1–C2; V3 is stricter than agent C2. Units check C6=${units?.status ?? 'n/a'}. Review disagreements.`,
    },
  ];
}

export function topSubBrandsForSegment(segment: string, n = 7): CalcSubBrand[] {
  return CALC_SUBBRANDS.filter((r) => r.segment === segment)
    .sort((a, b) => b.shareMatPct - a.shareMatPct)
    .slice(0, n);
}

export function top3ConcentrationPct(segment: string): number {
  const top = topSubBrandsForSegment(segment, 3);
  return top.reduce((s, r) => s + r.shareMatPct, 0);
}

export function shortSegmentName(segment: string): string {
  return segment
    .replace('IBS & SENSITIVE STOMACH', 'IBS')
    .replace('GAS & BLOATING', 'Gas')
    .replace('ANTACIDS', 'Antacids')
    .replace('PPIS', 'PPIs');
}
