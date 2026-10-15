/**
 * Bain Landscape 6Cs Market story — AI Assistant v5 (chart + reading units).
 * Kirill TB4L-003 blocks via includeTb4l003 (on by default). Stacked reading under charts.
 */
import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import { ASSISTANT_NARRATIVE_V2, ASSISTANT_STORY_RAIL } from '../config/assistantNarrative';
import {
  brandEvolutionIndex,
  CALC_CATEGORY,
  CALC_IBEROGAST,
  CALC_SEGMENTS,
  CALC_SUBBRANDS,
  CALC_TOP_BRANDS_IN_SET,
} from '../data/m360Charts';
import {
  M360_CHART,
  m360ChangeColor,
  m360ChartColorModeAttr,
} from '../data/m360ChartColors';
import {
  CALC_CHANNEL_ECOMM,
  CALC_CHANNEL_PHARMA,
  CALC_CHANNELS,
  M360_CHANNEL_META,
  channelBrandsByShareChange,
} from '../data/m360ChannelRetrieval';
import { M360_METADATA, M360_RETRIEVAL_PARAMS } from '../data/m360Retrieval';
import {
  AssistantMarketDataCare,
  AssistantMarketReadout,
  buildMarketNarrativeProps,
} from './AssistantNarrative';
import {
  buildStoryAnalyses,
  MarketSynthesis,
  type ChartAxBody,
  type HypCheck,
  type HypStatus,
} from './m360StoryAnalyses';
import {
  StoryCandidateOpportunities,
  StoryGrowthShareBubble,
  StoryMekkoChart,
  StorySegmentScorecard,
  StoryTb4l003KpiExtras,
  StoryWhoWinsAll,
  scenarioForSegment,
} from './M360Tb4l003StoryBlocks';
import {
  TB4L003_CATEGORY,
  TB4L003_SEGMENTS,
  plainNeedStateJob,
  shortSegmentName,
} from '../data/tb4l003Calc';
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

