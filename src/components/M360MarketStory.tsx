/**
 * Bain-logic Market story — used by AI Assistant v2 only.
 * Classic AI Assistant keeps M360Report. CALC only; TB4L look, not Bain slides.
 */
import { useRef, useState, type ReactNode } from 'react';
import { ASSISTANT_NARRATIVE_V2 } from '../config/assistantNarrative';
import {
  CALC_CATEGORY,
  CALC_IBEROGAST,
  CALC_SEGMENTS,
  CALC_SUBBRANDS,
} from '../data/m360Charts';
import { M360_METADATA, M360_RETRIEVAL_PARAMS } from '../data/m360Retrieval';
import {
  AssistantMarketActions,
  AssistantMarketReadout,
  buildMarketNarrativeProps,
} from './AssistantNarrative';
import './M360Report.css';

function fmtM(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return 'Not available';
  return `EUR ${v.toFixed(1)}m`;
}
function fmtPct(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return 'Not available';
  return `${v > 0 ? '+' : ''}${v.toFixed(1)}%`;
}
function fmtShare(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return 'Not available';
  return `${v.toFixed(1)}%`;
}
function fmtEvi(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return 'Not available';
  return v.toFixed(0);
}
function fmtPp(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return 'Not available';
  return `${v >= 0 ? '+' : ''}${v.toFixed(1)} points`;
}

function shortName(segment: string): string {
  if (segment.startsWith('IBS')) return 'IBS';
  if (segment.startsWith('ANTACID')) return 'Antacids';
  if (segment.startsWith('GAS')) return 'Gas';
  if (segment.startsWith('PPI')) return 'PPIs';
  return segment.split(' ')[0];
}

function tone(v: number | null | undefined, pivot = 0): 'is-up' | 'is-down' | 'is-flat' | '' {
  if (v === null || v === undefined || !Number.isFinite(v)) return '';
  if (v > pivot) return 'is-up';
  if (v < pivot) return 'is-down';
  return 'is-flat';
}

type Tip = { x: number; y: number; title: string; lines: string[]; color?: string };

function useChartTip() {
  const wrap = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  function show(e: { clientX: number; clientY: number }, next: Omit<Tip, 'x' | 'y'>) {
    const r = wrap.current?.getBoundingClientRect();
    if (!r) return;
    setTip({ ...next, x: e.clientX - r.left, y: e.clientY - r.top });
  }
  return { wrap, tip, show, hide: () => setTip(null) };
}

function ChartTip({ tip }: { tip: Tip | null }) {
  if (!tip) return null;
  const flipX = tip.x > 280;
  const flipY = tip.y < 72;
  return (
    <div
      className={`m360-tip${flipX ? ' is-left' : ''}${flipY ? ' is-down' : ''}`}
      style={{ left: tip.x, top: tip.y, ['--tip' as string]: tip.color ?? '#00607e' }}
    >
      <strong>{tip.title}</strong>
      {tip.lines.map((line) => (
        <span key={line}>{line}</span>
      ))}
    </div>
  );
}

const SEG_PALETTE = ['#4ec3e0', '#c9a0e8', '#6fd48a', '#f0a15c'] as const;

function colorForSegment(segment: string): string {
  const i = CALC_SEGMENTS.findIndex((s) => s.segment === segment);
  return SEG_PALETTE[i >= 0 ? i % SEG_PALETTE.length : 0];
}

function ChartCard({
  id,
  title,
  caption,
  wide,
  children,
}: {
  id: string;
  title: string;
  caption: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <article className={`m360-rep-chart${wide ? ' is-wide' : ''}`} id={id}>
      <h3>{title}</h3>
      <p className="m360-rep-chart__cap">{caption}</p>
      {children}
    </article>
  );
}

function StoryNote({ children }: { children: ReactNode }) {
  return <p className="m360-story-note">{children}</p>;
}

/** Why we dig deeper — logic only; do not name the following section. */
function StoryBridge({ children }: { children: ReactNode }) {
  return <p className="m360-story-bridge">{children}</p>;
}

function StorySection({
  id,
  title,
  lede,
  children,
}: {
  id: string;
  title: string;
  lede?: string;
  children: ReactNode;
}) {
  return (
    <section className="m360-story-sec" aria-labelledby={id}>
      <h2 className="section-title" id={id}>
        {title}
      </h2>
      {lede ? <p className="m360-rep__lede">{lede}</p> : null}
      {children}
    </section>
  );
}

