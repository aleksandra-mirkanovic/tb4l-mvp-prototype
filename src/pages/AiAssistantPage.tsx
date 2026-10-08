import { NavLink, Navigate, useParams } from 'react-router-dom';
import { CopaReport } from '../components/CopaReport';
import { FinanceMcpAudit } from '../components/FinanceMcpAudit';
import { M360MarketStory } from '../components/M360MarketStory';
import { M360Report } from '../components/M360Report';
import { SiriusTip } from '../components/SiriusTip';
import { CALC_FORMULAS, CAGR_3Y_NOTE } from '../data/m360Charts';
import { COPA_FORMULAS, COPA_MISSING } from '../data/copaCharts';
import { COPA_BRAND_YEARS, COPA_RETRIEVAL_PARAMS } from '../data/copaRetrieval';
import {
  M360_METADATA,
  M360_RETRIEVAL_PARAMS,
  M360_SEGMENTS,
  M360_SUBBRANDS,
  buildM360Checks,
  type NullableNumber,
} from '../data/m360Retrieval';
import './AiAssistantPage.css';

function Td({
  table,
  field,
  children,
}: {
  table: 'T1' | 'T2' | 'T3' | 'T4';
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

export type AiAssistantVariant = 'classic' | 'v2';

export function AiAssistantPage({ variant = 'classic' }: { variant?: AiAssistantVariant }) {
  const { pane } = useParams();
  const base = variant === 'v2' ? '/ai-assistant-v2' : '/ai-assistant';
  if (pane && pane !== 'market' && pane !== 'finance') {
    return <Navigate to={`${base}/market`} replace />;
  }
  const view = pane === 'finance' ? 'finance' : 'market';
  const checks = buildM360Checks();
  const p = M360_RETRIEVAL_PARAMS;
  const m = M360_METADATA;
  const isV2 = variant === 'v2';

  return (
    <div className={`ai-assistant-page ai-assistant-page--tables${isV2 ? ' ai-assistant-page--v2' : ''}`}>
      <header className="ai-assistant-hero">
        <div className="ai-assistant-hero__copy">
          <p className="ai-assistant-hero__eyebrow">
            {isV2 ? 'Brand manager report · story redesign' : 'Brand manager report'}
          </p>
          <h1 className="page-title">{isV2 ? 'AI Assistant v2' : 'AI Assistant'}</h1>
          <p className="page-subtitle">
            {isV2
              ? 'Same Sirius and COPA clocks as AI Assistant. Market follows a Bain-logic drill-down; finance is unchanged. Compare side by side with the classic tab.'
              : 'Two windows. Market is Sirius sell-out for the latest 12 months. Finance is internal COPA for calendar 2025 versus 2024. Prompt one window at a time — the clocks are different.'}
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
          <span>Sirius · latest 12 months</span>
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
            <p className="ai-window__title">Market{isV2 ? ' · story' : ''}</p>
            <p className="ai-window__meta">
              {p.country} {p.category} · Iberogast competitive set · MAT ending {m.latest_actual_month}
            </p>
          </header>
          <div className="ai-window__body">{isV2 ? <M360MarketStory /> : <M360Report />}</div>
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
        <summary>Technical appendix — formulas, gaps, Sirius tables</summary>
        <p className="ai-raw__lede">
          For analysts. Brand-manager cards and charts above do not need this to be open.
        </p>

        <details className="ai-raw__inner">
          <summary>CALC formulas</summary>
          <p className="ai-table-note">
            Insights and the report only read these results. They do not compute extra metrics.
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
                {CALC_FORMULAS.map((row) => (
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
          <summary>Not in this Sirius extract</summary>
          <ul className="m360-rep-na">
            <li>
              <b>Channel stacked bar</b> Pharmacy / e-commerce / retail — N/A
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
              <b>Fiona finance</b> revenue, margin, waterfall, investment, price elasticity — N/A
            </li>
            <li>
              <b>Market vs finance</b> share vs margin, growth vs profit — N/A
            </li>
            <li>
              <b>3y CAGR</b> — N/A · {CAGR_3Y_NOTE}
            </li>
            <li>
              <b>T4 checks</b> — {checks.filter((c) => c.status === 'FAIL').map((c) => c.id).join(', ') || 'none failed'}
            </li>
          </ul>
        </details>

        <details className="ai-raw__inner">
          <summary>Sirius retrieval tables T1–T4</summary>
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
        </details>
      </details>
      )}
    </div>
  );
}
