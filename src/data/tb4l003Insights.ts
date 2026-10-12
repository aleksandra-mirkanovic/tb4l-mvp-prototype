/**
 * TB4L-003 insights content — deterministic from CALC (stand-in for insights agent).
 * Guardrails: describe what happened, never why; no € opportunity sizing.
 */

import { CALC_CATEGORY, CALC_SUBBRANDS } from './m360Charts';
import {
  SCENARIO_COPY,
  TB4L003_CATEGORY,
  TB4L003_META,
  TB4L003_SEGMENTS,
  buildTb4l003Checks,
  shortSegmentName,
  top3ConcentrationPct,
  topSubBrandsForSegment,
  type Importance,
  type ScenarioCode,
  type Tb4l003SegmentCalc,
} from './tb4l003Calc';

function fmtM(v: number | null | undefined, dp = 1): string {
  if (v == null || !Number.isFinite(v)) return 'N/A';
  return `€${v.toFixed(dp)}m`;
}

function fmtPct(v: number | null | undefined, dp = 1): string {
  if (v == null || !Number.isFinite(v)) return 'N/A';
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(dp)}%`;
}

function fmtPp(v: number | null | undefined, dp = 1): string {
  if (v == null || !Number.isFinite(v)) return 'N/A';
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(dp)} pp`;
}

function fmtShare(v: number | null | undefined, dp = 1): string {
  if (v == null || !Number.isFinite(v)) return 'N/A';
  return `${v.toFixed(dp)}%`;
}

export type Tb4l003Observation = {
  id: number;
  area: 'market' | 'performance' | 'competitors' | 'white space';
  importance: Importance;
  headline: string;
  detail: string;
  sources: string[];
  chart: 1 | 2 | 3 | 4;
};

export type Tb4l003ScenarioRow = {
  segment: string;
  code: ScenarioCode;
  growthVsCategoryPp: number | null;
  growthStatus: string;
  bayerSharePct: number | null;
  shareStatus: string;
  interpretation: string;
  decisionToReview: string;
  evidenceNeeded: string;
  failedAxis: string | null;
};

export type Tb4l003Opportunity = {
  segment: string;
  type: 'white space' | 'near-miss' | 'share loss in growth';
  valueEurM: number;
  growthVsCategoryPp: number | null;
  bayerSharePct: number | null;
  bayerShareChangePp: number | null;
  top3: string;
  concentrationTop3Pct: number;
  cagrPct: number | null;
  cagrBasis: string;
  ppuChangePct: number | null;
  rationaleFor: string;
  rationaleAgainst: string;
  unitGrowthSensitivity: string;
  label: string;
};

export type Tb4l003WatchOut = {
  type: 'data' | 'interpretation';
  text: string;
  sources: string[];
};

const CANDIDATE_LABEL = 'Candidate for discussion — not a recommendation';

function importanceRank(i: Importance): number {
  return i === 'HIGH' ? 0 : i === 'MEDIUM' ? 1 : 2;
}