/** Value growth vs pack growth by segment (+ category) — original column chart, fixed size. */
function GrowthQualityChart() {
  const { wrap, tip, show, hide } = useChartTip();
  const [focus, setFocus] = useState<string | null>(null);
  const [showValue, setShowValue] = useState(true);
  const [showPacks, setShowPacks] = useState(true);
  const rows = [
    {
      key: 'category',
      name: 'Category',
      color: '#00607e',
      value: CALC_CATEGORY.growth1yPct,
      units: CALC_CATEGORY.unitGrowth1yPct,
    },
    ...CALC_SEGMENTS.map((s) => ({
      key: s.segment,
      name: shortName(s.segment),
      color: colorForSegment(s.segment),
      value: s.growth1yPct,
      units: s.unitGrowth1yPct,
    })),
  ];
  const vals = rows.flatMap((r) => [
    showValue ? (r.value ?? 0) : 0,
    showPacks ? (r.units ?? 0) : 0,
  ]);
  const maxAbs = Math.max(...vals.map((v) => Math.abs(v)), 4);
  const W = 800;
  const H = 260;
  const L = 44;
  const R = 12;
  const T = 12;
  const B = 36;
  const iw = W - L - R;
  const ih = H - T - B;
  const y0 = T + ih / 2;
  const groupW = iw / rows.length;
  const barW = groupW * 0.3;
  const yAt = (v: number) => y0 - (v / maxAbs) * (ih / 2);
  const ticks = [-1, -0.5, 0, 0.5, 1].map((p) => p * maxAbs);

  return (
    <div className="m360-viz m360-growth" ref={wrap} onMouseLeave={hide}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Value growth versus pack growth by segment"
      >
        {ticks.map((t) => (
          <g key={t}>
            <line className="m360-viz__grid" x1={L} x2={W - R} y1={yAt(t)} y2={yAt(t)} />
            <text className="m360-viz__tick" x={L - 6} y={yAt(t) + 4} textAnchor="end">
              {`${t > 0 ? '+' : ''}${t.toFixed(0)}%`}
            </text>
          </g>
        ))}
        <line className="m360-viz__ref" x1={L} x2={W - R} y1={y0} y2={y0} />
        {rows.map((r, i) => {
          const cx = L + i * groupW + groupW / 2;
          const on = !focus || focus === r.key;
          const v = r.value ?? 0;
          const u = r.units ?? 0;
          const gap =
            r.value !== null &&
            r.units !== null &&
            Number.isFinite(r.value) &&
            Number.isFinite(r.units)
              ? r.value - r.units
              : null;
          return (
            <g
              key={r.key}
              opacity={on ? 1 : 0.18}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setFocus(r.key)}
              onMouseMove={(e) =>
                show(e, {
                  color: r.color,
                  title: r.name,
                  lines: [
                    `Value growth  ${fmtPct(r.value)}`,
                    `Pack growth  ${fmtPct(r.units)}`,
                    gap === null
                      ? 'Value vs packs  Not available'
                      : `Value ahead of packs  ${fmtPct(gap)}`,
                  ],
                })
              }
              onMouseLeave={() => setFocus(null)}
            >
              {showValue ? (
                <rect
                  className="m360-viz__bar is-mat"
                  x={cx - barW - 2}
                  y={Math.min(yAt(v), y0)}
                  width={barW}
                  height={Math.max(2, Math.abs(yAt(v) - y0))}
                  rx="3"
                  fill={r.color}
                />
              ) : null}
              {showPacks ? (
                <rect
                  className="m360-viz__bar is-ya"
                  x={cx + 2}
                  y={Math.min(yAt(u), y0)}
                  width={barW}
                  height={Math.max(2, Math.abs(yAt(u) - y0))}
                  rx="3"
                  fill={r.color}
                  opacity={0.45}
                />
              ) : null}
              <text className="m360-viz__tick" x={cx} y={H - 12} textAnchor="middle">
                {r.name}
              </text>
            </g>
          );
        })}
      </svg>
      <ul className="m360-viz__legend">
        <li>
          <button
            type="button"
            className={showValue ? 'is-on' : 'is-off'}
            aria-pressed={showValue}
            onClick={() => setShowValue((v) => (showPacks || !v ? !v : v))}
          >
            <i className="is-mat" />
            Value growth
          </button>
        </li>
        <li>
          <button
            type="button"
            className={showPacks ? 'is-on' : 'is-off'}
            aria-pressed={showPacks}
            onClick={() => setShowPacks((v) => (showValue || !v ? !v : v))}
          >
            <i className="is-ya" />
            Pack growth
          </button>
        </li>
      </ul>
      <ChartTip tip={tip} />
    </div>
  );
}

