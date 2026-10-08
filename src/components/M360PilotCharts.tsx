import { useMemo, useState } from 'react';
import {
  CALC_CATEGORY,
  CALC_SEGMENTS,
  CALC_SUBBRANDS,
  CAGR_3Y_NOTE,
  STACK_SHARE_ROWS,
  TOP_SUBBRANDS_PER_SEGMENT,
  type CalcSegment,
  type CalcSubBrand,
} from '../data/m360Charts';
import { buildM360Insights } from '../data/m360Insights';
import './M360PilotCharts.css';

type ViewId = 'brand' | 'analyst' | 'fallback' | 'all';

function fasterCat(s: CalcSegment): boolean {
  return s.growth1y !== null && CALC_CATEGORY.growth1y !== null && s.growth1y > CALC_CATEGORY.growth1y;
}

function below3(s: CalcSegment): boolean {
  return s.bayerShareMatPct !== null && s.bayerShareMatPct < 3;
}

function fasterSeg(r: CalcSubBrand, segment: string): boolean | null {
  const gSeg = CALC_SEGMENTS.find((s) => s.segment === segment)?.growth1y ?? null;
  if (r.growth1y === null || gSeg === null) return null;
  return r.growth1y > gSeg;
}

function shortSegment(name: string): string {
  if (name.startsWith('IBS')) return 'IBS';
  if (name.startsWith('ANTACID')) return 'Antacids';
  if (name.startsWith('GAS')) return 'Gas';
  if (name.startsWith('PPI')) return 'PPIs';
  return name;
}

