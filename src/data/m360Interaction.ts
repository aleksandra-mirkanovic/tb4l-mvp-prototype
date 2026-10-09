import { MOCK_ENTRA_USER } from './entraUser';
import {
  CALC_CATEGORY,
  CALC_SEGMENTS,
  CALC_SUBBRANDS,
  CAGR_3Y_NOTE,
  type CalcSegment,
  type CalcSubBrand,
} from './m360Charts';
import { buildM360Checks, M360_METADATA, M360_RETRIEVAL_PARAMS } from './m360Retrieval';

export function fmtPct(v: number | null, digits = 1): string {
  if (v === null || !Number.isFinite(v)) return 'N/A';
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(digits)}%`;
}

export function fmtShare(v: number | null): string {
  if (v === null || !Number.isFinite(v)) return 'N/A';
  return `${v.toFixed(1)}%`;
}

export function fmtPp(v: number | null): string {
  if (v === null || !Number.isFinite(v)) return 'N/A';
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(1)}pp`;
}

export function fmtM(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return 'N/A';
  const sign = v < 0 ? '−' : '';
  return `${sign}EUR ${Math.abs(v).toFixed(1)}m`;
}

export function fmtPpu(v: number | null): string {
  if (v === null || !Number.isFinite(v)) return 'N/A';
  return `EUR ${v.toFixed(2)} / unit`;
}

function tops(segment: string, n: number, bayer?: boolean): CalcSubBrand[] {
  return CALC_SUBBRANDS.filter(
    (r) => r.segment === segment && (bayer === undefined || r.isBayer === bayer),
  )
    .sort((a, b) => b.valueMat - a.valueMat)
    .slice(0, n);
}

function lineSub(r: CalcSubBrand | undefined): string {
  if (!r) return 'N/A';
  const euroM = ((r.valueMat - (r.valueYa ?? 0)) / 1_000_000);
  return `${r.label}: share ${fmtShare(r.shareMatPct)}, EUR change ${fmtM(euroM)}, EI ${r.evolutionIndex === null ? 'N/A' : r.evolutionIndex.toFixed(0)}, PPU ${fmtPpu(r.ppuMat)}`;
}

export type ScenarioCode = 'S2' | 'S3' | 'S4';

function scenarioFromCalc(s: CalcSegment): { code: ScenarioCode; line: string } {
  const share = s.bayerShareMatPct ?? 0;
  if (s.bayerShareMatPct !== null && s.bayerShareMatPct < 3) {
    return {
      code: 'S2',
      line: `Bayer share ${fmtShare(s.bayerShareMatPct)} · units ${fmtPct(s.unitGrowth1yPct)} · value ${fmtPct(s.growth1yPct)}`,
    };
  }
  if (
    s.growth1y !== null &&
    CALC_CATEGORY.growth1y !== null &&
    s.growth1y > CALC_CATEGORY.growth1y
  ) {
    return {
      code: 'S2',
      line: `Value 1y ${fmtPct(s.growth1yPct)} vs category ${fmtPct(CALC_CATEGORY.growth1yPct)} · Bayer ${fmtShare(s.bayerShareMatPct)}`,
    };
  }
  if (share >= 55) {
    return {
      code: 'S4',
      line: `Bayer ${fmtShare(s.bayerShareMatPct)} · value 1y ${fmtPct(s.growth1yPct)} · 3y CAGR N/A`,
    };
  }
  return {
    code: 'S3',
    line: `Bayer ${fmtShare(s.bayerShareMatPct)} · value 1y ${fmtPct(s.growth1yPct)} vs category ${fmtPct(CALC_CATEGORY.growth1yPct)}`,
  };
}

function verdictFromCalc(s: CalcSegment): string {
  if (s.whiteSpaceFlag) {
    return `White-space candidate: Bayer share ${fmtShare(s.bayerShareMatPct)} is below 3% and 1y growth ${fmtPct(s.growth1yPct)} is above category ${fmtPct(CALC_CATEGORY.growth1yPct)}.`;
  }
  return `Not white space. Bayer share ${fmtShare(s.bayerShareMatPct)}, 1y ${fmtPct(s.growth1yPct)} vs category ${fmtPct(CALC_CATEGORY.growth1yPct)}.`;
}

export type InteractionCard = {
  segment: string;
  short: string;
  scenario: ScenarioCode;
  scenarioLine: string;
  valueMatM: number;
  growth1yPct: number | null;
  unitGrowth1yPct: number | null;
  cagr3yPct: number | null;
  bayerShareMatPct: number | null;
  bayerShareChangePp: number | null;
  whiteSpaceFlag: boolean | null;
  verdict: string;
  note: string;
  caveat: string;
  drills: { q: string; tag: string; answer: string; blocked: boolean }[];
};

