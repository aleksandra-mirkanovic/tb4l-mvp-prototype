import { useRef, useState, type ReactNode } from 'react';
import {
  CALC_COPA_BRANDS,
  CALC_COPA_CLASSIFICATION,
  CALC_COPA_CLASSIFICATION_NOTE,
  CALC_COPA_GROWTH_MARGIN,
  CALC_COPA_GROWTH_MARGIN_SET,
  CALC_COPA_IBERO,
  CALC_COPA_PROFIT_POOL,
  CALC_COPA_PROFIT_POOL_META,
  CALC_COPA_SCORECARD,
  CALC_COPA_SCORECARD_META,
  CALC_COPA_SET,
  CALC_COPA_STACK,
  CALC_COPA_STACK_META,
} from '../data/copaCharts';
import { COPA_RETRIEVAL_PARAMS } from '../data/copaRetrieval';
import { AssistantFinanceDiscussion, AssistantFinanceShow } from './AssistantNarrative';
import './M360Report.css';
import './CopaReport.css';

function fmtM(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—';
  return `EUR ${v.toFixed(1)}m`;
}
function fmtPct(v: number | null): string {
  if (v === null || !Number.isFinite(v)) return '—';
  return `${v > 0 ? '+' : ''}${v.toFixed(1)}%`;
}
function fmtShare(v: number | null): string {
  if (v === null || !Number.isFinite(v)) return '—';
  return `${v.toFixed(1)}%`;
}
function fmtPp(v: number | null): string {
  if (v === null || !Number.isFinite(v)) return '—';
  return `${v >= 0 ? '+' : ''}${v.toFixed(1)} points`;
}

function tone(v: number | null, pivot = 0): 'is-up' | 'is-down' | 'is-flat' | '' {
  if (v === null || !Number.isFinite(v)) return '';
  if (v > pivot) return 'is-up';
  if (v < pivot) return 'is-down';
  return 'is-flat';
}

const BRAND_COLOR: Record<string, string> = {
  Iberogast: '#4ec3e0',
  Lefax: '#6fd48a',
  Rennie: '#f0a15c',
  Talcid: '#c9a0e8',
};

const STACK_COLOR: Record<string, string> = {
  Iberogast: '#286436',
  Lefax: '#8ecf9a',
  Rennie: '#d30f4b',
  Talcid: '#2b7cb5',
};

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

function ChartCard({
  title,
  caption,
  wide,
  children,
}: {
  title: string;
  caption: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <article className={`m360-rep-chart${wide ? ' is-wide' : ''}`}>
      <h3>{title}</h3>
      <p className="m360-rep-chart__cap">{caption}</p>
      {children}
    </article>
  );
}