function buildObservations(): Tb4l003Observation[] {
  const out: Tb4l003Observation[] = [];
  const cat = TB4L003_CATEGORY;
  const segs = TB4L003_SEGMENTS;
  let id = 1;

  const largest = segs[0];
  if (largest) {
    out.push({
      id: id++,
      area: 'market',
      importance: largest.signalImportance,
      headline: `${shortSegmentName(largest.segment)} is the largest need-state at ${fmtShare(largest.shareOfCategoryPct)} of set value.`,
      detail: `${shortSegmentName(largest.segment)} is ${fmtM(largest.valueMatM)} of ${fmtM(cat.valueMatM)} category value. Bayer share ${fmtShare(largest.bayerShareMatPct)}.`,
      sources: [`CALC | ${largest.segment} | share_of_category_pct`],
      chart: 1,
    });
  }

  out.push({
    id: id++,
    area: 'market',
    importance: 'MEDIUM',
    headline: `Category value ${fmtM(cat.valueMatM)}; value growth ${fmtPct(cat.growth1yPct)}, units ${fmtPct(cat.unitGrowth1yPct)}.`,
    detail: `Bayer value ${fmtM(cat.bayerValueMatM)}; Bayer share ${fmtShare(cat.bayerShareMatPct)} (${fmtPp(cat.bayerShareChangePp)}).`,
    sources: ['CALC | category'],
    chart: 1,
  });

  for (const s of segs) {
    if (s.shareLossInGrowth) {
      out.push({
        id: id++,
        area: 'performance',
        importance: 'HIGH',
        headline: `${shortSegmentName(s.segment)} grows faster than category; Bayer share ${fmtPp(s.bayerShareChangePp)}.`,
        detail: `Growth vs category ${fmtPp(s.growthVsCategoryPp)}; Bayer share ${fmtShare(s.bayerShareMatPct)}. Scenario ${s.scenarioCode}.`,
        sources: [`CALC | ${s.segment} | bayer_share_change_pp`],
        chart: 2,
      });
    }
  }

  for (const s of segs) {
    const rival = CALC_SUBBRANDS.filter((r) => r.segment === s.segment && !r.isBayer).sort(
      (a, b) => b.shareMatPct - a.shareMatPct,
    )[0];
    if (rival && (rival.shareChangePp ?? 0) >= 1) {
      out.push({
        id: id++,
        area: 'competitors',
        importance: s.signalImportance === 'LOW' ? 'MEDIUM' : s.signalImportance,
        headline: `${rival.label} leads non-Bayer share in ${shortSegmentName(s.segment)} at ${fmtShare(rival.shareMatPct)}.`,
        detail: `Value growth ${fmtPct(rival.growth1yPct)}; share change ${fmtPp(rival.shareChangePp)}; EI ${rival.evolutionIndex != null ? Math.round(rival.evolutionIndex) : 'N/A'}.`,
        sources: [`CALC | ${s.segment} | ${rival.subBrand}`],
        chart: 3,
      });
    }
  }

  const s1 = segs.filter((s) => s.whiteSpace);
  if (s1.length === 0) {
    out.push({
      id: id++,
      area: 'white space',
      importance: 'MEDIUM',
      headline: 'No S1 white-space segments in this MAT window.',
      detail: 'No segment is both faster than category growth and below 3% Bayer share outside the U0 band.',
      sources: ['CALC | scenario_code'],
      chart: 2,
    });
  } else {
    for (const s of s1) {
      out.push({
        id: id++,
        area: 'white space',
        importance: 'HIGH',
        headline: `${shortSegmentName(s.segment)} is S1 — faster than category with Bayer absent.`,
        detail: `Value ${fmtM(s.valueMatM)}; growth vs category ${fmtPp(s.growthVsCategoryPp)}; Bayer share ${fmtShare(s.bayerShareMatPct)}.`,
        sources: [`CALC | ${s.segment} | scenario_code`],
        chart: 2,
      });
    }
  }

  // Ensure ≤7, cover areas where possible
  const sorted = out
    .sort(
      (a, b) =>
        importanceRank(a.importance) - importanceRank(b.importance) || a.id - b.id,
    )
    .slice(0, 7)
    .map((o, i) => ({ ...o, id: i + 1 }));

  return sorted;
}