function shortName(segment: string): string {
  const first = segment.split(' ')[0];
  return first.length <= 8 ? first : first.slice(0, 8);
}

function drillsFor(s: CalcSegment): InteractionCard['drills'] {
  const nonBayer = tops(s.segment, 3, false);
  const bayer = tops(s.segment, 3, true);
  return [
    {
      q: 'Top named sub-brands (T2)',
      tag: 'T2',
      blocked: false,
      answer: nonBayer.length ? nonBayer.map((r) => lineSub(r)).join(' · ') : 'N/A',
    },
    {
      q: 'Bayer named sub-brands (T2)',
      tag: 'T2',
      blocked: false,
      answer: bayer.length ? bayer.map((r) => lineSub(r)).join(' · ') : 'N/A',
    },
    {
      q: 'Price per unit MAT (T2)',
      tag: 'T2',
      blocked: false,
      answer: [...bayer, ...nonBayer]
        .slice(0, 4)
        .map((r) => `${r.label} ${fmtPpu(r.ppuMat)}`)
        .join(' · '),
    },
  ];
}

function t4ForSegment(segment: string): string {
  const checks = buildM360Checks();
  const bits: string[] = [];
  for (const c of checks) {
    if (c.status !== 'FAIL') continue;
    if (c.id === 'C5' && segment.startsWith('PPI')) {
      bits.push('C5 FAIL');
      continue;
    }
    if (c.id === 'C2') {
      const part = c.values.split('|').find((p) => p.includes(segment));
      const m = part?.match(/Δ\s*([\d.]+)%/);
      if (m && Number(m[1]) > 0.1) bits.push('C2 FAIL');
    }
  }
  return bits.join(' · ');
}

export function buildInteractionCards(): InteractionCard[] {
  return CALC_SEGMENTS.map((s) => {
    const sc = scenarioFromCalc(s);
    const t4 = t4ForSegment(s.segment);
    const topComp = tops(s.segment, 1, false)[0];
    const topBayer = tops(s.segment, 1, true)[0];
    return {
      segment: s.segment,
      short: shortName(s.segment),
      scenario: sc.code,
      scenarioLine: sc.line,
      valueMatM: s.valueMatM,
      growth1yPct: s.growth1yPct,
      unitGrowth1yPct: s.unitGrowth1yPct,
      cagr3yPct: s.cagr3yPct,
      bayerShareMatPct: s.bayerShareMatPct,
      bayerShareChangePp: s.bayerShareChangePp,
      whiteSpaceFlag: s.whiteSpaceFlag,
      verdict: verdictFromCalc(s),
      note: [
        `Share of category ${fmtShare(s.shareOfCategoryPct)}.`,
        `Value 1y ${fmtPct(s.growth1yPct)} vs category ${fmtPct(CALC_CATEGORY.growth1yPct)}.`,
        `Units 1y ${fmtPct(s.unitGrowth1yPct)}.`,
        `3y CAGR ${fmtPct(s.cagr3yPct)}.`,
        (s.bayerShareMatPct ?? 0) === 0 && (s.bayerShareYaPct ?? 0) === 0
          ? 'Bayer: no presence (no share Δ).'
          : `Bayer share ${fmtShare(s.bayerShareMatPct)} (${fmtPp(s.bayerShareChangePp)}).`,
        `Bayer EUR change ${fmtM(s.bayerEuroChangeM)}.`,
        `Largest named non-Bayer: ${topComp ? `${topComp.label} ${fmtShare(topComp.shareMatPct)}` : 'N/A'}.`,
        `Largest named Bayer: ${topBayer ? `${topBayer.label} ${fmtShare(topBayer.shareMatPct)}` : 'N/A'}.`,
      ].join(' '),
      caveat: t4 ? `${t4}. ${CAGR_3Y_NOTE}` : CAGR_3Y_NOTE,
      drills: drillsFor(s),
    };
  });
}

export const INTERACTION_CONTEXT = {
  user: MOCK_ENTRA_USER.displayName,
  country: M360_RETRIEVAL_PARAMS.country,
  category: M360_RETRIEVAL_PARAMS.category,
  scope: M360_RETRIEVAL_PARAMS.scope,
  brand: M360_RETRIEVAL_PARAMS.gbBamBrand,
  month: M360_METADATA.latest_actual_month,
  source: M360_RETRIEVAL_PARAMS.source,
  cat: CALC_CATEGORY,
  segments: CALC_SEGMENTS,
  cagr3yNote: CAGR_3Y_NOTE,
  checks: buildM360Checks(),
};

export function topNamed(segment: string, bayer?: boolean): CalcSubBrand | undefined {
  return tops(segment, 1, bayer)[0];
}