/**
 * Size × growth as readable rows (not a bubble plot).
 * Sorted by size — pool first; growth compared to category in plain language.
 */
function AttractivenessChart() {
  const { wrap, tip, show, hide } = useChartTip();
  const [focus, setFocus] = useState<string | null>(null);
  const catG = CALC_CATEGORY.growth1yPct;
  const rows = [...CALC_SEGMENTS].sort((a, b) => b.shareOfCategoryPct - a.shareOfCategoryPct);
  const maxShare = Math.max(...rows.map((s) => s.shareOfCategoryPct), 1);
  const maxGrowth = Math.max(...rows.map((s) => Math.abs(s.growth1yPct ?? 0)), Math.abs(catG ?? 0), 1);

  return (
    <div className="m360-viz m360-attract" ref={wrap} onMouseLeave={hide}>
      <p className="m360-attract__ref">
        Category growth {fmtPct(catG)} — bars below show each need-state versus that line. Hover a row for Bayer
        context.
      </p>
      <ul className="m360-attract__list">
        {rows.map((s) => {
          const g = s.growth1yPct;
          const faster = g !== null && catG !== null && g > catG;
          const slower = g !== null && catG !== null && g < catG;
          const pace = faster ? 'Faster than category' : slower ? 'Slower than category' : 'In line with category';
          const color = colorForSegment(s.segment);
          const on = !focus || focus === s.segment;
          return (
            <li
              key={s.segment}
              className={on ? undefined : 'is-off'}
              style={{ ['--seg' as string]: color }}
              onMouseEnter={() => setFocus(s.segment)}
              onMouseMove={(e) =>
                show(e, {
                  color,
                  title: shortName(s.segment),
                  lines: [
                    `Sales  ${fmtM(s.valueMatM)}`,
                    `Share of category  ${fmtShare(s.shareOfCategoryPct)}`,
                    `Growth vs last year  ${fmtPct(g)} · ${pace}`,
                    `Bayer share  ${fmtShare(s.bayerShareMatPct)} (${fmtPp(s.bayerShareChangePp)})`,
                    s.whiteSpaceFlag
                      ? 'White-space candidate (Bayer <3% and faster than category)'
                      : 'Not a white-space candidate in this set',
                  ],
                })
              }
              onMouseLeave={() => setFocus(null)}
            >
              <header>
                <h4>{shortName(s.segment)}</h4>
                <span className="m360-attract__sales">{fmtM(s.valueMatM)}</span>
                {s.whiteSpaceFlag ? <em className="m360-attract__ws">White-space candidate</em> : null}
              </header>
              <div className="m360-attract__metrics">
                <div>
                  <span className="m360-attract__lab">Size · share of category</span>
                  <div className="m360-attract__bar-wrap">
                    <b className="m360-attract__bar is-size" style={{ width: `${(s.shareOfCategoryPct / maxShare) * 100}%` }} />
                  </div>
                  <strong>{fmtShare(s.shareOfCategoryPct)}</strong>
                </div>
                <div>
                  <span className="m360-attract__lab">Growth vs last year</span>
                  <div className="m360-attract__bar-wrap">
                    <b
                      className={`m360-attract__bar is-growth ${tone(g)}`}
                      style={{ width: `${(Math.abs(g ?? 0) / maxGrowth) * 100}%` }}
                    />
                  </div>
                  <strong className={tone(g)}>{fmtPct(g)}</strong>
                </div>
              </div>
              <p className={`m360-attract__pace ${faster ? 'is-up' : slower ? 'is-down' : ''}`}>{pace}</p>
            </li>
          );
        })}
      </ul>
      <ChartTip tip={tip} />
    </div>
  );
}

function RankBars({
  rows,
  value,
  label,
  detail,
}: {
  rows: { key: string; name: string; bayer?: boolean }[];
  value: (key: string) => number;
  label: (key: string) => string;
  detail: (key: string) => string[];
}) {
  const { wrap, tip, show, hide } = useChartTip();
  const [focus, setFocus] = useState<string | null>(null);
  const max = Math.max(...rows.map((r) => value(r.key)), 1);
  return (
    <div className="m360-viz" ref={wrap} onMouseLeave={hide}>
      <ul className="m360-rank">
        {rows.map((r) => {
          const on = !focus || focus === r.key;
          return (
            <li
              key={r.key}
              className={[r.bayer ? 'is-bayer' : '', on ? '' : 'is-off'].filter(Boolean).join(' ') || undefined}
              onMouseEnter={() => setFocus(r.key)}
              onMouseMove={(e) =>
                show(e, {
                  color: r.bayer ? '#4ec3e0' : undefined,
                  title: r.name,
                  lines: detail(r.key),
                })
              }
              onMouseLeave={() => setFocus(null)}
            >
              <span>{r.name}</span>
              <div>
                <b style={{ width: `${(value(r.key) / max) * 100}%` }} />
              </div>
              <small>{label(r.key)}</small>
            </li>
          );
        })}
      </ul>
      <ChartTip tip={tip} />
    </div>
  );
}