/** Short key — three rules only; charts should read without scrolling back here. */
function ChartColorLegend() {
  const c = M360_CHART;
  return (
    <aside className="m360-chart-legend" aria-label="How to read chart colors">
      <p className="m360-chart-legend__title">Chart colors</p>
      <ul>
        <li>
          <span className="m360-chart-legend__swatch" aria-hidden>
            <i style={{ background: c.levelBar }} />
          </span>
          <span className="m360-chart-legend__label">Slate</span>
          <span className="m360-chart-legend__desc">Size or share — how big</span>
        </li>
        <li>
          <span className="m360-chart-legend__swatch" aria-hidden>
            <i style={{ background: c.levelBarBayer }} />
          </span>
          <span className="m360-chart-legend__label">Bayer</span>
          <span className="m360-chart-legend__desc">Deeper slate + tag — ownership, not “good”</span>
        </li>
        <li>
          <span className="m360-chart-legend__swatch" aria-hidden>
            <i style={{ background: c.gain }} />
            <i style={{ background: c.loss }} />
          </span>
          <span className="m360-chart-legend__label">Green / amber</span>
          <span className="m360-chart-legend__desc">Up or down — share Δ, pace, relative growth</span>
        </li>
      </ul>
    </aside>
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
/** True when Bayer has (or had) named share — never invent a Δ from 0→0. */
function hasBayerPresence(
  mat: number | null | undefined,
  ya?: number | null | undefined,
): boolean {
  const m = mat ?? 0;
  const y = ya ?? 0;
  return (Number.isFinite(m) && m > 0) || (Number.isFinite(y) && y > 0);
}
function fmtEvi(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return 'Not available';
  return v.toFixed(0);
}
function fmtPp(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return 'Not available';
  return `${v >= 0 ? '+' : ''}${v.toFixed(1)} points`;
}
/** Expand Sirius month abbrevs for reader-facing period labels. */
function fmtMonthLabel(v: string): string {
  return v
    .replace(/\bJan\b/g, 'January')
    .replace(/\bFeb\b/g, 'February')
    .replace(/\bMar\b/g, 'March')
    .replace(/\bApr\b/g, 'April')
    .replace(/\bJun\b/g, 'June')
    .replace(/\bJul\b/g, 'July')
    .replace(/\bAug\b/g, 'August')
    .replace(/\bSep\b/g, 'September')
    .replace(/\bOct\b/g, 'October')
    .replace(/\bNov\b/g, 'November')
    .replace(/\bDec\b/g, 'December');
}
function fmtMatWindow(start: string, end: string): string {
  return `12 months ending ${fmtMonthLabel(end)} (${fmtMonthLabel(start)}–${fmtMonthLabel(end)})`;
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
      style={{ left: tip.x, top: tip.y, ['--tip' as string]: tip.color ?? M360_CHART.bayerDeep }}
    >
      <strong>{tip.title}</strong>
      {tip.lines.map((line) => (
        <span key={line}>{line}</span>
      ))}
    </div>
  );
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
        <h4>1 · What stands out</h4>
        {factsVariant === 'table' ? (
          <div className="m360-chart-ax__facts is-table">{facts}</div>
        ) : (
          <ul className="m360-chart-ax__facts">{facts}</ul>
        )}
      </section>
      <section className="m360-chart-ax__block is-insights">
        <h4>2 · What it means</h4>
        <div>{insights}</div>
      </section>
      {hypotheses.length > 0 ? (
        <section className="m360-chart-ax__block is-hyp">
          <h4>3 · Claims we checked</h4>
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
      ) : null}
      <section className="m360-chart-ax__block is-brand">
        <h4>4 · For the brand</h4>
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

/** stacked = reading under chart (v3); split = reading beside chart (v4). */
const StoryBandLayoutCtx = createContext<'stacked' | 'split'>('stacked');

/**
 * Chart + reading in one card.
 * stacked: reading below the chart (v3 form).
 * split: reading beside the chart with a full-height scroller (v4).
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
  const layout = useContext(StoryBandLayoutCtx);
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
    <div className={`m360-story-band ${layout === 'split' ? 'is-split' : 'is-stacked'}`}>
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
      value: CALC_CATEGORY.growth1yPct,
      units: CALC_CATEGORY.unitGrowth1yPct,
    },
    ...CALC_SEGMENTS.map((s) => ({
      key: s.segment,
      name: shortName(s.segment),
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
                  color: m360ChangeColor(r.value),
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
                  fill={m360ChangeColor(r.value)}
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
                  fill={m360ChangeColor(r.units)}
                  opacity={0.55}
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
function AttractivenessChart({ includeTb4l003 = false }: { includeTb4l003?: boolean }) {
  const { wrap, tip, show, hide } = useChartTip();
  const [focus, setFocus] = useState<string | null>(null);
  const catG = CALC_CATEGORY.growth1yPct;
  const rows = [...CALC_SEGMENTS].sort((a, b) => b.shareOfCategoryPct - a.shareOfCategoryPct);
  const maxShare = Math.max(...rows.map((s) => s.shareOfCategoryPct), 1);
  const maxGrowth = Math.max(...rows.map((s) => Math.abs(s.growth1yPct ?? 0)), Math.abs(catG ?? 0), 1);

  return (
    <div className="m360-viz m360-attract" ref={wrap} onMouseLeave={hide}>
      <p className="m360-attract__ref">
        Category growth <strong className={`m360-num ${tone(catG) || 'is-key'}`}>{fmtPct(catG)}</strong> — bars
        below show each need-state versus that line. Hover a row for Bayer context.
      </p>
      <ul className="m360-attract__list">
        {rows.map((s) => {
          const g = s.growth1yPct;
          const faster = g !== null && catG !== null && g > catG;
          const slower = g !== null && catG !== null && g < catG;
          const paceTone = faster ? 'is-up' : slower ? 'is-down' : 'is-flat';
          const paceBase = faster ? 'Faster than category' : slower ? 'Slower than category' : 'In line with category';
          const pace = catG !== null && catG !== undefined ? `${paceBase} (${fmtPct(catG)})` : paceBase;
          const on = !focus || focus === s.segment;
          return (
            <li
              key={s.segment}
              className={on ? undefined : 'is-off'}
              onMouseEnter={() => setFocus(s.segment)}
              onMouseMove={(e) =>
                show(e, {
                  color: m360ChangeColor(faster ? 1 : slower ? -1 : 0),
                  title: shortName(s.segment),
                  lines: [
                    `Sales  ${fmtM(s.valueMatM)}`,
                    `Share of category  ${fmtShare(s.shareOfCategoryPct)}`,
                    `Growth vs last year  ${fmtPct(g)} · ${pace}`,
                    !hasBayerPresence(s.bayerShareMatPct, s.bayerShareYaPct)
                      ? 'Bayer: no presence (no named brands)'
                      : `Bayer share: ${fmtBayerShare(s.bayerShareMatPct)} (${fmtPp(s.bayerShareChangePp)})`,
                    (() => {
                      const sc = includeTb4l003 ? scenarioForSegment(s.segment) : null;
                      if (sc) return `Job  ${plainNeedStateJob(sc)}`;
                      return s.whiteSpaceFlag
                        ? 'White-space candidate (Bayer <3% and faster than category)'
                        : 'Not a white-space candidate in this set';
                    })(),
                  ],
                })
              }
              onMouseLeave={() => setFocus(null)}
            >
              <header>
                <h4>{shortName(s.segment)}</h4>
                <span className="m360-attract__sales m360-num is-key">{fmtM(s.valueMatM)}</span>
                {includeTb4l003 && scenarioForSegment(s.segment) ? (
                  <em className="m360-attract__ws">{plainNeedStateJob(scenarioForSegment(s.segment)!)}</em>
                ) : s.whiteSpaceFlag ? (
                  <em className="m360-attract__ws">White-space candidate</em>
                ) : null}
              </header>
              <div className="m360-attract__metrics">
                <div>
                  <span className="m360-attract__lab">Size · share of category</span>
                  <div className="m360-attract__bar-wrap">
                    <b className="m360-attract__bar is-size" style={{ width: `${(s.shareOfCategoryPct / maxShare) * 100}%` }} />
                  </div>
                  <strong className="m360-num is-key">{fmtShare(s.shareOfCategoryPct)}</strong>
                </div>
                <div>
                  <span className="m360-attract__lab">Growth vs last year</span>
                  <div className="m360-attract__bar-wrap">
                    <b
                      className={`m360-attract__bar is-growth ${paceTone}`}
                      style={{ width: `${(Math.abs(g ?? 0) / maxGrowth) * 100}%` }}
                    />
                  </div>
                  <strong className={`m360-num ${tone(g) || 'is-key'}`}>{fmtPct(g)}</strong>
                </div>
              </div>
              <p className={`m360-attract__pace ${paceTone}`}>{pace}</p>
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
  label: (key: string) => ReactNode;
  detail: (key: string) => string[];
}) {
  const { wrap, tip, show, hide } = useChartTip();
  const [focus, setFocus] = useState<string | null>(null);
  const max = Math.max(...rows.map((r) => value(r.key)), 1);
  const hasBayer = rows.some((r) => r.bayer);
  return (
    <div className="m360-viz" ref={wrap} onMouseLeave={hide}>
      {hasBayer ? (
        <p className="m360-rank__axis">Bayer brands: deeper bar and a Bayer tag on the name</p>
      ) : null}
      <ul className="m360-rank" role="img" aria-label={hasBayer ? 'Brand share; Bayer brands tagged' : 'Brand share'}>
        {rows.map((r) => {
          const on = !focus || focus === r.key;
          return (
            <li
              key={r.key}
              className={[r.bayer ? 'is-bayer' : '', on ? '' : 'is-off'].filter(Boolean).join(' ') || undefined}
              onMouseEnter={() => setFocus(r.key)}
              onMouseMove={(e) =>
                show(e, {
                  title: r.bayer ? `${r.name} (Bayer)` : r.name,
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
                  color: m360ChangeColor(evi, 100),
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
              <strong className={`m360-evi__val m360-num ${tone(r.evolutionIndex, 100) || 'is-key'}`}>
                {fmtEvi(r.evolutionIndex)}
              </strong>
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
  // Omit need-states with no Bayer presence — a 0→0 Δ is not a change story.
  const rows = [...CALC_SEGMENTS]
    .filter((s) => hasBayerPresence(s.bayerShareMatPct, s.bayerShareYaPct))
    .sort((a, b) => (a.bayerShareChangePp ?? 0) - (b.bayerShareChangePp ?? 0));
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
          const delta = s.bayerShareChangePp ?? 0;
          const lost = delta < 0;
          const changeColor = m360ChangeColor(delta);
          return (
            <li
              key={s.segment}
              className={!on ? 'is-off' : undefined}
              onMouseEnter={() => setFocus(s.segment)}
              onMouseMove={(e) =>
                show(e, {
                  color: changeColor,
                  title: shortName(s.segment),
                  lines: [
                    `Previous MAT 12M  ${fmtBayerShare(s.bayerShareYaPct)}`,
                    `Current MAT 12M  ${fmtBayerShare(s.bayerShareMatPct)}`,
                    `Change  ${fmtPp(s.bayerShareChangePp)}`,
                    lost
                      ? 'Read  Share leak — priority for the Antacids fight'
                      : delta > 0
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
                <circle className="m360-share-chg__mat" cx={xMat} cy={H / 2} r="6" fill={changeColor} />
              </svg>
              <span className="m360-share-chg__levels">
                <strong className="m360-num is-key">{fmtBayerShare(s.bayerShareYaPct)}</strong>
                {' → '}
                <strong className="m360-num is-key">{fmtBayerShare(s.bayerShareMatPct)}</strong>
              </span>
              <strong className={`m360-share-chg__delta m360-num ${tone(s.bayerShareChangePp) || 'is-key'}`}>
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
                  <strong className="m360-num is-key">{fmtM(c.valueEurM)}</strong>
                  {' · '}
                  <strong className="m360-num is-key">{fmtShare(c.shareOfSetPct)}</strong> of set ·{' '}
                  <strong className={`m360-num ${tone(c.valueGrowthPct) || 'is-key'}`}>
                    {fmtPct(c.valueGrowthPct)}
                  </strong>
                </span>
              </header>
              <p className={`m360-channel-drv__pace ${c.volumeContribEurM > c.priceContribEurM ? 'is-up' : ''}`}>
                {driver} · <strong className="m360-num is-key">{fmtShare(c.pctOfSetAbsGrowth)}</strong> of set’s EUR
                growth
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
                    <strong className={`m360-num ${tone(c.priceContribEurM) || 'is-key'}`}>
                      {fmtM(c.priceContribEurM)}
                    </strong>
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
                    <strong className={`m360-num ${tone(c.volumeContribEurM) || 'is-key'}`}>
                      {fmtM(c.volumeContribEurM)}
                    </strong>
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
                  color: m360ChangeColor(r.shareChangePp),
                  title: r.isBayer ? `${r.brand} (Bayer)` : r.brand,
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
                <small>
                  <strong className="m360-num is-key">{fmtShare(r.shareOfChannelPct)}</strong> of {channel}
                </small>
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
                <strong className={`m360-num ${tone(r.shareChangePp) || 'is-key'}`}>
                  {fmtPp(r.shareChangePp)}
                </strong>
                <em>
                  value{' '}
                  <strong className={`m360-num ${tone(r.valueGrowthPct) || 'is-key'}`}>
                    {fmtPct(r.valueGrowthPct)}
                  </strong>
                </em>
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
                  color: m360ChangeColor(r.evolutionIndex, 100),
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
                <span>
                  Relative growth{' '}
                  <strong className={`m360-num ${tone(r.evolutionIndex, 100) || 'is-key'}`}>
                    {fmtEvi(r.evolutionIndex)}
                  </strong>
                  {beat ? ' · ahead of IBS' : ' · with / behind IBS'}
                </span>
              </header>
              <div className="m360-ibero-pos__bar" aria-hidden>
                <b
                  className="is-bayer-level"
                  style={{ width: `${(r.shareMatPct / maxShare) * 100}%` }}
                />
              </div>
              <p>
                <strong className="m360-num is-key">{fmtShare(r.shareMatPct)}</strong> of IBS · sales{' '}
                <strong className={`m360-num ${tone(r.growth1yPct) || 'is-key'}`}>{fmtPct(r.growth1yPct)}</strong>{' '}
                versus last year · share change{' '}
                <strong className={`m360-num ${tone(r.shareChangePp) || 'is-key'}`}>
                  {fmtPp(r.shareChangePp)}
                </strong>
              </p>
            </li>
          );
        })}
      </ul>
      <ChartTip tip={tip} />
    </div>
  );
}

export function M360MarketStoryV5({
  includeTb4l003 = true,
  readingBeside = false,
  focusCId = null,
  focusCIds = null,
  analyticPack = null,
}: {
  includeTb4l003?: boolean;
  /** When true, reading panel beside the chart; leave false for stacked under chart. */
  readingBeside?: boolean;
  /** Bain Landscape C id — when set, only that C’s analysis is shown. null = full story. */
  focusCId?: string | null;
  /** Prefer over focusCId when several Cs belong to one analytic. */
  focusCIds?: string[] | null;
  /**
   * Kirill Category pack under Bain Category → Segment Share & White Space.
   * Mekko, growth × share, who wins, scorecard, candidates (POS proxy).
   */
  analyticPack?: 'segment-share-white-space' | null;
} = {}) {
  const sswsPack = analyticPack === 'segment-share-white-space';
  const showC = (cId: string) => {
    if (sswsPack) return false;
    if (focusCIds?.length) return focusCIds.includes(cId);
    return focusCId == null || focusCId === cId;
  };
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
  const iberoBrandEvi = brandEvolutionIndex('IBEROGAST', ibs.segment);
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

  const structSegs = TB4L003_SEGMENTS;
  const structLargest = structSegs[0];
  const structFast = [...structSegs]
    .filter((s) => s.growth1yPct != null)
    .sort((a, b) => (b.growth1yPct ?? 0) - (a.growth1yPct ?? 0))[0];
  const structS2 = structSegs.filter((s) => s.shareLossInGrowth);
  const structS1 = structSegs.filter((s) => s.whiteSpace);
  const structS3 = structSegs.filter((s) => s.nearMiss);
  const structS4 = structSegs.filter((s) => s.scenarioCode === 'S4');

  const tb4lAx = {
    structure: {
      facts: (
        <ul>
          {structLargest ? (
            <li>
              <Num kind="key">{shortSegmentName(structLargest.segment)}</Num> is the largest need-state —{' '}
              <Num kind="key">{fmtShare(structLargest.shareOfCategoryPct)}</Num> of set sales (
              <Num kind="key">{fmtM(structLargest.valueMatM)}</Num>
              ). Bayer holds <Num kind="key">{fmtShare(structLargest.bayerShareMatPct)}</Num> there.
            </li>
          ) : null}
          {structFast ? (
            <li>
              Fastest need-state: <Num kind="key">{shortSegmentName(structFast.segment)}</Num> at{' '}
              <Num v={structFast.growth1yPct}>{fmtPct(structFast.growth1yPct)}</Num> vs category{' '}
              <Num v={TB4L003_CATEGORY.growth1yPct}>{fmtPct(TB4L003_CATEGORY.growth1yPct)}</Num>
              {structFast.bayerShareChangePp != null ? (
                <>
                  ; Bayer share{' '}
                  <Num v={structFast.bayerShareChangePp}>{fmtPp(structFast.bayerShareChangePp)}</Num>
                </>
              ) : null}
              .
            </li>
          ) : null}
          <li>
            Job by need-state:{' '}
            {structSegs.map((s, i) => (
              <span key={s.segment}>
                {i > 0 ? ' · ' : null}
                {shortSegmentName(s.segment)} — {plainNeedStateJob(s)}
              </span>
            ))}
            .
          </li>
        </ul>
      ),
      insights: (
        <>
          <p>
            This chart answers where the euros sit and whether Bayer is present — before channels or brand lines. The
            wide columns are the cash pool; the fast-growing ones are where share fights matter most.
          </p>
          <p>
            {structS2.length
              ? `${structS2.map((s) => shortSegmentName(s.segment)).join(' and ')} grow faster than the set while Bayer’s share softens — that is the main structure tension.`
              : 'No need-state currently shows Bayer losing share inside a faster-than-category growth space.'}{' '}
            {structS1.length
              ? `${structS1.map((s) => shortSegmentName(s.segment)).join(' and ')} look like white-space candidates (fast growth, Bayer under 3%).`
              : 'There is no clear white-space need-state (fast growth with Bayer under 3%) in this window.'}
          </p>
        </>
      ),
      hypotheses: [
        {
          claim: 'One need-state is both the sales pool and the growth engine.',
          status: (structLargest &&
          structFast &&
          structLargest.segment === structFast.segment
            ? 'confirmed'
            : 'rejected') as HypStatus,
          because: (
            <>
              Largest is {structLargest ? shortSegmentName(structLargest.segment) : '—'}; fastest is{' '}
              {structFast ? shortSegmentName(structFast.segment) : '—'}. Pool and growth are separate jobs.
            </>
          ),
        },
        {
          claim: 'Bayer is present in the growth need-state but not keeping pace.',
          status: (structS2.length ? 'confirmed' : 'partial') as HypStatus,
          because: (
            <>
              {structS2.length
                ? structS2.map((s) => (
                    <span key={s.segment}>
                      {shortSegmentName(s.segment)} share{' '}
                      <Num v={s.bayerShareChangePp}>{fmtPp(s.bayerShareChangePp)}</Num>
                      {'. '}
                    </span>
                  ))
                : 'No growing need-state where Bayer is losing share in this extract.'}
            </>
          ),
        },
      ],
      brandImplications: (
        <p>
          Brief the franchise as “defend the large pool, fight where growth (and leak) sit” — not one blended volume
          target across every need-state.
        </p>
      ),
      opportunities: (
        <ul>
          {structS2.map((s) => (
            <li key={s.segment}>
              Contest {shortSegmentName(s.segment)} while it still grows faster than the set (
              <Num v={s.growth1yPct}>{fmtPct(s.growth1yPct)}</Num>).
            </li>
          ))}
          {structS4.map((s) => (
            <li key={s.segment}>
              Protect the {shortSegmentName(s.segment)} pool (
              <Num kind="key">{fmtShare(s.shareOfCategoryPct)}</Num> of set).
            </li>
          ))}
          {!structS2.length && !structS4.length ? (
            <li>Use the scorecard next for exact sizes and growth gaps by need-state.</li>
          ) : null}
        </ul>
      ),
      risks: (
        <ul>
          {structS2.map((s) => (
            <li key={s.segment}>
              Letting {shortSegmentName(s.segment)} share keep drifting (
              <Num v={s.bayerShareChangePp}>{fmtPp(s.bayerShareChangePp)}</Num>) while rivals take the growth.
            </li>
          ))}
          <li>Treating every need-state as the same job because they share one category label.</li>
        </ul>
      ),
    },
    growthShare: {
      facts: (
        <ul>
          <li>
            Category growth line sits at{' '}
            <Num v={TB4L003_CATEGORY.growth1yPct}>{fmtPct(TB4L003_CATEGORY.growth1yPct)}</Num>. Need-states to the
            right grow faster; to the left grow slower.
          </li>
          <li>
            Bayer presence line is 3% share. Above it = Bayer already plays; below it = little or no named presence.
          </li>
          {structS1.length ? (
            <li>
              White-space zone (fast + Bayer under 3%):{' '}
              {structS1.map((s) => shortSegmentName(s.segment)).join(', ')}.
            </li>
          ) : (
            <li>No need-state sits in the white-space zone in this window.</li>
          )}
          {structS2.length ? (
            <li>
              Growing with Bayer present but soft share:{' '}
              {structS2.map((s) => shortSegmentName(s.segment)).join(', ')}.
            </li>
          ) : null}
        </ul>
      ),
      insights: (
        <p>
          This map separates four jobs: enter (white space), keep pace where we already play in growth, research
          carefully where we are absent and growth is soft, and protect slower pools. Bubble size is need-state sales —
          big and soft is still a franchise issue.
        </p>
      ),
      hypotheses: [
        {
          claim: 'There is an obvious white-space need-state to enter now.',
          status: (structS1.length ? 'partial' : 'rejected') as HypStatus,
          because: (
            <>
              {structS1.length
                ? `${structS1.map((s) => shortSegmentName(s.segment)).join(', ')} meet the fast + low-presence rule — still a discussion candidate, not a sized entry.`
                : 'Nothing is both faster than category and under 3% Bayer share outside the unclear band.'}
            </>
          ),
        },
        {
          claim: 'The urgent fight is share loss inside a growing need-state we already play.',
          status: (structS2.length ? 'confirmed' : 'partial') as HypStatus,
          because: (
            <>
              {structS2.length
                ? structS2.map((s) => shortSegmentName(s.segment)).join(', ')
                : 'No share-loss-in-growth case in this pack.'}
            </>
          ),
        },
      ],
      brandImplications: (
        <p>
          Do not brief “new entry” from a slow, low-presence space, and do not ignore share leak in a fast space where
          Bayer already has a stake.
        </p>
      ),
      opportunities: (
        <ul>
          {structS2.map((s) => (
            <li key={s.segment}>
              Recover pace in {shortSegmentName(s.segment)} (Bayer share{' '}
              <Num v={s.bayerShareChangePp}>{fmtPp(s.bayerShareChangePp)}</Num>).
            </li>
          ))}
          {structS3.map((s) => (
            <li key={s.segment}>
              Keep {shortSegmentName(s.segment)} as research-only until growth looks durable.
            </li>
          ))}
          {!structS2.length && !structS3.length ? (
            <li>Use Antacids and IBS charts next to name the brands behind the structure.</li>
          ) : null}
        </ul>
      ),
      risks: (
        <ul>
          <li>Forcing a white-space story when the real leak is share loss in a need-state we already play.</li>
          <li>Opening entry talk from a low-presence, soft-growth need-state without a clear growth case.</li>
        </ul>
      ),
    },
    scorecard: {
      facts: (
        <ul>
          {structSegs.map((s) => (
            <li key={s.segment}>
              {shortSegmentName(s.segment)}: <Num kind="key">{fmtM(s.valueMatM)}</Num>, value{' '}
              <Num v={s.growth1yPct}>{fmtPct(s.growth1yPct)}</Num>
              {s.growthVsCategoryPp != null ? (
                <>
                  {' '}
                  (<Num v={s.growthVsCategoryPp}>{fmtPp(s.growthVsCategoryPp)}</Num> vs category)
                </>
              ) : null}
              , Bayer <Num kind="key">{fmtShare(s.bayerShareMatPct)}</Num>
              {s.bayerShareChangePp != null ? (
                <>
                  {' '}
                  (<Num v={s.bayerShareChangePp}>{fmtPp(s.bayerShareChangePp)}</Num>)
                </>
              ) : null}
              — {plainNeedStateJob(s)}.
            </li>
          ))}
        </ul>
      ),
      insights: (
        <p>
          The scorecard is the same story as the structure chart, in numbers you can quote in a meeting — size,
          growth vs the set, Bayer stake, and the plain job for each need-state.
        </p>
      ),
      hypotheses: [
        {
          claim: 'Antacids is the growth need-state; IBS is the pool.',
          status: 'confirmed' as HypStatus,
          because: (
            <>
              Compare the size and growth columns: pool = largest share of set; growth = fastest vs category.
            </>
          ),
        },
      ],
      brandImplications: (
        <p>Use these figures as the shared reference — do not re-average need-states into one blended KPI.</p>
      ),
      opportunities: (
        <ul>
          <li>Quote vs-category growth gaps when prioritizing where to fight.</li>
          <li>Where CAGR is marked 2y*, treat the medium-term view as provisional.</li>
        </ul>
      ),
      risks: (
        <ul>
          <li>Cherry-picking one growth number without the size and Bayer share next to it.</li>
        </ul>
      ),
    },
    whoWinsAll: {
      facts: (
        <ul>
          <li>
            <Num kind="key">{shortSegmentName(structLargest?.segment ?? '')}</Num> and Antacids are the large
            arenas — IBS <Num kind="key">{fmtM(structSegs.find((s) => s.segment.includes('IBS'))?.valueMatM ?? null)}</Num>
            , Antacids <Num kind="key">{fmtM(ant.valueMatM)}</Num>.
          </li>
          <li>
            In Antacids, <Num kind="key">{gaviscon?.label ?? 'Gaviscon'}</Num> holds{' '}
            <Num kind="key">{fmtShare(gaviscon?.shareMatPct ?? null)}</Num>
            {gaviscon?.evolutionIndex != null ? (
              <>
                {' '}
                with EVI <Num v={gaviscon.evolutionIndex} kind="evi">{fmtEvi(gaviscon.evolutionIndex)}</Num>
              </>
            ) : null}
            ; Bayer share there is <Num kind="key">{fmtShare(ant.bayerShareMatPct)}</Num> (
            <Num v={ant.bayerShareChangePp}>{fmtPp(ant.bayerShareChangePp)}</Num>).
          </li>
          <li>
            IBS stays Bayer-led (
            <Num kind="key">{topIbs[0]?.label ?? 'Iberogast'}</Num> at{' '}
            <Num kind="key">{fmtShare(topIbs[0]?.shareMatPct ?? null)}</Num>).
          </li>
        </ul>
      ),
      insights: (
        <p>
          The Antacids cast is where share is contested — a rival ahead of the need-state (EVI above 100) is the fight
          behind Bayer’s leak. IBS is about defending the pool, not hunting a new leader.
        </p>
      ),
      hypotheses: [
        {
          status: 'confirmed' as const,
          claim: 'IBS leadership is still Bayer / Iberogast.',
          because: (
            <>
              <Num kind="key">{topIbs[0]?.label ?? 'Lead brand'}</Num> is first at{' '}
              <Num kind="key">{fmtShare(topIbs[0]?.shareMatPct ?? null)}</Num> of IBS.
            </>
          ),
        },
        {
          status: 'confirmed' as const,
          claim: 'Antacids leadership is not Bayer.',
          because: (
            <>
              <Num kind="key">{gaviscon?.label ?? 'Top rival'}</Num> leads at{' '}
              <Num kind="key">{fmtShare(gaviscon?.shareMatPct ?? null)}</Num>; Bayer share{' '}
              <Num kind="key">{fmtShare(ant.bayerShareMatPct)}</Num>.
            </>
          ),
        },
      ],
      brandImplications: (
        <p>
          Put the Antacids rival name on the same page as Bayer’s{' '}
          <Num v={ant.bayerShareChangePp}>{fmtPp(ant.bayerShareChangePp)}</Num> before channel or pack tactics.
        </p>
      ),
      opportunities: (
        <ul>
          <li>
            Use the Antacids drill-down next for rival share and EVI in one place.
          </li>
        </ul>
      ),
      risks: (
        <ul>
          <li>Reading PPI molecule rows as Bayer brands or as a sized entry opportunity.</li>
        </ul>
      ),
    },
  };

  const bandLayout = readingBeside ? 'split' : 'stacked';

  return (
    <StoryBandLayoutCtx.Provider value={bandLayout}>
    <div
      className={`m360-rep m360-rep--story-v2${ASSISTANT_NARRATIVE_V2 ? ' m360-rep--narrative-v2' : ''}${ASSISTANT_STORY_RAIL ? ' m360-rep--story-rail' : ''}${includeTb4l003 ? ' m360-rep--tb4l003' : ''}${readingBeside ? ' m360-rep--reading-aside' : ''}`}
      data-m360-charts={m360ChartColorModeAttr()}
    >
      <p className="m360-rep__kicker">
        {p.country} {p.category} · Iberogast competitive set · {fmtMatWindow(m.mat_start, m.mat_end)}
      </p>
      <ChartColorLegend />

      {sswsPack ? (
        <StorySection
          id="story-ssws"
          title="Category · Segment Share and White Space"
          lede="Kirill TB4L-003 pack under Bain Category: how need-states are structured, where Bayer plays, who wins inside each, and white-space / share-loss candidates. v3-style interpretation under each chart — review only."
        >
          <StoryBand
            viz={
              <ChartCard
                id="ch-structure-mekko"
                wide
                title="Market structure"
                caption="Wider column = bigger need-state. Deeper slate in the column = Bayer’s share; lighter = competitors."
              >
                <StoryMekkoChart />
              </ChartCard>
            }
            {...tb4lAx.structure}
          />
          <StoryBand
            viz={
              <ChartCard
                id="ch-growth-share"
                wide
                title="Growth × Bayer share"
                caption="Right = growing faster than the category; up = higher Bayer share. Bubble size = need-state sales. Soft amber lower-right = white space (fast growth, Bayer under 3%)."
              >
                <StoryGrowthShareBubble />
              </ChartCard>
            }
            {...tb4lAx.growthShare}
          />
          <StoryBand
            viz={
              <ChartCard
                id="ch-who-wins-all"
                wide
                title="Who wins inside each need-state"
                caption="Kirill chart 3 (also lives under Competition). Longer bar = share of that need-state. Bayer = deeper slate."
              >
                <StoryWhoWinsAll />
              </ChartCard>
            }
            {...tb4lAx.whoWinsAll}
          />
          <StoryBand
            viz={
              <ChartCard
                id="ch-segment-scorecard"
                wide
                title="Segment scorecard"
                caption="One row per need-state: size, growth, gap vs the category, Bayer stake, and the job in plain words."
              >
                <StorySegmentScorecard />
              </ChartCard>
            }
            {...tb4lAx.scorecard}
          />
          <div id="story-candidates" className="m360-story-band is-stacked">
            <div className="m360-story-band__viz">
              <h3 className="m360-story-subhead">Preliminary opportunities · candidates</h3>
              <p className="m360-rep__lede m360-rep__lede--nested">
                POS proxy flags from structure (white space / near-miss / share loss in growth). Not sized consumer
                briefs — full Consumer C needs panel / demand space.
              </p>
              <StoryCandidateOpportunities />
            </div>
          </div>
        </StorySection>
      ) : null}

      {showC('exec') ? (
        <div id="story-exec" className="m360-story-sec m360-story-sec--exec">
          <AssistantMarketReadout {...narrative} heading="Executive summary" headingLevel={3} />
        </div>
      ) : null}

      {/* Bain Landscape · Category */}
      {showC('category') ? (
      <StorySection
        id="story-category"
        title="Category"
        lede="How the competitive set is sized and growing, how it is structured by need-state, where Bayer plays, and which spaces look attractive."
      >
        <StoryBand
          viz={
            <>
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
                  <strong className={`m360-num ${tone(iberoBrandEvi, 100) || 'is-key'}`}>
                    {fmtEvi(iberoBrandEvi)}
                  </strong>
                  <span>
                    Whole Iberogast brand (Classic + Advance) versus the IBS need-state. 100 = growing in line with
                    IBS; above 100 = faster.
                  </span>
                </article>
              </section>
              {includeTb4l003 ? <StoryTb4l003KpiExtras /> : null}
            </>
          }
          {...ax.overview}
        />
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
        {includeTb4l003 ? (
          <>
            <StoryBand
              viz={
                <ChartCard
                  id="ch-structure-mekko"
                  wide
                  title="Market structure"
                  caption="Wider column = bigger need-state. Deeper slate in the column = Bayer’s share; lighter = competitors."
                >
                  <StoryMekkoChart />
                </ChartCard>
              }
              {...tb4lAx.structure}
            />
            <StoryBand
              viz={
                <ChartCard
                  id="ch-growth-share"
                  wide
                  title="Growth × Bayer share"
                  caption="Right = growing faster than the category; up = higher Bayer share. Bubble size = need-state sales. Soft amber lower-right = white space (fast growth, Bayer under 3%)."
                >
                  <StoryGrowthShareBubble />
                </ChartCard>
              }
              {...tb4lAx.growthShare}
            />
            <StoryBand
              viz={
                <ChartCard
                  id="ch-segment-scorecard"
                  wide
                  title="Segment scorecard"
                  caption="One row per need-state: size, growth, gap vs the category, Bayer stake, and the job in plain words."
                >
                  <StorySegmentScorecard />
                </ChartCard>
              }
              {...tb4lAx.scorecard}
            />
          </>
        ) : null}
        <StoryBand
          viz={
            <ChartCard
              id="ch-attract"
              wide
              title="Need-state size × growth"
              caption={
                includeTb4l003
                  ? `Sorted by size. Growth bars show pace vs the category. Tags name the job in plain words (defend pool, fight share leak, white-space candidate).`
                  : `Sorted by size. IBS is the pool (${fmtShare(ibs.shareOfCategoryPct)}). Antacids is the growth engine (${fmtPct(ant.growth1yPct)}). White-space candidate = Bayer share under 3% and faster than category.`
              }
            >
              <AttractivenessChart includeTb4l003={includeTb4l003} />
            </ChartCard>
          }
          {...ax.attract}
        />
        <StoryBand
          viz={
            <ChartCard
              id="ch-share"
              wide
              title="Bayer share change by need-state"
              caption={`Bayer set share ${fmtShare(cat.bayerShareMatPct)} (${fmtPp(cat.bayerShareChangePp)} vs last year). Open circle = previous year; filled = current. Rows ordered by largest share loss first — Antacids is the biggest drop. Need-states with no Bayer presence omitted.`}
            >
              <ShareChangeChart />
            </ChartCard>
          }
          {...ax.share}
        />
      </StorySection>
      ) : null}

      {/* Bain Landscape · Customers (channels) */}
      {showC('customers') ? (
      <StorySection
        id="story-customers"
        title="Customers"
        lede="Which channels make up the set, where euro growth comes from (price vs volume), and who is gaining or losing share in each."
      >
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
      ) : null}

      {/* Bain Landscape · Competition */}
      {showC('competition') ? (
      <StorySection
        id="story-competition"
        title="Competition"
        lede="Who leads the set and each need-state, and which Bayer lines outpace or lag their own segment."
      >
        <StoryBand
          viz={
            <ChartCard
              id="ch-top-brands"
              wide
              title="Top 10 brands in the competitive set"
              caption="Longer bar = bigger share of the competitive set. Numbers after each bar: share of set, then sales growth versus last year. Small ‘Other’ leftovers are left out so the cast stays readable."
            >
              <RankBars
                rows={CALC_TOP_BRANDS_IN_SET.map((b) => ({
                  key: b.brand,
                  name: b.brand,
                  bayer: b.isBayer,
                }))}
                value={(key) => CALC_TOP_BRANDS_IN_SET.find((b) => b.brand === key)?.shareOfSetPct ?? 0}
                label={(key) => {
                  const b = CALC_TOP_BRANDS_IN_SET.find((x) => x.brand === key);
                  if (!b) return '';
                  return (
                    <>
                      <Num kind="key">{fmtShare(b.shareOfSetPct)}</Num>
                      {' · '}
                      <Num v={b.growth1yPct}>{fmtPct(b.growth1yPct)}</Num>
                    </>
                  );
                }}
                detail={(key) => {
                  const b = CALC_TOP_BRANDS_IN_SET.find((x) => x.brand === key);
                  if (!b) return [];
                  return [
                    `Sales  ${fmtM(b.valueMatM)}`,
                    `Share of competitive set  ${fmtShare(b.shareOfSetPct)}`,
                    `Value growth YoY  ${fmtPct(b.growth1yPct)}`,
                    b.isBayer ? 'Bayer brand' : 'Competitor brand',
                  ];
                }}
              />
            </ChartCard>
          }
          {...ax.topBrands}
        />
        {includeTb4l003 ? (
          <StoryBand
            viz={
              <ChartCard
                id="ch-who-wins-all"
                wide
                title="Who wins inside each need-state"
                caption="Longer bar = bigger share of that need-state. Deeper slate + Bayer tag = Bayer. Right: share, sales vs last year, then EVI (100 = growing in line with the need-state)."
              >
                <StoryWhoWinsAll />
              </ChartCard>
            }
            {...tb4lAx.whoWinsAll}
          />
        ) : null}
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
                  return (
                    <>
                      <Num kind="key">{fmtShare(r?.shareMatPct ?? null)}</Num>
                      {' · EVI '}
                      <Num v={r?.evolutionIndex} kind="evi">
                        {fmtEvi(r?.evolutionIndex ?? null)}
                      </Num>
                    </>
                  );
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
                  return (
                    <>
                      <Num kind="key">{fmtShare(r?.shareMatPct ?? null)}</Num>
                      {' · EVI '}
                      <Num v={r?.evolutionIndex} kind="evi">
                        {fmtEvi(r?.evolutionIndex ?? null)}
                      </Num>
                    </>
                  );
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
      ) : null}

      {/* Bain Landscape · Consumers (POS proxy only) */}
      {showC('consumers') ? (
      <StorySection
        id="story-consumers"
        title="Consumers"
        lede="Bain asks about need-states, unmet needs, and whitespace. This pack has sell-out only — no household panel or shopper survey. Flags below are POS proxies for discussion, not sized consumer briefs."
      >
        {includeTb4l003 ? (
          <div id="story-candidates">
            <h3 className="m360-story-subhead">Preliminary opportunities · candidates</h3>
            <p className="m360-rep__lede m360-rep__lede--nested">
              What the structure map flagged for talk — not what to invest in. Same colors as signals; no € opportunity
              size.
            </p>
            <StoryCandidateOpportunities />
          </div>
        ) : (
          <div className="m360-c-stub" role="note">
            <p>
              <strong>No consumer panel in this pack.</strong> White-space and shopper questions need household
              penetration or demand-space research. Structure charts under Category still show Bayer presence vs
              growth as a sell-out proxy.
            </p>
          </div>
        )}
      </StorySection>
      ) : null}

      {/* Bain Landscape · Convincers (stub) */}
      {showC('convincers') ? (
      <StorySection
        id="story-convincers"
        title="Convincers"
        lede="Who shapes recommendation — HCPs, KOLs, influencers, authorities — and what drives it."
      >
        <div className="m360-c-stub" role="note">
          <p>
            <strong>Not in Sirius sell-out.</strong> Bain’s Convincer module uses HCP survey, social listening, and
            recommendation drivers (clinical evidence, samples, guidelines). This Market pack does not include those
            sources — leave blank until research is loaded.
          </p>
        </div>
      </StorySection>
      ) : null}

      {/* Bain Landscape · Culture / Country (stub) */}
      {showC('culture') ? (
      <StorySection
        id="story-culture"
        title="Culture / Country"
        lede="Cultural trends, self-care attitudes, and regulatory or societal shifts that shape the category."
      >
        <div className="m360-c-stub" role="note">
          <p>
            <strong>Not in Sirius sell-out.</strong> Bain’s Culture / Country module uses cultural insights,
            Euromonitor-style secondary research, and social listening. This Market pack does not include those
            sources.
          </p>
        </div>
      </StorySection>
      ) : null}

      {/* Define bridge: summary → signals → actions */}
      {showC('synthesis') ? (
      <>
      <StorySection
        id="story-synthesis"
        title="Summary · synthesis & key implications"
        lede="Synthesize the 6C evidence, read traffic-light signals, then act."
      >
        <nav className="m360-closeout-nav" aria-label="Close-out steps">
          <a href="#story-synthesis">1 · Summary</a>
          <a href="#story-implications">2 · Signals</a>
          <a href="#story-actions">3 · Actions</a>
          {includeTb4l003 ? <a href="#story-consumers">Consumers · candidates</a> : null}
        </nav>
        <MarketSynthesis
          includeTb4l003={includeTb4l003}
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
              Each card: what it means for Bayer, then the numbers. Problem → Strength → Watch. Same colors as
              actions below.
            </p>
          </header>
          <SignalLegend />
          <ul className="m360-signal-grid">
            <SignalCard
              tone="bad"
              label="Problem"
              title="Bayer is losing Antacids share — Gaviscon is taking the growth"
              why="Act here first: soft set share is an Antacids leak, not an IBS problem. Contest Gaviscon where the need-state is growing fastest."
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
              why="Protect the pool: keep Classic as the cash engine, and put incremental IBS growth on Advance — the line already ahead of the need-state."
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
              why="Don’t run one Digestive plan: Pharmacies still hold most euros; E-commerce holds most of the set’s new euros — Iberogast must win both games."
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
              why="Don’t brief “sell more Classic packs”: category euros grow faster than packs, and IBS pack sell-out is soft — growth here is price or mix, not volume."
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
            {includeTb4l003 && structS1.length + structS3.length > 0 ? (
              <SignalCard
                tone="watch"
                label="Watch"
                title="Other need-states are flags, not briefs"
                why="PPIs (and any similar flags) show low Bayer presence — park them under Consumers · candidates. Do not open an entry project from this page alone."
                evidence={
                  <>
                    {structS1.length > 0 ? (
                      <>
                        Faster growth, little Bayer:{' '}
                        {structS1.map((s) => shortSegmentName(s.segment)).join(', ')}.
                      </>
                    ) : null}
                    {structS1.length > 0 && structS3.length > 0 ? ' ' : null}
                    {structS3.length > 0 ? (
                      <>
                        Low Bayer, softer growth:{' '}
                        {structS3.map((s) => shortSegmentName(s.segment)).join(', ')}.
                      </>
                    ) : null}{' '}
                    Detail under Consumers · candidates.
                  </>
                }
              />
            ) : null}
          </ul>
        </div>
      </StorySection>

      <StorySection
        id="story-actions"
        title="Recommended actions"
        lede="What to do next, in order — Act (red), Protect (green), Watch (amber)."
      >
        <ol className="m360-action-list">
          <ActionCard
            tone="bad"
            step={1}
            title="Antacids vs Gaviscon — this month"
            body={
              <>
                Build one competitive page for Gaviscon, Talcid and Rennie before the next cycle. Bayer Antacids share
                moved <Num v={ant.bayerShareChangePp}>{fmtPp(ant.bayerShareChangePp)}</Num> in a need-state growing{' '}
                <Num v={ant.growth1yPct}>{fmtPct(ant.growth1yPct)}</Num>. Split Pharmacy vs E-commerce — Gaviscon is{' '}
                <Num v={gavisconEcomm?.valueGrowthPct}>{fmtPct(gavisconEcomm?.valueGrowthPct ?? null)}</Num> online.
                Ask listings, price and promotions.
              </>
            }
          />
          <ActionCard
            tone="good"
            step={2}
            title="Iberogast — split Classic defend / Advance grow"
            body={
              <>
                Keep Classic as the IBS defend plan (
                <Num kind="key">{fmtShare(classic?.shareMatPct ?? null)}</Num> of IBS, EVI{' '}
                <Num v={classic?.evolutionIndex} kind="evi">
                  {fmtEvi(classic?.evolutionIndex ?? null)}
                </Num>
                ). Put incremental growth money and activity on Advance (EVI{' '}
                <Num v={advance?.evolutionIndex} kind="evi">
                  {fmtEvi(advance?.evolutionIndex ?? null)}
                </Num>
                ). IBS packs <Num v={ibs.unitGrowth1yPct}>{fmtPct(ibs.unitGrowth1yPct)}</Num> — a Classic volume push
                alone is a weak bet.
              </>
            }
          />
          <ActionCard
            tone="watch"
            step={3}
            title="Channel plan — protect Pharma, feed E-commerce"
            body={
              <>
                Write two channel plays, not one average. Pharmacies are{' '}
                <Num kind="key">{fmtShare(CALC_CHANNEL_PHARMA.shareOfSetPct)}</Num> of the set — protect Iberogast
                share there (
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
                Leave PPIs off the investment list for now. Bayer has{' '}
                <Num kind="key">{fmtBayerShare(narrative.ppi.bayerShareMatPct)}</Num> in this extract (no named Bayer
                brands in the set), and the need-state is not the growth engine (
                <Num v={narrative.ppi.growth1yPct}>{fmtPct(narrative.ppi.growth1yPct)}</Num> vs category{' '}
                <Num v={cat.growth1yPct}>{fmtPct(cat.growth1yPct)}</Num>). There is no entry size in euros here.
              </>
            }
          />
          {includeTb4l003 ? (
            <ActionCard
              tone="watch"
              step={5}
              title="Park structure candidates — discuss only"
              body={
                <>
                  Use the Consumers · candidates list as a talk track
                  {structS1.length + structS3.length > 0 ? (
                    <>
                      {' '}
                      for {[...structS1, ...structS3].map((s) => shortSegmentName(s.segment)).join(', ')}
                    </>
                  ) : null}
                  . Do not open an entry or delist brief from growth and Bayer presence alone — those flags are not
                  sized opportunities.
                </>
              }
            />
          ) : null}
        </ol>
      </StorySection>
      </>
      ) : null}

      <AssistantMarketDataCare checks={narrative.checks} />
    </div>
    </StoryBandLayoutCtx.Provider>
  );
}
