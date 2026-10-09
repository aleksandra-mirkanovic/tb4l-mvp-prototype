/**
 * Bain-logic Market story — AI Assistant v3 (stacked chart + reading units).
 * AI Assistant v2 keeps M360MarketStory (deployed story). Classic keeps M360Report.
 */
import { useRef, useState, type ReactNode } from 'react';
import { ASSISTANT_NARRATIVE_V2, ASSISTANT_STORY_RAIL } from '../config/assistantNarrative';
import {
  CALC_CATEGORY,
  CALC_IBEROGAST,
  CALC_SEGMENTS,
  CALC_SUBBRANDS,
} from '../data/m360Charts';
import {
  CALC_CHANNEL_ECOMM,
  CALC_CHANNEL_PHARMA,
  CALC_CHANNELS,
  M360_CHANNEL_META,
  channelBrandsByShareChange,
} from '../data/m360ChannelRetrieval';
import { M360_METADATA, M360_RETRIEVAL_PARAMS } from '../data/m360Retrieval';
import { AssistantMarketReadout, buildMarketNarrativeProps } from './AssistantNarrative';
import {
  buildStoryAnalyses,
  MarketSynthesis,
  type ChartAxBody,
  type HypCheck,
  type HypStatus,
} from './m360StoryAnalyses';
import './M360Report.css';

type SignalTone = 'good' | 'watch' | 'bad';

function SignalLegend() {
  return (
    <ul className="m360-signal-legend" aria-label="How to read signals">
      <li className="is-good">
        <i />
        Strength — protect or build on
      </li>
      <li className="is-watch">
        <i />
        Watch — needs attention
      </li>
      <li className="is-bad">
        <i />
        Problem — act on
      </li>
    </ul>
  );
}

function SignalCard({
  tone,
  label,
  title,
  why,
  evidence,
}: {
  tone: SignalTone;
  label: string;
  title: string;
  why: string;
  evidence: ReactNode;
}) {
  return (
    <li className={`m360-signal is-${tone}`}>
      <header>
        <span className="m360-signal__badge">{label}</span>
        <h3>{title}</h3>
      </header>
      <p className="m360-signal__why">{why}</p>
      <p className="m360-signal__evidence">
        <span className="m360-signal__evidence-lab">Evidence</span>
        {evidence}
      </p>
    </li>
  );
}

