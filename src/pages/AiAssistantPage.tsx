import { useState } from 'react';
import { NavLink, Navigate, useParams } from 'react-router-dom';
import { CopaReport } from '../components/CopaReport';
import { FinanceMcpAudit } from '../components/FinanceMcpAudit';
import { M360MarketStory } from '../components/M360MarketStory';
import { M360MarketStoryV3 } from '../components/M360MarketStoryV3';
import { M360MarketStoryV4 } from '../components/M360MarketStoryV4';
import { M360MarketStoryV5 } from '../components/M360MarketStoryV5';
import { M360Report } from '../components/M360Report';
import { SiriusTip, type SiriusTable } from '../components/SiriusTip';
import { Tb4l003Report } from '../components/Tb4l003Report';
import { CALC_FORMULAS, CAGR_3Y_NOTE } from '../data/m360Charts';
import {
  CALC_CHANNEL_FORMULAS,
  M360_CHANNEL_BRANDS,
  M360_CHANNEL_META,
  M360_CHANNELS,
} from '../data/m360ChannelRetrieval';
import { COPA_FORMULAS, COPA_MISSING } from '../data/copaCharts';
import { COPA_BRAND_YEARS, COPA_RETRIEVAL_PARAMS } from '../data/copaRetrieval';
import {
  M360_PROMPT_PLACEHOLDERS,
  M360_REPLICATION_PROMPTS,
  type ReplicationPrompt,
} from '../data/m360ReplicationPrompts';
import {
  M360_CATEGORY_ANALYTICS,
  M360_CHART_PLAYBOOK,
  M360_C_QUESTION_CHARTS,
  M360_REPLICATION_RULE_GROUPS,
  M360_STORY_SECTIONS,
  type M360CCatalogRow,
} from '../data/m360ReplicationRules';
import {
  M360_METADATA,
  M360_RETRIEVAL_PARAMS,
  M360_SEGMENTS,
  M360_SUBBRANDS,
  buildM360Checks,
  type NullableNumber,
} from '../data/m360Retrieval';
import './AiAssistantPage.css';

const M360_C_GROUPS: { cId: string; c: string; rows: M360CCatalogRow[] }[] = (() => {
  const order: string[] = [];
  const map = new Map<string, M360CCatalogRow[]>();
  for (const row of M360_C_QUESTION_CHARTS) {
    if (!map.has(row.cId)) {
      order.push(row.cId);
      map.set(row.cId, []);
    }
    map.get(row.cId)!.push(row);
  }
  return order.map((cId) => ({
    cId,
    c: map.get(cId)![0].c,
    rows: map.get(cId)!,
  }));
})();

const M360_C_STORY_ANCHOR: Record<string, string> = {
  exec: 'story-exec',
  category: 'story-category',
  customers: 'story-customers',
  competition: 'story-competition',
  consumers: 'story-consumers',
  convincers: 'story-convincers',
  culture: 'story-culture',
  synthesis: 'story-synthesis',
};

function cStatusLabel(status: M360CCatalogRow['status']): string {
  if (status === 'sirius') return 'Sirius';
  if (status === 'proxy') return 'POS proxy';
  if (status === 'stub') return 'Stub';
  return 'Bridge';
}

const MARKET_CALC_FORMULAS = [...CALC_FORMULAS, ...CALC_CHANNEL_FORMULAS];

function Td({
  table,
  field,
  children,
}: {
  table: SiriusTable;
  field: string;
  children: string | number;
}) {
  return (
    <td>
      <SiriusTip table={table} field={field}>
        {children}
      </SiriusTip>
    </td>
  );
}

function cell(value: NullableNumber | string | number | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return 'N/A';
    return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }
  return String(value);
}

function PromptBlock({ prompt }: { prompt: ReplicationPrompt }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt.body);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }
  return (
    <article className="ai-prompt">
      <header className="ai-prompt__head">
        <div>
          <h3 className="ai-prompt__title">{prompt.title}</h3>
          <p className="ai-prompt__purpose">{prompt.purpose}</p>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </header>
      <pre className="ai-prompt__body">{prompt.body}</pre>
    </article>
  );
}

export type AiAssistantVariant = 'classic' | 'v2' | 'v3' | 'v4' | 'v5';

function assistantBase(variant: AiAssistantVariant): string {
  if (variant === 'v5') return '/ai-assistant-v5';
  if (variant === 'v4') return '/ai-assistant-v4';
  if (variant === 'v3') return '/ai-assistant-v3';
  if (variant === 'v2') return '/ai-assistant-v2';
  return '/ai-assistant';
}

type AssistantPane = 'market' | 'finance' | 'tb4l-003';