/** Bayer brands vs own segment — HTML rows (same type size as rest of report; no SVG zoom). */
function EviChart() {
  const { wrap, tip, show, hide } = useChartTip();
  const [focus, setFocus] = useState<string | null>(null);
  const rows = CALC_SUBBRANDS.filter((r) => r.isBayer && r.evolutionIndex !== null).sort(
    (a, b) => (b.evolutionIndex ?? 0) - (a.evolutionIndex ?? 0),
  );
  const min = 80;
  const max = 120;
  const rowH = 36;
  const W = 520;
  const L = 176;
  const R = 48;
  const T = 8;
  const H = T + rows.length * rowH + 28;
  const iw = W - L - R;
  const xAt = (v: number) => L + ((v - min) / (max - min)) * iw;
  const x100 = xAt(100);

  return (
    <div className="m360-viz m360-evi" ref={wrap} onMouseLeave={hide}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        role="img"
        aria-label="Bayer brands versus their own segment"
      >
        <line className="m360-viz__ref" x1={x100} x2={x100} y1={T} y2={H - 24} />
        <text className="m360-viz__tick" x={x100} y={H - 8} textAnchor="middle">
          Growing with the market (100)
        </text>
        {rows.map((r, i) => {
          const y = T + i * rowH + 18;
          const evi = r.evolutionIndex ?? 100;
          const x = xAt(Math.min(max, Math.max(min, evi)));
          const beat = evi >= 100;
          const id = `${r.segment}-${r.label}`;
          const on = !focus || focus === id;
          return (
            <g
              key={id}
              opacity={on ? 1 : 0.16}
              className="m360-viz__evi"
              onMouseEnter={() => setFocus(id)}
              onMouseMove={(e) =>
                show(e, {
                  color: beat ? '#6fd48a' : '#f0a15c',
                  title: r.label,
                  lines: [
                    shortName(r.segment),
                    `Relative growth  ${fmtEvi(r.evolutionIndex)} (100 = in line with that need-state)`,
                    `Market share  ${fmtShare(r.shareMatPct)}`,
                    `Sales vs last year  ${fmtPct(r.growth1yPct)}`,
                  ],
                })
              }
              onMouseLeave={() => setFocus(null)}
            >
              <rect x={0} y={y - 16} width={W} height={32} fill="transparent" />
              <text className="m360-viz__lab" x={L - 10} y={y + 4} textAnchor="end">
                {`${shortName(r.segment)} · ${r.label.replace('IBEROGAST ', 'IG ')}`}
              </text>
              <line className={beat ? 'm360-viz__stem is-up' : 'm360-viz__stem is-down'} x1={x100} x2={x} y1={y} y2={y} />
              <circle className={beat ? 'm360-viz__dot is-up' : 'm360-viz__dot is-down'} cx={x} cy={y} r={on && focus ? 8 : 6} />
              <text
                className={`m360-viz__val ${beat ? 'is-up' : 'is-down'}`}
                x={x + (beat ? 10 : -10)}
                y={y + 4}
                textAnchor={beat ? 'start' : 'end'}
              >
                {fmtEvi(r.evolutionIndex)}
              </text>
            </g>
          );
        })}
      </svg>
      <ChartTip tip={tip} />
    </div>
  );
}

/**
 * Share change first: previous → current dumbbell, sorted by Δpp.
 * Side-by-side level bars hid the leak; this makes the move the story.
 */