function ActionCard({
  tone,
  step,
  title,
  body,
}: {
  tone: SignalTone;
  step: number;
  title: string;
  body: ReactNode;
}) {
  return (
    <li className={`m360-action is-${tone}`}>
      <span className="m360-action__step" aria-hidden>
        {step}
      </span>
      <div>
        <header>
          <span className="m360-signal__badge">{tone === 'bad' ? 'Act' : tone === 'watch' ? 'Watch' : 'Protect'}</span>
          <h3>{title}</h3>
        </header>
        <p>{body}</p>
      </div>
    </li>
  );
}

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
/** Bayer share of a need-state — 0 means no named Bayer brands, not a missing field. */
function fmtBayerShare(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return 'Not available';
  if (v === 0) return 'no presence';
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

/** Highlight a metric in prose — color only deltas / EVI, not every word. */
function Num({
  children,
  v,
  pivot = 0,
  kind = 'delta',
}: {
  children: ReactNode;
  v?: number | null;
  pivot?: number;
  /** delta = vs 0; evi = vs 100; key = size/level, no traffic color */
  kind?: 'delta' | 'evi' | 'key';
}) {
  const cls =
    kind === 'key' || v === null || v === undefined || !Number.isFinite(v)
      ? 'm360-num is-key'
      : `m360-num ${tone(v, kind === 'evi' ? 100 : pivot) || 'is-key'}`;
  return <strong className={cls}>{children}</strong>;
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

const HYP_STATUS_META: Record<
  HypStatus,
  { label: string; mark: string; className: string }
> = {
  confirmed: { label: 'Confirmed', mark: '✅', className: 'is-confirmed' },
  partial: { label: 'Partially confirmed', mark: '⚠️', className: 'is-partial' },
  rejected: { label: 'Rejected', mark: '❌', className: 'is-rejected' },
  new: { label: 'New hypothesis emerged', mark: '💡', className: 'is-new' },
};

function StoryNote({ children }: { children: ReactNode }) {
  return (
    <aside className="m360-story-note">
      <span className="m360-story-note__tag">Insight</span>
      <div className="m360-story-note__body">{children}</div>
    </aside>
  );
}

/** Fixed TB4L analysis under every chart — same blocks every time. */
function ChartAnalysis({
  facts,
  factsVariant = 'list',
  insights,
  hypotheses,
  brandImplications,
  opportunities,
  risks,
}: {
  facts: ReactNode;
  factsVariant?: 'list' | 'table';
  insights: ReactNode;
  hypotheses: HypCheck[];
  brandImplications: ReactNode;
  opportunities: ReactNode;
  risks: ReactNode;
}) {
  return (
    <aside className="m360-chart-ax" aria-label="Reading this chart">
      <header className="m360-chart-ax__head">
        <span className="m360-chart-ax__kicker">Reading this chart</span>
        <p className="m360-chart-ax__sub">What the numbers mean for the brand</p>
      </header>
      <section className="m360-chart-ax__block is-facts">
        <h4>1 · Key facts / evidence</h4>
        {factsVariant === 'table' ? (
          <div className="m360-chart-ax__facts is-table">{facts}</div>
        ) : (
          <ul className="m360-chart-ax__facts">{facts}</ul>
        )}
      </section>
      <section className="m360-chart-ax__block is-insights">
        <h4>2 · Key insights</h4>
        <div>{insights}</div>
      </section>
      <section className="m360-chart-ax__block is-hyp">
        <h4>3 · Hypothesis validation</h4>
        <ul className="m360-hyp-checks">
          {hypotheses.map((h, i) => {
            const meta = HYP_STATUS_META[h.status];
            return (
              <li key={i} className={meta.className}>
                <div className="m360-hyp-checks__row">
                  <span className="m360-hyp-checks__status" title={meta.label}>
                    <span aria-hidden>{meta.mark}</span> {meta.label}
                  </span>
                  <span className="m360-hyp-checks__claim">{h.claim}</span>
                </div>
                <p className="m360-hyp-checks__because">{h.because}</p>
              </li>
            );
          })}
        </ul>
      </section>
      <section className="m360-chart-ax__block is-brand">
        <h4>4 · Implications for the brand</h4>
        <div>{brandImplications}</div>
      </section>
      <section className="m360-chart-ax__block is-opp-risk">
        <h4>5 · Opportunities and risks</h4>
        <div className="m360-opp-risk">
          <div>
            <h5>Opportunities</h5>
            <ul>{opportunities}</ul>
          </div>
          <div>
            <h5>Risks</h5>
            <ul>{risks}</ul>
          </div>
        </div>
      </section>
    </aside>
  );
}

/**
 * Chart full width, then TB4L analysis underneath (stacked — not side-by-side).
 * ASSISTANT_STORY_RAIL = false → short note only under the chart.
 */
function StoryBand({
  viz,
  facts,
  factsVariant = 'list',
  insights,
  hypotheses,
  brandImplications,
  opportunities,
  risks,
}: ChartAxBody & { viz: ReactNode }) {
  if (!ASSISTANT_STORY_RAIL) {
    return (
      <>
        {viz}
        <StoryNote>
          <div>{insights}</div>
          {factsVariant === 'table' ? (
            <div className="m360-story-note__reads is-table">{facts}</div>
          ) : (
            <ul className="m360-story-note__reads">{facts}</ul>
          )}
          <div>{brandImplications}</div>
        </StoryNote>
      </>
    );
  }
  return (
    <div className="m360-story-band is-stacked">
      <div className="m360-story-band__viz">{viz}</div>
      <ChartAnalysis
        facts={facts}
        factsVariant={factsVariant}
        insights={insights}
        hypotheses={hypotheses}
        brandImplications={brandImplications}
        opportunities={opportunities}
        risks={risks}
      />
    </div>
  );
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
          const paceBase = faster ? 'Faster than category' : slower ? 'Slower than category' : 'In line with category';
          const pace = catG !== null && catG !== undefined ? `${paceBase} (${fmtPct(catG)})` : paceBase;
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
                    s.bayerShareMatPct === 0
                      ? 'Bayer: no presence (no named brands)'
                      : `Bayer share: ${fmtBayerShare(s.bayerShareMatPct)} (${fmtPp(s.bayerShareChangePp)})`,
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
  const hasBayer = rows.some((r) => r.bayer);
  return (
    <div className="m360-viz" ref={wrap} onMouseLeave={hide}>
      {hasBayer ? (
        <p className="m360-rank__axis">
          <i className="m360-rank__swatch" aria-hidden />
          Bayer brands highlighted
        </p>
      ) : null}
      <ul className="m360-rank" role="img" aria-label={hasBayer ? 'Brand share; Bayer brands highlighted' : 'Brand share'}>
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
              <span className="m360-rank__name">
                {r.name}
                {r.bayer ? <em className="m360-rank__tag">Bayer</em> : null}
              </span>
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

/** Bayer brands vs own segment — full-width HTML lollipops (no fixed SVG gutter). */
function EviChart() {
  const { wrap, tip, show, hide } = useChartTip();
  const [focus, setFocus] = useState<string | null>(null);
  const rows = CALC_SUBBRANDS.filter((r) => r.isBayer && r.evolutionIndex !== null).sort(
    (a, b) => (b.evolutionIndex ?? 0) - (a.evolutionIndex ?? 0),
  );
  const min = 80;
  const max = 120;
  const pctAt = (v: number) => ((Math.min(max, Math.max(min, v)) - min) / (max - min)) * 100;
  const x100 = pctAt(100);

  return (
    <div className="m360-viz m360-evi" ref={wrap} onMouseLeave={hide}>
      <p className="m360-evi__axis">Relative growth → · dashed line = growing with the market (100)</p>
      <ul className="m360-evi__list" role="img" aria-label="Bayer brands versus their own segment">
        {rows.map((r) => {
          const evi = r.evolutionIndex ?? 100;
          const x = pctAt(evi);
          const beat = evi >= 100;
          const id = `${r.segment}-${r.label}`;
          const on = !focus || focus === id;
          const stemLeft = Math.min(x100, x);
          const stemWidth = Math.abs(x - x100);
          return (
            <li
              key={id}
              className={[beat ? 'is-up' : 'is-down', on ? '' : 'is-off'].filter(Boolean).join(' ') || undefined}
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
              <span className="m360-evi__name">
                {`${shortName(r.segment)} · ${r.label.replace('IBEROGAST ', 'IG ')}`}
              </span>
              <div className="m360-evi__track" aria-hidden>
                <i className="m360-evi__ref" style={{ left: `${x100}%` }} />
                <b className="m360-evi__stem" style={{ left: `${stemLeft}%`, width: `${stemWidth}%` }} />
                <em className="m360-evi__dot" style={{ left: `${x}%` }} />
              </div>
              <strong className="m360-evi__val">{fmtEvi(r.evolutionIndex)}</strong>
            </li>
          );
        })}
      </ul>
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
          const noPresence = mat === 0 && ya === 0;
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
                  lines: noPresence
                    ? [
                        'Bayer share: no presence',
                        'Read  No named Bayer brands in this need-state in the extract',
                      ]
                    : [
                        `Previous MAT 12M  ${fmtBayerShare(s.bayerShareYaPct)}`,
                        `Current MAT 12M  ${fmtBayerShare(s.bayerShareMatPct)}`,
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
                {!noPresence ? (
                  <>
                    <line
                      className={lost ? 'm360-share-chg__link is-down' : 'm360-share-chg__link is-up'}
                      x1={xYa}
                      x2={xMat}
                      y1={H / 2}
                      y2={H / 2}
                    />
                    <circle className="m360-share-chg__ya" cx={xYa} cy={H / 2} r="5" />
                    <circle className="m360-share-chg__mat" cx={xMat} cy={H / 2} r="6" fill={color} />
                  </>
                ) : null}
              </svg>
              <span className="m360-share-chg__levels">
                {noPresence
                  ? 'no presence'
                  : `${fmtBayerShare(s.bayerShareYaPct)} → ${fmtBayerShare(s.bayerShareMatPct)}`}
              </span>
              <strong className={`m360-share-chg__delta ${noPresence ? '' : tone(s.bayerShareChangePp)}`}>
                {noPresence ? '—' : fmtPp(s.bayerShareChangePp)}
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

/** Price vs volume EUR contribution by channel — one driver question. */
function ChannelDriversChart() {
  const { wrap, tip, show, hide } = useChartTip();
  const [focus, setFocus] = useState<string | null>(null);
  const [showPrice, setShowPrice] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const maxAbs = Math.max(
    ...CALC_CHANNELS.flatMap((c) => [
      showPrice ? Math.abs(c.priceContribEurM) : 0,
      showVolume ? Math.abs(c.volumeContribEurM) : 0,
    ]),
    1,
  );

  return (
    <div className="m360-viz m360-channel-drv" ref={wrap} onMouseLeave={hide}>
      <p className="m360-channel-drv__ref">
        EUR millions added or removed versus last year. Price and volume are growth-driver fields —
        not packs from the segment chart above. {M360_CHANNEL_META.note}
      </p>
      <ul className="m360-channel-drv__list">
        {CALC_CHANNELS.map((c) => {
          const on = !focus || focus === c.channel;
          const driver =
            c.volumeContribEurM > c.priceContribEurM ? 'Volume-led growth' : 'Price-led growth';
          return (
            <li
              key={c.channel}
              className={on ? undefined : 'is-off'}
              onMouseEnter={() => setFocus(c.channel)}
              onMouseMove={(e) =>
                show(e, {
                  title: c.channel,
                  lines: [
                    `Sales  ${fmtM(c.valueEurM)} · ${fmtShare(c.shareOfSetPct)} of set`,
                    `Value growth  ${fmtPct(c.valueGrowthPct)} · packs ${fmtPct(c.unitGrowthPct)}`,
                    `Price effect  ${fmtM(c.priceContribEurM)}`,
                    `Volume effect  ${fmtM(c.volumeContribEurM)}`,
                    `Share of set’s EUR growth  ${fmtShare(c.pctOfSetAbsGrowth)}`,
                    driver,
                  ],
                })
              }
              onMouseLeave={() => setFocus(null)}
            >
              <header>
                <h4>{c.channel}</h4>
                <span>
                  {fmtM(c.valueEurM)} · {fmtShare(c.shareOfSetPct)} of set · {fmtPct(c.valueGrowthPct)}
                </span>
              </header>
              <p className={`m360-channel-drv__pace ${c.volumeContribEurM > c.priceContribEurM ? 'is-up' : ''}`}>
                {driver} · {fmtShare(c.pctOfSetAbsGrowth)} of set’s EUR growth
              </p>
              <div className="m360-channel-drv__metrics">
                {showPrice ? (
                  <div>
                    <span className="m360-channel-drv__lab">Price effect</span>
                    <div className="m360-channel-drv__bar-wrap">
                      <i className="m360-channel-drv__zero" />
                      <b
                        className={`m360-channel-drv__bar is-price ${c.priceContribEurM < 0 ? 'is-neg' : ''}`}
                        style={{
                          width: `${(Math.abs(c.priceContribEurM) / maxAbs) * 50}%`,
                          [c.priceContribEurM < 0 ? 'right' : 'left']: '50%',
                        }}
                      />
                    </div>
                    <strong className={tone(c.priceContribEurM)}>{fmtM(c.priceContribEurM)}</strong>
                  </div>
                ) : null}
                {showVolume ? (
                  <div>
                    <span className="m360-channel-drv__lab">Volume effect</span>
                    <div className="m360-channel-drv__bar-wrap">
                      <i className="m360-channel-drv__zero" />
                      <b
                        className={`m360-channel-drv__bar is-vol ${c.volumeContribEurM < 0 ? 'is-neg' : ''}`}
                        style={{
                          width: `${(Math.abs(c.volumeContribEurM) / maxAbs) * 50}%`,
                          [c.volumeContribEurM < 0 ? 'right' : 'left']: '50%',
                        }}
                      />
                    </div>
                    <strong className={tone(c.volumeContribEurM)}>{fmtM(c.volumeContribEurM)}</strong>
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      <ul className="m360-viz__legend">
        <li>
          <button
            type="button"
            className={showPrice ? 'is-on' : 'is-off'}
            aria-pressed={showPrice}
            onClick={() => setShowPrice((v) => (showVolume || !v ? !v : v))}
          >
            <i className="is-mat" />
            Price effect
          </button>
        </li>
        <li>
          <button
            type="button"
            className={showVolume ? 'is-on' : 'is-off'}
            aria-pressed={showVolume}
            onClick={() => setShowVolume((v) => (showPrice || !v ? !v : v))}
          >
            <i className="is-ya" />
            Volume effect
          </button>
        </li>
      </ul>
      <ChartTip tip={tip} />
    </div>
  );
}

/**
 * Channel movers: bar length = share change (pp), sorted gainers first.
 * Absolute share stays in the name line + tooltip — never as bar length.
 */
function ChannelPlayersChart({ channel }: { channel: 'Pharmacies' | 'E-commerce' }) {
  const { wrap, tip, show, hide } = useChartTip();
  const [focus, setFocus] = useState<string | null>(null);
  const rows = channelBrandsByShareChange(channel);
  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.shareChangePp)), 0.1);

  return (
    <div className="m360-viz m360-movers" ref={wrap} onMouseLeave={hide}>
      <p className="m360-movers__axis">Share change (points) → · zero at center · gainers first</p>
      <ul className="m360-movers__list" role="img" aria-label={`Share change in ${channel}`}>
        {rows.map((r) => {
          const on = !focus || focus === r.brand;
          const neg = r.shareChangePp < 0;
          const widthPct = (Math.abs(r.shareChangePp) / maxAbs) * 50;
          return (
            <li
              key={r.brand}
              className={[
                r.isBayer ? 'is-bayer' : '',
                neg ? 'is-down' : r.shareChangePp > 0 ? 'is-up' : 'is-flat',
                on ? '' : 'is-off',
              ]
                .filter(Boolean)
                .join(' ') || undefined}
              onMouseEnter={() => setFocus(r.brand)}
              onMouseMove={(e) =>
                show(e, {
                  color: r.isBayer ? '#4ec3e0' : neg ? '#f0a15c' : '#6fd48a',
                  title: r.brand,
                  lines: [
                    `Share of ${channel}  ${fmtShare(r.shareOfChannelPct)}`,
                    `Share change  ${fmtPp(r.shareChangePp)}`,
                    `Value growth  ${fmtPct(r.valueGrowthPct)}`,
                    `Pack growth  ${fmtPct(r.unitGrowthPct)}`,
                    `Sales  ${fmtM(r.valueEurM)}`,
                    r.isBayer ? 'Bayer' : 'Competitor',
                  ],
                })
              }
              onMouseLeave={() => setFocus(null)}
            >
              <span className="m360-movers__name">
                {r.brand}
                <small>{fmtShare(r.shareOfChannelPct)} of {channel}</small>
              </span>
              <div className="m360-movers__track" aria-hidden>
                <i className="m360-movers__zero" />
                <b
                  className={`m360-movers__bar ${neg ? 'is-neg' : ''}`}
                  style={{
                    width: `${widthPct}%`,
                    [neg ? 'right' : 'left']: '50%',
                  }}
                />
              </div>
              <span className="m360-movers__labs">
                <strong className={tone(r.shareChangePp)}>{fmtPp(r.shareChangePp)}</strong>
                <em>value {fmtPct(r.valueGrowthPct)}</em>
              </span>
            </li>
          );
        })}
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

export function M360MarketStoryV3() {
  const cat = CALC_CATEGORY;
  const p = M360_RETRIEVAL_PARAMS;
  const m = M360_METADATA;
  const narrative = buildMarketNarrativeProps();
  const { ibs, ant, gas, ppi, classic, advance, gaviscon } = narrative;
  const topIbs = CALC_SUBBRANDS.filter((r) => r.segment === ibs.segment)
    .sort((a, b) => b.valueMat - a.valueMat)
    .slice(0, 6);
  const topAnt = CALC_SUBBRANDS.filter((r) => r.segment === ant.segment)
    .sort((a, b) => b.valueMat - a.valueMat)
    .slice(0, 6);
  const ibero = CALC_IBEROGAST[0];
  const pharmaBrands = channelBrandsByShareChange('Pharmacies');
  const ecommBrands = channelBrandsByShareChange('E-commerce');
  const gavisconPharma = pharmaBrands.find((r) => r.brand === 'GAVISCON');
  const gavisconEcomm = ecommBrands.find((r) => r.brand === 'GAVISCON');
  const iberoPharma = pharmaBrands.find((r) => r.brand === 'IBEROGAST');
  const iberoEcomm = ecommBrands.find((r) => r.brand === 'IBEROGAST');
  const lefaxEcomm = ecommBrands.find((r) => r.brand === 'LEFAX');
  const talcidEcomm = ecommBrands.find((r) => r.brand === 'TALCID');
  const valuePackGap =
    cat.growth1yPct != null && cat.unitGrowth1yPct != null
      ? cat.growth1yPct - cat.unitGrowth1yPct
      : null;

  const ax = buildStoryAnalyses({
    cat,
    ibs,
    ant,
    gas,
    ppi,
    classic,
    advance,
    gaviscon,
    ibero,
    topIbs,
    pharma: CALC_CHANNEL_PHARMA,
    ecomm: CALC_CHANNEL_ECOMM,
    gavisconPharma,
    gavisconEcomm,
    iberoPharma,
    iberoEcomm,
    lefaxEcomm,
    talcidEcomm,
    valuePackGap,
  });

  return (
    <div
      className={`m360-rep m360-rep--story-v2${ASSISTANT_NARRATIVE_V2 ? ' m360-rep--narrative-v2' : ''}${ASSISTANT_STORY_RAIL ? ' m360-rep--story-rail' : ''}`}
    >
      <p className="m360-rep__kicker">
        {p.country} {p.category} · Iberogast competitive set · latest 12 months ending {m.latest_actual_month}
      </p>

      {/* 1 · Category overview */}
      <StorySection id="story-overview" title="Category overview">
        <AssistantMarketReadout {...narrative} heading="Executive summary" headingLevel={3} />
        <StoryBand
          viz={
            <section className="m360-rep-kpis" aria-label="Three headline measures by scope">
              <article>
                <p>Category sales</p>
                <strong className="m360-num is-key">{fmtM(cat.valueMatM)}</strong>
                <span>
                  Whole Iberogast competitive set, latest 12 months.{' '}
                  <Num v={cat.growth1yPct}>{fmtPct(cat.growth1yPct)}</Num> versus last year. Bayer sales inside this
                  set: <Num kind="key">{fmtM(cat.bayerValueMatM)}</Num>.
                </span>
              </article>
              <article className={tone(cat.bayerShareChangePp) === 'is-down' ? 'is-soft' : undefined}>
                <p>Bayer market share</p>
                <strong className={`m360-num ${tone(cat.bayerShareChangePp) || 'is-key'}`}>
                  {fmtShare(cat.bayerShareMatPct)}
                </strong>
                <span>
                  Bayer’s share of the same competitive set (not Iberogast alone).{' '}
                  <Num v={cat.bayerShareChangePp}>{fmtPp(cat.bayerShareChangePp)}</Num> versus last year.
                </span>
              </article>
              <article>
                <p>Iberogast relative growth</p>
                <strong className={`m360-num ${tone(ibero?.evolutionIndex ?? null, 100) || 'is-key'}`}>
                  {fmtEvi(ibero?.evolutionIndex ?? null)}
                </strong>
                <span>
                  {ibero
                    ? `${ibero.label} versus the IBS need-state only. 100 = growing in line with IBS; above 100 = faster.`
                    : 'Not available.'}
                </span>
              </article>
            </section>
          }
          {...ax.overview}
        />
      </StorySection>

      {/* 2 · Category growth */}
      <StorySection id="story-growth" title="Category growth">
        <StoryBand
          viz={
            <ChartCard
              id="ch-growth-quality"
              wide
              title="Value growth vs pack growth"
              caption={`Category: value ${fmtPct(cat.growth1yPct)}, packs ${fmtPct(cat.unitGrowth1yPct)}. Solid bars = value; faded = packs. Category first, then each need-state.`}
            >
              <GrowthQualityChart />
            </ChartCard>
          }
          {...ax.growth}
        />
      </StorySection>

      {/* 3 · Channel dynamics */}
      <StorySection id="story-channel" title="Channel dynamics">
        <StoryBand
          viz={
            <ChartCard
              id="ch-channel-drivers"
              wide
              title="Channel growth drivers"
              caption={`Pharmacies ${fmtM(CALC_CHANNEL_PHARMA.valueEurM)} (${fmtShare(CALC_CHANNEL_PHARMA.shareOfSetPct)}) · E-commerce ${fmtM(CALC_CHANNEL_ECOMM.valueEurM)} (${fmtShare(CALC_CHANNEL_ECOMM.shareOfSetPct)}). E-commerce is ${fmtShare(CALC_CHANNEL_ECOMM.pctOfSetAbsGrowth)} of the set’s EUR growth.`}
            >
              <ChannelDriversChart />
            </ChartCard>
          }
          {...ax.channelDrivers}
        />
        <StoryBand
          viz={
            <ChartCard
              id="ch-channel-pharma"
              title="Who is moving in Pharmacies"
              caption="Bar length = share change (points), zero at center. Sorted gainers first. Right: share Δ (points) and value growth (%). Absolute share under each name."
            >
              <ChannelPlayersChart channel="Pharmacies" />
            </ChartCard>
          }
          {...ax.channelPharma}
        />
        <StoryBand
          viz={
            <ChartCard
              id="ch-channel-ecomm"
              title="Who is moving in E-commerce"
              caption="Bar length = share change (points), zero at center. Sorted gainers first. Right: share Δ (points) and value growth (%). Absolute share under each name."
            >
              <ChannelPlayersChart channel="E-commerce" />
            </ChartCard>
          }
          {...ax.channelEcomm}
        />
      </StorySection>

      {/* 4 · Segment attractiveness */}
      <StorySection id="story-attract" title="Segment attractiveness">
        <StoryBand
          viz={
            <ChartCard
              id="ch-attract"
              wide
              title="Need-state size × growth"
              caption={`Sorted by size. IBS is the pool (${fmtShare(ibs.shareOfCategoryPct)}). Antacids is the growth engine (${fmtPct(ant.growth1yPct)}). White-space candidate = Bayer share under 3% and faster than category.`}
            >
              <AttractivenessChart />
            </ChartCard>
          }
          {...ax.attract}
        />
      </StorySection>

      {/* 4 · Competitive landscape */}
      <StorySection id="story-comp" title="Competitive landscape">
        <StoryBand
          viz={
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
          }
          {...ax.compIbs}
        />
        <StoryBand
          viz={
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
          }
          {...ax.compAnt}
        />
      </StorySection>

      {/* 5 · Bayer relative growth (portfolio pace → brand zoom) */}
      <StorySection id="story-evi" title="Bayer relative growth">
        <StoryBand
          viz={
            <ChartCard
              id="ch-evi"
              wide
              title="Bayer brands versus their own segment"
              caption={`${ibero?.label ?? 'Iberogast'} relative growth ${fmtEvi(ibero?.evolutionIndex ?? null)}. 100 = in line with that need-state. Next chart zooms into Classic vs Advance on IBS.`}
            >
              <EviChart />
            </ChartCard>
          }
          {...ax.evi}
        />
      </StorySection>

      {/* 6 · Iberogast position */}
      <StorySection id="story-ibero" title="Iberogast position">
        <StoryBand
          viz={
            <ChartCard
              id="ch-ibero-pos"
              wide
              title="Classic vs Advance on IBS"
              caption={`Classic ${fmtShare(classic?.shareMatPct ?? null)} of IBS · Advance ${fmtShare(advance?.shareMatPct ?? null)}. Share plus relative growth versus IBS only.`}
            >
              <IberogastPosition />
            </ChartCard>
          }
          {...ax.iberoPos}
        />
      </StorySection>

      {/* 7 · Market share performance */}
      <StorySection id="story-share" title="Market share performance">
        <StoryBand
          viz={
            <ChartCard
              id="ch-share"
              wide
              title="Bayer share change by need-state"
              caption={`Set share ${fmtShare(cat.bayerShareMatPct)} (${fmtPp(cat.bayerShareChangePp)} vs last year). Open circle = previous MAT; filled = current. Sorted worst-first — leak is Antacids.`}
            >
              <ShareChangeChart />
            </ChartCard>
          }
          {...ax.share}
        />
      </StorySection>

      {/* Synthesis + Key implications (one pack) */}
      <StorySection
        id="story-synthesis"
        title="Summary · synthesis & key implications"
        lede="Synthesize the evidence, then read it as traffic-light signals — then act."
      >
        <MarketSynthesis
          d={{
            cat,
            ibs,
            ant,
            gas,
            ppi,
            classic,
            advance,
            gaviscon,
            ibero,
            topIbs,
            pharma: CALC_CHANNEL_PHARMA,
            ecomm: CALC_CHANNEL_ECOMM,
            gavisconPharma,
            gavisconEcomm,
            iberoPharma,
            iberoEcomm,
            lefaxEcomm,
            talcidEcomm,
            valuePackGap,
          }}
        />
        <div className="m360-synthesis-signals" id="story-implications">
          <header className="m360-synthesis-signals__head">
            <h3>Key implications · signal readout</h3>
            <p>
              Same evidence as the synthesis above — scored as Problem / Strength / Watch so the brand team can act in
              order.
            </p>
          </header>
          <SignalLegend />
          <ul className="m360-signal-grid">
            <SignalCard
              tone="bad"
              label="Problem"
              title="Antacids is the competitive wound — Gaviscon is taking the growth"
              why="Set share softness is not an IBS story. The leak sits in the fastest need-state, in both channels."
              evidence={
                <>
                  Bayer Antacids share <Num kind="key">{fmtShare(ant.bayerShareMatPct)}</Num> (
                  <Num v={ant.bayerShareChangePp}>{fmtPp(ant.bayerShareChangePp)}</Num>); need-state{' '}
                  <Num v={ant.growth1yPct}>{fmtPct(ant.growth1yPct)}</Num>. Gaviscon{' '}
                  <Num v={gavisconPharma?.shareChangePp}>{fmtPp(gavisconPharma?.shareChangePp ?? null)}</Num> in
                  Pharmacies and{' '}
                  <Num v={gavisconEcomm?.shareChangePp}>{fmtPp(gavisconEcomm?.shareChangePp ?? null)}</Num> in E-commerce
                  (<Num v={gavisconEcomm?.valueGrowthPct}>{fmtPct(gavisconEcomm?.valueGrowthPct ?? null)}</Num> online).
                </>
              }
            />
            <SignalCard
              tone="good"
              label="Strength"
              title="IBS franchise still holds — Advance is the growth line"
              why="Classic remains the cash pool; Advance is the only Iberogast line clearly ahead of IBS."
              evidence={
                <>
                  IBS Bayer share <Num kind="key">{fmtShare(ibs.bayerShareMatPct)}</Num> (
                  <Num v={ibs.bayerShareChangePp}>{fmtPp(ibs.bayerShareChangePp)}</Num>). Classic{' '}
                  <Num kind="key">{fmtShare(classic?.shareMatPct ?? null)}</Num> of IBS · EVI{' '}
                  <Num v={classic?.evolutionIndex} kind="evi">
                    {fmtEvi(classic?.evolutionIndex ?? null)}
                  </Num>
                  . Advance <Num kind="key">{fmtShare(advance?.shareMatPct ?? null)}</Num> · EVI{' '}
                  <Num v={advance?.evolutionIndex} kind="evi">
                    {fmtEvi(advance?.evolutionIndex ?? null)}
                  </Num>
                  .
                </>
              }
            />
            <SignalCard
              tone="watch"
              label="Watch"
              title="Two channel jobs: defend Pharmacies, grow E-commerce"
              why="Most euros still sit in Pharmacies, but most of the set’s absolute growth sits online — and the brand mix differs by channel."
              evidence={
                <>
                  Pharmacies <Num kind="key">{fmtShare(CALC_CHANNEL_PHARMA.shareOfSetPct)}</Num> of set, price-led (
                  <Num kind="key">{fmtM(CALC_CHANNEL_PHARMA.priceContribEurM)}</Num> /{' '}
                  <Num v={CALC_CHANNEL_PHARMA.volumeContribEurM}>{fmtM(CALC_CHANNEL_PHARMA.volumeContribEurM)}</Num>).
                  E-commerce <Num kind="key">{fmtShare(CALC_CHANNEL_ECOMM.pctOfSetAbsGrowth)}</Num> of EUR growth,
                  volume-led. Iberogast{' '}
                  <Num v={iberoPharma?.shareChangePp}>{fmtPp(iberoPharma?.shareChangePp ?? null)}</Num> Pharmacies ·{' '}
                  <Num v={iberoEcomm?.shareChangePp}>{fmtPp(iberoEcomm?.shareChangePp ?? null)}</Num> E-commerce.
                </>
              }
            />
            <SignalCard
              tone="watch"
              label="Watch"
              title="Growth is value and mix — not more packs everywhere"
              why="Category value runs ahead of packs; IBS packs are soft. Chasing Classic volume alone is a weak bet from this view."
              evidence={
                <>
                  Category value <Num v={cat.growth1yPct}>{fmtPct(cat.growth1yPct)}</Num> vs packs{' '}
                  <Num v={cat.unitGrowth1yPct}>{fmtPct(cat.unitGrowth1yPct)}</Num>. IBS packs{' '}
                  <Num v={ibs.unitGrowth1yPct}>{fmtPct(ibs.unitGrowth1yPct)}</Num>. PPIs:{' '}
                  <Num kind="key">{fmtBayerShare(narrative.ppi.bayerShareMatPct)}</Num> — not a sized entry from this
                  view.
                </>
              }
            />
          </ul>
        </div>
      </StorySection>

      {/* Actions — follow from synthesis + signals */}
      <StorySection
        id="story-actions"
        title="Recommended actions"
        lede="From the synthesis and key implications above — fix the red, protect the green, manage the yellow."
      >
        <ol className="m360-action-list">
          <ActionCard
            tone="bad"
            step={1}
            title="Antacids vs Gaviscon — this month"
            body={
              <>
                One page for Gaviscon, Talcid and Rennie: Bayer share{' '}
                <Num v={ant.bayerShareChangePp}>{fmtPp(ant.bayerShareChangePp)}</Num> in a need-state at{' '}
                <Num v={ant.growth1yPct}>{fmtPct(ant.growth1yPct)}</Num>. Split Pharmacy vs E-commerce — Gaviscon is{' '}
                <Num v={gavisconEcomm?.valueGrowthPct}>{fmtPct(gavisconEcomm?.valueGrowthPct ?? null)}</Num> online. Ask
                listings, price and promotions.
              </>
            }
          />
          <ActionCard
            tone="good"
            step={2}
            title="Iberogast — split Classic defend / Advance grow"
            body={
              <>
                Defend Classic share in IBS (
                <Num kind="key">{fmtShare(classic?.shareMatPct ?? null)}</Num>, EVI{' '}
                <Num v={classic?.evolutionIndex} kind="evi">
                  {fmtEvi(classic?.evolutionIndex ?? null)}
                </Num>
                ). Put incremental growth plans on Advance (EVI{' '}
                <Num v={advance?.evolutionIndex} kind="evi">
                  {fmtEvi(advance?.evolutionIndex ?? null)}
                </Num>
                ). IBS packs <Num v={ibs.unitGrowth1yPct}>{fmtPct(ibs.unitGrowth1yPct)}</Num> — more of the same Classic
                volume is a weak bet.
              </>
            }
          />
          <ActionCard
            tone="watch"
            step={3}
            title="Channel plan — protect Pharma, feed E-commerce"
            body={
              <>
                Pharmacies are <Num kind="key">{fmtShare(CALC_CHANNEL_PHARMA.shareOfSetPct)}</Num> of the set and
                price-led — protect Iberogast share there (
                <Num v={iberoPharma?.shareChangePp}>{fmtPp(iberoPharma?.shareChangePp ?? null)}</Num>). E-commerce is{' '}
                <Num kind="key">{fmtShare(CALC_CHANNEL_ECOMM.pctOfSetAbsGrowth)}</Num> of EUR growth — Iberogast is
                already <Num v={iberoEcomm?.shareChangePp}>{fmtPp(iberoEcomm?.shareChangePp ?? null)}</Num>; watch
                Lefax/Talcid share loss online.
              </>
            }
          />
          <ActionCard
            tone="watch"
            step={4}
            title="Do not open a PPI project from this view"
            body={
              <>
                PPIs show <Num kind="key">{fmtBayerShare(narrative.ppi.bayerShareMatPct)}</Num> in this extract —
                no named Bayer brands in the competitive set — and the need-state is not the growth engine (
                <Num v={narrative.ppi.growth1yPct}>{fmtPct(narrative.ppi.growth1yPct)}</Num> vs category{' '}
                <Num v={cat.growth1yPct}>{fmtPct(cat.growth1yPct)}</Num>). There is no entry-size in euros here.
              </>
            }
          />
        </ol>
      </StorySection>
    </div>
  );
}
