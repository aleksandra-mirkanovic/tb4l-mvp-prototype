import {
  ANALYSES_CANNOT,
  ANALYSES_IMMEDIATE,
  ANALYSES_PARTIAL,
  CHARTS_NOT_TODAY,
  CHARTS_TODAY,
  COPA_FIELDS,
  COOM_FIELDS,
  MCP_SOURCES_NOT_USABLE,
  MCP_SOURCES_REACHABLE,
  NEXT_SOURCES,
  SIRIUS_FIELDS_PRESENT,
  WORKSHOP_AREA_AUDIT,
  type AuditVerdict,
} from '../data/financeMcpAudit';
import './FinanceMcpAudit.css';

function Verdict({ v }: { v: AuditVerdict }) {
  return <span className={`fin-audit__v fin-audit__v--${v.toLowerCase()}`}>{v}</span>;
}

export function FinanceMcpAudit() {
  return (
    <section className="fin-audit" aria-labelledby="fin-audit-heading">
      <h2 id="fin-audit-heading" className="section-title">
        Finance Agent · MCP data audit
      </h2>
      <p className="fin-audit__lede">
        Workshop analyses were not run. This is a catalog of what the connected MCP tools can actually
        see as of 6 Oct 2026. Only reachable sources count. Nothing was assumed.
      </p>

      <h3 className="fin-audit__h">1. Available finance datasets discovered through MCP</h3>
      <div className="ai-table-wrap">
        <table className="ai-table">
          <thead>
            <tr>
              <th>Source</th>
              <th>Tool</th>
              <th>Object</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {MCP_SOURCES_REACHABLE.map((s) => (
              <tr key={s.name}>
                <td>{s.name}</td>
                <td>{s.tool}</td>
                <td>{s.object}</td>
                <td>{s.status}</td>
              </tr>
            ))}
            {MCP_SOURCES_NOT_USABLE.map((s) => (
              <tr key={s.name}>
                <td>{s.name}</td>
                <td>{s.tool}</td>
                <td>—</td>
                <td>{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="fin-audit__h">2. Available fields by dataset</h3>
      <ul className="fin-audit__list">
        <li>
          <b>COPA.</b> Dimensions: {COPA_FIELDS.dimensions.join(', ')}. Measures:{' '}
          {COPA_FIELDS.measures.join(', ')}. KPI labels in keyfigure_text: {COPA_FIELDS.keyfigureLabels.join(', ')}.
        </li>
        <li>
          <b>COOM.</b> Measures: {COOM_FIELDS.measures.join(', ')}. Dimensions: {COOM_FIELDS.dimensions.join(', ')}.
        </li>
        <li>
          <b>Sirius CHDAA.</b> {SIRIUS_FIELDS_PRESENT.join('; ')}.
        </li>
      </ul>

      <h3 className="fin-audit__h">Workshop analysis areas</h3>
      <div className="ai-table-wrap fin-audit__wide">
        <table className="ai-table">
          <thead>
            <tr>
              <th>Area</th>
              <th>Data exists</th>
              <th>Datasets</th>
              <th>Fields that support it</th>
              <th>Missing fields</th>
              <th>Produce today</th>
              <th>Auto charts</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {WORKSHOP_AREA_AUDIT.map((row) => (
              <tr key={row.area}>
                <td>
                  <b>{row.area}</b>
                  <p className="fin-audit__note">{row.note}</p>
                </td>
                <td>
                  <Verdict v={row.dataExists} />
                </td>
                <td>{row.datasets}</td>
                <td>{row.fields}</td>
                <td>{row.missing}</td>
                <td>
                  <Verdict v={row.produceToday} />
                </td>
                <td>
                  <Verdict v={row.autoCharts} />
                </td>
                <td>{row.confidence}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="fin-audit__h">3. Missing fields required for workshop-level analyses</h3>
      <ul className="fin-audit__list">
        <li>Named NSV, GSV, contribution margin, GTN, list price, net price, elasticity.</li>
        <li>Queryable COPA volume/units (sales_quantity_GA not confirmed in catalog search).</li>
        <li>COPA channel. Media spend. Trade spend.</li>
        <li>Targets, profit-uplift drivers, ROI / incrementality.</li>
        <li>Join between Sirius brands and COPA cv_brand.</li>
      </ul>

      <div className="fin-audit__cols">
        <div>
          <h3 className="fin-audit__h">4. Can be generated immediately</h3>
          <ul className="fin-audit__list">
            {ANALYSES_IMMEDIATE.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="fin-audit__h">5. Partially supported</h3>
          <ul className="fin-audit__list">
            {ANALYSES_PARTIAL.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="fin-audit__h">6. Cannot be generated</h3>
          <ul className="fin-audit__list">
            {ANALYSES_CANNOT.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      </div>

      <h3 className="fin-audit__h">7–8. Charts that can be created today, with spec</h3>
      <div className="ai-table-wrap">
        <table className="ai-table">
          <thead>
            <tr>
              <th>Chart</th>
              <th>Source</th>
              <th>Example specification</th>
            </tr>
          </thead>
          <tbody>
            {CHARTS_TODAY.map((c) => (
              <tr key={c.name}>
                <td>{c.name}</td>
                <td>{c.source}</td>
                <td>{c.spec}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="fin-audit__note">
        InsightsNow COPA stated it cannot auto-generate charts. Not available today:{' '}
        {CHARTS_NOT_TODAY.join('; ')}.
      </p>

      <h3 className="fin-audit__h">9. Recommended next data sources</h3>
      <ol className="fin-audit__list">
        {NEXT_SOURCES.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ol>
    </section>
  );
}
