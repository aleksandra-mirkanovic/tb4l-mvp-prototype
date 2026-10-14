/**
 * TB4L-003 Segment Share and White Space — analytic page per building block v0.2.
 * Charts use interactive Market story blocks (hover tooltips + focus).
 */
import { useMemo, useState } from 'react';
import {
  SCENARIO_COPY,
  TB4L003_CATEGORY,
  TB4L003_META,
  TB4L003_SEGMENTS,
  buildTb4l003Checks,
  shortSegmentName,
  type ScenarioCode,
} from '../data/tb4l003Calc';
import { buildTb4l003Insights } from '../data/tb4l003Insights';
import {
  StoryGrowthShareBubble,
  StoryMekkoChart,
  StorySegmentScorecard,
  StoryWhoWinsAll,
} from './M360Tb4l003StoryBlocks';
import './M360Report.css';
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

type ChartFocus = 'mekko' | 'bubble' | 'wins' | 'scorecard' | null;

export function Tb4l003Report() {
  const checks = buildTb4l003Checks();
  const insights = buildTb4l003Insights();
  const cat = TB4L003_CATEGORY;
  const cagrShow = cat.cagr3yPct ?? cat.cagr2yPct;
  const cagrLabel = cat.cagr3yPct != null ? '' : cat.cagr2yPct != null ? '2y*' : '';
  const [chartFocus, setChartFocus] = useState<ChartFocus>(null);
  const [segFocus, setSegFocus] = useState<string | null>(null);
  const [openOpp, setOpenOpp] = useState<string | null>(null);

  const byType = {
    'white space': insights.opportunities.filter((o) => o.type === 'white space'),
    'near-miss': insights.opportunities.filter((o) => o.type === 'near-miss'),
    'share loss in growth': insights.opportunities.filter((o) => o.type === 'share loss in growth'),
  };

  const focusSeg = useMemo(
    () => (segFocus ? TB4L003_SEGMENTS.find((s) => s.segment === segFocus) : null),
    [segFocus],
  );

  function jumpChart(id: ChartFocus) {
    setChartFocus(id);
    if (!id) return;
    window.setTimeout(() => {
      document.getElementById(`tb4l003-chart-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 40);
  }

  return (
    <div className="tb4l003 m360-rep m360-rep--story-v2 m360-rep--tb4l003" data-m360-interactive="1">
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

      {/* 3 · Data status strip — interactive (hover detail already via title) */}
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

      {/* 4 · KPI tiles — click jumps to related chart */}
      <div className="tb4l003__kpis" aria-label="Category KPIs">
        <button type="button" className="tb4l003__kpi is-click" onClick={() => jumpChart('mekko')}>
          <p>Category value</p>
          <strong>{fmtM(cat.valueMatM)}</strong>
        </button>
        <button type="button" className="tb4l003__kpi is-click" onClick={() => jumpChart('bubble')}>
          <p>Value growth 1y</p>
          <strong className={tone(cat.growth1yPct)}>{fmtPct(cat.growth1yPct)}</strong>
        </button>
        <button type="button" className="tb4l003__kpi is-click" onClick={() => jumpChart('scorecard')}>
          <p>Unit growth 1y</p>
          <strong className={tone(cat.unitGrowth1yPct)}>{fmtPct(cat.unitGrowth1yPct)}</strong>
        </button>
        <button type="button" className="tb4l003__kpi is-click" onClick={() => jumpChart('scorecard')}>
          <p>Value CAGR {cagrLabel || '3y'}</p>
          <strong>{fmtPct(cagrShow)}</strong>
          {cagrLabel ? <em>2y fallback — 3y incomplete</em> : null}
        </button>
        <button type="button" className="tb4l003__kpi is-click" onClick={() => jumpChart('mekko')}>
          <p>Bayer value</p>
          <strong>{fmtM(cat.bayerValueMatM)}</strong>
        </button>
        <button type="button" className="tb4l003__kpi is-click" onClick={() => jumpChart('bubble')}>
          <p>Bayer share</p>
          <strong>{fmtShare(cat.bayerShareMatPct)}</strong>
          <em className={tone(cat.bayerShareChangePp)}>{fmtPp(cat.bayerShareChangePp)}</em>
        </button>
      </div>

      {focusSeg ? (
        <div className="tb4l003__focus" role="status">
          <p>
            Focused segment: <strong>{shortSegmentName(focusSeg.segment)}</strong> · {fmtM(focusSeg.valueMatM)} ·
            growth {fmtPct(focusSeg.growth1yPct)} · Bayer {fmtShare(focusSeg.bayerShareMatPct)} (
            {fmtPp(focusSeg.bayerShareChangePp)}) · {focusSeg.scenarioCode}
          </p>
          <button type="button" className="tb4l003__focus-clear" onClick={() => setSegFocus(null)}>
            Clear focus
          </button>
        </div>
      ) : (
        <p className="tb4l003__hint">
          Hover charts for detail. Click a KPI to jump. Click a scorecard / scenario row to focus a segment.
        </p>
      )}

      {/* 5 · Charts 1–4 — interactive */}
      <div className="tb4l003__charts tb4l003__charts--interactive">
        <article
          id="tb4l003-chart-mekko"
          className={`tb4l003__chart${chartFocus === 'mekko' ? ' is-focus' : ''}`}
        >
          <h3>1 · Market structure</h3>
          <p className="tb4l003__q">Market: how big is each segment, and where does Bayer play?</p>
          <StoryMekkoChart />
        </article>
        <article
          id="tb4l003-chart-bubble"
          className={`tb4l003__chart${chartFocus === 'bubble' ? ' is-focus' : ''}`}
        >
          <h3>2 · Growth × share matrix</h3>
          <p className="tb4l003__q">
            Performance: which segments grow faster than the category, and where is Bayer present or absent?
          </p>
          <StoryGrowthShareBubble />
        </article>
        <article
          id="tb4l003-chart-wins"
          className={`tb4l003__chart tb4l003__chart--wide${chartFocus === 'wins' ? ' is-focus' : ''}`}
        >
          <h3>3 · Who wins inside each segment</h3>
          <p className="tb4l003__q">
            Competitors: which sub-brands lead each segment, and who grows faster or slower than it?
          </p>
          <StoryWhoWinsAll />
        </article>
        <article
          id="tb4l003-chart-scorecard"
          className={`tb4l003__chart tb4l003__chart--wide${chartFocus === 'scorecard' ? ' is-focus' : ''}`}
        >
          <h3>4 · Segment scorecard</h3>
          <p className="tb4l003__q">Summary: all key numbers per segment in one view</p>
          <div className="tb4l003-score-interactive">
            <StorySegmentScorecard />
            <div className="tb4l003-seg-pick" aria-label="Focus a segment">
              {TB4L003_SEGMENTS.map((s) => (
                <button
                  key={s.segment}
                  type="button"
                  className={`tb4l003-seg-pick__btn${segFocus === s.segment ? ' is-on' : ''}`}
                  onClick={() => setSegFocus((cur) => (cur === s.segment ? null : s.segment))}
                >
                  {shortSegmentName(s.segment)}
                  <span>{s.scenarioCode}</span>
                </button>
              ))}
            </div>
          </div>
        </article>
      </div>

      {/* 6 · Key observations */}
      <section className="tb4l003__block" aria-labelledby="tb4l003-obs">
        <h3 id="tb4l003-obs">Key observations</h3>
        <ul className="tb4l003-obs">
          {insights.observations.map((o) => (
            <li key={o.id}>
              <button
                type="button"
                className="tb4l003-obs__btn"
                onClick={() => {
                  const map: Record<1 | 2 | 3 | 4, ChartFocus> = {
                    1: 'mekko',
                    2: 'bubble',
                    3: 'wins',
                    4: 'scorecard',
                  };
                  jumpChart(map[o.chart]);
                }}
              >
                <div className="tb4l003-obs__head">
                  <span className={`tb4l003-pill is-${o.importance.toLowerCase()}`}>{o.importance}</span>
                  <span className="tb4l003-pill">{o.area}</span>
                  <b>{o.headline}</b>
                </div>
                <p>{o.detail}</p>
                <small>
                  Chart {o.chart} · {o.sources.join(' · ')} · click to jump
                </small>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* 7 · Scenario classification */}
      <section className="tb4l003__block" aria-labelledby="tb4l003-scen">
        <h3 id="tb4l003-scen">Scenario classification</h3>
        <div className="tb4l003-table-wrap">
          <table className="tb4l003-score tb4l003-scen">
            <thead>
              <tr>
                <th>Segment</th>
                <th>Code</th>
                <th>Growth vs cat.</th>
                <th>Bayer share</th>
                <th>Interpretation</th>
                <th>Decision to review</th>
              </tr>
            </thead>
            <tbody>
              {TB4L003_SEGMENTS.map((s) => {
                const copy =
                  s.scenarioCode === 'U0'
                    ? {
                        interpretation: 'Missing or borderline growth/share axis — do not force S1–S4.',
                        decisionToReview: `Failed axis: ${s.failedAxis ?? 'unknown'}.`,
                      }
                    : SCENARIO_COPY[s.scenarioCode as Exclude<ScenarioCode, 'U0'>];
                return (
                  <tr
                    key={s.segment}
                    className={segFocus === s.segment ? 'is-focus-row' : ''}
                    onClick={() => setSegFocus((cur) => (cur === s.segment ? null : s.segment))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSegFocus((cur) => (cur === s.segment ? null : s.segment));
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-pressed={segFocus === s.segment}
                  >
                    <td>{shortSegmentName(s.segment)}</td>
                    <td className="code">{s.scenarioCode}</td>
                    <td className={tone(s.growthVsCategoryPp)}>{fmtPp(s.growthVsCategoryPp)}</td>
                    <td className={(s.bayerShareMatPct ?? 100) < 3 ? 'is-absent' : ''}>
                      {fmtShare(s.bayerShareMatPct)}
                    </td>
                    <td>{copy.interpretation}</td>
                    <td>{copy.decisionToReview}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 8 · Preliminary opportunities */}
      <section className="tb4l003__block" aria-labelledby="tb4l003-opp">
        <h3 id="tb4l003-opp">Preliminary opportunities</h3>
        {(['white space', 'near-miss', 'share loss in growth'] as const).map((type) => (
          <div key={type} className="tb4l003-opp-group">
            <h4>{type}</h4>
            {byType[type].length === 0 ? (
              <p className="tb4l003-bubble__note">None in this MAT window.</p>
            ) : (
              <ul className="tb4l003-opp">
                {byType[type].map((o) => {
                  const oppKey = `${o.type}:${o.segment}`;
                  const open = openOpp === oppKey;
                  return (
                    <li key={oppKey} className={open ? 'is-open' : undefined}>
                      <button
                        type="button"
                        className="tb4l003-opp__toggle"
                        aria-expanded={open}
                        onClick={() => setOpenOpp((cur) => (cur === oppKey ? null : oppKey))}
                      >
                        <b>{o.segment}</b>
                        <span>{open ? 'Hide' : 'Why for / against'}</span>
                      </button>
                      {open ? (
                        <div className="tb4l003-opp__body">
                          <p>
                            <b>For:</b> {o.rationaleFor}
                          </p>
                          <p>
                            <b>Against:</b> {o.rationaleAgainst}
                          </p>
                          {o.unitGrowthSensitivity ? <p>{o.unitGrowthSensitivity}</p> : null}
                        </div>
                      ) : null}
                    </li>
                  );
                })}
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
          Interactive charts: hover for numbers; KPI / observation click jumps to chart; scenario rows focus a
          segment. AI-generated insights from CALC. Status: {TB4L003_META.status}. Review and discussion only —
          not investment, entry, or delisting decisions.
        </p>
      </footer>
    </div>
  );
}
