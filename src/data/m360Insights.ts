import { buildM360Checks, M360_METADATA, M360_RETRIEVAL_PARAMS } from './m360Retrieval';
import {
  CALC_CATEGORY,
  CALC_SEGMENTS,
  CALC_SUBBRANDS,
  CAGR_3Y_NOTE,
  WHITE_SPACE_CANDIDATES,
  type CalcSegment,
  type CalcSubBrand,
} from './m360Charts';

export type InsightImportance = 'HIGH' | 'MEDIUM' | 'LOW';

export type InsightObservation = {
  id: number;
  importance: InsightImportance;
  headline: string;
  detail: string;
  sources: string[];
  chart: 'A' | 'B' | 'C';
};

export type WhiteSpaceEntry = {
  segment: string;
  status: 'candidate';
  failed_condition: string | null;
  value_eur_m: number;
  bayer_share_pct: number | null;
  top3: string;
  cagr_3y_pct: number | null;
  rationale_for: string;
  rationale_against: string;
  label: string;
};

export type InsightsPayload = {
  context: string;
  data_caveats: { check: string; text: string }[];
  observations: InsightObservation[];
  white_space: WhiteSpaceEntry[];
};

function f1(v: number): string {
  return v.toFixed(1);
}

function pct1(v: number | null): string {
  if (v === null || !Number.isFinite(v)) return 'N/A';
  const sign = v > 0 ? '+' : '';
  return `${sign}${f1(v)}%`;
}

function pp1(v: number | null): string {
  if (v === null || !Number.isFinite(v)) return 'N/A';
  const sign = v > 0 ? '+' : '';
  return `${sign}${f1(v)}pp`;
}

function top3FromCalc(segment: string): { text: string; combined: number } {
  const rows = CALC_SUBBRANDS.filter((r) => r.segment === segment)
    .sort((a, b) => b.valueMat - a.valueMat)
    .slice(0, 3);
  const combined = rows.reduce((s, r) => s + r.shareMatPct, 0);
  const text = rows.map((r) => `${r.label} ${f1(r.shareMatPct)}%`).join(', ');
  return { text, combined };
}

function importanceRank(i: InsightImportance): number {
  return i === 'HIGH' ? 0 : i === 'MEDIUM' ? 1 : 2;
}

type Draft = Omit<InsightObservation, 'id'> & { segment: string };

function subImportance(row: CalcSubBrand, seg: CalcSegment): InsightImportance | null {
  if (row.isBayer && row.evolutionIndex !== null && row.evolutionIndex < 95) return 'HIGH';
  if (row.shareChangePp !== null && Math.abs(row.shareChangePp) >= 1) {
    return row.isBayer ? 'HIGH' : 'MEDIUM';
  }
  if (seg.shareOfCategoryPct >= 20 && row.shareMatPct >= 10) return 'LOW';
  return null;
}

function bayerImportance(s: CalcSegment): InsightImportance {
  if (s.whiteSpaceFlag) return 'HIGH';
  if (s.bayerShareChangePp !== null && Math.abs(s.bayerShareChangePp) >= 1) return 'HIGH';
  if (s.bayerShareChangePp !== null && Math.abs(s.bayerShareChangePp) >= 0.5) return 'MEDIUM';
  if (s.bayerShareMatPct !== null && s.bayerShareMatPct < 3) return 'MEDIUM';
  return 'LOW';
}

function wsEntry(s: CalcSegment): WhiteSpaceEntry {
  const t3 = top3FromCalc(s.segment);
  return {
    segment: s.segment,
    status: 'candidate',
    failed_condition: null,
    value_eur_m: Number(f1(s.valueMatM)),
    bayer_share_pct: s.bayerShareMatPct === null ? null : Number(f1(s.bayerShareMatPct)),
    top3: `${t3.text} (combined ${f1(t3.combined)}%)`,
    cagr_3y_pct: s.cagr3yPct,
    rationale_for: `Bayer share MAT ${pct1(s.bayerShareMatPct)} is below 3%. Segment 1y growth ${pct1(s.growth1yPct)} is above category ${pct1(CALC_CATEGORY.growth1yPct)}. Value EUR ${f1(s.valueMatM)}m.`,
    rationale_against: `${CAGR_3Y_NOTE} Top-3 combined share ${f1(t3.combined)}%.`,
    label: 'Candidate for discussion - not a recommendation',
  };
}