function scenarioRows(): Tb4l003ScenarioRow[] {
  return TB4L003_SEGMENTS.map((s) => {
    if (s.scenarioCode === 'U0') {
      return {
        segment: s.segment,
        code: 'U0',
        growthVsCategoryPp: s.growthVsCategoryPp,
        growthStatus: s.growthStatus,
        bayerSharePct: s.bayerShareMatPct,
        shareStatus: s.shareStatus,
        interpretation: 'No classification.',
        decisionToReview: 'Resolve the failed axis first.',
        evidenceNeeded: `State which axis failed (${s.failedAxis}) and the next evidence task.`,
        failedAxis: s.failedAxis,
      };
    }
    const copy = SCENARIO_COPY[s.scenarioCode];
    return {
      segment: s.segment,
      code: s.scenarioCode,
      growthVsCategoryPp: s.growthVsCategoryPp,
      growthStatus: s.growthStatus,
      bayerSharePct: s.bayerShareMatPct,
      shareStatus: s.shareStatus,
      interpretation: copy.interpretation,
      decisionToReview: copy.decisionToReview,
      evidenceNeeded: copy.evidenceNeeded,
      failedAxis: null,
    };
  });
}

function opportunityCard(s: Tb4l003SegmentCalc, type: Tb4l003Opportunity['type']): Tb4l003Opportunity {
  const top = topSubBrandsForSegment(s.segment, 3);
  const top3 = top.map((r) => `${r.label} (${fmtShare(r.shareMatPct)})`).join('; ');
  const unitVsCat =
    s.unitGrowth1yPct != null && CALC_CATEGORY.unitGrowth1yPct != null
      ? s.unitGrowth1yPct - CALC_CATEGORY.unitGrowth1yPct
      : null;

  let rationaleFor = '';
  let rationaleAgainst = '';
  let unitGrowthSensitivity = '';

  if (type === 'white space') {
    rationaleFor = `Faster than category (${fmtPp(s.growthVsCategoryPp)}); Bayer share ${fmtShare(s.bayerShareMatPct)} (< 3%).`;
    rationaleAgainst = 'No consumer-fit, supply, or incremental-economics evidence on this page; no € sizing.';
  } else if (type === 'near-miss') {
    rationaleFor = `Bayer absent (${fmtShare(s.bayerShareMatPct)}); segment exists at ${fmtM(s.valueMatM)}.`;
    rationaleAgainst = `Growth vs category ${fmtPp(s.growthVsCategoryPp)} — slower than category on value.`;
    unitGrowthSensitivity =
      unitVsCat != null && unitVsCat > 0
        ? `Unit growth vs category ${fmtPp(unitVsCat)} — units alone do not move the value-growth axis to S1 on this pack.`
        : `Unit growth vs category ${fmtPp(unitVsCat)}.`;
  } else {
    rationaleFor = `S2 with Bayer share change ${fmtPp(s.bayerShareChangePp)}; segment faster than category (${fmtPp(s.growthVsCategoryPp)}).`;
    rationaleAgainst = 'Page does not size reclaim potential; competitor movements need channel and price/volume follow-up.';
  }

  return {
    segment: s.segment,
    type,
    valueEurM: s.valueMatM,
    growthVsCategoryPp: s.growthVsCategoryPp,
    bayerSharePct: s.bayerShareMatPct,
    bayerShareChangePp: s.bayerShareChangePp,
    top3,
    concentrationTop3Pct: top3ConcentrationPct(s.segment),
    cagrPct: s.cagrPct,
    cagrBasis: s.cagrBasis,
    ppuChangePct: s.ppuChangePct,
    rationaleFor,
    rationaleAgainst,
    unitGrowthSensitivity,
    label: CANDIDATE_LABEL,
  };
}

function buildOpportunities(): Tb4l003Opportunity[] {
  const cards: Tb4l003Opportunity[] = [];
  for (const s of TB4L003_SEGMENTS) {
    if (s.whiteSpace) cards.push(opportunityCard(s, 'white space'));
  }
  for (const s of TB4L003_SEGMENTS) {
    if (s.nearMiss) cards.push(opportunityCard(s, 'near-miss'));
  }
  for (const s of TB4L003_SEGMENTS) {
    if (s.shareLossInGrowth) cards.push(opportunityCard(s, 'share loss in growth'));
  }
  return cards;
}