function pct(v: number | null, digits = 1): string {
  if (v === null || !Number.isFinite(v)) return 'N/A';
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(digits)}%`;
}

function sharePct(v: number | null, digits = 1): string {
  if (v === null || !Number.isFinite(v)) return 'N/A';
  return `${v.toFixed(digits)}%`;
}

function pp(v: number | null): string {
  if (v === null || !Number.isFinite(v)) return 'N/A';
  return `${v >= 0 ? '+' : ''}${v.toFixed(1)}pp`;
}

function eurM(v: number): string {
  const sign = v > 0 ? '+' : '';
  return `${sign}€${v.toFixed(1)}m`;
}

function ChartA() {
  const maxValue = Math.max(...CALC_SEGMENTS.map((r) => r.valueMatM), 1);
  const catG = CALC_CATEGORY.growth1yPct;
  return (
    <article className="m360-chart" id="chart-a">
      <header>
        <p className="m360-chart__tag">A · base</p>
        <h3>Where is the market?</h3>
        <p>
          Segment size, 1y growth and 3y CAGR. Green = faster than category (
          {catG === null ? 'N/A' : `${catG.toFixed(1)}%`}). {CAGR_3Y_NOTE}
        </p>
      </header>
      <ul className="m360-size">
        {CALC_SEGMENTS.map((row) => (
          <li key={row.segment}>
            <div className="m360-size__meta">
              <span className="m360-size__name">{row.segment}</span>
              <span className="m360-size__val">€{row.valueMatM.toFixed(1)}m</span>
              <span className={`m360-chip${fasterCat(row) ? ' m360-chip--fast' : ''}`}>
                1y {pct(row.growth1yPct)}
              </span>
              <span className="m360-chip">3y {pct(row.cagr3yPct)}</span>
            </div>
            <div className="m360-size__track">
              <div
                className={`m360-size__fill${fasterCat(row) ? ' is-fast' : ''}`}
                style={{ width: `${(row.valueMatM / maxValue) * 100}%` }}
              />
            </div>
            <span className="m360-size__share">{row.shareOfCategoryPct.toFixed(1)}% of category</span>
          </li>
        ))}
      </ul>
      <p className="m360-chart__foot">
        Category MAT €{CALC_CATEGORY.valueMatM.toFixed(1)}m · 1y {pct(catG)}
      </p>
    </article>
  );
}

function ChartB() {
  return (
    <article className="m360-chart" id="chart-b">
      <header>
        <p className="m360-chart__tag">B · base</p>
        <h3>Where is Bayer — and where is it absent?</h3>
        <p>Bayer share by segment with change vs YA. Red = below 3%, with white-space verdict.</p>
      </header>
      <ul className="m360-bayer">
        {CALC_SEGMENTS.map((row) => (
          <li key={row.segment}>
            <div className="m360-bayer__meta">
              <span>{row.segment}</span>
              <strong className={below3(row) ? 'is-low' : undefined}>
                {row.bayerShareMatPct === null ? 'N/A' : `${row.bayerShareMatPct.toFixed(1)}%`}
              </strong>
              <em>{pp(row.bayerShareChangePp)}</em>
            </div>
            <div className="m360-bayer__track">
              <i className="m360-bayer__mark" title="3% threshold" />
              <div
                className={`m360-bayer__fill${below3(row) ? ' is-low' : ''}`}
                style={{ width: `${Math.min(100, Math.max(0, row.bayerShareMatPct ?? 0))}%` }}
              />
            </div>
            <span className="m360-bayer__ws">
              {row.whiteSpaceFlag ? 'White-space candidate' : 'Not white space'}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function ChartC() {
  return (
    <article className="m360-chart m360-chart--wide" id="chart-c">
      <header>
        <p className="m360-chart__tag">C · base</p>
        <h3>Who wins inside each segment?</h3>
        <p>
          Top sub-brands per segment. Navy = Bayer. Green / red = competitor growing faster / slower
          than its segment.
        </p>
      </header>
      <div className="m360-subgrid">
        {TOP_SUBBRANDS_PER_SEGMENT.map((g) => (
          <div key={g.segment} className="m360-subblock">
            <h4>{g.segment}</h4>
            <ul>
              {g.rows.map((r) => {
                const tone = r.isBayer
                  ? 'is-bayer'
                  : fasterSeg(r, g.segment)
                    ? 'is-fast'
                    : fasterSeg(r, g.segment) === false
                      ? 'is-slow'
                      : undefined;
                return (
                  <li key={r.label} className={tone}>
                    <span>{r.label}</span>
                    <div className="m360-subblock__track">
                      <div style={{ width: `${Math.min(100, r.shareMatPct)}%` }} />
                    </div>
                    <em>
                      {r.shareMatPct.toFixed(1)}% <small>({pp(r.shareChangePp)})</small>
                    </em>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </article>
  );
}

function ChartAlt1() {
  const maxValue = Math.max(...CALC_SEGMENTS.map((r) => r.valueMatM), 1);
  const catG = CALC_CATEGORY.growth1yPct ?? 0;
  const yMin = -2;
  const yMax = 14;
  const xMax = 70;
  const y = (v: number) => ((v - yMin) / (yMax - yMin)) * 100;
  const x = (v: number) => 6 + (v / xMax) * 88;
  return (
    <article className="m360-chart" id="chart-alt1">
      <header>
        <p className="m360-chart__tag">ALT 1</p>
        <h3>Growth × share matrix</h3>
        <p>
          Combines A and B. X = Bayer share. Y = 1y growth. Size = MAT value. Shaded box = white-space
          zone (share &lt; 3% and growth above category).
        </p>
      </header>
      <div className="m360-scatter" role="img" aria-label="Bayer share versus 1y growth">
        <span className="m360-scatter__y">1y growth %</span>
        <div className="m360-scatter__plot">
          <b
            className="m360-scatter__ws"
            style={{
              left: 0,
              width: `${x(3)}%`,
              bottom: `${y(catG)}%`,
              height: `${100 - y(catG)}%`,
            }}
          />
          <b className="m360-scatter__cat" style={{ bottom: `${y(catG)}%` }} />
          <i className="m360-scatter__thr" style={{ left: `${x(3)}%` }} />
          {CALC_SEGMENTS.map((row) => {
            const size = 18 + (row.valueMatM / maxValue) * 28;
            return (
              <span
                key={row.segment}
                className={`m360-scatter__pt${fasterCat(row) ? ' is-fast' : ''}${below3(row) ? ' is-low' : ''}`}
                style={{
                  left: `${x(row.bayerShareMatPct ?? 0)}%`,
                  bottom: `${y(row.growth1yPct ?? 0)}%`,
                }}
                title={`${row.segment}: Bayer ${sharePct(row.bayerShareMatPct)}, 1y ${pct(row.growth1yPct)}`}
              >
                <i style={{ width: size, height: size }} />
                <em>{shortSegment(row.segment)}</em>
              </span>
            );
          })}
        </div>
        <span className="m360-scatter__x">Bayer share %</span>
      </div>
    </article>
  );
}

function ChartAlt2() {
  return (
    <article className="m360-chart m360-chart--wide" id="chart-alt2">
      <header>
        <p className="m360-chart__tag">ALT 2</p>
        <h3>Bayer vs leader vs rest</h3>
        <p>100% bar per segment: Bayer, largest competitor, everyone else.</p>
      </header>
      <ul className="m360-stack">
        {STACK_SHARE_ROWS.map((row) => (
          <li key={row.segment}>
            <span className="m360-stack__name">{row.segment}</span>
            <div className="m360-stack__bar">
              <span className="is-bayer" style={{ width: `${row.bayerPct}%` }} title={`Bayer ${row.bayerPct.toFixed(1)}%`} />
              <span
                className="is-comp"
                style={{ width: `${row.competitorPct}%` }}
                title={`${row.competitorLabel} ${row.competitorPct.toFixed(1)}%`}
              />
              <span className="is-rest" style={{ width: `${row.restPct}%` }} title={`Rest ${row.restPct.toFixed(1)}%`} />
            </div>
            <span className="m360-stack__note">
              Comp: {row.competitorLabel} {row.competitorPct.toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
      <ul className="m360-legend">
        <li>
          <i className="is-bayer" /> Bayer
        </li>
        <li>
          <i className="is-comp" /> Largest competitor
        </li>
        <li>
          <i className="is-rest" /> Rest
        </li>
      </ul>
    </article>
  );
}

function ChartAlt3() {
  const catEuro = (CALC_CATEGORY.valueMat - CALC_CATEGORY.valueYa) / 1_000_000;
  const maxAbs = Math.max(
    ...CALC_SEGMENTS.flatMap((r) => {
      const segEuro = (r.valueMat - r.valueYa) / 1_000_000;
      const others = segEuro - r.bayerEuroChangeM;
      return [Math.abs(r.bayerEuroChangeM), Math.abs(others), Math.abs(segEuro)];
    }),
    0.1,
  );
  return (
    <article className="m360-chart" id="chart-alt3">
      <header>
        <p className="m360-chart__tag">ALT 3</p>
        <h3>Where did the category growth come from?</h3>
        <p>€ change vs YA by segment, Bayer vs others. Category {eurM(catEuro)}.</p>
      </header>
      <ul className="m360-delta">
        {CALC_SEGMENTS.map((row) => {
          const others = (row.valueMat - row.valueYa) / 1_000_000 - row.bayerEuroChangeM;
          return (
          <li key={row.segment}>
            <span className="m360-delta__name">{row.segment}</span>
            <div className="m360-delta__pair">
              <span className="m360-delta__lab">Bayer {eurM(row.bayerEuroChangeM)}</span>
              <div className="m360-delta__track">
                <div
                  className={`m360-delta__fill is-bayer${row.bayerEuroChangeM < 0 ? ' is-neg' : ''}`}
                  style={{ width: `${(Math.abs(row.bayerEuroChangeM) / maxAbs) * 100}%` }}
                />
              </div>
            </div>
            <div className="m360-delta__pair">
              <span className="m360-delta__lab">Others {eurM(others)}</span>
              <div className="m360-delta__track">
                <div
                  className={`m360-delta__fill is-others${others < 0 ? ' is-neg' : ''}`}
                  style={{ width: `${(Math.abs(others) / maxAbs) * 100}%` }}
                />
              </div>
            </div>
          </li>
          );
        })}
      </ul>
    </article>
  );
}

function ChartAlt4() {
  return (
    <article className="m360-chart" id="chart-alt4">
      <header>
        <p className="m360-chart__tag">ALT 4</p>
        <h3>Bayer share slope YA → MAT</h3>
        <p>Direction of Bayer share by segment.</p>
      </header>
      <ul className="m360-slope">
        {CALC_SEGMENTS.map((row) => {
          const ya = row.bayerShareYaPct ?? 0;
          const mat = row.bayerShareMatPct ?? 0;
          const up = mat >= ya;
          return (
            <li key={row.segment}>
              <span className="m360-slope__name">{row.segment}</span>
              <svg viewBox="0 0 120 36" className="m360-slope__svg" aria-hidden>
                <line x1="8" y1="30" x2="112" y2="30" className="m360-slope__axis" />
                <line
                  x1="16"
                  y1={28 - ya * 0.35}
                  x2="104"
                  y2={28 - mat * 0.35}
                  className={up ? 'm360-slope__line is-up' : 'm360-slope__line is-down'}
                />
                <circle cx="16" cy={28 - ya * 0.35} r="3.5" className={up ? 'is-up' : 'is-down'} />
                <circle cx="104" cy={28 - mat * 0.35} r="3.5" className={up ? 'is-up' : 'is-down'} />
              </svg>
              <span>
                {row.bayerShareYaPct === null ? 'N/A' : `${row.bayerShareYaPct.toFixed(1)}%`} →{' '}
                {row.bayerShareMatPct === null ? 'N/A' : `${row.bayerShareMatPct.toFixed(1)}%`}{' '}
                <small>({pp(row.bayerShareChangePp)})</small>
              </span>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

function ChartAlt5() {
  return (
    <article className="m360-chart m360-chart--wide" id="chart-alt5">
      <header>
        <p className="m360-chart__tag">ALT 5</p>
        <h3>Segment scorecard</h3>
        <p>All CALC metrics in one table. Green = above category / threshold. Red = Bayer share &lt; 3%.</p>
      </header>
      <div className="ai-table-wrap">
        <table className="ai-table m360-score">
          <thead>
            <tr>
              <th>segment</th>
              <th>value €m</th>
              <th>share %</th>
              <th>1y %</th>
              <th>3y CAGR %</th>
              <th>unit 1y %</th>
              <th>Bayer share %</th>
              <th>Bayer Δ pp</th>
              <th>Bayer €m Δ</th>
              <th>WS</th>
            </tr>
          </thead>
          <tbody>
            {CALC_SEGMENTS.map((s) => (
              <tr key={s.segment}>
                <td>{s.segment}</td>
                <td>{s.valueMatM.toFixed(1)}</td>
                <td>{s.shareOfCategoryPct.toFixed(1)}</td>
                <td className={fasterCat(s) ? 'is-fast' : undefined}>{pct(s.growth1yPct)}</td>
                <td>{pct(s.cagr3yPct)}</td>
                <td>{pct(s.unitGrowth1yPct)}</td>
                <td className={below3(s) ? 'is-low' : undefined}>
                  {s.bayerShareMatPct === null ? 'N/A' : s.bayerShareMatPct.toFixed(1)}
                </td>
                <td className={s.bayerShareChangePp !== null && s.bayerShareChangePp < 0 ? 'is-low' : undefined}>
                  {pp(s.bayerShareChangePp)}
                </td>
                <td>{eurM(s.bayerEuroChangeM)}</td>
                <td>{s.whiteSpaceFlag ? 'flag' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="m360-chart__foot">{CAGR_3Y_NOTE}</p>
    </article>
  );
}

function ChartAlt6() {
  const [seg, setSeg] = useState(CALC_SEGMENTS[0]?.segment ?? '');
  const rows = CALC_SUBBRANDS.filter((r) => r.segment === seg).sort((a, b) => b.shareMatPct - a.shareMatPct);
  const shown = rows.slice(0, 12);
  const eiVals = shown.map((r) => r.evolutionIndex).filter((v): v is number => v !== null);
  const eiMin = Math.min(80, ...eiVals, 100);
  const eiMax = Math.max(120, ...eiVals, 100);
  const y = (ei: number) => ((ei - eiMin) / (eiMax - eiMin)) * 100;
  return (
    <article className="m360-chart m360-chart--wide" id="chart-alt6">
      <header>
        <p className="m360-chart__tag">ALT 6</p>
        <h3>Sub-brand position inside a segment</h3>
        <p>Share vs evolution index, one segment at a time. Navy = Bayer. Dashed line = EI 100.</p>
      </header>
      <div className="m360-alt6__tabs">
        {CALC_SEGMENTS.map((s) => (
          <button
            key={s.segment}
            type="button"
            className={s.segment === seg ? 'is-on' : undefined}
            onClick={() => setSeg(s.segment)}
          >
            {shortSegment(s.segment)}
          </button>
        ))}
      </div>
      <div className="m360-scatter m360-scatter--wide" role="img" aria-label={`${seg} share versus evolution index`}>
        <span className="m360-scatter__y">Evolution index</span>
        <div className="m360-scatter__plot">
          <b className="m360-scatter__cat" style={{ bottom: `${y(100)}%` }} />
          {shown.map((r, i) => (
            <span
              key={r.label}
              className={`m360-scatter__pt${r.isBayer ? ' is-navy' : fasterSeg(r, seg) ? ' is-fast' : ' is-slow'}`}
              style={{
                left: `${Math.min(92, Math.max(4, r.shareMatPct * 1.6))}%`,
                bottom: `${y(r.evolutionIndex ?? 100)}%`,
              }}
              title={`${r.label}: share ${r.shareMatPct.toFixed(1)}%, EI ${r.evolutionIndex === null ? 'N/A' : r.evolutionIndex.toFixed(1)}`}
            >
              <i style={{ width: 14, height: 14 }} />
              {i < 4 || r.isBayer ? <em>{r.label}</em> : null}
            </span>
          ))}
        </div>
        <span className="m360-scatter__x">Share of {seg} %</span>
      </div>
    </article>
  );
}

export function InsightsPanel() {
  const payload = useMemo(() => buildM360Insights(), []);
  const [jsonOpen, setJsonOpen] = useState(false);
  return (
    <section className="m360-insights" aria-labelledby="insights-heading">
      <div className="m360-charts__head">
        <h2 id="insights-heading" className="section-title">
          Insights agent
        </h2>
        <p className="m360-charts__lede">{payload.context}</p>
      </div>
      {payload.data_caveats.length > 0 ? (
        <ul className="m360-caveats">
          {payload.data_caveats.map((c) => (
            <li key={c.check}>
              <strong>{c.check}</strong> {c.text}
            </li>
          ))}
        </ul>
      ) : null}
      <ol className="m360-obs">
        {payload.observations.map((o) => (
          <li key={o.id}>
            <span className={`m360-imp m360-imp--${o.importance.toLowerCase()}`}>{o.importance}</span>
            <span className="m360-obs__chart">Chart {o.chart}</span>
            <h3>{o.headline}</h3>
            <p>{o.detail}</p>
            <p className="m360-obs__src">{o.sources.join(' · ')}</p>
          </li>
        ))}
      </ol>
      <h3 className="m360-ws__title">White-space candidates</h3>
      {payload.white_space.length === 0 ? (
        <p>No segment meets both conditions.</p>
      ) : (
        <ul className="m360-ws">
          {payload.white_space.map((w) => (
            <li key={w.segment}>
              <p>
                <strong>{w.segment}</strong> · {w.status}
                {w.failed_condition ? ` · ${w.failed_condition}` : ''}
              </p>
              <p>
                EUR {w.value_eur_m.toFixed(1)}m · Bayer {w.bayer_share_pct === null ? 'N/A' : `${w.bayer_share_pct.toFixed(1)}%`}{' '}
                · 3y CAGR{' '}
                {w.cagr_3y_pct === null ? 'N/A' : `${w.cagr_3y_pct.toFixed(1)}%`}
              </p>
              <p>Top 3: {w.top3}</p>
              <p>
                <em>For:</em> {w.rationale_for}
              </p>
              <p>
                <em>Against:</em> {w.rationale_against}
              </p>
              <p className="m360-ws__label">{w.label}</p>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="m360-json-btn" onClick={() => setJsonOpen((v) => !v)}>
        {jsonOpen ? 'Hide JSON' : 'Insights JSON'}
      </button>
      {jsonOpen ? <pre className="m360-json">{JSON.stringify(payload, null, 2)}</pre> : null}
    </section>
  );
}

const VIEW_CHARTS: Record<ViewId, Array<'a' | 'b' | 'c' | 'alt1' | 'alt2' | 'alt3' | 'alt4' | 'alt5' | 'alt6'>> = {
  brand: ['alt1', 'alt3', 'c'],
  analyst: ['alt5', 'c'],
  fallback: ['a', 'b'],
  all: ['a', 'b', 'c', 'alt1', 'alt2', 'alt3', 'alt4', 'alt5', 'alt6'],
};

function renderChart(id: (typeof VIEW_CHARTS)[ViewId][number]) {
  switch (id) {
    case 'a':
      return <ChartA key="a" />;
    case 'b':
      return <ChartB key="b" />;
    case 'c':
      return <ChartC key="c" />;
    case 'alt1':
      return <ChartAlt1 key="alt1" />;
    case 'alt2':
      return <ChartAlt2 key="alt2" />;
    case 'alt3':
      return <ChartAlt3 key="alt3" />;
    case 'alt4':
      return <ChartAlt4 key="alt4" />;
    case 'alt5':
      return <ChartAlt5 key="alt5" />;
    case 'alt6':
      return <ChartAlt6 key="alt6" />;
  }
}

export function M360PilotCharts() {
  const [view, setView] = useState<ViewId>('brand');
  const show = VIEW_CHARTS[view];
  return (
    <section className="m360-charts" aria-labelledby="m360-charts-heading">
      <div className="m360-charts__head">
        <h2 id="m360-charts-heading" className="section-title">
          Charts
        </h2>
        <p className="m360-charts__lede">
          Calculated from T1 and T2 (CALC layer). Brand manager view = ALT 1 + ALT 3 + C. Analyst =
          ALT 5 + C. A and B are the fallback if the matrix tests poorly.
        </p>
        <div className="m360-view" role="tablist" aria-label="Chart view">
          {(
            [
              ['brand', 'Brand manager'],
              ['analyst', 'Analyst'],
              ['fallback', 'Fallback A+B'],
              ['all', 'All charts'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={view === id}
              className={view === id ? 'is-on' : undefined}
              onClick={() => setView(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="m360-charts__grid">{show.map((id) => renderChart(id))}</div>
    </section>
  );
}
