/**
 * AI Assistant v6 — Bain 6Cs outside; Kirill SSWS under Category Discover analytics.
 */
import { useState } from 'react';
import {
  CATEGORY_ANALYTICS_JOURNEY,
  LANDSCAPE_6CS,
  LANDSCAPE_BRANDS,
  LANDSCAPE_CATEGORIES,
  LANDSCAPE_COUNTRIES,
  LANDSCAPE_DEFAULTS,
  LANDSCAPE_LIVE_CASE,
  LANDSCAPE_PERIODS,
  brandById,
  landscapeCById,
  optionLabel,
  type FilterOption,
  type JourneyStep,
  type LandscapeC,
  type LandscapeCStatus,
} from '../data/landscapeJourney';
import { M360MarketStoryV5 } from './M360MarketStoryV5';
import './LandscapeJourney.css';

function FilterField({
  label,
  options,
  value,
  onChange,
  allowPreview = false,
  placeholder = 'Choose…',
}: {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (id: string) => void;
  allowPreview?: boolean;
  placeholder?: string;
}) {
  const selected = options.find((o) => o.id === value);
  return (
    <label className="lj-filter">
      <span className="lj-filter__label">{label}</span>
      <select
        className={`lj-filter__select${value ? '' : ' is-empty'}`}
        value={value}
        onChange={(e) => {
          const id = e.target.value;
          if (!id) {
            onChange('');
            return;
          }
          const next = options.find((o) => o.id === id);
          if (!next) return;
          if (next.available || allowPreview) onChange(next.id);
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id} disabled={!o.available && !allowPreview}>
            {o.label}
            {!o.available ? ' · coming soon' : ''}
          </option>
        ))}
      </select>
      <span className="lj-filter__hint">
        {selected?.hint ?? (value ? '' : 'Required to continue')}
      </span>
    </label>
  );
}

function CIcon({ name }: { name: LandscapeC['icon'] }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  switch (name) {
    case 'category':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="8" height="8" rx="1.5" />
          <rect x="13" y="3" width="8" height="8" rx="1.5" />
          <rect x="3" y="13" width="8" height="8" rx="1.5" />
          <rect x="13" y="13" width="8" height="8" rx="1.5" />
        </svg>
      );
    case 'competitor':
      return (
        <svg {...common}>
          <path d="M8 18V8l4-3 4 3v10" />
          <path d="M8 12h8" />
        </svg>
      );
    case 'consumer':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 19c1.5-3.5 4-5 7-5s5.5 1.5 7 5" />
        </svg>
      );
    case 'convincer':
      return (
        <svg {...common}>
          <path d="M4 10v4h3l5 4V6L7 10H4z" />
          <path d="M16 9a3.5 3.5 0 0 1 0 6" />
          <path d="M18.5 7a6 6 0 0 1 0 10" />
        </svg>
      );
    case 'customer':
      return (
        <svg {...common}>
          <path d="M4 10h16v9H4z" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case 'culture':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M4 12h16" />
          <path d="M12 4c2.5 2.8 2.5 12.2 0 16" />
          <path d="M12 4c-2.5 2.8-2.5 12.2 0 16" />
        </svg>
      );
    default:
      return null;
  }
}

function StatusPill({ status }: { status: LandscapeCStatus | 'live' | 'partial' | 'stub' | 'soon' }) {
  const label =
    status === 'live'
      ? 'Available'
      : status === 'partial'
        ? 'Partial'
        : status === 'stub' || status === 'soon'
          ? 'Coming soon'
          : 'Coming soon';
  return <span className={`lj-pill is-${status === 'soon' ? 'stub' : status}`}>{label}</span>;
}