function PortfolioGrowthChart() {
  const { wrap, tip, show, hide } = useChartTip();
  const [focus, setFocus] = useState<string | null>(null);
  const [metric, setMetric] = useState<'nsv' | 'gsv'>('nsv');
  const years = CALC_COPA_STACK;
  const latest = years[years.length - 1];
  const value = (b: (typeof latest.brands)[0]) => (metric === 'nsv' ? b.netSalesM : b.grossSalesM);
  const total = (y: (typeof years)[0]) => (metric === 'nsv' ? y.totalNsM : y.totalGsM);
  const ymax = Math.max(...years.map((y) => total(y)), 1) * 1.22;
  const W = 720;
  const H = 300;
  const L = 48;
  const R = 96;
  const T = 28;
  const B = 40;
  const iw = W - L - R;
  const ih = H - T - B;
  const yAt = (v: number) => T + ih - (v / ymax) * ih;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((p) => p * ymax);
  const barW = Math.min(72, (iw / Math.max(years.length, 1)) * 0.42);

  return (
    <div className="m360-viz copa-stack" ref={wrap} onMouseLeave={hide}>
      <div className="copa-stack__toggle" role="group" aria-label="Sales measure">
        <button type="button" className={metric === 'nsv' ? 'is-on' : undefined} onClick={() => setMetric('nsv')}>
          NSV
        </button>
        <button type="button" className={metric === 'gsv' ? 'is-on' : undefined} onClick={() => setMetric('gsv')}>
          GSV
        </button>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${metric === 'nsv' ? 'Net' : 'Gross'} sales stacked by brand and year`}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line className="m360-viz__grid" x1={L} x2={W - R} y1={yAt(t)} y2={yAt(t)} />
            <text className="m360-viz__tick" x={L - 6} y={yAt(t) + 4} textAnchor="end">
              {t === 0 ? '0' : t.toFixed(0)}
            </text>
          </g>
        ))}
        {years.map((y, i) => {
          const cx = L + ((i + 0.5) * iw) / years.length;
          let acc = 0;
          return (
            <g key={y.year}>
              {y.brands.map((b) => {
                const v = value(b);
                const y1 = yAt(acc + v);
                const y0 = yAt(acc);
                acc += v;
                const tot = total(y);
                const share = tot ? (v / tot) * 100 : 0;
                const on = !focus || focus === b.brand;
                return (
                  <rect
                    key={b.brand}
                    className="m360-viz__bar"
                    x={cx - barW / 2}
                    y={y1}
                    width={barW}
                    height={Math.max(0, y0 - y1)}
                    fill={STACK_COLOR[b.brand]}
                    opacity={on ? 1 : 0.18}
                    onMouseEnter={() => setFocus(b.brand)}
                    onMouseMove={(e) =>
                      show(e, {
                        color: STACK_COLOR[b.brand],
                        title: `${b.brand} · ${y.label}`,
                        lines: [
                          `${metric === 'nsv' ? 'Net sales' : 'Gross sales'}  ${fmtM(v)}`,
                          `Share of stack  ${fmtShare(share)}`,
                          `1-year growth  ${fmtPct(b.growth1yPct)}`,
                          `Contribution to set change  ${fmtPp(b.contribNsPp)}`,
                        ],
                      })
                    }
                    onMouseLeave={() => setFocus(null)}
                  />
                );
              })}
              <text className="copa-stack__total" x={cx} y={yAt(total(y)) - 8} textAnchor="middle">
                {total(y).toFixed(1)}
              </text>
              <text className="m360-viz__tick" x={cx} y={H - 16} textAnchor="middle">
                {y.label}
              </text>
            </g>
          );
        })}
        {latest
          ? latest.brands.map((b) => {
              const cx = L + ((years.length - 0.5) * iw) / years.length;
              let acc = 0;
              for (const x of latest.brands) {
                if (x.brand === b.brand) break;
                acc += value(x);
              }
              const mid = yAt(acc + value(b) / 2);
              return (
                <text
                  key={b.brand}
                  className="copa-stack__cagr"
                  x={cx + barW / 2 + 10}
                  y={mid + 4}
                  fill={STACK_COLOR[b.brand]}
                >
                  {fmtPct(b.growth1yPct)}
                </text>
              );
            })
          : null}
      </svg>
      <ul className="m360-viz__legend">
        {latest?.brands.map((b) => (
          <li key={b.brand}>
            <button
              type="button"
              className={focus === b.brand ? 'is-on' : undefined}
              onMouseEnter={() => setFocus(b.brand)}
              onMouseLeave={() => setFocus(null)}
            >
              <i style={{ background: STACK_COLOR[b.brand] }} />
              {b.brand}
            </button>
          </li>
        ))}
      </ul>
      <p className="copa-stack__note">
        Right-hand labels are 1-year growth, not CAGR
        {CALC_COPA_STACK_META.hasCagr ? '' : ' — 2021–2025 CAGR needs 2021, which is not in this extract'}.
      </p>
      <div className="copa-stack__table-wrap">
        <table className="copa-stack__table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Brand</th>
              {years.map((y) => (
                <th key={y.year}>{y.year}</th>
              ))}
              <th>1y</th>
            </tr>
          </thead>
          <tbody>
            {(['GSV (€m)', 'NSV (€m)', 'Gross margin % NSV'] as const).map((metricLabel) =>
              latest?.brands.map((b, i) => (
                <tr key={`${metricLabel}-${b.brand}`}>
                  {i === 0 ? <th rowSpan={latest.brands.length}>{metricLabel}</th> : null}
                  <td>{b.brand}</td>
                  {years.map((y) => {
                    const row = y.brands.find((x) => x.brand === b.brand);
                    const cell =
                      metricLabel === 'GSV (€m)'
                        ? row?.grossSalesM.toFixed(1)
                        : metricLabel === 'NSV (€m)'
                          ? row?.netSalesM.toFixed(1)
                          : fmtShare(row?.gpPct ?? null);
                    return <td key={y.year}>{cell}</td>;
                  })}
                  <td>
                    {metricLabel === 'Gross margin % NSV'
                      ? fmtPp(
                          years.length > 1
                            ? (latest.brands.find((x) => x.brand === b.brand)?.gpPct ?? 0) -
                                (years[years.length - 2].brands.find((x) => x.brand === b.brand)?.gpPct ?? 0)
                            : null,
                        )
                      : metricLabel === 'GSV (€m)'
                        ? fmtPct(b.gsvGrowth1yPct)
                        : fmtPct(b.growth1yPct)}
                  </td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
      <ChartTip tip={tip} />
    </div>
  );
}

function MarginKpiTable() {
  const set = CALC_COPA_GROWTH_MARGIN_SET;
  return (
    <div>
      <div className="copa-stack__table-wrap">
        <table className="copa-stack__table copa-margin-kpi">
          <thead>
            <tr>
              <th>Brand</th>
              <th>Net Sales</th>
              <th>Gross Sales</th>
              <th>Gross Profit</th>
              <th>GM %</th>
              <th>EBITDA</th>
              <th>EBIT</th>
              <th>EBIT %</th>
              <th>Rev. growth</th>
              <th>Rev. contrib.</th>
              <th>Profit contrib.</th>
              <th>Rank</th>
              <th>Pareto</th>
            </tr>
          </thead>
          <tbody>
            {CALC_COPA_GROWTH_MARGIN.map((r) => (
              <tr key={r.brand}>
                <td>{r.brand}</td>
                <td>{fmtM(r.netSalesM)}</td>
                <td>{fmtM(r.grossSalesM)}</td>
                <td>{fmtM(r.grossProfitM)}</td>
                <td>{fmtShare(r.grossMarginPct)}</td>
                <td className="copa-na-cell">—</td>
                <td>{fmtM(r.ebitM)}</td>
                <td>{fmtShare(r.ebitMarginPct)}</td>
                <td className={tone(r.revenueGrowthPct)}>{fmtPct(r.revenueGrowthPct)}</td>
                <td>{fmtShare(r.revenueContribPct)}</td>
                <td>{fmtShare(r.profitContribPct)}</td>
                <td>{r.revenueRank}</td>
                <td>{r.paretoClass}</td>
              </tr>
            ))}
            <tr className="copa-margin-kpi__total">
              <td>Set total</td>
              <td>{fmtM(set.netSalesM)}</td>
              <td>{fmtM(set.grossSalesM)}</td>
              <td>{fmtM(set.grossProfitM)}</td>
              <td>{fmtShare(set.grossMarginPct)}</td>
              <td className="copa-na-cell">—</td>
              <td>{fmtM(set.ebitM)}</td>
              <td>{fmtShare(set.ebitMarginPct)}</td>
              <td className={tone(set.revenueGrowthPct)}>{fmtPct(set.revenueGrowthPct)}</td>
              <td>100%</td>
              <td>100%</td>
              <td>—</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="m360-rep__lede">{set.note}</p>
    </div>
  );
}

/** Net Sales growth % by brand — one KPI, portfolio average as reference. */
function GrowthRankingChart() {
  const { wrap, tip, show, hide } = useChartTip();
  const [focus, setFocus] = useState<string | null>(null);
  const rows = [...CALC_COPA_SCORECARD].sort(
    (a, b) => (b.revenueGrowthPct ?? 0) - (a.revenueGrowthPct ?? 0),
  );
  const portfolio = CALC_COPA_SCORECARD_META.portfolioGrowthPct ?? 0;
  const vals = rows.map((r) => r.revenueGrowthPct ?? 0);
  const maxAbs = Math.max(...vals.map((v) => Math.abs(v)), Math.abs(portfolio), 4);
  const W = 560;
  const H = 220;
  const L = 88;
  const R = 52;
  const T = 16;
  const B = 28;
  const iw = W - L - R;
  const ih = H - T - B;
  const rowH = ih / rows.length;
  const x0 = L + iw / 2;
  const xAt = (v: number) => x0 + (v / maxAbs) * (iw / 2);

  return (
    <div className="m360-viz" ref={wrap} onMouseLeave={hide}>
      <p className="copa-simple__ref">
        Portfolio growth {fmtPct(portfolio)} — dashed line. Bars are Net Sales growth % versus prior calendar year.
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Revenue growth ranking by brand">
        <line className="m360-viz__ref" x1={x0} x2={x0} y1={T} y2={T + ih} />
        <line
          className="m360-viz__grid"
          x1={xAt(portfolio)}
          x2={xAt(portfolio)}
          y1={T}
          y2={T + ih}
          strokeDasharray="4 4"
        />
        <text className="m360-viz__tick" x={xAt(portfolio)} y={H - 8} textAnchor="middle">
          Portfolio {fmtPct(portfolio)}
        </text>
        {rows.map((r, i) => {
          const g = r.revenueGrowthPct ?? 0;
          const y = T + i * rowH;
          const x = xAt(g);
          const barX = Math.min(x, x0);
          const barW = Math.max(2, Math.abs(x - x0));
          const on = !focus || focus === r.name;
          const color = BRAND_COLOR[r.name];
          return (
            <g
              key={r.name}
              opacity={on ? 1 : 0.2}
              onMouseEnter={() => setFocus(r.name)}
              onMouseMove={(e) =>
                show(e, {
                  color,
                  title: r.name,
                  lines: [
                    `Revenue growth  ${fmtPct(r.revenueGrowthPct)}`,
                    `Versus portfolio  ${fmtPct(g - portfolio)}`,
                    `Role  ${r.role}`,
                  ],
                })
              }
              onMouseLeave={() => setFocus(null)}
            >
              <text className="m360-viz__tick" x={L - 8} y={y + rowH / 2 + 4} textAnchor="end">
                {r.name}
              </text>
              <rect
                className="m360-viz__bar"
                x={barX}
                y={y + 6}
                width={barW}
                height={Math.max(10, rowH - 14)}
                rx="3"
                fill={color}
              />
              <text
                className={`m360-viz__tick ${tone(g)}`}
                x={g >= 0 ? barX + barW + 6 : barX - 6}
                y={y + rowH / 2 + 4}
                textAnchor={g >= 0 ? 'start' : 'end'}
              >
                {fmtPct(r.revenueGrowthPct)}
              </text>
            </g>
          );
        })}
      </svg>
      <ChartTip tip={tip} />
    </div>
  );
}

/** Gross margin % and EBIT % — two simple bar columns, not a matrix. */
function MarginQualityChart() {
  const { wrap, tip, show, hide } = useChartTip();
  const [focus, setFocus] = useState<string | null>(null);
  const rows = [...CALC_COPA_SCORECARD].sort(
    (a, b) => (b.grossMarginPct ?? 0) - (a.grossMarginPct ?? 0),
  );
  const meta = CALC_COPA_SCORECARD_META;
  const maxGm = Math.max(...rows.map((r) => r.grossMarginPct ?? 0), meta.portfolioGmPct ?? 0, 1);
  const maxEbit = Math.max(...rows.map((r) => r.ebitMarginPct ?? 0), meta.portfolioEbitPct ?? 0, 1);

  return (
    <div className="m360-viz copa-margin-simple" ref={wrap} onMouseLeave={hide}>
      <p className="copa-simple__ref">
        Portfolio GM {fmtShare(meta.portfolioGmPct)} · portfolio EBIT {fmtShare(meta.portfolioEbitPct)}. Sorted by
        gross margin.
      </p>
      <ul className="copa-margin-simple__list">
        {rows.map((r) => {
          const on = !focus || focus === r.name;
          const color = BRAND_COLOR[r.name];
          return (
            <li
              key={r.name}
              className={on ? undefined : 'is-off'}
              style={{ ['--brand' as string]: color }}
              onMouseEnter={() => setFocus(r.name)}
              onMouseMove={(e) =>
                show(e, {
                  color,
                  title: r.name,
                  lines: [
                    `Gross margin  ${fmtShare(r.grossMarginPct)}`,
                    `EBIT margin  ${fmtShare(r.ebitMarginPct)}`,
                    `Role  ${r.role}`,
                  ],
                })
              }
              onMouseLeave={() => setFocus(null)}
            >
              <header>
                <h4>{r.name}</h4>
                <span className={`copa-role copa-role--${r.role.replace(/\s+/g, '-').toLowerCase()}`}>{r.role}</span>
              </header>
              <div className="copa-margin-simple__metrics">
                <div>
                  <span className="copa-margin-simple__lab">Gross margin %</span>
                  <div className="copa-margin-simple__bar-wrap">
                    <b style={{ width: `${((r.grossMarginPct ?? 0) / maxGm) * 100}%` }} />
                  </div>
                  <strong>{fmtShare(r.grossMarginPct)}</strong>
                </div>
                <div>
                  <span className="copa-margin-simple__lab">EBIT margin %</span>
                  <div className="copa-margin-simple__bar-wrap">
                    <b className="is-ebit" style={{ width: `${((r.ebitMarginPct ?? 0) / maxEbit) * 100}%` }} />
                  </div>
                  <strong>{fmtShare(r.ebitMarginPct)}</strong>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <ChartTip tip={tip} />
    </div>
  );
}

/** Revenue share vs profit share — two bars per brand, one contribution question. */
function ContributionSplitChart() {
  const { wrap, tip, show, hide } = useChartTip();
  const [focus, setFocus] = useState<string | null>(null);
  const [showRev, setShowRev] = useState(true);
  const [showProfit, setShowProfit] = useState(true);
  const rows = [...CALC_COPA_SCORECARD].sort((a, b) => b.revenueContribPct - a.revenueContribPct);
  const maxShare = Math.max(
    ...rows.flatMap((r) => [showRev ? r.revenueContribPct : 0, showProfit ? r.profitContribPct : 0]),
    1,
  );

  return (
    <div className="m360-viz" ref={wrap} onMouseLeave={hide}>
      <ul className="copa-contrib">
        {rows.map((r) => {
          const on = !focus || focus === r.name;
          const color = BRAND_COLOR[r.name];
          return (
            <li
              key={r.name}
              className={on ? undefined : 'is-off'}
              onMouseEnter={() => setFocus(r.name)}
              onMouseMove={(e) =>
                show(e, {
                  color,
                  title: `${r.name} · ${r.role}`,
                  lines: [
                    `Revenue share  ${fmtShare(r.revenueContribPct)}`,
                    `Profit share  ${fmtShare(r.profitContribPct)}`,
                    `Mix change  ${fmtPp(r.mixChangePp)}`,
                  ],
                })
              }
              onMouseLeave={() => setFocus(null)}
            >
              <span>{r.name}</span>
              <div className="copa-contrib__bars">
                {showRev ? (
                  <div className="copa-contrib__row">
                    <i className="is-rev" style={{ width: `${(r.revenueContribPct / maxShare) * 100}%`, background: color }} />
                    <small>Rev {fmtShare(r.revenueContribPct)}</small>
                  </div>
                ) : null}
                {showProfit ? (
                  <div className="copa-contrib__row">
                    <i
                      className="is-profit"
                      style={{ width: `${(r.profitContribPct / maxShare) * 100}%`, background: color }}
                    />
                    <small>Profit {fmtShare(r.profitContribPct)}</small>
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
            className={showRev ? 'is-on' : 'is-off'}
            aria-pressed={showRev}
            onClick={() => setShowRev((v) => (showProfit || !v ? !v : v))}
          >
            <i className="is-mat" />
            Revenue share
          </button>
        </li>
        <li>
          <button
            type="button"
            className={showProfit ? 'is-on' : 'is-off'}
            aria-pressed={showProfit}
            onClick={() => setShowProfit((v) => (showRev || !v ? !v : v))}
          >
            <i className="is-ya" />
            Profit share
          </button>
        </li>
      </ul>
      <ul className="copa-score__why">
        {CALC_COPA_SCORECARD.map((r) => (
          <li key={`${r.name}-why`}>
            <b>{r.name}.</b> {r.roleWhy}
          </li>
        ))}
      </ul>
      <ChartTip tip={tip} />
    </div>
  );
}

/** Role cards only — no bubble matrix. */
function ClassificationRoles() {
  return (
    <div>
      <p className="m360-rep__lede">{CALC_COPA_CLASSIFICATION_NOTE}</p>
      <div className="copa-class-grid">
        {CALC_COPA_CLASSIFICATION.map((c) => (
          <article key={c.role} className={`copa-class-card copa-class-card--${c.role.replace(/\s+/g, '-').toLowerCase()}`}>
            <h4>{c.role}</h4>
            <p>{c.rule}</p>
            <ul>
              {c.brands.length === 0 ? (
                <li className="copa-na-cell">None in this set</li>
              ) : (
                c.brands.map((b) => (
                  <li key={b.name}>
                    <b>{b.name}</b>
                    <span>
                      Growth {fmtPct(b.revenueGrowthPct)} · GM {fmtShare(b.grossMarginPct)}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}

function ProfitContributionChart() {
  const { wrap, tip, show, hide } = useChartTip();
  const [focus, setFocus] = useState<string | null>(null);
  const rows = CALC_COPA_PROFIT_POOL;
  const maxShare = Math.max(...rows.map((r) => r.profitSharePct), 1);
  const W = 560;
  const H = 248;
  const L = 88;
  const R = 56;
  const T = 12;
  const B = 28;
  const iw = W - L - R;
  const ih = H - T - B;
  const rowH = ih / rows.length;

  return (
    <div className="m360-viz" ref={wrap} onMouseLeave={hide}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Profit contribution by brand">
        {rows.map((r, i) => {
          const y = T + i * rowH;
          const w = (r.profitSharePct / maxShare) * iw;
          const on = !focus || focus === r.brand;
          const color = BRAND_COLOR[r.brand];
          return (
            <g
              key={r.brand}
              opacity={on ? 1 : 0.2}
              onMouseEnter={() => setFocus(r.brand)}
              onMouseMove={(e) =>
                show(e, {
                  color,
                  title: `${r.brand} · rank ${r.profitRank}`,
                  lines: [
                    `Gross Profit  ${fmtM(r.grossProfitM)}`,
                    `Profit share  ${fmtShare(r.profitSharePct)}`,
                    `Prior share  ${fmtShare(r.profitSharePriorPct)}`,
                    `GP change  ${fmtM(r.deltaGpM)}`,
                    `Contrib to set GP growth  ${fmtPp(r.contribGpPp)}`,
                  ],
                })
              }
              onMouseLeave={() => setFocus(null)}
            >
              <text className="m360-viz__tick" x={L - 8} y={y + rowH / 2 + 4} textAnchor="end">
                {r.brand}
              </text>
              <rect
                className="m360-viz__bar"
                x={L}
                y={y + 6}
                width={Math.max(2, w)}
                height={Math.max(10, rowH - 14)}
                rx="3"
                fill={color}
              />
              <text className="m360-viz__tick" x={L + w + 6} y={y + rowH / 2 + 4}>
                {fmtShare(r.profitSharePct)}
              </text>
            </g>
          );
        })}
      </svg>
      <ChartTip tip={tip} />
    </div>
  );
}

function ProfitPoolWaterfall() {
  const { wrap, tip, show, hide } = useChartTip();
  const meta = CALC_COPA_PROFIT_POOL_META;
  const rows = CALC_COPA_PROFIT_POOL;
  const prior = meta.totalGpPriorM;
  const latest = meta.totalGpM;
  type Step = {
    key: string;
    label: string;
    from: number;
    to: number;
    color: string;
    title: string;
    lines: string[];
    kind: 'total' | 'delta';
  };
  const steps: Step[] = [
    {
      key: 'prior',
      label: String(COPA_RETRIEVAL_PARAMS.priorYear),
      from: 0,
      to: prior,
      color: '#8aa0ad',
      title: `Set Gross Profit ${COPA_RETRIEVAL_PARAMS.priorYear}`,
      lines: [fmtM(prior)],
      kind: 'total',
    },
  ];
  let running = prior;
  for (const r of [...rows].sort((a, b) => (b.contribGpPp ?? 0) - (a.contribGpPp ?? 0))) {
    const from = running;
    const to = running + r.deltaGpM;
    steps.push({
      key: r.brand,
      label: r.brand,
      from,
      to,
      color: r.deltaGpM >= 0 ? '#2E7D32' : '#C0392B',
      title: r.brand,
      lines: [
        `GP change  ${fmtM(r.deltaGpM)}`,
        `Contrib to set GP growth  ${fmtPp(r.contribGpPp)}`,
        `GP ${fmtM(r.grossProfitPriorM)} → ${fmtM(r.grossProfitM)}`,
      ],
      kind: 'delta',
    });
    running = to;
  }
  steps.push({
    key: 'latest',
    label: String(COPA_RETRIEVAL_PARAMS.latestYear),
    from: 0,
    to: latest,
    color: '#00607e',
    title: `Set Gross Profit ${COPA_RETRIEVAL_PARAMS.latestYear}`,
    lines: [fmtM(latest), `Growth  ${fmtPct(meta.gpGrowth1yPct)}`],
    kind: 'total',
  });

  const vals = steps.flatMap((s) => [s.from, s.to]);
  const ymin = Math.min(0, ...vals) - 1;
  const ymax = Math.max(...vals) + 2;
  const W = 560;
  const H = 248;
  const L = 44;
  const R = 12;
  const T = 16;
  const B = 40;
  const iw = W - L - R;
  const ih = H - T - B;
  const yAt = (v: number) => T + ih - ((v - ymin) / (ymax - ymin)) * ih;
  const barW = (iw / steps.length) * 0.5;

  return (
    <div className="m360-viz" ref={wrap} onMouseLeave={hide}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Gross profit waterfall by brand">
        {steps.map((s, i) => {
          const cx = L + ((i + 0.5) * iw) / steps.length;
          const y1 = yAt(Math.max(s.from, s.to));
          const y2 = yAt(Math.min(s.from, s.to));
          const h = Math.max(2, y2 - y1);
          return (
            <g key={s.key} onMouseMove={(e) => show(e, { color: s.color, title: s.title, lines: s.lines })}>
              <rect x={cx - barW / 2} y={y1} width={barW} height={h} rx="3" fill={s.color} />
              <text className="m360-viz__tick" x={cx} y={H - 14} textAnchor="middle">
                {s.label.length > 7 ? s.label.slice(0, 6) : s.label}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="copa-chart-axis">
        Waterfall: set Gross Profit {COPA_RETRIEVAL_PARAMS.priorYear} → each brand’s GP change → set Gross Profit{' '}
        {COPA_RETRIEVAL_PARAMS.latestYear} ({fmtM(latest)}, {fmtPct(meta.gpGrowth1yPct)}).
      </p>
      <ChartTip tip={tip} />
    </div>
  );
}

function ProfitPoolTable() {
  const meta = CALC_COPA_PROFIT_POOL_META;
  return (
    <div className="copa-stack__table-wrap">
      <table className="copa-stack__table copa-score">
        <thead>
          <tr>
            <th>Brand</th>
            <th>Gross Profit</th>
            <th>Profit share</th>
            <th>Profit rank</th>
            <th>GP change</th>
            <th>Contrib to GP growth</th>
          </tr>
        </thead>
        <tbody>
          {CALC_COPA_PROFIT_POOL.map((r) => (
            <tr key={r.brand}>
              <td>{r.brand}</td>
              <td>{fmtM(r.grossProfitM)}</td>
              <td>{fmtShare(r.profitSharePct)}</td>
              <td>{r.profitRank}</td>
              <td className={tone(r.deltaGpM)}>{fmtM(r.deltaGpM)}</td>
              <td className={tone(r.contribGpPp)}>{fmtPp(r.contribGpPp)}</td>
            </tr>
          ))}
          <tr className="copa-margin-kpi__total">
            <td>Set total</td>
            <td>{fmtM(meta.totalGpM)}</td>
            <td>100%</td>
            <td>—</td>
            <td className={tone(meta.totalGpM - meta.totalGpPriorM)}>
              {fmtM(meta.totalGpM - meta.totalGpPriorM)}
            </td>
            <td>{fmtPct(meta.gpGrowth1yPct)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

type HypItem = { title: string; see: string; hyp: string };

function ChartHypotheses({ chart, items }: { chart: string; items: HypItem[] }) {
  return (
    <section className="copa-hyp" aria-label={`Hypotheses for ${chart}`}>
      <h4 className="copa-hyp__title">Hypotheses · {chart}</h4>
      <p className="m360-rep__lede">
        Working ideas only from this chart (calendar {COPA_RETRIEVAL_PARAMS.latestYear} vs{' '}
        {COPA_RETRIEVAL_PARAMS.priorYear}). Not facts. Not recommendations.
      </p>
      <ul className="m360-rep-ins">
        {items.map((item) => (
          <li key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.see}</p>
            <p className="m360-hyp">
              <b>Hypothesis.</b> {item.hyp}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ChartWithHypotheses({
  title,
  caption,
  wide,
  children,
  hypotheses,
}: {
  title: string;
  caption: string;
  wide?: boolean;
  children: ReactNode;
  hypotheses: HypItem[];
}) {
  return (
    <div className={`copa-chart-follow${wide ? ' is-wide' : ''}`}>
      <ChartCard title={title} caption={caption} wide={wide}>
        {children}
      </ChartCard>
      <ChartHypotheses chart={title} items={hypotheses} />
    </div>
  );
}

function chartHypData() {
  const gm = CALC_COPA_GROWTH_MARGIN;
  const set = CALC_COPA_GROWTH_MARGIN_SET;
  const ibero = gm.find((r) => r.brand === 'Iberogast')!;
  const lefax = gm.find((r) => r.brand === 'Lefax')!;
  const rennie = gm.find((r) => r.brand === 'Rennie')!;
  const talcid = gm.find((r) => r.brand === 'Talcid')!;
  const score = CALC_COPA_SCORECARD;
  const pool = CALC_COPA_PROFIT_POOL;
  const poolMeta = CALC_COPA_PROFIT_POOL_META;
  const topProfit = pool[0];
  const gpGainer = [...pool].sort((a, b) => b.deltaGpM - a.deltaGpM)[0];
  const gpLoser = [...pool].sort((a, b) => a.deltaGpM - b.deltaGpM)[0];
  const growthDriver = score.find((r) => r.role === 'Growth Driver');
  const profitDriver = score.find((r) => r.role === 'Profit Driver');
  const declining = score.find((r) => r.role === 'Declining');
  const maintain = score.find((r) => r.role === 'Maintain');
  return {
    ibero,
    lefax,
    rennie,
    talcid,
    set,
    score,
    pool,
    poolMeta,
    topProfit,
    gpGainer,
    gpLoser,
    growthDriver,
    profitDriver,
    declining,
    maintain,
  };
}

export function CopaReport() {
  const ibero = CALC_COPA_IBERO;
  const set = CALC_COPA_SET;
  const p = COPA_RETRIEVAL_PARAMS;
  const lefax = CALC_COPA_BRANDS.find((b) => b.brand === 'Lefax');
  const rennie = CALC_COPA_BRANDS.find((b) => b.brand === 'Rennie');
  const talcid = CALC_COPA_BRANDS.find((b) => b.brand === 'Talcid');
  const h = chartHypData();

  return (
    <div className="copa-rep">
      <h2 className="section-title" id="assistant-finance">
        What finance is doing
      </h2>
      <p className="m360-rep__kicker">
        Germany Consumer Health · Iberogast, Lefax, Rennie, Talcid · calendar {p.latestYear} versus {p.priorYear}. This
        is a different time window from the market view (latest 12 months to July 2026).
      </p>

      <section className="m360-rep-kpis copa-kpis" aria-label="Portfolio finance measures">
        <article>
          <p>Net sales</p>
          <strong>{fmtM(set.netSalesM)}</strong>
          <span>
            Four-brand set, {p.latestYear}. {fmtPct(set.growth1yPct)} versus {p.priorYear}.
          </span>
        </article>
        <article>
          <p>Gross profit</p>
          <strong>{fmtM(set.grossProfitM)}</strong>
          <span>
            {fmtShare(set.gpPct)} of set net sales. {fmtPp(set.gpChangePp)} versus 2024.
          </span>
        </article>
        <article>
          <p>Iberogast net sales</p>
          <strong>{fmtM(ibero.netSalesM)}</strong>
          <span>
            {fmtPct(ibero.growth1yPct)} versus 2024 · {fmtShare(ibero.shareOfSetPct)} of this set · {ibero.quadrant}.
          </span>
        </article>
      </section>

      <h3 className="section-title">Brand cards</h3>
      <div className="m360-rep-seg">
        {CALC_COPA_BRANDS.map((s) => (
          <article key={s.brand} className="m360-scard" style={{ ['--seg' as string]: BRAND_COLOR[s.brand] }}>
            <header>
              <span className="m360-scard__swatch" />
              <div>
                <h3>{s.brand}</h3>
                <p>{s.quadrant}</p>
              </div>
            </header>
            <dl>
              <div>
                <dt>Net sales</dt>
                <dd>{fmtM(s.netSalesM)}</dd>
                <small>
                  {fmtShare(s.shareOfSetPct)} of this brand set
                  <em className={tone(s.growth1yPct)}>{fmtPct(s.growth1yPct)} vs 2024</em>
                </small>
                <b className="m360-scard__track">
                  <i style={{ width: `${s.shareOfSetPct}%` }} />
                </b>
              </div>
              <div>
                <dt>Gross profit</dt>
                <dd>{fmtShare(s.gpPct)}</dd>
                <small>
                  of net sales · {fmtM(s.grossProfitM)}
                  <em className={tone(s.gpChangePp)}>{fmtPp(s.gpChangePp)}</em>
                </small>
              </div>
              <div>
                <dt>Marketing spend</dt>
                <dd>{fmtM(s.marketingM)}</dd>
                <small>{fmtShare(s.mktPct)} of net sales</small>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <h3 className="section-title" id="assistant-growth-margin">
        Portfolio Growth &amp; Margin Mix
      </h3>
      <p className="m360-rep__lede">
        OAuth COPA brand grain. Net Sales, Gross Sales, Gross Profit, margins and contribution from the four-brand set.
        Revenue = Net Sales. Gross Margin % = Gross Profit ÷ Net Sales. EBIT Margin % = cEBIT ÷ Net Sales. EBITDA is not
        in this extract. Each chart is followed by hypotheses from that chart only.
      </p>
      <div className="copa-chart-stack">
        <ChartWithHypotheses
          wide
          title="Stacked Revenue Chart"
          caption={`${CALC_COPA_STACK_META.title}. Toggle NSV / GSV. Stacked columns are calendar EUR millions by brand.`}
          hypotheses={[
            {
              title: `Iberogast adds most of the stack height (${fmtPct(h.ibero.revenueGrowthPct)} vs set ${fmtPct(h.set.revenueGrowthPct)})`,
              see: `What we see. Iberogast Net Sales ${fmtM(h.ibero.netSalesM)}, ${fmtShare(h.ibero.revenueContribPct)} of the set. Lefax ${fmtM(h.lefax.netSalesM)}, Rennie is the only brand with negative growth (${fmtPct(h.rennie.revenueGrowthPct)}).`,
              hyp: 'Set growth in the stacked columns is mostly Iberogast adding height, not a broad four-brand lift. If Iberogast slows, the stack story weakens at once.',
            },
            {
              title: `Rennie is the shrinking slice (${fmtPct(h.rennie.revenueGrowthPct)})`,
              see: `What we see. Rennie Net Sales ${fmtM(h.rennie.netSalesM)}, ${fmtShare(h.rennie.revenueContribPct)} of the set — smallest stack band.`,
              hyp: 'Rennie may be giving up stack height while the other three brands still grow. That is a top-line mix shift inside the portfolio, not a set-level collapse.',
            },
          ]}
        >
          <PortfolioGrowthChart />
        </ChartWithHypotheses>

        <ChartWithHypotheses
          wide
          title="Margin KPI Table"
          caption="All calcs for this set. Pareto A until 80% of set Net Sales, B until 95%, C the rest. EBITDA column is empty — not in the brand-year snapshot."
          hypotheses={[
            {
              title: `Iberogast leads revenue and profit density (${fmtShare(h.ibero.profitContribPct)} of Gross Profit)`,
              see: `What we see. Rank 1, Pareto ${h.ibero.paretoClass}. GM ${fmtShare(h.ibero.grossMarginPct)}, EBIT ${fmtShare(h.ibero.ebitMarginPct)} versus set GM ${fmtShare(h.set.grossMarginPct)} and EBIT ${fmtShare(h.set.ebitMarginPct)}.`,
              hyp: 'Iberogast is both the revenue engine and the profit engine. Concentration risk: one brand carries size and margin quality together.',
            },
            {
              title: `Lefax is large but thin (GM ${fmtShare(h.lefax.grossMarginPct)}, EBIT ${fmtShare(h.lefax.ebitMarginPct)})`,
              see: `What we see. Rank ${h.lefax.revenueRank}, revenue contrib ${fmtShare(h.lefax.revenueContribPct)} but profit contrib only ${fmtShare(h.lefax.profitContribPct)}. Growth ${fmtPct(h.lefax.revenueGrowthPct)} lags the set.`,
              hyp: 'Lefax dilutes portfolio GM and EBIT even though it sits in the Pareto A revenue band — quality of each euro is the issue, not size.',
            },
            {
              title: `Talcid is a slow profit pocket; Rennie is rich but shrinking`,
              see: `What we see. Talcid growth ${fmtPct(h.talcid.revenueGrowthPct)} with GM ${fmtShare(h.talcid.grossMarginPct)}. Rennie growth ${fmtPct(h.rennie.revenueGrowthPct)} with GM ${fmtShare(h.rennie.grossMarginPct)}.`,
              hyp: 'Margin % alone does not equal a growth job. Talcid protects margin quality; Rennie keeps a rich mix on a smaller top line — neither is proven as price versus volume without packs.',
            },
          ]}
        >
          <MarginKpiTable />
        </ChartWithHypotheses>
      </div>

      <h3 className="section-title" id="assistant-bain-scorecard">
        Portfolio Scorecard
      </h3>
      <p className="m360-rep__lede">
        Same Bain roles from OAuth COPA, split into three simple views: growth ranking, margin quality, then revenue
        versus profit contribution. No bubble matrix.
      </p>
      <div className="copa-chart-stack">
        <ChartWithHypotheses
          wide
          title="Growth ranking"
          caption={`Net Sales growth % by brand. Dashed line is portfolio growth ${fmtPct(CALC_COPA_SCORECARD_META.portfolioGrowthPct)}.`}
          hypotheses={[
            {
              title: `${h.growthDriver?.name ?? 'Growth Driver'} leads the growth ranking (${fmtPct(h.growthDriver?.revenueGrowthPct ?? null)})`,
              see: `What we see. Sorted by growth: ${h.growthDriver?.name ?? '—'} is above portfolio ${fmtPct(CALC_COPA_SCORECARD_META.portfolioGrowthPct)}. ${h.declining?.name ?? '—'} is ${fmtPct(h.declining?.revenueGrowthPct ?? null)}.`,
              hyp: 'The growth job in this set sits on one brand. If that brand slows, set growth weakens at once — the ranking makes the concentration obvious without a matrix.',
            },
            {
              title: `${h.declining?.name ?? 'Declining brand'} is the only negative bar`,
              see: `What we see. ${h.declining?.name ?? '—'} growth ${fmtPct(h.declining?.revenueGrowthPct ?? null)} versus portfolio ${fmtPct(CALC_COPA_SCORECARD_META.portfolioGrowthPct)}.`,
              hyp: 'Negative growth is a top-line job of its own. Do not average it into a “Digestive is fine” story.',
            },
          ]}
        >
          <GrowthRankingChart />
        </ChartWithHypotheses>

        <ChartWithHypotheses
          wide
          title="Margin quality"
          caption={`Gross margin % and EBIT margin % by brand versus portfolio GM ${fmtShare(CALC_COPA_SCORECARD_META.portfolioGmPct)} and EBIT ${fmtShare(CALC_COPA_SCORECARD_META.portfolioEbitPct)}.`}
          hypotheses={[
            {
              title: `${h.profitDriver?.name ?? 'Profit Driver'} is rich on GM (${fmtShare(h.profitDriver?.grossMarginPct ?? null)}) but not the growth leader`,
              see: `What we see. ${h.profitDriver?.name ?? '—'} GM ${fmtShare(h.profitDriver?.grossMarginPct ?? null)}, EBIT ${fmtShare(h.profitDriver?.ebitMarginPct ?? null)}. ${h.growthDriver?.name ?? '—'} is the growth brand, not always the richest margin.`,
              hyp: 'Margin quality and growth are different jobs. A rich bar here does not mean that brand is carrying set growth.',
            },
            {
              title: `${h.declining?.name ?? 'Declining brand'} stays rich on EBIT while growth is negative`,
              see: `What we see. ${h.declining?.name ?? '—'} EBIT ${fmtShare(h.declining?.ebitMarginPct ?? null)} versus portfolio ${fmtShare(CALC_COPA_SCORECARD_META.portfolioEbitPct)}.`,
              hyp: 'High EBIT % with negative growth is shrink-and-keep-quality until volume or price proves otherwise — not “healthy growth.”',
            },
          ]}
        >
          <MarginQualityChart />
        </ChartWithHypotheses>

        <ChartWithHypotheses
          wide
          title="Revenue vs profit contribution"
          caption="Share of set Net Sales versus share of set Gross Profit. Toggle series. Role notes sit under the bars."
          hypotheses={[
            {
              title: `${h.growthDriver?.name ?? 'Iberogast'} owns both revenue and profit weight`,
              see: `What we see. ${h.growthDriver?.name ?? '—'} rev ${fmtShare(h.growthDriver?.revenueContribPct ?? null)}, profit ${fmtShare(h.growthDriver?.profitContribPct ?? null)}.`,
              hyp: 'Concentration risk: one brand carries size and profit density together. Losing that bar redraws the whole contribution story.',
            },
            {
              title: `Lefax revenue share (${fmtShare(h.lefax.revenueContribPct)}) exceeds profit share (${fmtShare(h.lefax.profitContribPct)})`,
              see: 'What we see. On the paired bars Lefax is longer on revenue than on profit.',
              hyp: 'Lefax dilutes portfolio margin quality even inside the large revenue band — contribution mismatch is the issue, not missing size.',
            },
          ]}
        >
          <ContributionSplitChart />
        </ChartWithHypotheses>
      </div>

      <h3 className="section-title" id="assistant-classification">
        Portfolio Classification
      </h3>
      <p className="m360-rep__lede">
        OAuth COPA roles for this four-brand set. Growth Driver, Profit Driver, Maintain, Declining, Rationalize —
        first-match from Net Sales growth and Gross Margin versus the portfolio. Cards only — no positioning bubble.
      </p>
      <div className="copa-chart-stack">
        <ChartWithHypotheses
          wide
          title="Role cards"
          caption="Each card is one role rule and the brands that match. Growth and GM on the card; EBIT stays in Margin quality above."
          hypotheses={[
            {
              title: 'Classes split the jobs: growth ≠ margin ≠ maintain ≠ decline',
              see: `What we see. Growth Driver ${h.growthDriver?.name ?? 'none'}; Profit Driver ${h.profitDriver?.name ?? 'none'}; Maintain ${h.maintain?.name ?? 'none'}; Declining ${h.declining?.name ?? 'none'}; Rationalize none in this set.`,
              hyp: 'Treating the four brands as one “Digestive” story hides different roles. Actions should follow class, not an average.',
            },
            {
              title: `${h.declining?.name ?? 'Declining brand'} is Declining while ${h.profitDriver?.name ?? 'Profit Driver'} is Profit Driver`,
              see: `What we see. ${h.declining?.name ?? '—'} growth ${fmtPct(h.declining?.revenueGrowthPct ?? null)}. ${h.profitDriver?.name ?? '—'} GM ${fmtShare(h.profitDriver?.grossMarginPct ?? null)}.`,
              hyp: 'Rich margin and declining top-line are different cards. Do not read high GM as permission to ignore negative growth.',
            },
          ]}
        >
          <ClassificationRoles />
        </ChartWithHypotheses>
      </div>

      <h3 className="section-title" id="assistant-profit-pool">
        Profit Pool
      </h3>
      <p className="m360-rep__lede">
        {CALC_COPA_PROFIT_POOL_META.note} Set Gross Profit {fmtM(CALC_COPA_PROFIT_POOL_META.totalGpM)} (
        {fmtPct(CALC_COPA_PROFIT_POOL_META.gpGrowth1yPct)} versus {COPA_RETRIEVAL_PARAMS.priorYear}).
      </p>
      <div className="copa-chart-stack">
        <ChartWithHypotheses
          wide
          title="Profit Contribution Chart"
          caption="Horizontal bars are each brand’s share of set Gross Profit. Sorted by profit rank."
          hypotheses={[
            {
              title: `${h.topProfit.brand} owns the profit pool (rank ${h.topProfit.profitRank}, ${fmtShare(h.topProfit.profitSharePct)})`,
              see: `What we see. Gross Profit ${fmtM(h.topProfit.grossProfitM)} of set ${fmtM(h.poolMeta.totalGpM)}. Next brands are shorter bars on the same share axis.`,
              hyp: 'The profit pool is concentrated. Share-of-GP risk is as real as share-of-revenue risk — losing Iberogast GP would redraw the whole bar chart.',
            },
            {
              title: `Lefax profit share (${fmtShare(h.lefax.profitContribPct)}) undershoots its revenue share (${fmtShare(h.lefax.revenueContribPct)})`,
              see: 'What we see. On the contribution chart Lefax is not as long as its Net Sales weight would suggest.',
              hyp: 'Lefax takes more of the revenue story than of the profit pool — a structural dilutor inside an otherwise GP-heavy set.',
            },
          ]}
        >
          <ProfitContributionChart />
        </ChartWithHypotheses>

        <ChartWithHypotheses
          wide
          title="Waterfall"
          caption="How set Gross Profit moved from the prior calendar year to the latest — brand by brand."
          hypotheses={[
            {
              title: `${h.gpGainer.brand} adds the most Gross Profit on the bridge (${fmtM(h.gpGainer.deltaGpM)})`,
              see: `What we see. Set GP ${fmtM(h.poolMeta.totalGpPriorM)} → ${fmtM(h.poolMeta.totalGpM)} (${fmtPct(h.poolMeta.gpGrowth1yPct)}). ${h.gpGainer.brand} contrib ${fmtPp(h.gpGainer.contribGpPp)}.`,
              hyp: 'The waterfall’s lift is not evenly shared. GP growth is a brand bridge story led by the largest positive step.',
            },
            {
              title: `${h.gpLoser.brand} is the softest step (${fmtM(h.gpLoser.deltaGpM)})`,
              see: `What we see. ${h.gpLoser.brand} GP ${fmtM(h.gpLoser.grossProfitPriorM)} → ${fmtM(h.gpLoser.grossProfitM)}, contrib ${fmtPp(h.gpLoser.contribGpPp)}.`,
              hyp: 'Even a small negative or flat step matters when the set bridge is short. Watch whether that brand is leaking GP while others fund the total.',
            },
          ]}
        >
          <ProfitPoolWaterfall />
        </ChartWithHypotheses>

        <ChartWithHypotheses
          wide
          title="Profit Pool table"
          caption="Gross Profit, profit share, ranking and contribution to set GP growth."
          hypotheses={[
            {
              title: 'Rank order of Gross Profit matches who funds the pool',
              see: `What we see. ${h.pool.map((r) => `${r.brand} #${r.profitRank} (${fmtShare(r.profitSharePct)})`).join(' · ')}.`,
              hyp: 'Profit ranking is the simple read of the pool. Use it with the waterfall: rank is stock; the bridge is flow.',
            },
          ]}
        >
          <ProfitPoolTable />
        </ChartWithHypotheses>
      </div>

      <AssistantFinanceShow ibero={ibero} set={set} lefax={lefax} rennie={rennie} talcid={talcid} />
      <AssistantFinanceDiscussion ibero={ibero} set={set} lefax={lefax} rennie={rennie} talcid={talcid} />

      <h3 className="section-title">Market versus finance</h3>
      <p className="m360-rep__lede">
        Do not add these euros to the market sales above. Market is the latest 12 months to July 2026. Finance is
        calendar 2025 versus 2024. Same country and Iberogast family, different clocks.
      </p>
    </div>
  );
}