function ShareChangeChart() {
  const { wrap, tip, show, hide } = useChartTip();
  const [focus, setFocus] = useState<string | null>(null);
  const rows = [...CALC_SEGMENTS].sort(
    (a, b) => (a.bayerShareChangePp ?? 0) - (b.bayerShareChangePp ?? 0),
  );
  const maxShare = Math.max(
    ...rows.flatMap((s) => [s.bayerShareYaPct ?? 0, s.bayerShareMatPct ?? 0]),
    10,
  );
  const W = 420;
  const H = 28;
  const pad = 10;
  const xAt = (v: number) => pad + (v / maxShare) * (W - pad * 2);

  return (
    <div className="m360-viz m360-share-chg" ref={wrap} onMouseLeave={hide}>
      <p className="m360-share-chg__axis">Bayer share of need-state → (sorted by change, worst first)</p>
      <ul className="m360-share-chg__list">
        {rows.map((s) => {
          const ya = s.bayerShareYaPct ?? 0;
          const mat = s.bayerShareMatPct ?? 0;
          const xYa = xAt(ya);
          const xMat = xAt(mat);
          const on = !focus || focus === s.segment;
          const color = colorForSegment(s.segment);
          const lost = (s.bayerShareChangePp ?? 0) < 0;
          return (
            <li
              key={s.segment}
              className={!on ? 'is-off' : undefined}
              onMouseEnter={() => setFocus(s.segment)}
              onMouseMove={(e) =>
                show(e, {
                  color,
                  title: shortName(s.segment),
                  lines: [
                    `Previous MAT 12M  ${fmtShare(s.bayerShareYaPct)}`,
                    `Current MAT 12M  ${fmtShare(s.bayerShareMatPct)}`,
                    `Change  ${fmtPp(s.bayerShareChangePp)}`,
                    lost
                      ? 'Read  Share leak — priority for the Antacids fight'
                      : (s.bayerShareChangePp ?? 0) > 0
                        ? 'Read  Gaining share in this need-state'
                        : 'Read  Flat vs last year',
                  ],
                })
              }
              onMouseLeave={() => setFocus(null)}
            >
              <span className="m360-share-chg__name">{shortName(s.segment)}</span>
              <svg viewBox={`0 0 ${W} ${H}`} className="m360-share-chg__track" aria-hidden>
                <line className="m360-share-chg__base" x1={pad} x2={W - pad} y1={H / 2} y2={H / 2} />
                <line
                  className={lost ? 'm360-share-chg__link is-down' : 'm360-share-chg__link is-up'}
                  x1={xYa}
                  x2={xMat}
                  y1={H / 2}
                  y2={H / 2}
                />
                <circle className="m360-share-chg__ya" cx={xYa} cy={H / 2} r="5" />
                <circle className="m360-share-chg__mat" cx={xMat} cy={H / 2} r="6" fill={color} />
              </svg>
              <span className="m360-share-chg__levels">
                {fmtShare(s.bayerShareYaPct)} → {fmtShare(s.bayerShareMatPct)}
              </span>
              <strong className={`m360-share-chg__delta ${tone(s.bayerShareChangePp)}`}>
                {fmtPp(s.bayerShareChangePp)}
              </strong>
            </li>
          );
        })}
      </ul>
      <ul className="m360-viz__legend">
        <li>
          <i className="is-ya" />
          Previous MAT 12M
        </li>
        <li>
          <i className="is-mat" />
          Current MAT 12M
        </li>
      </ul>
      <ChartTip tip={tip} />
    </div>
  );
}

function IberogastPosition() {
  const { wrap, tip, show, hide } = useChartTip();
  const [focus, setFocus] = useState<string | null>(null);
  const rows = CALC_IBEROGAST;
  if (!rows.length) {
    return <p className="m360-rep__lede">Iberogast sub-brands not available in this set.</p>;
  }
  const maxShare = Math.max(...rows.map((r) => r.shareMatPct), 1);
  return (
    <div className="m360-viz m360-ibero" ref={wrap} onMouseLeave={hide}>
      <ul className="m360-ibero-pos">
        {rows.map((r) => {
          const beat = (r.evolutionIndex ?? 100) >= 100;
          const on = !focus || focus === r.label;
          return (
            <li
              key={r.label}
              className={on ? undefined : 'is-off'}
              onMouseEnter={() => setFocus(r.label)}
              onMouseMove={(e) =>
                show(e, {
                  color: beat ? '#6fd48a' : '#f0a15c',
                  title: r.label,
                  lines: [
                    `Share of IBS  ${fmtShare(r.shareMatPct)}`,
                    `Relative growth  ${fmtEvi(r.evolutionIndex)} (100 = in line with IBS)`,
                    beat ? 'Pace  Ahead of IBS' : 'Pace  With / behind IBS',
                    `Sales vs last year  ${fmtPct(r.growth1yPct)}`,
                    `Share change  ${fmtPp(r.shareChangePp)}`,
                    beat
                      ? 'Job  Growth line — put plans here'
                      : 'Job  Defend share — volume chase is weak while IBS packs soft',
                  ],
                })
              }
              onMouseLeave={() => setFocus(null)}
            >
              <header>
                <h4>{r.label}</h4>
                <span className={tone(r.evolutionIndex, 100)}>
                  Relative growth {fmtEvi(r.evolutionIndex)}
                  {beat ? ' · ahead of IBS' : ' · with / behind IBS'}
                </span>
              </header>
              <div className="m360-ibero-pos__bar" aria-hidden>
                <b style={{ width: `${(r.shareMatPct / maxShare) * 100}%` }} />
              </div>
              <p>
                {fmtShare(r.shareMatPct)} of IBS · sales {fmtPct(r.growth1yPct)} versus last year · share change{' '}
                {fmtPp(r.shareChangePp)}
              </p>
            </li>
          );
        })}
      </ul>
      <ChartTip tip={tip} />
    </div>
  );
}