export function LandscapeJourney() {
  const [step, setStep] = useState<JourneyStep>('scope');
  const [categoryId, setCategoryId] = useState(LANDSCAPE_DEFAULTS.categoryId);
  const [brandId, setBrandId] = useState(LANDSCAPE_DEFAULTS.brandId);
  const [countryId, setCountryId] = useState(LANDSCAPE_DEFAULTS.countryId);
  const [periodId, setPeriodId] = useState(LANDSCAPE_DEFAULTS.periodId);
  const [activeCId, setActiveCId] = useState<string | null>(null);
  const [analyticId, setAnalyticId] = useState<string | null>(null);

  const brand = brandById(brandId);
  const liveBrand = brand.available;
  const scopeReady = Boolean(categoryId && brandId && countryId && periodId && liveBrand);
  const activeC = activeCId ? landscapeCById(activeCId) : null;
  const analytic = CATEGORY_ANALYTICS_JOURNEY.find((a) => a.id === analyticId) ?? null;

  function goLandscape() {
    if (!scopeReady) return;
    setActiveCId(null);
    setAnalyticId(null);
    setStep('landscape');
  }

  function openC(c: LandscapeC) {
    if (!c.available) return;
    setActiveCId(c.id);
    setAnalyticId(null);
    if (c.openAs === 'category-analytics') {
      setStep('category');
      return;
    }
    if (c.openAs === 'story-c') {
      setStep('c-analysis');
      return;
    }
    setStep('c-stub');
  }

  function openAnalytic(id: string) {
    const item = CATEGORY_ANALYTICS_JOURNEY.find((a) => a.id === id);
    if (!item?.canOpen) return;
    setAnalyticId(id);
    setStep('analytic');
  }

  function backToLandscape() {
    setActiveCId(null);
    setAnalyticId(null);
    setStep('landscape');
  }

  function backFromAnalytic() {
    setAnalyticId(null);
    setStep('category');
  }

  /** Pack + meta only after scope is confirmed (not while choosing filters). */
  const showBrandPanel = step !== 'scope' && step !== 'analytic' && step !== 'c-analysis';

  return (
    <div
      className="lj"
      style={{ ['--lj-accent' as string]: brand.accent, ['--lj-accent-soft' as string]: brand.accentSoft }}
    >
      <nav className="lj-crumbs" aria-label="Journey">
        <button type="button" className={step === 'scope' ? 'is-on' : undefined} onClick={() => setStep('scope')}>
          1 · Scope
        </button>
        <span aria-hidden="true">/</span>
        <button
          type="button"
          className={step === 'landscape' ? 'is-on' : undefined}
          disabled={step === 'scope'}
          onClick={() => scopeReady && goLandscape()}
        >
          2 · Landscape 6Cs
        </button>
        {activeC ? (
          <>
            <span aria-hidden="true">/</span>
            <button
              type="button"
              className={
                step === 'category' || step === 'c-analysis' || step === 'c-stub' || step === 'analytic'
                  ? 'is-on'
                  : undefined
              }
              onClick={() => openC(activeC)}
            >
              {activeC.label}
            </button>
          </>
        ) : null}
        {step === 'analytic' && analytic ? (
          <>
            <span aria-hidden="true">/</span>
            <span className="lj-crumbs__now">{analytic.title}</span>
          </>
        ) : null}
      </nav>

      {showBrandPanel ? (
        <section className="lj-brand lj-brand--strip" aria-label="Selected brand">
          <div className="lj-brand__visual">
            {brand.packImage ? (
              <img src={brand.packImage} alt="" width={72} height={72} decoding="async" />
            ) : (
              <div className="lj-brand__placeholder" aria-hidden="true">
                <span>{brand.label.slice(0, 1)}</span>
              </div>
            )}
          </div>
          <div className="lj-brand__copy">
            <p className="lj-brand__kicker">Focus brand</p>
            <h2 className="lj-brand__name">{brand.label}</h2>
            <p className="lj-brand__strip-meta">
              {brand.manufacturer}
              {' · '}
              {optionLabel(LANDSCAPE_COUNTRIES, countryId)}
              {' · '}
              {optionLabel(LANDSCAPE_CATEGORIES, categoryId)}
              {' · '}
              {optionLabel(LANDSCAPE_PERIODS, periodId)}
            </p>
          </div>
        </section>
      ) : null}

      {step === 'scope' ? (
        <section className="lj-panel" aria-labelledby="lj-scope-title">
          <header className="lj-panel__head">
            <h2 id="lj-scope-title">Set your assessment scope</h2>
            <p>
              Choose each filter, then continue. Live case available:{' '}
              {optionLabel(LANDSCAPE_CATEGORIES, LANDSCAPE_LIVE_CASE.categoryId)} · Iberogast ·{' '}
              {optionLabel(LANDSCAPE_COUNTRIES, LANDSCAPE_LIVE_CASE.countryId)} ·{' '}
              {optionLabel(LANDSCAPE_PERIODS, LANDSCAPE_LIVE_CASE.periodId)}.
            </p>
          </header>
          <div className="lj-filters">
            <FilterField
              label="Category"
              options={LANDSCAPE_CATEGORIES}
              value={categoryId}
              onChange={setCategoryId}
            />
            <FilterField
              label="Brand"
              options={LANDSCAPE_BRANDS}
              value={brandId}
              onChange={setBrandId}
              allowPreview
            />
            <FilterField
              label="Country"
              options={LANDSCAPE_COUNTRIES}
              value={countryId}
              onChange={setCountryId}
            />
            <FilterField
              label="Time period"
              options={LANDSCAPE_PERIODS}
              value={periodId}
              onChange={setPeriodId}
            />
          </div>
          <div className="lj-actions">
            <button type="button" className="lj-btn lj-btn--primary" disabled={!scopeReady} onClick={goLandscape}>
              Continue to Landscape Assessment
            </button>
            <p className="lj-actions__hint">
              {liveBrand
                ? 'Next: Bain 6Cs — Category, Customers, Competition live; Consumers partial; Convincers & Culture stubs.'
                : 'Preview only — switch Brand back to Iberogast to continue with live data.'}
            </p>
          </div>
        </section>
      ) : null}

      {step === 'landscape' ? (
        <section className="lj-panel" aria-labelledby="lj-land-title">
          <header className="lj-panel__head">
            <p className="lj-eyebrow">Landscape Assessment</p>
            <h2 id="lj-land-title">Bain Landscape · 6Cs</h2>
            <p>
              Working set:{' '}
              <strong>
                {brand.label} · {optionLabel(LANDSCAPE_COUNTRIES, countryId)}
              </strong>
              . Pick a C. Category opens Discover analytics (Kirill SSWS). Customers / Competition open chart packs.
              Consumers is POS proxy only. Convincers and Culture are coming soon.
            </p>
          </header>
          <ul className="lj-cs">
            {LANDSCAPE_6CS.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className={`lj-c${c.status === 'stub' ? ' is-soon' : ''}`}
                  onClick={() => openC(c)}
                >
                  <span className="lj-c__icon">
                    <CIcon name={c.icon} />
                  </span>
                  <span className="lj-c__body">
                    <span className="lj-c__top">
                      <strong>{c.label}</strong>
                      <StatusPill status={c.status} />
                    </span>
                    <span className="lj-c__short">{c.short}</span>
                    <span className="lj-c__blurb">{c.blurb}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="lj-actions">
            <button type="button" className="lj-btn" onClick={() => setStep('scope')}>
              Back to scope
            </button>
          </div>
        </section>
      ) : null}

      {step === 'category' ? (
        <section className="lj-panel" aria-labelledby="lj-cat-title">
          <header className="lj-panel__head">
            <p className="lj-eyebrow">Bain Category · Discover analytics</p>
            <h2 id="lj-cat-title">Category building blocks</h2>
            <p>
              Nested under Category (not separate Cs). Only{' '}
              <strong>Segment Share &amp; White Space</strong> is the live Kirill pack on this extract.
            </p>
          </header>
          <ul className="lj-analytics">
            {CATEGORY_ANALYTICS_JOURNEY.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  className={`lj-analytic${a.canOpen ? ' is-openable' : ' is-locked'}`}
                  disabled={!a.canOpen}
                  onClick={() => openAnalytic(a.id)}
                >
                  <span className="lj-analytic__top">
                    <strong>{a.title}</strong>
                    <StatusPill status={a.status} />
                  </span>
                  <span className="lj-analytic__q">{a.question}</span>
                  <span className="lj-analytic__note">{a.note}</span>
                  {a.canOpen ? (
                    <span className="lj-analytic__cta">Open Kirill analysis →</span>
                  ) : (
                    <span className="lj-analytic__cta is-muted">Not available on this Sirius extract yet</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
          <div className="lj-actions">
            <button type="button" className="lj-btn" onClick={backToLandscape}>
              Back to 6Cs
            </button>
          </div>
        </section>
      ) : null}

      {step === 'c-analysis' && activeC?.storyCId ? (
        <section className="lj-analytic-view" aria-labelledby="lj-c-title">
          <header className="lj-analytic-view__bar">
            <div>
              <p className="lj-eyebrow">
                {brand.label} · Bain Landscape · {activeC.label}
              </p>
              <h2 id="lj-c-title">{activeC.label}</h2>
              <p className="lj-analytic-view__q">{activeC.blurb}</p>
              {activeC.status === 'partial' ? (
                <p className="lj-analytic-view__note">
                  Partial on Sirius sell-out only. Full Bain Consumer needs household panel / demand-space research.
                </p>
              ) : (
                <p className="lj-analytic-view__note">
                  v3-style interpretation under each chart (Key facts → insights → hypothesis → implications). Review
                  only.
                </p>
              )}
            </div>
            <button type="button" className="lj-btn" onClick={backToLandscape}>
              Back to 6Cs
            </button>
          </header>
          <div className="lj-analytic-story">
            <M360MarketStoryV5 includeTb4l003 focusCId={activeC.storyCId} />
          </div>
        </section>
      ) : null}

      {step === 'c-stub' && activeC ? (
        <section className="lj-panel" aria-labelledby="lj-stub-title">
          <header className="lj-panel__head">
            <p className="lj-eyebrow">Bain Landscape · {activeC.label}</p>
            <h2 id="lj-stub-title">{activeC.label}</h2>
            <p>{activeC.blurb}</p>
          </header>
          <div className="lj-stub" role="note">
            <p>
              <strong>Coming soon.</strong> Not in the Sirius sell-out extract used for this Iberogast · Germany
              prototype. Bain lists this C in Landscape Assessment; data will come from survey / secondary sources.
            </p>
          </div>
          <div className="lj-actions">
            <button type="button" className="lj-btn" onClick={backToLandscape}>
              Back to 6Cs
            </button>
          </div>
        </section>
      ) : null}

      {step === 'analytic' && analytic ? (
        <section className="lj-analytic-view" aria-labelledby="lj-analytic-title">
          <header className="lj-analytic-view__bar">
            <div>
              <p className="lj-eyebrow">
                {brand.label} · Category · Discover analytic
              </p>
              <h2 id="lj-analytic-title">{analytic.title}</h2>
              <p className="lj-analytic-view__q">{analytic.question}</p>
              <p className="lj-analytic-view__note">
                Kirill TB4L-003 pack nested under Bain <strong>Category</strong>: market structure, growth × share, who
                wins, scorecard, and POS-proxy candidates. Same v3 interpretation under charts — review only.
              </p>
            </div>
            <button type="button" className="lj-btn" onClick={backFromAnalytic}>
              Back to Category analytics
            </button>
          </header>
          <div className="lj-analytic-story">
            <M360MarketStoryV5 includeTb4l003 analyticPack="segment-share-white-space" />
          </div>
        </section>
      ) : null}
    </div>
  );
}