function buildWatchOuts(): Tb4l003WatchOut[] {
  const checks = buildTb4l003Checks();
  const out: Tb4l003WatchOut[] = [];
  for (const c of checks) {
    if (c.status === 'FAIL' || c.status === 'FLAG') {
      out.push({
        type: 'data',
        text: `${c.id} ${c.status}: ${c.rule}. ${c.detail}`,
        sources: [c.id],
      });
    }
  }
  out.push({
    type: 'interpretation',
    text: `Value growth ${fmtPct(TB4L003_CATEGORY.growth1yPct)} and unit growth ${fmtPct(TB4L003_CATEGORY.unitGrowth1yPct)} can disagree — read both before prioritising mix vs volume.`,
    sources: ['CALC | category'],
  });
  if (TB4L003_SEGMENTS.some((s) => s.scenarioCode === 'U0')) {
    out.push({
      type: 'interpretation',
      text: 'U0 segments sit in the ±0.5 pp tolerance band or lack an axis — do not force S1–S4.',
      sources: ['CALC | scenario_code'],
    });
  }
  out.push({
    type: 'interpretation',
    text: 'Scope is GB BAM competitive set only. Scenarios permit review only — not entry, budget change, or delisting.',
    sources: ['TB4L-003 guardrails'],
  });
  return out.slice(0, 5);
}

function buildExecutiveSummary(): [string, string] {
  const cat = TB4L003_CATEGORY;
  const segs = TB4L003_SEGMENTS;
  const structure = segs
    .map((s) => `${shortSegmentName(s.segment)} ${fmtShare(s.shareOfCategoryPct)}`)
    .join('; ');
  const p1 = `MAT ending ${TB4L003_META.matEnd}, GB BAM: category value ${fmtM(cat.valueMatM)} (${fmtPct(cat.growth1yPct)} value, ${fmtPct(cat.unitGrowth1yPct)} units). Structure — ${structure}. Bayer share ${fmtShare(cat.bayerShareMatPct)} (${fmtPp(cat.bayerShareChangePp)}).`;

  const loss = segs.filter((s) => s.shareLossInGrowth);
  const s1 = segs.filter((s) => s.whiteSpace);
  const rivalBits = segs
    .map((s) => {
      const r = CALC_SUBBRANDS.filter((x) => x.segment === s.segment && !x.isBayer).sort(
        (a, b) => b.valueMat - a.valueMat,
      )[0];
      return r ? `${shortSegmentName(s.segment)}: ${r.label}` : null;
    })
    .filter(Boolean)
    .slice(0, 2)
    .join('; ');

  const white =
    s1.length === 0
      ? 'White-space result: none (no S1).'
      : `White-space (S1): ${s1.map((s) => shortSegmentName(s.segment)).join(', ')}.`;
  const perf =
    loss.length > 0
      ? `Share loss in growth: ${loss.map((s) => shortSegmentName(s.segment)).join(', ')}.`
      : 'No S2 share-loss cases.';
  const p2 = `${perf} Leading non-Bayer names — ${rivalBits || 'see Chart 3'}. ${white}`;

  // Soft trim toward 150 words
  const join = `${p1} ${p2}`;
  const words = join.split(/\s+/);
  if (words.length <= 150) return [p1, p2];
  const trimmed = words.slice(0, 150).join(' ');
  const mid = Math.ceil(trimmed.length / 2);
  const cut = trimmed.lastIndexOf('. ', mid);
  if (cut > 40) return [trimmed.slice(0, cut + 1).trim(), trimmed.slice(cut + 1).trim()];
  return [trimmed, ''];
}

export function buildTb4l003Insights() {
  return {
    period: `MAT ending ${TB4L003_META.matEnd}, GB BAM`,
    executiveSummary: buildExecutiveSummary(),
    observations: buildObservations(),
    scenarios: scenarioRows(),
    opportunities: buildOpportunities(),
    watchOuts: buildWatchOuts(),
  };
}