export function M360MarketStory() {
  const cat = CALC_CATEGORY;
  const p = M360_RETRIEVAL_PARAMS;
  const m = M360_METADATA;
  const narrative = buildMarketNarrativeProps();
  const { ibs, ant, classic, advance, gaviscon } = narrative;
  const topIbs = CALC_SUBBRANDS.filter((r) => r.segment === ibs.segment)
    .sort((a, b) => b.valueMat - a.valueMat)
    .slice(0, 6);
  const topAnt = CALC_SUBBRANDS.filter((r) => r.segment === ant.segment)
    .sort((a, b) => b.valueMat - a.valueMat)
    .slice(0, 6);
  const ibero = CALC_IBEROGAST[0];

  return (
    <div
      className={`m360-rep m360-rep--story-v2${ASSISTANT_NARRATIVE_V2 ? ' m360-rep--narrative-v2' : ''}`}
    >
      <p className="m360-rep__kicker">
        {p.country} {p.category} · Iberogast competitive set · latest 12 months ending {m.latest_actual_month}
      </p>

      {/* 1 · Category overview */}
      <StorySection
        id="story-overview"
        title="Category overview"
        lede="Headline first: how big is the set, how is Bayer doing, and is Iberogast keeping pace with IBS?"
      >
        <AssistantMarketReadout {...narrative} heading="Executive summary" headingLevel={3} />
        <section className="m360-rep-kpis" aria-label="Three headline measures by scope">
          <article>
            <p>Category sales</p>
            <strong>{fmtM(cat.valueMatM)}</strong>
            <span>
              Whole Iberogast competitive set, latest 12 months. {fmtPct(cat.growth1yPct)} versus last year. Bayer sales
              inside this set: {fmtM(cat.bayerValueMatM)}.
            </span>
          </article>
          <article>
            <p>Bayer market share</p>
            <strong>{fmtShare(cat.bayerShareMatPct)}</strong>
            <span>
              Bayer’s share of the same competitive set (not Iberogast alone). {fmtPp(cat.bayerShareChangePp)} versus
              last year.
            </span>
          </article>
          <article>
            <p>Iberogast relative growth</p>
            <strong>{fmtEvi(ibero?.evolutionIndex ?? null)}</strong>
            <span>
              {ibero
                ? `${ibero.label} versus the IBS need-state only. 100 = growing in line with IBS; above 100 = faster.`
                : 'Not available.'}
            </span>
          </article>
        </section>
        <StoryNote>
          <b>So what?</b> The set is growing ({fmtPct(cat.growth1yPct)}) while Bayer share is soft (
          {fmtPp(cat.bayerShareChangePp)}). That is the tension the rest of the pack unpacks.
        </StoryNote>
        <StoryBridge>
          So dig into what kind of growth this is — more packs, or value / mix — before picking where to play.
        </StoryBridge>
      </StorySection>

      {/* 2 · Category growth */}
      <StorySection
        id="story-growth"
        title="Category growth"
        lede="Business question: is growth coming from more packs, or from value (price / mix)?"
      >
        <ChartCard
          id="ch-growth-quality"
          wide
          title="Value growth vs pack growth"
          caption={`Category: value ${fmtPct(cat.growth1yPct)}, packs ${fmtPct(cat.unitGrowth1yPct)}. Solid bars = value; faded = packs. Category first, then each need-state.`}
        >
          <GrowthQualityChart />
        </ChartCard>
        <StoryNote>
          <b>Insight.</b> Category value is running ahead of packs — price or mix is carrying sales. IBS looks like the
          opposite mix inside the pool: value {fmtPct(ibs.growth1yPct)} while packs {fmtPct(ibs.unitGrowth1yPct)}.
        </StoryNote>
        <StoryBridge>
          Growth quality differs by need-state — so size and pace by segment decide where the two jobs sit.
        </StoryBridge>
      </StorySection>

      {/* 3 · Segment attractiveness */}
      <StorySection
        id="story-attract"
        title="Segment attractiveness"
        lede="Business question: where to play — how big is each need-state, and is it growing faster than the category?"
      >
        <ChartCard
          id="ch-attract"
          wide
          title="Need-state size × growth"
          caption={`Sorted by size. IBS is the pool (${fmtShare(ibs.shareOfCategoryPct)}). Antacids is the growth engine (${fmtPct(ant.growth1yPct)}). White-space candidate = Bayer share under 3% and faster than category.`}
        >
          <AttractivenessChart />
        </ChartCard>
        <StoryNote>
          <b>Insight.</b> Two jobs, not one category number: defend the large IBS franchise (
          {fmtShare(ibs.shareOfCategoryPct)} of sales); compete in faster Antacids ({fmtPct(ant.growth1yPct)}) where
          Bayer is soft.
        </StoryNote>
        <StoryBridge>
          So open those two arenas — who owns the cash pool (IBS), and who is winning the growth fight (Antacids).
        </StoryBridge>
      </StorySection>

      {/* 4 · Competitive landscape */}
      <StorySection
        id="story-comp"
        title="Competitive landscape"
        lede="Business question: who holds the cash pool and who is winning the share fight in the growth segment?"
      >
        <div className="m360-rep-grid">
          <ChartCard
            id="ch-comp-ibs"
            title="Who holds IBS"
            caption={
              topIbs[0]
                ? `${topIbs[0].label} leads at ${fmtShare(topIbs[0].shareMatPct)} of IBS.`
                : 'Not available'
            }
          >
            <RankBars
              rows={topIbs.map((r) => ({ key: r.label, name: r.label, bayer: r.isBayer }))}
              value={(key) => topIbs.find((r) => r.label === key)?.shareMatPct ?? 0}
              label={(key) => {
                const r = topIbs.find((x) => x.label === key);
                return `${fmtShare(r?.shareMatPct ?? null)} · EVI ${fmtEvi(r?.evolutionIndex ?? null)}`;
              }}
              detail={(key) => {
                const r = topIbs.find((x) => x.label === key);
                return [
                  `Market share  ${fmtShare(r?.shareMatPct ?? null)}`,
                  `Relative growth  ${fmtEvi(r?.evolutionIndex ?? null)}`,
                  `Sales vs last year  ${fmtPct(r?.growth1yPct ?? null)}`,
                  r?.isBayer ? 'Bayer' : (r?.manufacturer ?? ''),
                ];
              }}
            />
          </ChartCard>
          <ChartCard
            id="ch-comp-ant"
            title="Who holds Antacids"
            caption={
              gaviscon
                ? `Gaviscon is ${fmtShare(gaviscon.shareMatPct)} of Antacids. Bayer share ${fmtShare(ant.bayerShareMatPct)} (${fmtPp(ant.bayerShareChangePp)}).`
                : `Bayer share ${fmtShare(ant.bayerShareMatPct)} (${fmtPp(ant.bayerShareChangePp)}).`
            }
          >
            <RankBars
              rows={topAnt.map((r) => ({ key: r.label, name: r.label, bayer: r.isBayer }))}
              value={(key) => topAnt.find((r) => r.label === key)?.shareMatPct ?? 0}
              label={(key) => {
                const r = topAnt.find((x) => x.label === key);
                return `${fmtShare(r?.shareMatPct ?? null)} · EVI ${fmtEvi(r?.evolutionIndex ?? null)}`;
              }}
              detail={(key) => {
                const r = topAnt.find((x) => x.label === key);
                return [
                  `Market share  ${fmtShare(r?.shareMatPct ?? null)}`,
                  `Relative growth  ${fmtEvi(r?.evolutionIndex ?? null)}`,
                  `Sales vs last year  ${fmtPct(r?.growth1yPct ?? null)}`,
                  r?.isBayer ? 'Bayer' : (r?.manufacturer ?? ''),
                ];
              }}
            />
          </ChartCard>
        </div>
        <StoryNote>
          <b>Insight.</b> Iberogast still leads IBS. In Antacids, competitors (not IBS) explain the growth Bayer is not
          capturing — Gaviscon is the reference rival.
        </StoryNote>
        <StoryBridge>
          Brand ranks show who wins today. Then check which Bayer brands are keeping pace with their own need-state.
        </StoryBridge>
      </StorySection>

      {/* 5 · Bayer relative growth (portfolio pace → brand zoom) */}
      <StorySection
        id="story-evi"
        title="Bayer relative growth"
        lede="Business question: which Bayer brands outpace or lag their own need-state? (100 = in line; above 100 = faster.)"
      >
        <ChartCard
          id="ch-evi"
          wide
          title="Bayer brands versus their own segment"
          caption={`${ibero?.label ?? 'Iberogast'} relative growth ${fmtEvi(ibero?.evolutionIndex ?? null)}. 100 = in line with that need-state. Next chart zooms into Classic vs Advance on IBS.`}
        >
          <EviChart />
        </ChartCard>
        <StoryNote>
          <b>Insight.</b> Advance is ahead of IBS ({fmtEvi(advance?.evolutionIndex ?? null)}); Classic is near line (
          {fmtEvi(classic?.evolutionIndex ?? null)}). Antacids Bayer names below 100 belong with the share-leak story —
          not the Iberogast defend/grow choice.
        </StoryNote>
        <StoryBridge>
          Zoom into the IBS franchise: Classic vs Advance — share plus relative growth on the same need-state.
        </StoryBridge>
      </StorySection>

      {/* 6 · Iberogast position */}
      <StorySection
        id="story-ibero"
        title="Iberogast position"
        lede="Business question: defend Classic, grow Advance — or both, with different jobs?"
      >
        <ChartCard
          id="ch-ibero-pos"
          wide
          title="Classic vs Advance on IBS"
          caption={`Classic ${fmtShare(classic?.shareMatPct ?? null)} of IBS · Advance ${fmtShare(advance?.shareMatPct ?? null)}. Share plus relative growth versus IBS only.`}
        >
          <IberogastPosition />
        </ChartCard>
        <StoryNote>
          <b>Insight.</b> Defend Classic share (relative growth {fmtEvi(classic?.evolutionIndex ?? null)}). Put growth
          plans on Advance ({fmtEvi(advance?.evolutionIndex ?? null)}). More of the same Classic volume is a weak bet
          while IBS packs are {fmtPct(ibs.unitGrowth1yPct)}.
        </StoryNote>
        <StoryBridge>
          Brand jobs set — close on Bayer share change, where the portfolio is leaking points.
        </StoryBridge>
      </StorySection>

      {/* 7 · Market share performance */}
      <StorySection
        id="story-share"
        title="Market share performance"
        lede="Business question: where is Bayer gaining or losing share — change first, not just the level?"
      >
        <ChartCard
          id="ch-share"
          wide
          title="Bayer share change by need-state"
          caption={`Set share ${fmtShare(cat.bayerShareMatPct)} (${fmtPp(cat.bayerShareChangePp)} vs last year). Open circle = previous MAT; filled = current. Sorted worst-first — leak is Antacids.`}
        >
          <ShareChangeChart />
        </ChartCard>
        <StoryNote>
          <b>Insight.</b> Category share softness is an Antacids story ({fmtPp(ant.bayerShareChangePp)}). IBS Bayer share{' '}
          {fmtShare(ibs.bayerShareMatPct)} ({fmtPp(ibs.bayerShareChangePp)}). That locks the two jobs before actions.
        </StoryNote>
        <StoryBridge>
          Pull the thread: pool vs growth, brand jobs, and the Antacids leak — then what to do this month.
        </StoryBridge>
      </StorySection>

      {/* 8 · Implications → Recommendations */}
      <StorySection
        id="story-implications"
        title="Key implications"
        lede="Conclusion from the drill-down — two jobs, one leak, clocks kept apart."
      >
        <ul className="m360-rep-ins">
          <li>
            <h3>IBS = defend the pool · Antacids = contest the growth</h3>
            <p>
              One category number hides two jobs. Do not open a PPI project from this pack — Bayer share{' '}
              {fmtShare(narrative.ppi.bayerShareMatPct)} and the need-state is not the fastest grower.
            </p>
          </li>
          <li>
            <h3>Keep clocks apart</h3>
            <p>
              This is Sirius sell-out for the latest 12 months. Do not fold calendar COPA euros into this view until
              finance is on the same clock.
            </p>
          </li>
        </ul>
      </StorySection>

      <AssistantMarketActions {...narrative} />
    </div>
  );
}