/** Insights layer: format CALC + T4 only. No new formulas. */
export function buildM360Insights(): InsightsPayload {
  const cat = CALC_CATEGORY;
  const checks = buildM360Checks();
  const data_caveats = checks
    .filter((c) => c.status === 'FAIL')
    .map((c) => ({ check: c.id, text: `${c.check}. ${c.values}` }));

  const drafts: Draft[] = [];

  for (const s of CALC_SEGMENTS) {
    drafts.push({
      segment: s.segment,
      importance: s.shareOfCategoryPct >= 20 || s.whiteSpaceFlag ? 'HIGH' : 'LOW',
      headline: `${s.segment} is ${f1(s.shareOfCategoryPct)}% of category value at EUR ${f1(s.valueMatM)}m.`,
      detail: `1y value growth is ${pct1(s.growth1yPct)} versus category ${pct1(cat.growth1yPct)}. ${CAGR_3Y_NOTE}`,
      sources: [
        `T1 | ${s.segment} | value_mat`,
        `CALC | ${s.segment} | shareOfCategoryPct`,
        `CALC | ${s.segment} | growth1yPct`,
        `CALC | category | growth1yPct`,
      ],
      chart: 'A',
    });

    drafts.push({
      segment: s.segment,
      importance: bayerImportance(s),
      headline: `Bayer share in ${s.segment} is ${s.bayerShareMatPct === null ? 'N/A' : `${f1(s.bayerShareMatPct)}%`} (${pp1(s.bayerShareChangePp)} vs YA).`,
      detail: `Bayer EUR change vs YA is ${s.bayerEuroChangeM >= 0 ? '+' : ''}EUR ${f1(s.bayerEuroChangeM)}m. White-space flag is ${s.whiteSpaceFlag ? 'yes' : 'no'}.`,
      sources: [
        `CALC | ${s.segment} | bayerShareMatPct`,
        `CALC | ${s.segment} | bayerShareChangePp`,
        `CALC | ${s.segment} | bayerEuroChange`,
        `CALC | ${s.segment} | whiteSpaceFlag`,
      ],
      chart: 'B',
    });

    const tops = CALC_SUBBRANDS.filter((r) => r.segment === s.segment)
      .sort((a, b) => b.valueMat - a.valueMat)
      .slice(0, 6);
    for (const row of tops) {
      const imp = subImportance(row, s);
      if (!imp) continue;
      drafts.push({
        segment: s.segment,
        importance: imp,
        headline: `${row.label} holds ${f1(row.shareMatPct)}% of ${s.segment} (${pp1(row.shareChangePp)} vs YA).`,
        detail: `Evolution index is ${row.evolutionIndex === null ? 'N/A' : f1(row.evolutionIndex)}. 1y value growth is ${pct1(row.growth1yPct)}. Bayer flag is ${row.isBayer ? 1 : 0}.`,
        sources: [
          `CALC | ${s.segment} | ${row.label} | shareMatPct`,
          `CALC | ${s.segment} | ${row.label} | shareChangePp`,
          `CALC | ${s.segment} | ${row.label} | evolutionIndex`,
        ],
        chart: 'C',
      });
    }
  }

  drafts.sort((a, b) => {
    const r = importanceRank(a.importance) - importanceRank(b.importance);
    if (r !== 0) return r;
    const va = CALC_SEGMENTS.find((s) => s.segment === a.segment)?.valueMat ?? 0;
    const vb = CALC_SEGMENTS.find((s) => s.segment === b.segment)?.valueMat ?? 0;
    return vb - va;
  });

  const observations: InsightObservation[] = [];
  const seen = new Set<string>();
  for (const d of drafts) {
    if (seen.has(d.headline)) continue;
    seen.add(d.headline);
    observations.push({
      id: observations.length + 1,
      importance: d.importance,
      headline: d.headline,
      detail: d.detail,
      sources: d.sources,
      chart: d.chart,
    });
    if (observations.length >= 7) break;
  }

  const white_space: WhiteSpaceEntry[] = WHITE_SPACE_CANDIDATES.map((s) => wsEntry(s));

  if (WHITE_SPACE_CANDIDATES.length === 0) {
    observations.unshift({
      id: 0,
      importance: 'HIGH',
      headline: 'No segment meets both white-space conditions.',
      detail: `White-space needs Bayer share MAT below 3% and 1y growth above category ${pct1(cat.growth1yPct)}. ${CAGR_3Y_NOTE}`,
      sources: ['CALC | whiteSpaceFlag', 'CALC | category | growth1yPct'],
      chart: 'B',
    });
    observations.forEach((o, i) => {
      o.id = i + 1;
    });
    observations.splice(7);
  }

  const context = `MAT ending ${M360_METADATA.latest_actual_month}, ${M360_RETRIEVAL_PARAMS.scope}, category EUR ${f1(cat.valueMatM)}m, ${pct1(cat.growth1yPct)}. ${CAGR_3Y_NOTE}`;

  return { context, data_caveats, observations, white_space };
}
