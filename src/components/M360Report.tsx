import { useRef, useState, type ReactNode } from 'react';
import {
  CALC_CATEGORY,
  CALC_IBEROGAST,
  CALC_SEGMENTS,
  CALC_SUBBRANDS,
  largestBayerSubBrand,
} from '../data/m360Charts';
import { ASSISTANT_NARRATIVE_V2 } from '../config/assistantNarrative';
import { M360_METADATA, M360_RETRIEVAL_PARAMS } from '../data/m360Retrieval';
import {
  AssistantMarketActions,
  AssistantMarketInsights,
  AssistantMarketReadout,
  buildMarketNarrativeProps,
} from './AssistantNarrative';
import './M360Report.css';

function fmtM(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return 'Not available';
  return `EUR ${v.toFixed(1)}m`;
}
function fmtPct(v: number | null): string {
  if (v === null || !Number.isFinite(v)) return 'Not available';
  return `${v > 0 ? '+' : ''}${v.toFixed(1)}%`;
}
function fmtShare(v: number | null): string {
  if (v === null || !Number.isFinite(v)) return 'Not available';
  return `${v.toFixed(1)}%`;
}
function fmtEvi(v: number | null): string {
  if (v === null || !Number.isFinite(v)) return 'Not available';
  return v.toFixed(0);
}
function fmtPp(v: number | null): string {
  if (v === null || !Number.isFinite(v)) return 'Not available';
  return `${v >= 0 ? '+' : ''}${v.toFixed(1)} points`;
}

function shortName(segment: string): string {
  if (segment.startsWith('IBS')) return 'IBS';
  if (segment.startsWith('ANTACID')) return 'Antacids';
  if (segment.startsWith('GAS')) return 'Gas';
  if (segment.startsWith('PPI')) return 'PPIs';
  return segment.split(' ')[0];
}

