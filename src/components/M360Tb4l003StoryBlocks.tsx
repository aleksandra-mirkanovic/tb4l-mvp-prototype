/**
 * TB4L-003 building-block visuals adapted for Market v3 story chrome.
 * Gated by `M360_TB4L003_IN_STORY` in the parent. Uses Market color rules (slate / change).
 * Charts are interactive (hover tooltips) — required for Market story and replication prompts.
 */
import { useRef, useState } from 'react';
import { M360_CHART, m360ChangeColor } from '../data/m360ChartColors';
import {
  SCENARIO_COPY,
  TB4L003_CATEGORY,
  TB4L003_SEGMENTS,
  plainNeedStateJob,
  shortSegmentName,
  topSubBrandsForSegment,
  type ScenarioCode,
  type Tb4l003SegmentCalc,
} from '../data/tb4l003Calc';
import { buildTb4l003Insights } from '../data/tb4l003Insights';

function fmtM(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return 'N/A';
  return `€${v.toFixed(1)}m`;
}
function fmtPct(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return 'N/A';
  return `${v > 0 ? '+' : ''}${v.toFixed(1)}%`;
}
function fmtPp(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return 'N/A';
  return `${v > 0 ? '+' : ''}${v.toFixed(1)} pp`;
}
function fmtShare(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return 'N/A';
  return `${v.toFixed(1)}%`;
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

export function scenarioForSegment(segment: string): Tb4l003SegmentCalc | undefined {
  return TB4L003_SEGMENTS.find((s) => s.segment === segment);
}

/** Extra KPI tiles from TB4L-003 (pairs with existing 3 overview KPIs). */
function changeTone(v: number | null | undefined, pivot = 0): string {
  if (v == null || !Number.isFinite(v)) return 'is-key';
  if (v > pivot) return 'is-up';
  if (v < pivot) return 'is-down';
  return 'is-flat';
}

export function StoryTb4l003KpiExtras() {
  const cat = TB4L003_CATEGORY;
  const cagr = cat.cagr3yPct ?? cat.cagr2yPct;
  const use2y = cat.cagr3yPct == null && cat.cagr2yPct != null;
  return (
    <section className="m360-rep-kpis m360-tb4l-kpis" aria-label="Additional category measures">
      <article>
        <p>Unit growth 1y</p>
        <strong className={'m360-num ' + changeTone(cat.unitGrowth1yPct)}>
          {fmtPct(cat.unitGrowth1yPct)}
        </strong>
        <span>
          Pack sell-out for the same competitive set, latest 12 months versus last year. Read next to value growth
          above — value can run ahead of packs.
        </span>
      </article>
      <article>
        <p>Value CAGR {use2y ? '(2y)' : '(3y)'}</p>
        <strong className={'m360-num ' + changeTone(cagr)}>{fmtPct(cagr)}</strong>
        <span>
          {use2y
            ? 'Average yearly value growth over two years — used because a full three-year window is not yet available in this extract.'
            : 'Average yearly value growth over three years for the competitive set.'}
        </span>
      </article>
      <article className={changeTone(cat.bayerShareChangePp) === 'is-down' ? 'is-soft' : undefined}>
        <p>Bayer sales in set</p>
        <strong className="m360-num is-key">{fmtM(cat.bayerValueMatM)}</strong>
        <span>
          Bayer brands’ sell-out inside the same competitive set (not Iberogast alone). Share of set{' '}
          <strong className="m360-num is-key">{fmtShare(cat.bayerShareMatPct)}</strong>
          ,{' '}
          <strong className={'m360-num ' + changeTone(cat.bayerShareChangePp)}>
            {fmtPp(cat.bayerShareChangePp)}
          </strong>{' '}
          versus last year.
        </span>
      </article>
    </section>
  );
}

/** Chart 1 — mekko structure (interactive). */
export function StoryMekkoChart() {
  const { wrap, tip, show, hide } = useChartTip();
  const [focus, setFocus] = useState<string | null>(null);
  const segs = TB4L003_SEGMENTS;
  const total = segs.reduce((s, r) => s + r.valueMatM, 0) || 1;
  return (
    <div className="m360-viz m360-tb4l-mekko" ref={wrap} onMouseLeave={hide}>
      <p className="m360-tb4l-mekko__sub">Category total {fmtM(TB4L003_CATEGORY.valueMatM)} · hover a column</p>
      <div className="m360-tb4l-mekko__cols" role="img" aria-label="Market structure by need-state">
        {segs.map((s) => {
          const w = (s.valueMatM / total) * 100;
          const bayer = Math.max(0, Math.min(100, s.bayerShareMatPct ?? 0));
          const low = (s.bayerShareMatPct ?? 100) < 3;
          const on = !focus || focus === s.segment;
          return (
            <div
              key={s.segment}
              className={`m360-tb4l-mekko__col${on ? '' : ' is-off'}`}
              style={{ flex: `${w} 1 0` }}
              onMouseEnter={() => setFocus(s.segment)}
              onMouseMove={(e) =>
                show(e, {
                  color: low ? M360_CHART.loss : M360_CHART.levelBarBayer,
                  title: shortSegmentName(s.segment),
                  lines: [
                    `Sales  ${fmtM(s.valueMatM)} (${fmtShare(s.shareOfCategoryPct)} of set)`,
                    `Bayer share  ${fmtShare(s.bayerShareMatPct)}`,
                    `Value growth  ${fmtPct(s.growth1yPct)} · vs category ${fmtPp(s.growthVsCategoryPp)}`,
                    `Share change  ${fmtPp(s.bayerShareChangePp)}`,
                    `Job  ${plainNeedStateJob(s)}`,
                    `CAGR  ${s.cagrBasis === 'n/a' ? 'N/A' : `${fmtPct(s.cagrPct)} (${s.cagrBasis})`}`,
                  ],
                })
              }
              onMouseLeave={() => setFocus(null)}
            >
              <div className="m360-tb4l-mekko__stack">
                <div
                  className="m360-tb4l-mekko__comp"
                  style={{ height: `${100 - bayer}%`, background: M360_CHART.levelBar }}
                />
                <div
                  className={`m360-tb4l-mekko__bayer${low ? ' is-low' : ''}`}
                  style={{ height: `${bayer}%`, background: M360_CHART.levelBarBayer }}
                >
                  {bayer >= 10 ? fmtShare(s.bayerShareMatPct) : null}
                </div>
              </div>
              <div className="m360-tb4l-mekko__lab">
                <b>{shortSegmentName(s.segment)}</b>
                <span className="m360-num is-key">{fmtM(s.valueMatM)}</span>
              </div>
            </div>
          );
        })}
      </div>
      <ul className="m360-tb4l-mekko__row">
        {segs.map((s) => (
            <li key={s.segment}>
              <b>{shortSegmentName(s.segment)}</b> value{' '}
              <span className={'m360-num ' + changeTone(s.growth1yPct)}>{fmtPct(s.growth1yPct)}</span>
              {' · vs category '}
              <span className={'m360-num ' + changeTone(s.growthVsCategoryPp)}>
                {fmtPp(s.growthVsCategoryPp)}
              </span>
            </li>
          ))}
      </ul>
      <ChartTip tip={tip} />
    </div>
  );
}

/** Chart 2 — growth × share bubble (interactive). */
export function StoryGrowthShareBubble() {
  const { wrap, tip, show, hide } = useChartTip();
  const [focus, setFocus] = useState<string | null>(null);
  const segs = TB4L003_SEGMENTS;
  const catG = TB4L003_CATEGORY.growth1yPct ?? 0;
  const W = 640;
  const H = 300;
  const L = 52;
  const R = 20;
  const T = 20;
  const B = 40;
  const xs = segs.map((s) => s.growth1yPct ?? 0);
  const ys = segs.map((s) => s.bayerShareMatPct ?? 0);
  const xPad = Math.max(0.6, (Math.max(...xs, catG) - Math.min(...xs, catG)) * 0.08);
  const minX = Math.min(...xs, catG) - xPad;
  const maxX = Math.max(...xs, catG) + xPad;
  const maxY = Math.max(...ys, 3) * 1.08;
  const xAt = (v: number) => L + ((v - minX) / (maxX - minX || 1)) * (W - L - R);
  const yAt = (v: number) => T + (1 - v / (maxY || 1)) * (H - T - B);
  const maxVal = Math.max(...segs.map((s) => s.valueMatM), 1);
  const rAt = (v: number) => 12 + Math.sqrt(v / maxVal) * 30;
  const xCat = xAt(catG);
  const y3 = yAt(3);
  const plotBottom = H - B;
  // White space = faster than category (right) AND Bayer under 3% (below the 3% line).
  const zoneX = Math.min(xCat, W - R);
  const zoneW = Math.max(0, W - R - zoneX);
  const zoneY = Math.min(y3, plotBottom);
  const zoneH = Math.max(0, plotBottom - zoneY);

  return (
    <div className="m360-viz m360-tb4l-bubble" ref={wrap} onMouseLeave={hide}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Growth versus Bayer share">
        {zoneW > 0 && zoneH > 0 ? (
          <rect x={zoneX} y={zoneY} width={zoneW} height={zoneH} fill={M360_CHART.loss} opacity={0.12} />
        ) : null}
        <line x1={xCat} x2={xCat} y1={T} y2={plotBottom} stroke="currentColor" strokeDasharray="5 4" opacity={0.45} />
        <line x1={L} x2={W - R} y1={y3} y2={y3} stroke="currentColor" strokeDasharray="2 3" opacity={0.45} />
        <text x={xCat + 4} y={T + 12} fontSize="11" fill="currentColor" opacity={0.7}>
          Category {fmtPct(TB4L003_CATEGORY.growth1yPct)}
        </text>
        <text x={L + 4} y={y3 - 4} fontSize="11" fill="currentColor" opacity={0.7}>
          3% Bayer
        </text>
        {segs.map((s) => {
          const cx = xAt(s.growth1yPct ?? 0);
          const cy = yAt(s.bayerShareMatPct ?? 0);
          const present = (s.bayerShareMatPct ?? 0) >= 3;
          const on = !focus || focus === s.segment;
          return (
            <g
              key={s.segment}
              opacity={on ? 1 : 0.22}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setFocus(s.segment)}
              onMouseMove={(e) =>
                show(e, {
                  color: present ? M360_CHART.levelBarBayer : M360_CHART.loss,
                  title: shortSegmentName(s.segment),
                  lines: [
                    `Value growth  ${fmtPct(s.growth1yPct)}`,
                    `vs category  ${fmtPp(s.growthVsCategoryPp)}`,
                    `Bayer share  ${fmtShare(s.bayerShareMatPct)}`,
                    `Sales  ${fmtM(s.valueMatM)}`,
                    `Job  ${plainNeedStateJob(s)}`,
                  ],
                })
              }
              onMouseLeave={() => setFocus(null)}
            >
              <circle
                cx={cx}
                cy={cy}
                r={rAt(s.valueMatM)}
                fill={present ? M360_CHART.levelBarBayer : M360_CHART.loss}
                fillOpacity={0.88}
              />
              <text x={cx} y={cy + rAt(s.valueMatM) + 14} fontSize="11" textAnchor="middle" fill="currentColor">
                {shortSegmentName(s.segment)}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="m360-tb4l-note">
        Bubble size = need-state sales. Deeper slate = Bayer present (≥3%); amber = little or no presence. Soft
        lower-right = faster than category with Bayer under 3% (white-space candidates).
      </p>
      <ChartTip tip={tip} />
    </div>
  );
}

/** Chart 4 — segment scorecard (row hover). */
export function StorySegmentScorecard() {
  const { wrap, tip, show, hide } = useChartTip();
  const [focus, setFocus] = useState<string | null>(null);
  return (
    <div className="m360-viz m360-tb4l-score-wrap" ref={wrap} onMouseLeave={hide}>
      <table className="m360-tb4l-score">
        <thead>
          <tr>
            <th>Need-state</th>
            <th>Size €m</th>
            <th>Value 1y</th>
            <th>vs cat.</th>
            <th>Units 1y</th>
            <th>CAGR</th>
            <th>Bayer share</th>
            <th>Share Δ</th>
            <th>Job</th>
          </tr>
        </thead>
        <tbody>
          {TB4L003_SEGMENTS.map((s) => (
            <tr
              key={s.segment}
              className={!focus || focus === s.segment ? undefined : 'is-off'}
              onMouseEnter={() => setFocus(s.segment)}
              onMouseMove={(e) =>
                show(e, {
                  color: m360ChangeColor(s.growthVsCategoryPp),
                  title: shortSegmentName(s.segment),
                  lines: [
                    `Sales  ${fmtM(s.valueMatM)}`,
                    `Value ${fmtPct(s.growth1yPct)} · units ${fmtPct(s.unitGrowth1yPct)}`,
                    `vs category  ${fmtPp(s.growthVsCategoryPp)}`,
                    `Bayer  ${fmtShare(s.bayerShareMatPct)} (${fmtPp(s.bayerShareChangePp)})`,
                    `Job  ${plainNeedStateJob(s)}`,
                  ],
                })
              }
              onMouseLeave={() => setFocus(null)}
            >
              <td>{shortSegmentName(s.segment)}</td>
              <td className="m360-num is-key">{s.valueMatM.toFixed(1)}</td>
              <td className={'m360-num ' + changeTone(s.growth1yPct)}>{fmtPct(s.growth1yPct)}</td>
              <td className={'m360-num ' + changeTone(s.growthVsCategoryPp)}>
                {fmtPp(s.growthVsCategoryPp)}
              </td>
              <td className={'m360-num ' + changeTone(s.unitGrowth1yPct)}>{fmtPct(s.unitGrowth1yPct)}</td>
              <td className={'m360-num ' + changeTone(s.cagrPct)}>
                {s.cagrBasis === 'n/a' ? 'N/A' : `${fmtPct(s.cagrPct)}${s.cagrBasis === '2y' ? '*' : ''}`}
              </td>
              <td className={(s.bayerShareMatPct ?? 100) < 3 ? 'm360-num is-down' : 'm360-num is-key'}>
                {fmtShare(s.bayerShareMatPct)}
              </td>
              <td className={'m360-num ' + changeTone(s.bayerShareChangePp)}>
                {fmtPp(s.bayerShareChangePp)}
              </td>
              <td>{plainNeedStateJob(s)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="m360-tb4l-note">* 2y CAGR where 3y is incomplete. Hover a row for detail.</p>
      <ChartTip tip={tip} />
    </div>
  );
}

/** Who wins — all need-states (interactive rows). */
export function StoryWhoWinsAll() {
  const { wrap, tip, show, hide } = useChartTip();
  const [focus, setFocus] = useState<string | null>(null);
  return (
    <div className="m360-viz m360-tb4l-wins" ref={wrap} onMouseLeave={hide}>
      {TB4L003_SEGMENTS.map((s) => {
        const rows = topSubBrandsForSegment(s.segment, 7);
        const maxShare = Math.max(...rows.map((r) => r.shareMatPct), 1);
        return (
          <article key={s.segment}>
            <h4>
              {shortSegmentName(s.segment)} · <span className="m360-num is-key">{fmtM(s.valueMatM)}</span> ·{' '}
              <span className={'m360-num ' + changeTone(s.growth1yPct)}>{fmtPct(s.growth1yPct)}</span>
            </h4>
            <ul>
              {rows.map((r) => {
                const ei = r.evolutionIndex;
                const beat = ei != null && ei >= 100;
                const color = r.isBayer
                  ? M360_CHART.levelBarBayer
                  : m360ChangeColor(ei != null ? ei - 100 : 0);
                const id = `${s.segment}-${r.label}`;
                const on = !focus || focus === id;
                return (
                  <li
                    key={r.label}
                    className={on ? undefined : 'is-off'}
                    onMouseEnter={() => setFocus(id)}
                    onMouseMove={(e) =>
                      show(e, {
                        color,
                        title: r.isBayer ? `${r.label} (Bayer)` : r.label,
                        lines: [
                          shortSegmentName(s.segment),
                          `Share of need-state  ${fmtShare(r.shareMatPct)}`,
                          `Value growth  ${fmtPct(r.growth1yPct)}`,
                          `EVI  ${ei != null ? Math.round(ei) : 'N/A'} (100 = in line)`,
                          beat ? 'Pace  Ahead of need-state' : 'Pace  With / behind need-state',
                        ],
                      })
                    }
                    onMouseLeave={() => setFocus(null)}
                  >
                    <span>{r.label}</span>
                    <div className="m360-tb4l-wins__bar" aria-hidden>
                      <i style={{ width: `${(r.shareMatPct / maxShare) * 100}%`, background: color }} />
                    </div>
                    <small>
                      <span className="m360-num is-key">{fmtShare(r.shareMatPct)}</span>
                      {' · '}
                      <span className={'m360-num ' + changeTone(r.growth1yPct)}>{fmtPct(r.growth1yPct)}</span>
                      {ei != null ? (
                        <>
                          {' · EVI '}
                          <span className={'m360-num ' + changeTone(ei, 100)}>{Math.round(ei)}</span>
                        </>
                      ) : null}
                    </small>
                  </li>
                );
              })}
            </ul>
          </article>
        );
      })}
      <ChartTip tip={tip} />
    </div>
  );
}

function scenarioBlurb(code: ScenarioCode): string {
  if (code === 'U0') return 'No classification — resolve the failed axis first.';
  return SCENARIO_COPY[code].interpretation;
}

/** Scenario table — row hover. */
export function StoryScenarioTable() {
  const { wrap, tip, show, hide } = useChartTip();
  const [focus, setFocus] = useState<string | null>(null);
  return (
    <div className="m360-viz m360-tb4l-score-wrap" ref={wrap} onMouseLeave={hide}>
      <table className="m360-tb4l-score m360-tb4l-scen">
        <thead>
          <tr>
            <th>Need-state</th>
            <th>Code</th>
            <th>Growth vs category</th>
            <th>Bayer</th>
            <th>Interpretation</th>
            <th>Review</th>
          </tr>
        </thead>
        <tbody>
          {TB4L003_SEGMENTS.map((s) => {
            const copy =
              s.scenarioCode === 'U0'
                ? {
                    interpretation: scenarioBlurb('U0'),
                    decisionToReview: `Failed axis: ${s.failedAxis ?? 'unknown'}.`,
                    evidenceNeeded: 'State which axis failed and the next evidence task.',
                  }
                : SCENARIO_COPY[s.scenarioCode];
            return (
              <tr
                key={s.segment}
                className={!focus || focus === s.segment ? undefined : 'is-off'}
                onMouseEnter={() => setFocus(s.segment)}
                onMouseMove={(e) =>
                  show(e, {
                    title: `${shortSegmentName(s.segment)} · ${s.scenarioCode}`,
                    lines: [
                      copy.interpretation,
                      `Review  ${copy.decisionToReview}`,
                      'evidenceNeeded' in copy ? `Evidence  ${copy.evidenceNeeded}` : '',
                    ].filter(Boolean),
                  })
                }
                onMouseLeave={() => setFocus(null)}
              >
                <td>{shortSegmentName(s.segment)}</td>
                <td>
                  <em className="m360-tb4l-code">{s.scenarioCode}</em>
                </td>
                <td>
                  {fmtPp(s.growthVsCategoryPp)} ({s.growthStatus})
                </td>
                <td>
                  {fmtShare(s.bayerShareMatPct)} ({s.shareStatus})
                </td>
                <td>{copy.interpretation}</td>
                <td>{copy.decisionToReview}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <ChartTip tip={tip} />
    </div>
  );
}

/** Candidate opportunities — not recommendations. */
export function StoryCandidateOpportunities() {
  const { opportunities } = buildTb4l003Insights();
  const types = ['white space', 'near-miss', 'share loss in growth'] as const;
  return (
    <div className="m360-tb4l-opps">
      <p className="m360-tb4l-opps__lede">
        From growth and Bayer presence only. Labelled candidates for discussion — not investment, entry, or delisting
        decisions. No € opportunity sizing.
      </p>
      {types.map((type) => {
        const rows = opportunities.filter((o) => o.type === type);
        return (
          <div key={type} className="m360-tb4l-opps__block">
            <h4>{type}</h4>
            {rows.length === 0 ? (
              <p className="m360-tb4l-opps__empty">None in this MAT window.</p>
            ) : (
              <ul>
                {rows.map((o) => (
                  <li key={`${o.type}-${o.segment}`}>
                    <p className="m360-tb4l-opps__tag">{o.label}</p>
                    <strong>{shortSegmentName(o.segment)}</strong>
                    <p>
                      <span className="m360-num is-key">{fmtM(o.valueEurM)}</span>
                      {' · vs category '}
                      <span className={'m360-num ' + changeTone(o.growthVsCategoryPp)}>
                        {fmtPp(o.growthVsCategoryPp)}
                      </span>
                      {' · Bayer '}
                      <span className="m360-num is-key">{fmtShare(o.bayerSharePct)}</span> (
                      <span className={'m360-num ' + changeTone(o.bayerShareChangePp)}>
                        {fmtPp(o.bayerShareChangePp)}
                      </span>
                      )
                    </p>
                    <p>
                      <b>For:</b> {o.rationaleFor}
                    </p>
                    <p>
                      <b>Against:</b> {o.rationaleAgainst}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

