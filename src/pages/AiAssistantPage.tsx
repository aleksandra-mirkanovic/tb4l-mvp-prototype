import { useState } from 'react';
import { NavLink, Navigate, useParams } from 'react-router-dom';
import { CopaReport } from '../components/CopaReport';
import { FinanceMcpAudit } from '../components/FinanceMcpAudit';
import { M360MarketStory } from '../components/M360MarketStory';
import { M360MarketStoryV3 } from '../components/M360MarketStoryV3';
import { M360Report } from '../components/M360Report';
import { SiriusTip, type SiriusTable } from '../components/SiriusTip';
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
  M360_METADATA,
  M360_RETRIEVAL_PARAMS,
  M360_SEGMENTS,
  M360_SUBBRANDS,
  buildM360Checks,
  type NullableNumber,
} from '../data/m360Retrieval';
import './AiAssistantPage.css';

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

export type AiAssistantVariant = 'classic' | 'v2' | 'v3';

function assistantBase(variant: AiAssistantVariant): string {
  if (variant === 'v3') return '/ai-assistant-v3';
  if (variant === 'v2') return '/ai-assistant-v2';
  return '/ai-assistant';
}

export function AiAssistantPage({ variant = 'classic' }: { variant?: AiAssistantVariant }) {
  const { pane } = useParams();
  const base = assistantBase(variant);
  if (pane && pane !== 'market' && pane !== 'finance') {
    return <Navigate to={`${base}/market`} replace />;
  }
  const view = pane === 'finance' ? 'finance' : 'market';
  const checks = buildM360Checks();
  const p = M360_RETRIEVAL_PARAMS;
  const m = M360_METADATA;
  const isV2 = variant === 'v2';
  const isV3 = variant === 'v3';
  const isStory = isV2 || isV3;

  return (
    <div
      className={`ai-assistant-page ai-assistant-page--tables${isV2 ? ' ai-assistant-page--v2' : ''}${isV3 ? ' ai-assistant-page--v3' : ''}`}
    >
      <header className="ai-assistant-hero">
        <div className="ai-assistant-hero__copy">
          <p className="ai-assistant-hero__eyebrow">
            {isV3
              ? 'Brand manager report · story redesign'
              : isV2
                ? 'Brand manager report · story redesign'
                : 'Brand manager report'}
          </p>
          <h1 className="page-title">
            {isV3 ? 'AI Assistant v3' : isV2 ? 'AI Assistant v2' : 'AI Assistant'}
          </h1>
          <p className="page-subtitle">
            {view === 'market'
              ? isV3
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
          <span>{isV3 ? 'Sell-out · latest 12 months' : 'Sirius · latest 12 months'}</span>
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
          <div className="ai-window__body">
            {isV3 ? <M360MarketStoryV3 /> : isV2 ? <M360MarketStory /> : <M360Report />}
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
      ) : (
      <details className="ai-raw">
        <summary>Technical appendix — formulas, gaps, prompts, Sirius tables</summary>
        <p className="ai-raw__lede">
          For analysts. Brand-manager cards and charts above do not need this to be open.
        </p>

        {isV3 ? (
          <details className="ai-raw__inner">
            <summary>Business questions by section</summary>
            <p className="ai-table-note">
              Framing questions used to build each Market story section. Kept here so the brand-manager view stays
              chart-first.
            </p>
            <ul className="m360-rep-na">
              <li>
                <b>Category overview</b> — How big is the set, how is Bayer doing, and is Iberogast keeping pace with
                IBS?
              </li>
              <li>
                <b>Category growth</b> — Is growth coming from more packs, or from value (price / mix)?
              </li>
              <li>
                <b>Channel dynamics</b> — Where is set growth coming from by channel (price vs volume), and who is
                gaining or losing share in each channel?
              </li>
              <li>
                <b>Segment attractiveness</b> — Where to play — how big is each need-state, and is it growing faster
                than the category?
              </li>
              <li>
                <b>Competitive landscape</b> — Who holds the cash pool and who is winning the share fight in the
                growth segment?
              </li>
              <li>
                <b>Bayer relative growth</b> — Which Bayer brands outpace or lag their own need-state? (100 = in line;
                above 100 = faster.)
              </li>
              <li>
                <b>Iberogast position</b> — Defend Classic, grow Advance — or both, with different jobs?
              </li>
              <li>
                <b>Market share performance</b> — Where is Bayer gaining or losing share — change first, not just the
                level?
              </li>
            </ul>
          </details>
        ) : null}

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
          <summary>Not in this Sirius extract</summary>
          <ul className="m360-rep-na">
            <li>
              <b>Channel grain still missing</b> — no customer / retailer grain; no drugstore or grocery for
              Germany. Pharmacies + E-commerce (Mail Order) totals, price/volume drivers, and top-brand dynamics
              are in the extract and shown in AI Assistant {isV3 ? 'v3' : 'v2'} · Channel dynamics (see T-ch /
              T-ch-b below).
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
            {!isV3 ? (
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
              <b>T4 checks</b> — {checks.filter((c) => c.status === 'FAIL').map((c) => c.id).join(', ') || 'none failed'}
            </li>
          </ul>
        </details>

        <details className="ai-raw__inner">
          <summary>Prompts — replicate this Market story for another brand</summary>
          <p className="ai-table-note">
            Use with an LLM that can call Sirius / CHDAA (or paste retrieval tables). Replace{' '}
            <code>{'{{PLACEHOLDERS}}'}</code> first. Prompt 1 is system instructions (story order + chart
            playbook). Prompt 8 is the one-shot. Prompt 9 shows the Iberogast fill used in this report.
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
      )}
    </div>
  );
}