function tone(v: number | null, pivot = 0): 'is-up' | 'is-down' | 'is-flat' | '' {
  if (v === null || !Number.isFinite(v)) return '';
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

function ValueTrendChart() {
  const { wrap, tip, show, hide } = useChartTip();
  const [focus, setFocus] = useState<string | null>(null);
  const series = CALC_SEGMENTS.map((s) => ({
    key: s.segment,
    name: shortName(s.segment),
    color: colorForSegment(s.segment),
    values: [s.value2ya, s.valueYa, s.valueMat].map((v) => (v == null ? null : v / 1_000_000)),
  }));
  const ymax = Math.max(...series.flatMap((s) => s.values.filter((v): v is number => v !== null)), 1) * 1.12;
  const W = 640;
  const H = 280;
  const L = 52;
  const R = 18;
  const T = 18;
  const B = 40;
  const iw = W - L - R;
  const ih = H - T - B;
  const xAt = (i: number) => L + (i * iw) / 2;
  const yAt = (v: number) => T + ih - (v / ymax) * ih;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((p) => p * ymax);
  const labels = ['2 years ago', 'Last year', 'Latest'];

  return (
    <div className="m360-viz" ref={wrap} onMouseLeave={hide}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Segment sales from two years ago to the latest 12 months">
        {ticks.map((t) => (
          <g key={t}>
            <line className="m360-viz__grid" x1={L} x2={W - R} y1={yAt(t)} y2={yAt(t)} />
            <text className="m360-viz__tick" x={L - 8} y={yAt(t) + 4} textAnchor="end">
              {t === 0 ? '0' : t.toFixed(0)}
            </text>
          </g>
        ))}
        {labels.map((lab, i) => (
          <text key={lab} className="m360-viz__tick" x={xAt(i)} y={H - 14} textAnchor="middle">
            {lab}
          </text>
        ))}
        {series.map((s) => {
          const pts = s.values
            .map((v, i) => (v === null ? null : `${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`))
            .filter((p): p is string => p !== null);
          const on = !focus || focus === s.key;
          return (
            <g key={s.key} className={on ? 'is-on' : 'is-off'} opacity={on ? 1 : 0.12}>
              <polyline className="m360-viz__line" points={pts.join(' ')} stroke={s.color} />
              <polyline
                className="m360-viz__hit"
                points={pts.join(' ')}
                onMouseEnter={() => setFocus(s.key)}
                onMouseMove={(e) =>
                  show(e, {
                    color: s.color,
                    title: s.name,
                    lines: labels.map((lab, i) => {
                      const v = s.values[i];
                      return `${lab}  ${v === null ? 'Not available' : `EUR ${v.toFixed(1)}m`}`;
                    }),
                  })
                }
              />
              {s.values.map((v, i) =>
                v === null ? null : (
                  <circle
                    key={i}
                    className="m360-viz__dot"
                    cx={xAt(i)}
                    cy={yAt(v)}
                    r={focus === s.key ? 6 : 4.5}
                    fill={s.color}
                    onMouseEnter={(e) => {
                      setFocus(s.key);
                      show(e, {
                        color: s.color,
                        title: `${s.name} · ${labels[i]}`,
                        lines: [`Sales  EUR ${v.toFixed(1)}m`],
                      });
                    }}
                  />
                ),
              )}
            </g>
          );
        })}
        <text className="m360-viz__axis" x={16} y={14}>
          EUR m
        </text>
      </svg>
      <ul className="m360-viz__legend">
        {series.map((s) => (
          <li key={s.key}>
            <button
              type="button"
              className={focus === s.key ? 'is-on' : undefined}
              onMouseEnter={(e) => {
                setFocus(s.key);
                show(e, {
                  color: s.color,
                  title: s.name,
                  lines: labels.map((lab, i) => {
                    const v = s.values[i];
                    return `${lab}  ${v === null ? 'Not available' : `EUR ${v.toFixed(1)}m`}`;
                  }),
                });
              }}
              onMouseLeave={() => setFocus(null)}
            >
              <i style={{ background: s.color }} />
              {s.name}
            </button>
          </li>
        ))}
      </ul>
      <ChartTip tip={tip} />
    </div>
  );
}

function ShareBarsChart() {
  const { wrap, tip, show, hide } = useChartTip();
  const [focus, setFocus] = useState<string | null>(null);
  const rows = CALC_SEGMENTS;
  const ymax = Math.max(...rows.flatMap((s) => [s.bayerShareYaPct ?? 0, s.bayerShareMatPct ?? 0]), 10) * 1.15;
  const W = 520;
  const H = 260;
  const L = 44;
  const R = 12;
  const T = 16;
  const B = 48;
  const iw = W - L - R;
  const ih = H - T - B;
  const groupW = iw / rows.length;
  const barW = groupW * 0.28;
  const yAt = (v: number) => T + ih - (v / ymax) * ih;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((p) => p * ymax);

  return (
    <div className="m360-viz" ref={wrap} onMouseLeave={hide}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Bayer market share previous MAT 12M versus current MAT 12M">
        {ticks.map((t) => (
          <g key={t}>
            <line className="m360-viz__grid" x1={L} x2={W - R} y1={yAt(t)} y2={yAt(t)} />
            <text className="m360-viz__tick" x={L - 6} y={yAt(t) + 4} textAnchor="end">
              {t.toFixed(0)}%
            </text>
          </g>
        ))}
        {rows.map((s, i) => {
          const cx = L + i * groupW + groupW / 2;
          const ya = s.bayerShareYaPct ?? 0;
          const mat = s.bayerShareMatPct ?? 0;
          const on = !focus || focus === s.segment;
          const color = colorForSegment(s.segment);
          return (
            <g
              key={s.segment}
              opacity={on ? 1 : 0.18}
              onMouseEnter={() => setFocus(s.segment)}
              onMouseMove={(e) =>
                show(e, {
                  color,
                  title: shortName(s.segment),
                  lines: [
                    `Previous MAT 12M  ${fmtShare(s.bayerShareYaPct)}`,
                    `Current MAT 12M  ${fmtShare(s.bayerShareMatPct)}`,
                    `Change  ${fmtPp(s.bayerShareChangePp)} vs previous MAT 12M`,
                  ],
                })
              }
              onMouseLeave={() => setFocus(null)}
            >
              <rect x={cx - groupW / 2 + 4} y={T} width={groupW - 8} height={ih} fill="transparent" />
              <rect
                className="m360-viz__bar is-ya"
                x={cx - barW - 3}
                y={yAt(ya)}
                width={barW}
                height={Math.max(0, yAt(0) - yAt(ya))}
                rx="3"
              />
              <rect
                className="m360-viz__bar is-mat"
                x={cx + 3}
                y={yAt(mat)}
                width={barW}
                height={Math.max(0, yAt(0) - yAt(mat))}
                rx="3"
              />
              <text className="m360-viz__tick" x={cx} y={H - 28} textAnchor="middle">
                {shortName(s.segment)}
              </text>
              <text className={`m360-viz__pp ${tone(s.bayerShareChangePp)}`} x={cx} y={H - 12} textAnchor="middle">
                {fmtPp(s.bayerShareChangePp)}
              </text>
            </g>
          );
        })}
      </svg>
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
    <div className="m360-viz" ref={wrap} onMouseLeave={hide}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Bayer sub-brand evolution index">
        <line className="m360-viz__ref" x1={x100} x2={x100} y1={T} y2={H - 24} />
        <text className="m360-viz__tick" x={x100} y={H - 8} textAnchor="middle">
          Growing with the market
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
                    `Relative growth  ${fmtEvi(r.evolutionIndex)} (100 = in line with the market)`,
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
              <text className="m360-viz__val" x={x + (beat ? 10 : -10)} y={y + 4} textAnchor={beat ? 'start' : 'end'}>
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

function RankBars({
  rows,
  value,
  label,
  detail,
}: {
  rows: { key: string; name: string; bayer?: boolean; color?: string }[];
  value: (key: string) => number;
  label: (key: string) => string;
  detail: (key: string) => string[];
}) {
  const { wrap, tip, show, hide } = useChartTip();
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
        {rows.map((r) => (
          <li
            key={r.key}
            className={r.bayer ? 'is-bayer' : undefined}
            onMouseMove={(e) =>
              show(e, {
                color: r.bayer ? '#4ec3e0' : undefined,
                title: r.name,
                lines: detail(r.key),
              })
            }
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
        ))}
      </ul>
      <ChartTip tip={tip} />
    </div>
  );
}

function MixChart() {
  const { wrap, tip, show, hide } = useChartTip();
  const [focus, setFocus] = useState<string | null>(null);
  const total = CALC_SEGMENTS.reduce((s, r) => s + r.valueMatM, 0) || 1;
  return (
    <div className="m360-viz m360-mix" ref={wrap} onMouseLeave={hide}>
      <div className="m360-mix__bar">
        {CALC_SEGMENTS.map((s) => (
          <i
            key={s.segment}
            className={!focus || focus === s.segment ? 'is-on' : 'is-off'}
            style={{
              width: `${(s.valueMatM / total) * 100}%`,
              background: colorForSegment(s.segment),
            }}
            onMouseEnter={() => setFocus(s.segment)}
            onMouseMove={(e) =>
              show(e, {
                color: colorForSegment(s.segment),
                title: s.segment,
                lines: [
                  `Sales  ${fmtM(s.valueMatM)}`,
                  `Share of category  ${fmtShare(s.shareOfCategoryPct)}`,
                  `Sales vs last year  ${fmtPct(s.growth1yPct)}`,
                ],
              })
            }
            onMouseLeave={() => setFocus(null)}
          />
        ))}
      </div>
      <ul className="m360-viz__legend">
        {CALC_SEGMENTS.map((s) => (
          <li key={s.segment}>
            <button
              type="button"
              className={focus === s.segment ? 'is-on' : undefined}
              onMouseEnter={() => setFocus(s.segment)}
              onMouseLeave={() => setFocus(null)}
            >
              <i style={{ background: colorForSegment(s.segment) }} />
              {shortName(s.segment)} {fmtShare(s.shareOfCategoryPct)} · {fmtPct(s.growth1yPct)}
            </button>
          </li>
        ))}
      </ul>
      <ChartTip tip={tip} />
    </div>
  );
}

/** Classic Market layout (AI Assistant tab). Story redesign lives on AI Assistant v2. */
export function M360Report() {
  const cat = CALC_CATEGORY;
  const p = M360_RETRIEVAL_PARAMS;
  const m = M360_METADATA;
  const ibs = CALC_SEGMENTS.find((s) => s.segment.startsWith('IBS'))!;
  const topIbs = CALC_SUBBRANDS.filter((r) => r.segment === ibs.segment)
    .sort((a, b) => b.valueMat - a.valueMat)
    .slice(0, 6);
  const ibero = CALC_IBEROGAST[0];
  const iberoRows = CALC_IBEROGAST;
  const narrative = buildMarketNarrativeProps();

  return (
    <div className={`m360-rep${ASSISTANT_NARRATIVE_V2 ? ' m360-rep--narrative-v2' : ''}`}>
      <p className="m360-rep__kicker">
        {p.country} {p.category} · Iberogast competitive set · latest 12 months ending {m.latest_actual_month}
      </p>

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
            Bayer’s share of the same competitive set (not Iberogast alone). {fmtPp(cat.bayerShareChangePp)} versus last
            year.
          </span>
        </article>
        <article>
          <p>Iberogast relative growth</p>
          <strong>{fmtEvi(ibero?.evolutionIndex ?? null)}</strong>
          <span>
            {ibero
              ? `${ibero.label} versus the IBS need-state only. 100 = growing in line with IBS; above 100 = faster.`
              : 'Not available.'}{' '}
            {iberoRows.map((r) => `${r.label} ${fmtEvi(r.evolutionIndex)}`).join('. ')}.
          </span>
        </article>
      </section>

      <h2 className="section-title" id="assistant-cards">Segment cards</h2>
      <div className="m360-rep-seg">
        {CALC_SEGMENTS.map((s) => {
          const bayer = largestBayerSubBrand(s.segment);
          const color = colorForSegment(s.segment);
          const spark = [s.value2ya, s.valueYa, s.valueMat].map((v) => (v == null ? null : v / 1_000_000));
          const peak = Math.max(...spark.filter((v): v is number => v !== null), 1);
          const pts = spark
            .map((v, i) => (v === null ? null : `${8 + i * 36},${28 - (v / peak) * 22}`))
            .filter((p): p is string => p !== null);
          return (
            <article key={s.segment} className="m360-scard" style={{ ['--seg' as string]: color }}>
              <header>
                <span className="m360-scard__swatch" />
                <div>
                  <h3>{shortName(s.segment)}</h3>
                  <p>{s.segment}</p>
                </div>
                <svg viewBox="0 0 88 32" className="m360-scard__spark" aria-hidden>
                  <polyline points={pts.join(' ')} />
                  {spark.map((v, i) =>
                    v === null ? null : (
                      <circle key={i} cx={8 + i * 36} cy={28 - (v / peak) * 22} r="2.2" />
                    ),
                  )}
                </svg>
              </header>
              <dl>
                <div>
                  <dt>Sales value</dt>
                  <dd>{fmtM(s.valueMatM)}</dd>
                  <small>
                    {fmtShare(s.shareOfCategoryPct)} of the category
                    <em className={tone(s.growth1yPct)}>{fmtPct(s.growth1yPct)} vs last year</em>
                  </small>
                  <b className="m360-scard__track">
                    <i style={{ width: `${s.shareOfCategoryPct}%` }} />
                  </b>
                </div>
                <div>
                  <dt>Bayer market share</dt>
                  <dd>{fmtShare(s.bayerShareMatPct)}</dd>
                  <small className={tone(s.bayerShareChangePp)}>{fmtPp(s.bayerShareChangePp)} versus last year</small>
                </div>
                <div>
                  <dt>Relative growth</dt>
                  <dd className={tone(bayer?.evolutionIndex ?? null, 100)}>{fmtEvi(bayer?.evolutionIndex ?? null)}</dd>
                  <small>
                    {bayer
                      ? `${bayer.label} versus this segment. 100 = in line with the market`
                      : 'No named Bayer brand in this segment'}
                  </small>
                </div>
              </dl>
            </article>
          );
        })}
      </div>

      <h2 className="section-title" id="assistant-charts">Charts</h2>
      <p className="m360-rep__lede">Hover a line, bar or slice for the exact number.</p>

      <div className="m360-rep-grid">
        <ChartCard
          id="ch-value"
          wide
          title={`Category sales ${fmtM(cat.valueMatM)}`}
          caption={`Germany Digestive Health, ${fmtPct(cat.growth1yPct)} versus last year. IBS is the largest pool; Antacids is growing fastest.`}
        >
          <ValueTrendChart />
        </ChartCard>

        <ChartCard
          id="ch-share"
          title={`Bayer market share ${fmtShare(cat.bayerShareMatPct)}`}
          caption={`${fmtPp(cat.bayerShareChangePp)} versus last year in the Iberogast competitive set. Antacids is where share is falling.`}
        >
          <ShareBarsChart />
        </ChartCard>

        <ChartCard
          id="ch-evi"
          title={`${ibero?.label ?? 'Iberogast'} relative growth ${fmtEvi(ibero?.evolutionIndex ?? null)}`}
          caption="Bayer brands versus their own segment. 100 means growing in line with that market; above 100 means growing faster."
        >
          <EviChart />
        </ChartCard>

        <ChartCard
          id="ch-comp"
          wide
          title="Who holds IBS sales"
          caption={
            topIbs[0]
              ? `${topIbs[0].label} leads at ${fmtShare(topIbs[0].shareMatPct)} of IBS. Highlighted bars are Bayer.`
              : 'Not available'
          }
        >
          <RankBars
            rows={topIbs.map((r) => ({
              key: r.label,
              name: r.label,
              bayer: r.isBayer,
            }))}
            value={(key) => topIbs.find((r) => r.label === key)?.shareMatPct ?? 0}
            label={(key) => {
              const r = topIbs.find((x) => x.label === key);
              return `${fmtShare(r?.shareMatPct ?? null)} · relative growth ${fmtEvi(r?.evolutionIndex ?? null)}`;
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
          id="ch-mix"
          wide
          title="Where category sales sit"
          caption={`${shortName(ibs.segment)} is ${fmtShare(ibs.shareOfCategoryPct)} of category sales.`}
        >
          <MixChart />
        </ChartCard>
      </div>

      <AssistantMarketInsights {...narrative} />
      <AssistantMarketActions {...narrative} />
      <AssistantMarketReadout {...narrative} />
    </div>
  );
}
