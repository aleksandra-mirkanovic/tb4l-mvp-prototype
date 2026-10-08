import type { ReactNode } from 'react';
import type {
  AssistantBar,
  AssistantChart,
  ChartPoint,
  ChartSlice,
  GroupedBarSeries,
  WaterfallStep,
} from '../data/iberogastAssistant';
import './AssistantCharts.css';

const PALETTE = ['#00607e', '#d30f4b', '#286436', '#624963', '#a87b1f', '#8a9aa8', '#c9d2d8'];

function formatValue(value: number, unit?: string, suffix?: string) {
  if (suffix === 'm' || unit === '€m') {
    const sign = value > 0 && unit === '€m' && Math.abs(value) < 100 ? '' : '';
    return `${sign}€${value.toFixed(Math.abs(value) >= 10 ? 1 : 2)}m`;
  }
  if (unit === '%' || suffix === '%') return `${value.toFixed(1)}%`;
  if (unit === 'index') return String(Math.round(value));
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1);
}

function ChartShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <figure className="asst-chart">
      <figcaption className="asst-chart__caption">
        <strong>{title}</strong>
        {subtitle ? <span>{subtitle}</span> : null}
      </figcaption>
      <div className="asst-chart__body">{children}</div>
    </figure>
  );
}

function HBarChart({
  items,
  unit,
}: {
  items: AssistantBar[];
  unit?: string;
}) {
  const max = Math.max(...items.map((b) => b.max ?? Math.abs(b.value)), 0.0001);
  return (
    <ul className="asst-hbar" aria-label="Horizontal bar chart">
      {items.map((bar) => (
        <li key={bar.label} className={bar.highlight ? 'is-highlight' : undefined}>
          <span className="asst-hbar__label">{bar.label}</span>
          <div className="asst-hbar__track">
            <div
              className="asst-hbar__fill"
              style={{ width: `${Math.min(100, (Math.abs(bar.value) / max) * 100)}%` }}
            />
          </div>
          <span className="asst-hbar__value">
            {formatValue(bar.value, unit, bar.suffix)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ColumnChart({ items, unit }: { items: AssistantBar[]; unit?: string }) {
  const max = Math.max(...items.map((b) => Math.abs(b.value)), 0.0001);
  const baseline = 100; // for EVI-style charts around 100
  const isIndex = unit === 'index';

  return (
    <div className="asst-columns" role="img" aria-label="Column chart">
      {items.map((item) => {
        const height = isIndex
          ? Math.min(100, Math.max(8, ((item.value - 90) / 40) * 100))
          : Math.min(100, Math.max(6, (Math.abs(item.value) / max) * 100));
        return (
          <div
            key={item.label}
            className={`asst-columns__col${item.highlight ? ' is-highlight' : ''}`}
          >
            <span className="asst-columns__value">
              {formatValue(item.value, unit, item.suffix)}
            </span>
            <div className="asst-columns__track">
              {isIndex ? (
                <div className="asst-columns__baseline" style={{ bottom: `${((baseline - 90) / 40) * 100}%` }} />
              ) : null}
              <div className="asst-columns__bar" style={{ height: `${height}%` }} />
            </div>
            <span className="asst-columns__label">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({
  slices,
  centerLabel,
  centerValue,
}: {
  slices: ChartSlice[];
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const r = 42;
  const c = 2 * Math.PI * r;
  let offset = 0;

  const asPercent = total > 20 || slices.some((s) => !Number.isInteger(s.value));

  return (
    <div className="asst-donut">
      <div className="asst-donut__ring">
        <svg viewBox="0 0 120 120" className="asst-donut__svg" aria-hidden="true">
          <circle cx="60" cy="60" r={r} className="asst-donut__track" />
          {slices.map((slice, i) => {
            const frac = slice.value / total;
            const dash = frac * c;
            const el = (
              <circle
                key={slice.label}
                cx="60"
                cy="60"
                r={r}
                className="asst-donut__slice"
                stroke={slice.color ?? PALETTE[i % PALETTE.length]}
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={-offset}
              />
            );
            offset += dash;
            return el;
          })}
          <circle cx="60" cy="60" r="28" className="asst-donut__hole" />
        </svg>
        <div className="asst-donut__center">
          {centerValue ? <strong>{centerValue}</strong> : null}
          {centerLabel ? <span>{centerLabel}</span> : null}
        </div>
      </div>
      <ul className="asst-donut__legend">
        {slices.map((slice, i) => (
          <li key={slice.label}>
            <i style={{ background: slice.color ?? PALETTE[i % PALETTE.length] }} />
            <span>{slice.label}</span>
            <em>{asPercent ? `${slice.value.toFixed(1)}%` : slice.value}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WaterfallChart({ steps, unit }: { steps: WaterfallStep[]; unit?: string }) {
  const values = steps.map((s) => s.value);
  const running: number[] = [];
  let cursor = 0;
  steps.forEach((step) => {
    if (step.kind === 'total') {
      cursor = step.value;
      running.push(0);
    } else {
      running.push(cursor);
      cursor += step.value;
    }
  });

  const min = Math.min(...values, ...running.map((r, i) => r + (steps[i].kind === 'total' ? 0 : Math.min(0, steps[i].value))), 0);
  const max = Math.max(
    ...values,
    ...running.map((r, i) => r + (steps[i].kind === 'total' ? steps[i].value : Math.max(0, steps[i].value))),
  );
  const span = max - min || 1;

  return (
    <div className="asst-waterfall" role="img" aria-label="Waterfall chart">
      {steps.map((step, i) => {
        const isTotal = step.kind === 'total';
        const start = isTotal ? min : running[i];
        const end = isTotal ? step.value : running[i] + step.value;
        const bottom = ((Math.min(start, end) - min) / span) * 100;
        const height = (Math.abs(end - start) / span) * 100;
        const kind =
          step.kind ??
          (step.value >= 0 ? 'increase' : 'decrease');
        return (
          <div key={step.label} className={`asst-waterfall__col is-${kind}`}>
            <span className="asst-waterfall__value">
              {isTotal
                ? formatValue(step.value, unit)
                : `${step.value >= 0 ? '+' : ''}${formatValue(step.value, unit)}`}
            </span>
            <div className="asst-waterfall__track">
              <div
                className="asst-waterfall__bar"
                style={{ bottom: `${bottom}%`, height: `${Math.max(height, 2)}%` }}
              />
            </div>
            <span className="asst-waterfall__label">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function GroupedChart({
  categories,
  series,
  unit,
}: {
  categories: string[];
  series: GroupedBarSeries[];
  unit?: string;
}) {
  const max = Math.max(
    ...series.flatMap((s) => s.values.map((v) => Math.abs(v))),
    0.0001,
  );

  return (
    <div className="asst-grouped">
      <div className="asst-grouped__plot" role="img" aria-label="Grouped bar chart">
        {categories.map((cat, ci) => (
          <div key={cat} className="asst-grouped__cluster">
            <div className="asst-grouped__bars">
              {series.map((s, si) => {
                const v = s.values[ci] ?? 0;
                const h = Math.min(100, Math.max(4, (Math.abs(v) / max) * 100));
                return (
                  <div
                    key={s.label}
                    className={`asst-grouped__bar${v < 0 ? ' is-neg' : ''}`}
                    style={{
                      height: `${h}%`,
                      background: s.color ?? PALETTE[si % PALETTE.length],
                    }}
                    title={`${s.label}: ${formatValue(v, unit)}`}
                  />
                );
              })}
            </div>
            <span className="asst-grouped__cat">{cat}</span>
          </div>
        ))}
      </div>
      <ul className="asst-grouped__legend">
        {series.map((s, i) => (
          <li key={s.label}>
            <i style={{ background: s.color ?? PALETTE[i % PALETTE.length] }} />
            {s.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScatterChart({
  points,
  xLabel,
  yLabel,
}: {
  points: ChartPoint[];
  xLabel: string;
  yLabel: string;
}) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const pad = 0.15;
  const xMin = Math.min(...xs) - pad;
  const xMax = Math.max(...xs) + pad;
  const yMin = Math.min(0, ...ys) - pad;
  const yMax = Math.max(...ys) + pad;
  const xSpan = xMax - xMin || 1;
  const ySpan = yMax - yMin || 1;
  const sizeMax = Math.max(...points.map((p) => p.size ?? 40), 1);

  return (
    <div className="asst-scatter">
      <div className="asst-scatter__plot" role="img" aria-label="Scatter chart">
        <span className="asst-scatter__axis asst-scatter__axis--y">{yLabel}</span>
        <div className="asst-scatter__grid">
          {[0.25, 0.5, 0.75].map((g) => (
            <i key={g} style={{ bottom: `${g * 100}%` }} />
          ))}
          {points.map((p) => {
            const left = ((p.x - xMin) / xSpan) * 100;
            const bottom = ((p.y - yMin) / ySpan) * 100;
            const size = 14 + ((p.size ?? 40) / sizeMax) * 28;
            return (
              <button
                key={p.label}
                type="button"
                className={`asst-scatter__point${p.highlight ? ' is-highlight' : ''}`}
                style={{
                  left: `${left}%`,
                  bottom: `${bottom}%`,
                  width: size,
                  height: size,
                }}
                title={`${p.label}: x ${p.x.toFixed(1)}%, y ${p.y.toFixed(1)}%`}
              >
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
        <span className="asst-scatter__axis asst-scatter__axis--x">{xLabel}</span>
      </div>
    </div>
  );
}

function renderChart(chart: AssistantChart) {
  switch (chart.type) {
    case 'hbar':
      return <HBarChart items={chart.items} unit={chart.unit} />;
    case 'column':
      return <ColumnChart items={chart.items} unit={chart.unit} />;
    case 'donut':
      return (
        <DonutChart
          slices={chart.slices}
          centerLabel={chart.centerLabel}
          centerValue={chart.centerValue}
        />
      );
    case 'waterfall':
      return <WaterfallChart steps={chart.steps} unit={chart.unit} />;
    case 'grouped':
      return (
        <GroupedChart
          categories={chart.categories}
          series={chart.series}
          unit={chart.unit}
        />
      );
    case 'scatter':
      return (
        <ScatterChart points={chart.points} xLabel={chart.xLabel} yLabel={chart.yLabel} />
      );
    default:
      return null;
  }
}

export function AssistantChartGrid({ charts }: { charts: AssistantChart[] }) {
  if (!charts.length) return null;
  return (
    <div className="asst-charts">
      {charts.map((chart) => (
        <ChartShell key={chart.id} title={chart.title} subtitle={chart.subtitle}>
          {renderChart(chart)}
        </ChartShell>
      ))}
    </div>
  );
}