export function AiAssistantPage({ variant = 'classic' }: { variant?: AiAssistantVariant }) {
  const { pane } = useParams();
  const base = assistantBase(variant);
  /** Bain Landscape C focus for Market v5 — null = show all sections. */
  const [focusCId, setFocusCId] = useState<string | null>(null);
  /** Category Discover analytic (under Category C) — v5 only. */
  const [focusCategoryAnalyticId, setFocusCategoryAnalyticId] = useState<string | null>(null);
  if (pane && pane !== 'market' && pane !== 'finance' && pane !== 'tb4l-003') {
    return <Navigate to={`${base}/market`} replace />;
  }
  const view: AssistantPane =
    pane === 'finance' ? 'finance' : pane === 'tb4l-003' ? 'tb4l-003' : 'market';
  const checks = buildM360Checks();
  const p = M360_RETRIEVAL_PARAMS;
  const m = M360_METADATA;
  const isV2 = variant === 'v2';
  const isV3 = variant === 'v3';
  const isV4 = variant === 'v4';
  const isV5 = variant === 'v5';
  const isV3Plus = isV3 || isV4 || isV5;
  const isStory = isV2 || isV3Plus;
  const activeCGroup = focusCId ? M360_C_GROUPS.find((g) => g.cId === focusCId) ?? null : null;
  const activeCategoryAnalytic =
    focusCId === 'category' && focusCategoryAnalyticId
      ? M360_CATEGORY_ANALYTICS.find((a) => a.id === focusCategoryAnalyticId) ?? null
      : null;
  const showKirillSegmentShare =
    focusCId === 'category' && focusCategoryAnalyticId === 'segment-share-white-space';

  function scrollMarketBody() {
    window.setTimeout(() => {
      document.querySelector('.ai-window__body')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  function selectC(cId: string | null) {
    setFocusCId(cId);
    if (cId === 'category') {
      setFocusCategoryAnalyticId('segment-share-white-space');
      scrollMarketBody();
      return;
    }
    setFocusCategoryAnalyticId(null);
    window.setTimeout(() => {
      const anchor = cId ? M360_C_STORY_ANCHOR[cId] : 'story-exec';
      const el = document.getElementById(anchor);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      document.querySelector('.ai-window__body')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  function selectCategoryAnalytic(analyticId: string) {
    setFocusCId('category');
    setFocusCategoryAnalyticId(analyticId);
    scrollMarketBody();
  }

  function categoryAnalyticStatusLabel(status: 'live' | 'partial' | 'stub'): string {
    if (status === 'live') return 'Live';
    if (status === 'partial') return 'Partial';
    return 'Stub';
  }

  return (
    <div
      className={`ai-assistant-page ai-assistant-page--tables${isV2 ? ' ai-assistant-page--v2' : ''}${isV3 ? ' ai-assistant-page--v3' : ''}${isV4 ? ' ai-assistant-page--v4' : ''}${isV5 ? ' ai-assistant-page--v5' : ''}`}
    >
      <header className="ai-assistant-hero">
        <div className="ai-assistant-hero__copy">
          <p className="ai-assistant-hero__eyebrow">
            {view === 'tb4l-003'
              ? 'Discover analytic · TB4L-003 building block'
              : isV3Plus || isV2
                ? 'Brand manager report · story redesign'
                : 'Brand manager report'}
          </p>
          <h1 className="page-title">
            {isV5
              ? 'AI Assistant v5'
              : isV4
                ? 'AI Assistant v4'
                : isV3
                  ? 'AI Assistant v3'
                  : isV2
                    ? 'AI Assistant v2'
                    : 'AI Assistant'}
          </h1>
          <p className="page-subtitle">
            {view === 'tb4l-003'
              ? 'Segment Share and White Space — fixed layout from TB4L-003 v0.2. Same Sirius MAT extract as Market; scenario codes S1–S4 / U0; review only, not recommendations.'
              : view === 'market'
                ? isV5
                  ? 'Market window · sell-out, latest 12 months. Bain Landscape 6Cs (Category, Customers, Competition, Consumers, Convincers, Culture).'
                  : isV3Plus
                    ? 'Market window · sell-out, latest 12 months. Bain-logic drill-down from category to brand and channel.'
                    : isV2
                      ? 'Same Sirius and COPA clocks as AI Assistant. Market follows a Bain-logic drill-down; finance is unchanged. Compare side by side with the classic tab.'
                      : 'Two windows. Market is Sirius sell-out for the latest 12 months. Finance is internal COPA for calendar 2025 versus 2024. Prompt one window at a time — the clocks are different.'
                : isStory
                  ? 'Finance window · internal COPA, calendar 2025 versus 2024. Same finance pack as classic; compare side by side with the classic tab.'
                  : 'Finance window · internal COPA for calendar 2025 versus 2024. Prompt this window separately from Market — the clocks are different.'}
          </p>
        </div>
        <dl className="ai-assistant-params">
          <div>
            <dt>Country</dt>
            <dd>{p.country}</dd>
          </div>
          <div>
            <dt>Category</dt>
            <dd>{p.category}</dd>
          </div>
          <div>
            <dt>Competitive set</dt>
            <dd>Iberogast</dd>
          </div>
          <div>
            <dt>Currency</dt>
            <dd>{p.currency}</dd>
          </div>
        </dl>
      </header>

      <nav className="ai-windows" aria-label="Data windows">
        <NavLink
          to={`${base}/market`}
          className={({ isActive }) => `ai-windows__tab${isActive ? ' is-active' : ''}`}
        >
          Market window
          <span>{isV3Plus ? 'Sell-out · latest 12 months' : 'Sirius · latest 12 months'}</span>
        </NavLink>
        <NavLink
          to={`${base}/tb4l-003`}
          className={({ isActive }) => `ai-windows__tab${isActive ? ' is-active' : ''}`}
        >
          TB4L-003
          <span>Segment share & white space</span>
        </NavLink>
        <NavLink
          to={`${base}/finance`}
          className={({ isActive }) => `ai-windows__tab${isActive ? ' is-active' : ''}`}
        >
          Finance window
          <span>COPA · calendar 2025 vs 2024</span>
        </NavLink>
      </nav>

      {view === 'market' ? (
        <section className="ai-window" aria-label="Market window">
          <header className="ai-window__bar">
            <p className="ai-window__title">Market{isStory ? ' · story' : ''}</p>
            <p className="ai-window__meta">
              {p.country} {p.category} · Iberogast competitive set · MAT ending {m.latest_actual_month}
            </p>
          </header>
          {isV5 ? (
            <div className="ai-c-nav ai-c-nav--in-window" aria-label="Bain Landscape 6Cs">
              <p className="ai-c-nav__lede">
                Click a C to show only that analysis. <strong>All</strong> shows the full story.
              </p>
              <div className="ai-c-nav__tabs" role="tablist" aria-label="Landscape Cs">
                <button
                  type="button"
                  role="tab"
                  aria-selected={focusCId === null}
                  className={`ai-c-nav__tab${focusCId === null ? ' is-active' : ''}`}
                  onClick={() => selectC(null)}
                >
                  All
                </button>
                {M360_C_GROUPS.map((group) => (
                  <button
                    key={group.cId}
                    type="button"
                    role="tab"
                    aria-selected={focusCId === group.cId}
                    className={`ai-c-nav__tab${focusCId === group.cId ? ' is-active' : ''}`}
                    onClick={() => selectC(group.cId)}
                  >
                    {group.c}
                  </button>
                ))}
              </div>
              {activeCGroup ? (
                <p className="ai-c-nav__focus-note">
                  Showing <strong>{activeCGroup.c}</strong>
                  <span className={`ai-c-status is-${activeCGroup.rows[0].status}`}>
                    {cStatusLabel(activeCGroup.rows[0].status)}
                  </span>
                  {activeCategoryAnalytic ? (
                    <>
                      {' '}
                      · <strong>{activeCategoryAnalytic.title}</strong>
                    </>
                  ) : (
                    <>
                      {' '}
                      — {activeCGroup.rows.length} view{activeCGroup.rows.length === 1 ? '' : 's'} below.
                    </>
                  )}
                </p>
              ) : null}
              {focusCId === 'category' ? (
                <div className="ai-c-subnav" aria-label="Category analytics">
                  <p className="ai-c-subnav__lede">Category analytics (Discover)</p>
                  <div className="ai-c-subnav__tabs" role="tablist">
                    {M360_CATEGORY_ANALYTICS.map((analytic) => (
                      <button
                        key={analytic.id}
                        type="button"
                        role="tab"
                        aria-selected={focusCategoryAnalyticId === analytic.id}
                        className={`ai-c-subnav__tab${focusCategoryAnalyticId === analytic.id ? ' is-active' : ''}${analytic.status === 'stub' ? ' is-stub' : ''}`}
                        onClick={() => selectCategoryAnalytic(analytic.id)}
                      >
                        {analytic.title}
                        <span
                          className={`ai-c-status is-${analytic.status === 'live' ? 'sirius' : analytic.status === 'partial' ? 'proxy' : 'stub'}`}
                        >
                          {categoryAnalyticStatusLabel(analytic.status)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
          <div className="ai-window__body">
            {isV5 && showKirillSegmentShare ? (
              <div className="ai-category-analytic" id="story-category">
                <header className="ai-category-analytic__head">
                  <p className="ai-category-analytic__kicker">Category · TB4L-003</p>
                  <h2 className="ai-category-analytic__title">Segment Share and White Space</h2>
                  <p className="ai-category-analytic__q">
                    {M360_CATEGORY_ANALYTICS.find((a) => a.id === 'segment-share-white-space')?.question}
                  </p>
                  <p className="ai-category-analytic__note">
                    Layout follows Kirill’s building block v0.2: title → executive summary → data checks → 6 KPIs →
                    charts 1–4 → observations → scenarios → candidates → watch-outs. GB BAM · review only.
                  </p>
                </header>
                <Tb4l003Report />
              </div>
            ) : isV5 && focusCId === 'category' && activeCategoryAnalytic ? (
              <div className="ai-category-analytic ai-category-analytic--stub" id="story-category">
                <header className="ai-category-analytic__head">
                  <p className="ai-category-analytic__kicker">Category</p>
                  <h2 className="ai-category-analytic__title">{activeCategoryAnalytic.title}</h2>
                  <p className="ai-category-analytic__q">{activeCategoryAnalytic.question}</p>
                </header>
                <div className="m360-c-stub" role="note">
                  <p>
                    <strong>{categoryAnalyticStatusLabel(activeCategoryAnalytic.status)}.</strong>{' '}
                    {activeCategoryAnalytic.note}
                  </p>
                  <p>
                    Open <strong>Segment Share and White Space</strong> for the live Kirill / TB4L-003 analytic, or
                    choose another Landscape C.
                  </p>
                </div>
              </div>
            ) : isV5 ? (
              <M360MarketStoryV5 focusCId={focusCId} />
            ) : isV4 ? (
              <M360MarketStoryV4 />
            ) : isV3 ? (
              <M360MarketStoryV3 />
            ) : isV2 ? (
              <M360MarketStory />
            ) : (
              <M360Report />
            )}
          </div>
        </section>
      ) : view === 'tb4l-003' ? (
        <section className="ai-window" aria-label="TB4L-003 Segment Share and White Space">
          <header className="ai-window__bar">
            <p className="ai-window__title">TB4L-003 · Segment Share and White Space</p>
            <p className="ai-window__meta">
              {p.country} {p.category} · GB BAM · MAT ending {m.latest_actual_month} · DRAFT v0.2
            </p>
          </header>
          <div className="ai-window__body">
            <Tb4l003Report />
          </div>
        </section>
      ) : (
        <section className="ai-window ai-window--finance" aria-label="Finance window">
          <header className="ai-window__bar">
            <p className="ai-window__title">Finance</p>
            <p className="ai-window__meta">
              {COPA_RETRIEVAL_PARAMS.countryBsv} {COPA_RETRIEVAL_PARAMS.division} · calendar{' '}
              {COPA_RETRIEVAL_PARAMS.latestYear} versus {COPA_RETRIEVAL_PARAMS.priorYear}
            </p>
          </header>
          <div className="ai-window__body">
            <CopaReport />
            <FinanceMcpAudit />
          </div>
        </section>
      )}

      {view === 'finance' ? (
      <details className="ai-raw">
        <summary>Technical appendix — finance</summary>
        <p className="ai-raw__lede">
          For analysts. Brand-manager cards and charts above do not need this to be open.
        </p>

        <details className="ai-raw__inner">
          <summary>CALC formulas</summary>
          <p className="ai-table-note">
            Insights and the finance report only read these results. They do not compute extra metrics.
          </p>
          <div className="ai-table-wrap">
            <table className="ai-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Formula</th>
                  <th>From</th>
                </tr>
              </thead>
              <tbody>
                {COPA_FORMULAS.map((row) => (
                  <tr key={row.metric}>
                    <td>{row.metric}</td>
                    <td>{row.formula}</td>
                    <td>{row.from}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        <details className="ai-raw__inner">
          <summary>Retrieval params and period</summary>
          <p className="ai-table-note">
            Calendar {COPA_RETRIEVAL_PARAMS.latestYear} versus {COPA_RETRIEVAL_PARAMS.priorYear},{' '}
            {COPA_RETRIEVAL_PARAMS.division} {COPA_RETRIEVAL_PARAMS.countryBsv}. Do not mix with Sirius MAT Jul 2026.
            Sign convention: SUM(−amount_eur) as returned by the finance agent. Cost of goods and marketing are stored
            as absolute values from those signed amounts. Promotions and incentives (p&amp;i) had no rows in this
            extract.
          </p>
          <div className="ai-table-wrap">
            <table className="ai-table">
              <thead>
                <tr>
                  <th>Param</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    ['source', COPA_RETRIEVAL_PARAMS.source],
                    ['view', COPA_RETRIEVAL_PARAMS.view],
                    ['division', COPA_RETRIEVAL_PARAMS.division],
                    ['country', COPA_RETRIEVAL_PARAMS.countryBsv],
                    ['version', COPA_RETRIEVAL_PARAMS.version],
                    ['latestYear', COPA_RETRIEVAL_PARAMS.latestYear],
                    ['priorYear', COPA_RETRIEVAL_PARAMS.priorYear],
                    ['latestMonth', COPA_RETRIEVAL_PARAMS.latestMonth],
                    ['brandField', COPA_RETRIEVAL_PARAMS.brandField],
                  ] as const
                ).map(([key, value]) => (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>{String(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        <details className="ai-raw__inner">
          <summary>Brand-year snapshot</summary>
          <div className="ai-table-wrap">
            <table className="ai-table">
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Year</th>
                  <th>Gross Sales</th>
                  <th>Net Sales</th>
                  <th>Gross Profit</th>
                  <th>cCOGS</th>
                  <th>cMarketing</th>
                  <th>cEBIT</th>
                  <th>p&amp;i</th>
                </tr>
              </thead>
              <tbody>
                {COPA_BRAND_YEARS.map((r) => (
                  <tr key={`${r.brand}-${r.year}`}>
                    <td>{r.brand}</td>
                    <td>{r.year}</td>
                    <td>{r.grossSales.toFixed(2)}</td>
                    <td>{r.netSales.toFixed(2)}</td>
                    <td>{r.grossProfit.toFixed(2)}</td>
                    <td>{r.cogs.toFixed(2)}</td>
                    <td>{r.marketing.toFixed(2)}</td>
                    <td>{r.ebit.toFixed(2)}</td>
                    <td>{r.pi === null ? 'no rows' : r.pi.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        <details className="ai-raw__inner">
          <summary>Not in this finance extract</summary>
          <ul className="m360-rep-na">
            {COPA_MISSING.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </details>
      </details>
      ) : view === 'market' ? (
      <details className="ai-raw">
        <summary>Technical appendix — formulas, gaps, prompts, Sirius tables</summary>
        <p className="ai-raw__lede">
          For analysts and for AI replication. Everything needed to rebuild this Market analytics for another brand
          or market is below: rules, section order, chart playbook, CALC, gaps, copy-paste prompts, and Sirius
          tables. Brand-manager cards above do not need this open.
        </p>

        <details className="ai-raw__inner" open={isV3Plus}>
          <summary>Replication playbook — all rules</summary>
          <p className="ai-table-note">
            Canonical rule book for another country / category / brand. Placeholders match the prompt pack
            ({'{{COUNTRY}}'}, {'{{BRAND}}'}, …). Do not copy Iberogast-specific rivals or conclusions — rediscover
            pool, leak, and rival from that brand’s CALC.
          </p>
          {M360_REPLICATION_RULE_GROUPS.map((group) => (
            <section key={group.id} className="ai-rule-group" aria-labelledby={`rule-${group.id}`}>
              <h3 id={`rule-${group.id}`} className="ai-rule-group__title">
                {group.title}
              </h3>
              {group.intro ? <p className="ai-table-note">{group.intro}</p> : null}
              <ul className="m360-rep-na ai-rule-list">
                {group.items.map((item) => (
                  <li key={item.label}>
                    <b>{item.label}</b> — {item.rule}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </details>

        <details className="ai-raw__inner" open={isV3Plus}>
          <summary>Bain Landscape 6Cs — questions &amp; charts by C</summary>
          <p className="ai-table-note">
            What Market v5 already answers, grouped by Bain Landscape C. Status: Sirius = sell-out chart; POS
            proxy = consumer stand-in only; Stub = no data in this pack; Bridge = summary / actions.
          </p>
          {M360_C_GROUPS.map((group) => (
            <section key={group.cId} className="ai-rule-group ai-c-group" aria-labelledby={`c-cat-${group.cId}`}>
              <h3 id={`c-cat-${group.cId}`} className="ai-rule-group__title">
                <button
                  type="button"
                  className="ai-c-group__jump"
                  onClick={() => selectC(group.cId)}
                >
                  {group.c}
                </button>
                <span className={`ai-c-status is-${group.rows[0].status}`}>
                  {cStatusLabel(group.rows[0].status)}
                </span>
              </h3>
              <div className="ai-table-wrap">
                <table className="ai-table">
                  <thead>
                    <tr>
                      <th>Business question</th>
                      <th>Chart / visual</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.rows.map((row) => (
                      <tr key={`${row.cId}-${row.chart}-${row.question.slice(0, 24)}`}>
                        <td>{row.question}</td>
                        <td>{row.chart}</td>
                        <td>
                          <span className={`ai-c-status is-${row.status}`}>{cStatusLabel(row.status)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </details>

        <details className="ai-raw__inner">
          <summary>Story section order (Bain Landscape 6Cs)</summary>
          <p className="ai-table-note">
            Section order on the Market story page. One business question per section.
          </p>
          <div className="ai-table-wrap">
            <table className="ai-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Section</th>
                  <th>Business question</th>
                </tr>
              </thead>
              <tbody>
                {M360_STORY_SECTIONS.map((row) => (
                  <tr key={row.id}>
                    <td>{row.step}</td>
                    <td>{row.title}</td>
                    <td>{row.question}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        <details className="ai-raw__inner">
          <summary>Chart playbook</summary>
          <p className="ai-table-note">
            Chart types to use when replicating. Colors: slate = size; deeper slate + manufacturer tag = ownership;
            green/amber = change. No per–need-state rainbow.
          </p>
          <div className="ai-table-wrap">
            <table className="ai-table">
              <thead>
                <tr>
                  <th>Section</th>
                  <th>Chart</th>
                  <th>Reads</th>
                </tr>
              </thead>
              <tbody>
                {M360_CHART_PLAYBOOK.map((row) => (
                  <tr key={`${row.section}-${row.chart}`}>
                    <td>{row.section}</td>
                    <td>{row.chart}</td>
                    <td>{row.reads}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        <details className="ai-raw__inner">
          <summary>CALC formulas</summary>
          <p className="ai-table-note">
            Insights and the report only read these results (T1/T2 segment metrics plus T-ch / T-ch-b channel
            metrics). They do not compute extra metrics beyond this list.
          </p>
          <div className="ai-table-wrap">
            <table className="ai-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Formula</th>
                  <th>From</th>
                </tr>
              </thead>
              <tbody>
                {MARKET_CALC_FORMULAS.map((row) => (
                  <tr key={`${row.from} · ${row.metric}`}>
                    <td>{row.metric}</td>
                    <td>{row.formula}</td>
                    <td>{row.from}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        <details className="ai-raw__inner">
          <summary>Not in this Sirius extract (gaps → always N/A)</summary>
          <ul className="m360-rep-na">
            <li>
              <b>Channel grain still missing</b> — no customer / retailer grain; no drugstore or grocery for
              Germany. Pharmacies + E-commerce (Mail Order) totals, price/volume drivers, and top-brand dynamics
              are in the extract and shown in AI Assistant{' '}
              {isV5 ? 'v5' : isV4 ? 'v4' : isV3 ? 'v3' : 'v2'} · Channel dynamics (see T-ch / T-ch-b below).
            </li>
            <li>
              <b>Innovation bubble</b> — N/A
            </li>
            <li>
              <b>Perceptual map</b> brand strength × consumer relevance — N/A
            </li>
            <li>
              <b>Monthly Value RSP / share / EVI</b> — N/A (MAT windows only)
            </li>
            <li>
              <b>Household penetration / buyer panel</b> — N/A (sell-out share is not HH %)
            </li>
            <li>
              <b>Finance / COPA</b> — different clock; never mix into Market charts (see Finance appendix if needed)
            </li>
            {!isV3Plus ? (
              <>
                <li>
                  <b>Fiona finance</b> revenue, margin, waterfall, investment, price elasticity — N/A
                </li>
                <li>
                  <b>Market vs finance</b> share vs margin, growth vs profit — N/A
                </li>
              </>
            ) : null}
            <li>
              <b>3y CAGR</b> — N/A · {CAGR_3Y_NOTE}
            </li>
            <li>
              <b>T4 checks</b> —{' '}
              {checks.filter((c) => c.status === 'FAIL').map((c) => c.id).join(', ') || 'none failed'} (surface FAILs
              in Data care; do not silently ignore)
            </li>
          </ul>
        </details>

        <details className="ai-raw__inner">
          <summary>Prompts — replicate this Market story for another brand</summary>
          <p className="ai-table-note">
            Use with an LLM that can call Sirius / CHDAA (or paste retrieval tables). Read the{' '}
            <b>Replication playbook</b> above first, then replace <code>{'{{PLACEHOLDERS}}'}</code>. Prompt 1 =
            system instructions (full rules). Prompt 8 = one-shot. Prompt 9 = Iberogast fill for this report only.
          </p>
          <div className="ai-table-wrap">
            <table className="ai-table">
              <thead>
                <tr>
                  <th>Placeholder</th>
                  <th>Meaning</th>
                  <th>This report</th>
                </tr>
              </thead>
              <tbody>
                {M360_PROMPT_PLACEHOLDERS.map((row) => (
                  <tr key={row.key}>
                    <td>
                      <code>{row.key}</code>
                    </td>
                    <td>{row.meaning}</td>
                    <td>{row.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="ai-prompt-list">
            {M360_REPLICATION_PROMPTS.map((prompt) => (
              <PromptBlock key={prompt.id} prompt={prompt} />
            ))}
          </div>
        </details>

        <details className="ai-raw__inner">
          <summary>Sirius retrieval tables T1–T4 · channels</summary>
        <section aria-labelledby="t3-heading">
        <h2 id="t3-heading" className="section-title">
          Table 3 · Metadata
        </h2>
        <div className="ai-table-wrap">
          <table className="ai-table">
            <thead>
              <tr>
                <th>latest_actual_month</th>
                <th>mat_start</th>
                <th>mat_end</th>
                <th>scope</th>
                <th>currency</th>
                <th>rows_total</th>
                <th>rows_excluded_outlier</th>
                <th>units_fill_rate_pct</th>
                <th>months_available_for_3ya</th>
                <th>segments_returned</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <Td table="T3" field="latest_actual_month">{m.latest_actual_month}</Td>
                <Td table="T3" field="mat_start">{m.mat_start}</Td>
                <Td table="T3" field="mat_end">{m.mat_end}</Td>
                <Td table="T3" field="scope">{m.scope}</Td>
                <Td table="T3" field="currency">{m.currency}</Td>
                <Td table="T3" field="rows_total">{cell(m.rows_total)}</Td>
                <Td table="T3" field="rows_excluded_outlier">{cell(m.rows_excluded_outlier)}</Td>
                <Td table="T3" field="units_fill_rate_pct">{cell(m.units_fill_rate_pct)}</Td>
                <Td table="T3" field="months_available_for_3ya">{cell(m.months_available_for_3ya)}</Td>
                <Td table="T3" field="segments_returned">{cell(m.segments_returned)}</Td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="ai-table-note">
          MAT_3YA incomplete ({m.months_available_for_3ya}/12 months) — value_3ya, units_3ya,
          bayer_value_3ya = N/A. Source: {p.source}. Local currency = EUR (same as EUR).
        </p>
      </section>

      <section aria-labelledby="t1-heading">
        <h2 id="t1-heading" className="section-title">
          Table 1 · Segments
        </h2>
        <div className="ai-table-wrap">
          <table className="ai-table">
            <thead>
              <tr>
                <th>country</th>
                <th>category</th>
                <th>segment_name</th>
                <th>value_mat</th>
                <th>value_ya</th>
                <th>value_2ya</th>
                <th>value_3ya</th>
                <th>units_mat</th>
                <th>units_ya</th>
                <th>units_3ya</th>
                <th>bayer_value_mat</th>
                <th>bayer_value_ya</th>
                <th>bayer_value_3ya</th>
                <th>n_subbrands_total</th>
              </tr>
            </thead>
            <tbody>
              {M360_SEGMENTS.map((row) => (
                <tr key={row.segment_name}>
                  <Td table="T1" field={`${row.segment_name} · country`}>{row.country}</Td>
                  <Td table="T1" field={`${row.segment_name} · category`}>{row.category}</Td>
                  <Td table="T1" field={`${row.segment_name} · segment_name`}>{row.segment_name}</Td>
                  <Td table="T1" field={`${row.segment_name} · value_mat`}>{cell(row.value_mat)}</Td>
                  <Td table="T1" field={`${row.segment_name} · value_ya`}>{cell(row.value_ya)}</Td>
                  <Td table="T1" field={`${row.segment_name} · value_2ya`}>{cell(row.value_2ya)}</Td>
                  <Td table="T1" field={`${row.segment_name} · value_3ya`}>{cell(row.value_3ya)}</Td>
                  <Td table="T1" field={`${row.segment_name} · units_mat`}>{cell(row.units_mat)}</Td>
                  <Td table="T1" field={`${row.segment_name} · units_ya`}>{cell(row.units_ya)}</Td>
                  <Td table="T1" field={`${row.segment_name} · units_3ya`}>{cell(row.units_3ya)}</Td>
                  <Td table="T1" field={`${row.segment_name} · bayer_value_mat`}>{cell(row.bayer_value_mat)}</Td>
                  <Td table="T1" field={`${row.segment_name} · bayer_value_ya`}>{cell(row.bayer_value_ya)}</Td>
                  <Td table="T1" field={`${row.segment_name} · bayer_value_3ya`}>{cell(row.bayer_value_3ya)}</Td>
                  <Td table="T1" field={`${row.segment_name} · n_subbrands_total`}>{cell(row.n_subbrands_total)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="t2-heading">
        <h2 id="t2-heading" className="section-title">
          Table 2 · Sub-brands
        </h2>
        <div className="ai-table-wrap">
          <table className="ai-table">
            <thead>
              <tr>
                <th>segment_name</th>
                <th>manufacturer</th>
                <th>brand</th>
                <th>sub_brand</th>
                <th>sub_brand_source</th>
                <th>is_bayer</th>
                <th>value_mat</th>
                <th>value_ya</th>
                <th>value_3ya</th>
                <th>units_mat</th>
                <th>units_ya</th>
              </tr>
            </thead>
            <tbody>
              {M360_SUBBRANDS.map((row, i) => (
                <tr key={`${row.segment_name}-${row.manufacturer}-${row.sub_brand}-${i}`}>
                  <Td table="T2" field={`${row.segment_name} · ${row.sub_brand} · segment_name`}>{row.segment_name}</Td>
                  <Td table="T2" field={`${row.segment_name} · ${row.sub_brand} · manufacturer`}>{row.manufacturer}</Td>
                  <Td table="T2" field={`${row.segment_name} · ${row.sub_brand} · brand`}>{row.brand}</Td>
                  <Td table="T2" field={`${row.segment_name} · ${row.sub_brand}`}>
                    {`${row.sub_brand}${row.grouped_count ? ` [${row.grouped_count}]` : ''}`}
                  </Td>
                  <Td table="T2" field={`${row.segment_name} · ${row.sub_brand} · sub_brand_source`}>{row.sub_brand_source}</Td>
                  <Td table="T2" field={`${row.segment_name} · ${row.sub_brand} · is_bayer`}>{row.is_bayer}</Td>
                  <Td table="T2" field={`${row.segment_name} · ${row.sub_brand} · value_mat`}>{cell(row.value_mat)}</Td>
                  <Td table="T2" field={`${row.segment_name} · ${row.sub_brand} · value_ya`}>{cell(row.value_ya)}</Td>
                  <Td table="T2" field={`${row.segment_name} · ${row.sub_brand} · value_3ya`}>{cell(row.value_3ya)}</Td>
                  <Td table="T2" field={`${row.segment_name} · ${row.sub_brand} · units_mat`}>{cell(row.units_mat)}</Td>
                  <Td table="T2" field={`${row.segment_name} · ${row.sub_brand} · units_ya`}>{cell(row.units_ya)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="t4-heading">
        <h2 id="t4-heading" className="section-title">
          Table 4 · Checks
        </h2>
        <div className="ai-table-wrap">
          <table className="ai-table">
            <thead>
              <tr>
                <th>id</th>
                <th>check</th>
                <th>status</th>
                <th>values</th>
              </tr>
            </thead>
            <tbody>
              {checks.map((row) => (
                <tr key={row.id}>
                  <Td table="T4" field={`${row.id} · id`}>{row.id}</Td>
                  <Td table="T4" field={`${row.id} · check`}>{row.check}</Td>
                  <td>
                    <SiriusTip table="T4" field={`${row.id} · status`}>
                      <span className={`ai-check ai-check--${row.status.toLowerCase()}`}>
                        {row.status}
                      </span>
                    </SiriusTip>
                  </td>
                  <Td table="T4" field={`${row.id} · values`}>{row.values}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="tch-heading">
        <h2 id="tch-heading" className="section-title">
          Table · Channels
        </h2>
        <p className="ai-table-note">
          {M360_CHANNEL_META.country} · {M360_CHANNEL_META.scope} · MAT ending {M360_CHANNEL_META.matEnd}.{' '}
          {M360_CHANNEL_META.note} Source: {M360_CHANNEL_META.source}.
        </p>
        <div className="ai-table-wrap">
          <table className="ai-table">
            <thead>
              <tr>
                <th>channel</th>
                <th>local_channel</th>
                <th>value_eur_m</th>
                <th>share_of_set_pct</th>
                <th>value_growth_pct</th>
                <th>unit_growth_pct</th>
                <th>price_contrib_eur_m</th>
                <th>volume_contrib_eur_m</th>
                <th>new_pack_eur_m</th>
                <th>new_product_eur_m</th>
                <th>intersection_eur_m</th>
                <th>abs_change_eur_m</th>
                <th>pct_of_set_abs_growth</th>
              </tr>
            </thead>
            <tbody>
              {M360_CHANNELS.map((row) => (
                <tr key={row.channel}>
                  <Td table="T-ch" field={`${row.channel} · channel`}>{row.channel}</Td>
                  <Td table="T-ch" field={`${row.channel} · local_channel`}>{row.localChannel}</Td>
                  <Td table="T-ch" field={`${row.channel} · value_eur_m`}>{cell(row.valueEurM)}</Td>
                  <Td table="T-ch" field={`${row.channel} · share_of_set_pct`}>{cell(row.shareOfSetPct)}</Td>
                  <Td table="T-ch" field={`${row.channel} · value_growth_pct`}>{cell(row.valueGrowthPct)}</Td>
                  <Td table="T-ch" field={`${row.channel} · unit_growth_pct`}>{cell(row.unitGrowthPct)}</Td>
                  <Td table="T-ch" field={`${row.channel} · price_contrib_eur_m`}>{cell(row.priceContribEurM)}</Td>
                  <Td table="T-ch" field={`${row.channel} · volume_contrib_eur_m`}>{cell(row.volumeContribEurM)}</Td>
                  <Td table="T-ch" field={`${row.channel} · new_pack_eur_m`}>{cell(row.newPackEurM)}</Td>
                  <Td table="T-ch" field={`${row.channel} · new_product_eur_m`}>{cell(row.newProductEurM)}</Td>
                  <Td table="T-ch" field={`${row.channel} · intersection_eur_m`}>{cell(row.intersectionEurM)}</Td>
                  <Td table="T-ch" field={`${row.channel} · abs_change_eur_m`}>{cell(row.absChangeEurM)}</Td>
                  <Td table="T-ch" field={`${row.channel} · pct_of_set_abs_growth`}>{cell(row.pctOfSetAbsGrowth)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="tchb-heading">
        <h2 id="tchb-heading" className="section-title">
          Table · Channel brands (top 8 by value)
        </h2>
        <div className="ai-table-wrap">
          <table className="ai-table">
            <thead>
              <tr>
                <th>channel</th>
                <th>rank</th>
                <th>brand</th>
                <th>is_bayer</th>
                <th>value_eur_m</th>
                <th>share_of_channel_pct</th>
                <th>share_change_pp</th>
                <th>value_growth_pct</th>
                <th>unit_growth_pct</th>
              </tr>
            </thead>
            <tbody>
              {M360_CHANNEL_BRANDS.map((row) => (
                <tr key={`${row.channel}-${row.rank}-${row.brand}`}>
                  <Td table="T-ch-b" field={`${row.channel} · ${row.brand} · channel`}>{row.channel}</Td>
                  <Td table="T-ch-b" field={`${row.channel} · ${row.brand} · rank`}>{row.rank}</Td>
                  <Td table="T-ch-b" field={`${row.channel} · ${row.brand}`}>{row.brand}</Td>
                  <Td table="T-ch-b" field={`${row.channel} · ${row.brand} · is_bayer`}>
                    {row.isBayer ? 'Y' : 'N'}
                  </Td>
                  <Td table="T-ch-b" field={`${row.channel} · ${row.brand} · value_eur_m`}>{cell(row.valueEurM)}</Td>
                  <Td table="T-ch-b" field={`${row.channel} · ${row.brand} · share_of_channel_pct`}>
                    {cell(row.shareOfChannelPct)}
                  </Td>
                  <Td table="T-ch-b" field={`${row.channel} · ${row.brand} · share_change_pp`}>
                    {cell(row.shareChangePp)}
                  </Td>
                  <Td table="T-ch-b" field={`${row.channel} · ${row.brand} · value_growth_pct`}>
                    {cell(row.valueGrowthPct)}
                  </Td>
                  <Td table="T-ch-b" field={`${row.channel} · ${row.brand} · unit_growth_pct`}>
                    {cell(row.unitGrowthPct)}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
        </details>
      </details>
      ) : null}
    </div>
  );
}
