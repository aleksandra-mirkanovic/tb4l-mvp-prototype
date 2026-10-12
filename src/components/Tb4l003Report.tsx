/**
 * TB4L-003 Segment Share and White Space — analytic page per building block v0.2.
 */
import {
  TB4L003_CATEGORY,
  TB4L003_META,
  TB4L003_SEGMENTS,
  buildTb4l003Checks,
  shortSegmentName,
  topSubBrandsForSegment,
} from '../data/tb4l003Calc';
import { buildTb4l003Insights } from '../data/tb4l003Insights';
import './Tb4l003Report.css';

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

function tone(v: number | null | undefined, pivot = 0): string {
  if (v == null || !Number.isFinite(v)) return '';
  if (v > pivot) return 'is-up';
  if (v < pivot) return 'is-down';
  return '';
}

function Chart1Mekko() {
  const segs = TB4L003_SEGMENTS;
  const total = segs.reduce((s, r) => s + r.valueMatM, 0) || 1;
  const catG = TB4L003_CATEGORY.growth1yPct;
  return (
    <div>
      <p className="tb4l003__q">Market: how big is each segment, and where does Bayer play?</p>
      <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--text-secondary)' }}>
        Category total {fmtM(TB4L003_CATEGORY.valueMatM)}
      </p>
      <div className="tb4l003-mekko" role="img" aria-label="Market structure marimekko">
        {segs.map((s) => {
          const w = (s.valueMatM / total) * 100;
          const bayer = Math.max(0, Math.min(100, s.bayerShareMatPct ?? 0));
          const low = (s.bayerShareMatPct ?? 100) < 3;
          return (
            <div key={s.segment} className="tb4l003-mekko__col" style={{ flex: `${w} 1 0` }}>
              <div className="tb4l003-mekko__stack">
                <div className="tb4l003-mekko__comp" style={{ height: `${100 - bayer}%` }} />
                <div
                  className={`tb4l003-mekko__bayer${low ? ' is-low' : ''}`}
                  style={{ height: `${bayer}%` }}
                >
                  {bayer >= 8 ? fmtShare(s.bayerShareMatPct, 0) : null}
                </div>
              </div>
              <div className="tb4l003-mekko__lab">
                <b>{shortSegmentName(s.segment)}</b>
                {fmtM(s.valueMatM)}
              </div>
            </div>
          );
        })}
      </div>
      <ul className="tb4l003-mekko__row">
        {segs.map((s) => {
          const faster = s.growth1yPct != null && catG != null && s.growth1yPct > catG;
          return (
            <li key={s.segment}>
              <b>{shortSegmentName(s.segment)}</b>:{' '}
              <span className={faster ? 'is-up' : 'is-down'}>{fmtPct(s.growth1yPct)}</span>
              {' · CAGR '}
              {s.cagrBasis === 'n/a'
                ? 'N/A'
                : `${fmtPct(s.cagrPct)} (${s.cagrBasis}${s.cagrBasis === '2y' ? '*' : ''})`}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Chart2Bubble() {
  const segs = TB4L003_SEGMENTS;
  const catG = TB4L003_CATEGORY.growth1yPct ?? 0;
  const W = 520;
  const H = 280;
  const L = 48;
  const R = 16;
  const T = 16;
  const B = 36;
  const xs = segs.map((s) => s.growth1yPct ?? 0);
  const ys = segs.map((s) => s.bayerShareMatPct ?? 0);
  const minX = Math.min(...xs, catG) - 2;
  const maxX = Math.max(...xs, catG) + 2;
  const minY = 0;
  const maxY = Math.max(...ys, 8) + 4;
  const xAt = (v: number) => L + ((v - minX) / (maxX - minX || 1)) * (W - L - R);
  const yAt = (v: number) => T + (1 - (v - minY) / (maxY - minY || 1)) * (H - T - B);
  const maxVal = Math.max(...segs.map((s) => s.valueMatM), 1);
  const rAt = (v: number) => 10 + Math.sqrt(v / maxVal) * 28;
  const xCat = xAt(catG);
  const y3 = yAt(3);
  const zoneX = Math.min(xCat, W - R);
  const zoneW = Math.max(0, W - R - zoneX);
  const zoneH = Math.max(0, y3 - T);

  return (
    <div>
      <p className="tb4l003__q">
        Performance and white space: which segments grow faster than the category, and where is Bayer present or
        absent?
      </p>
      <svg className="tb4l003-bubble" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Growth times share matrix">
        <rect x={zoneX} y={T} width={zoneW} height={zoneH} fill="var(--tb4l003-zone)" />
        <line
          x1={xCat}
          x2={xCat}
          y1={T}
          y2={H - B}
          stroke="var(--text-muted)"
          strokeDasharray="5 4"
          strokeWidth="1.2"
        />
        <line
          x1={L}
          x2={W - R}
          y1={y3}
          y2={y3}
          stroke="var(--text-muted)"
          strokeDasharray="2 3"
          strokeWidth="1"
        />
        <text x={xCat + 4} y={T + 12} fontSize="10" fill="var(--text-muted)">
          Category {fmtPct(TB4L003_CATEGORY.growth1yPct)}
        </text>
        <text x={L + 4} y={y3 - 4} fontSize="10" fill="var(--text-muted)">
          3% Bayer
        </text>
        <text x={(L + W - R) / 2} y={H - 8} fontSize="11" textAnchor="middle" fill="var(--text-secondary)">
          Segment value growth 1y %
        </text>
        <text
          x={14}
          y={(T + H - B) / 2}
          fontSize="11"
          fill="var(--text-secondary)"
          transform={`rotate(-90 14 ${(T + H - B) / 2})`}
          textAnchor="middle"
        >
          Bayer share %
        </text>
        {segs.map((s) => {
          const cx = xAt(s.growth1yPct ?? 0);
          const cy = yAt(s.bayerShareMatPct ?? 0);
          const r = rAt(s.valueMatM);
          const present = (s.bayerShareMatPct ?? 0) >= 3;
          return (
            <g key={s.segment}>
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={present ? 'var(--tb4l003-bayer)' : 'var(--tb4l003-slow)'}
                fillOpacity={0.85}
              />
              <text x={cx} y={cy + r + 12} fontSize="10" textAnchor="middle" fill="var(--text-primary)">
                {shortSegmentName(s.segment)} {s.scenarioCode}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="tb4l003-bubble__note">
        Bubble size = segment €m. Navy = Bayer present (≥ 3%); red = absent. Light red zone = S1 candidate area
        (faster than category, below 3%).
      </p>
    </div>
  );
}

function Chart3Wins() {
  return (
    <div>
      <p className="tb4l003__q">
        Competitors: which sub-brands lead each segment, and who is growing faster or slower than it?
      </p>
      <div className="tb4l003-wins">
        {TB4L003_SEGMENTS.map((s) => {
          const rows = topSubBrandsForSegment(s.segment, 7);
          const maxShare = Math.max(...rows.map((r) => r.shareMatPct), 1);
          return (
            <article key={s.segment}>
              <h4>
                {shortSegmentName(s.segment)} · {fmtM(s.valueMatM)} · {fmtPct(s.growth1yPct)}
              </h4>
              <ul>
                {rows.map((r) => {
                  const ei = r.evolutionIndex;
                  const fast = ei != null && ei >= 100;
                  const slow = ei != null && ei < 100;
                  return (
                    <li
                      key={r.label}
                      className={[r.isBayer ? 'is-bayer' : '', fast ? 'is-fast' : '', slow ? 'is-slow' : '']
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <span>{r.label}</span>
                      <div className="bar" aria-hidden>
                        <i style={{ width: `${(r.shareMatPct / maxShare) * 100}%` }} />
                      </div>
                      <span className="meta">
                        {fmtShare(r.shareMatPct)} · {fmtPct(r.growth1yPct)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Chart4Scorecard() {
  const catG = TB4L003_CATEGORY.growth1yPct;
  const catU = TB4L003_CATEGORY.unitGrowth1yPct;
  return (
    <div>
      <p className="tb4l003__q">Summary: all key numbers per segment in one view</p>
      <div className="tb4l003-table-wrap">
        <table className="tb4l003-score">
          <thead>
            <tr>
              <th>Segment</th>
              <th>Size €m</th>
              <th>Value 1y</th>
              <th>Units 1y</th>
              <th>CAGR</th>
              <th>Bayer share</th>
              <th>Share Δ</th>
              <th>Code</th>
            </tr>
          </thead>
          <tbody>
            {TB4L003_SEGMENTS.map((s) => (
              <tr key={s.segment}>
                <td>{shortSegmentName(s.segment)}</td>
                <td>{s.valueMatM.toFixed(1)}</td>
                <td
                  className={
                    s.growth1yPct != null && catG != null
                      ? s.growth1yPct > catG
                        ? 'is-up'
                        : 'is-down'
                      : ''
                  }
                >
                  {fmtPct(s.growth1yPct)}
                </td>
                <td
                  className={
                    s.unitGrowth1yPct != null && catU != null
                      ? s.unitGrowth1yPct > catU
                        ? 'is-up'
                        : 'is-down'
                      : ''
                  }
                >
                  {fmtPct(s.unitGrowth1yPct)}
                </td>
                <td>
                  {s.cagrBasis === 'n/a'
                    ? 'N/A'
                    : `${fmtPct(s.cagrPct)}${s.cagrBasis === '2y' ? '*' : ''}`}
                </td>
                <td className={(s.bayerShareMatPct ?? 100) < 3 ? 'is-absent' : ''}>
                  {fmtShare(s.bayerShareMatPct)}
                </td>
                <td className={tone(s.bayerShareChangePp)}>{fmtPp(s.bayerShareChangePp)}</td>
                <td className="code">{s.scenarioCode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="tb4l003-bubble__note">* 2y CAGR used where 3y history is incomplete.</p>
    </div>
  );
}

export function Tb4l003Report() {
  const checks = buildTb4l003Checks();
  const insights = buildTb4l003Insights();
  const cat = TB4L003_CATEGORY;
  const cagrShow = cat.cagr3yPct ?? cat.cagr2yPct;
  const cagrLabel = cat.cagr3yPct != null ? '' : cat.cagr2yPct != null ? '2y*' : '';

  const byType = {
    'white space': insights.opportunities.filter((o) => o.type === 'white space'),
    'near-miss': insights.opportunities.filter((o) => o.type === 'near-miss'),
    'share loss in growth': insights.opportunities.filter((o) => o.type === 'share loss in growth'),
  };

  return (
    <div className="tb4l003">
      {/* 1 · Title bar */}
      <header className="tb4l003__titlebar">
        <div>
          <h2>
            {TB4L003_META.analyticId} · {TB4L003_META.name}
          </h2>
          <p>
            {TB4L003_META.country} · {TB4L003_META.category} · MAT ending {TB4L003_META.matEnd} (
            {TB4L003_META.matStart}–{TB4L003_META.matEndLabel}) · scope {TB4L003_META.scope}
          </p>
        </div>
        <span className="tb4l003__badge is-draft">{TB4L003_META.status}</span>
      </header>

      {/* 2 · Executive summary */}
      <section className="tb4l003__exec" aria-labelledby="tb4l003-exec">
        <h3 id="tb4l003-exec">Executive summary</h3>
        {insights.executiveSummary.filter(Boolean).map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </section>

      {/* 3 · Data status strip */}
      <div className="tb4l003__status" aria-label="Data checks V1 to V10">
        {checks.map((c) => (
          <span
            key={c.id}
            className={c.status === 'PASS' ? 'is-pass' : c.status === 'FLAG' ? 'is-flag' : 'is-fail'}
            title={`${c.rule} — ${c.detail}`}
          >
            {c.id} {c.status}
          </span>
        ))}
      </div>

      {/* 4 · KPI tiles */}
      <div className="tb4l003__kpis" aria-label="Category KPIs">
        <article className="tb4l003__kpi">
          <p>Category value</p>
          <strong>{fmtM(cat.valueMatM)}</strong>
        </article>
        <article className="tb4l003__kpi">
          <p>Value growth 1y</p>
          <strong className={tone(cat.growth1yPct)}>{fmtPct(cat.growth1yPct)}</strong>
        </article>
        <article className="tb4l003__kpi">
          <p>Unit growth 1y</p>
          <strong className={tone(cat.unitGrowth1yPct)}>{fmtPct(cat.unitGrowth1yPct)}</strong>
        </article>
        <article className="tb4l003__kpi">
          <p>Value CAGR {cagrLabel || '3y'}</p>
          <strong>{fmtPct(cagrShow)}</strong>
          {cagrLabel ? <em>2y fallback — 3y incomplete</em> : null}
        </article>
        <article className="tb4l003__kpi">
          <p>Bayer value</p>
          <strong>{fmtM(cat.bayerValueMatM)}</strong>
        </article>
        <article className="tb4l003__kpi">
          <p>Bayer share</p>
          <strong>{fmtShare(cat.bayerShareMatPct)}</strong>
          <em className={tone(cat.bayerShareChangePp)}>{fmtPp(cat.bayerShareChangePp)}</em>
        </article>
      </div>

      {/* 5 · Charts 1–4 */}
      <div className="tb4l003__charts">
        <article className="tb4l003__chart">
          <h3>1 · Market structure</h3>
          <Chart1Mekko />
        </article>
        <article className="tb4l003__chart">
          <h3>2 · Growth × share matrix</h3>
          <Chart2Bubble />
        </article>
        <article className="tb4l003__chart">
          <h3>3 · Who wins inside each segment</h3>
          <Chart3Wins />
        </article>
        <article className="tb4l003__chart">
          <h3>4 · Segment scorecard</h3>
          <Chart4Scorecard />
        </article>
      </div>

      {/* 6 · Key observations */}
      <section className="tb4l003__block" aria-labelledby="tb4l003-obs">
        <h3 id="tb4l003-obs">Key observations</h3>
        <ul className="tb4l003-obs">
          {insights.observations.map((o) => (
            <li key={o.id}>
              <div className="tb4l003-obs__head">
                <span className={`tb4l003-pill is-${o.importance.toLowerCase()}`}>{o.importance}</span>
                <span className="tb4l003-pill">{o.area}</span>
                <b>{o.headline}</b>
              </div>
              <p>{o.detail}</p>
              <small>
                Chart {o.chart} · {o.sources.join(' · ')}
              </small>
            </li>
          ))}
        </ul>
      </section>

      {/* 7 · Scenario classification */}
      <section className="tb4l003__block" aria-labelledby="tb4l003-scen">
        <h3 id="tb4l003-scen">Scenario classification</h3>
        <div className="tb4l003-table-wrap">
          <table className="tb4l003-scen">
            <thead>
              <tr>
                <th>Segment</th>
                <th>Code</th>
                <th>Growth vs category</th>
                <th>Bayer share</th>
                <th>Interpretation</th>
                <th>Decision to review</th>
                <th>Evidence needed</th>
              </tr>
            </thead>
            <tbody>
              {insights.scenarios.map((r) => (
                <tr key={r.segment}>
                  <td>{shortSegmentName(r.segment)}</td>
                  <td>
                    <strong className="code">{r.code}</strong>
                  </td>
                  <td>
                    {fmtPp(r.growthVsCategoryPp)} ({r.growthStatus})
                  </td>
                  <td>
                    {fmtShare(r.bayerSharePct)} ({r.shareStatus})
                  </td>
                  <td>{r.interpretation}</td>
                  <td>{r.decisionToReview}</td>
                  <td>
                    {r.evidenceNeeded}
                    {r.failedAxis ? ` Failed axis: ${r.failedAxis}.` : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 8 · Preliminary opportunities */}
      <section className="tb4l003__block" aria-labelledby="tb4l003-opp">
        <h3 id="tb4l003-opp">Preliminary opportunities</h3>
        {(['white space', 'near-miss', 'share loss in growth'] as const).map((type) => (
          <div key={type} style={{ marginBottom: 14 }}>
            <h4 style={{ margin: '0 0 8px', fontSize: 13, textTransform: 'capitalize' }}>{type}</h4>
            {byType[type].length === 0 ? (
              <p className="empty" style={{ margin: 0, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                None in this MAT window.
              </p>
            ) : (
              <ul className="tb4l003-opps">
                {byType[type].map((o) => (
                  <li key={`${o.type}-${o.segment}`}>
                    <p className="label">{o.label}</p>
                    <h4>{shortSegmentName(o.segment)}</h4>
                    <p>
                      {fmtM(o.valueEurM)} · vs category {fmtPp(o.growthVsCategoryPp)} · Bayer{' '}
                      {fmtShare(o.bayerSharePct)} ({fmtPp(o.bayerShareChangePp)})
                    </p>
                    <p>
                      Top 3: {o.top3 || '—'} · concentration {fmtShare(o.concentrationTop3Pct)}
                    </p>
                    <p>
                      CAGR {fmtPct(o.cagrPct)} ({o.cagrBasis}) · PPU change {fmtPct(o.ppuChangePct)}
                    </p>
                    <p>
                      <b>For:</b> {o.rationaleFor}
                    </p>
                    <p>
                      <b>Against:</b> {o.rationaleAgainst}
                    </p>
                    {o.unitGrowthSensitivity ? <p>{o.unitGrowthSensitivity}</p> : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      {/* 9 · Watch-outs */}
      <section className="tb4l003__block" aria-labelledby="tb4l003-watch">
        <h3 id="tb4l003-watch">Watch-outs</h3>
        <ol className="tb4l003-watch">
          {insights.watchOuts.map((w, i) => (
            <li key={i}>
              <b>{w.type}:</b> {w.text}
            </li>
          ))}
        </ol>
      </section>

      {/* 10 · Footer */}
      <footer className="tb4l003__footer">
        <p>
          Source: {TB4L003_META.source} · {TB4L003_META.dataRefreshNote} · Analytic {TB4L003_META.analyticId} v
          {TB4L003_META.version}
        </p>
        <p>
          AI-generated insights from CALC (deterministic stand-in for insights agent). Status:{' '}
          {TB4L003_META.status}. Review and discussion only — not investment, entry, or delisting decisions.
        </p>
      </footer>
    </div>
  );
}
