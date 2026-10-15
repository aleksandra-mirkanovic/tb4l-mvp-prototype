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
  IBEROGAST_LINE_PACKS,
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

/** Journey = click into each C; page = full Landscape with jump buttons. */
type BrowseMode = 'journey' | 'page';

const BROWSE_MODE_KEY = 'ai-v6-browse-mode';

function readBrowseMode(): BrowseMode {
  try {
    const stored = sessionStorage.getItem(BROWSE_MODE_KEY);
    if (stored === 'journey' || stored === 'page') return stored;
  } catch {
    /* ignore */
  }
  return 'journey';
}

const PAGE_JUMP_ID: Record<string, string> = {
  category: 'lj-jump-category',
  customer: 'lj-jump-customer',
  competitor: 'lj-jump-competitor',
  consumer: 'lj-jump-consumer',
  convincer: 'lj-jump-convincer',
  culture: 'lj-jump-culture',
};

export function LandscapeJourney() {
  const [step, setStep] = useState<JourneyStep>('scope');
  const [categoryId, setCategoryId] = useState(LANDSCAPE_DEFAULTS.categoryId);
  const [brandId, setBrandId] = useState(LANDSCAPE_DEFAULTS.brandId);
  const [countryId, setCountryId] = useState(LANDSCAPE_DEFAULTS.countryId);
  const [periodId, setPeriodId] = useState(LANDSCAPE_DEFAULTS.periodId);
  const [activeCId, setActiveCId] = useState<string | null>(null);
  const [analyticId, setAnalyticId] = useState<string | null>(null);
  const [browseMode, setBrowseMode] = useState<BrowseMode>(readBrowseMode);
  const [pageJumpCId, setPageJumpCId] = useState<string | null>(null);

  const brand = brandById(brandId);
  const liveBrand = brand.available;
  const scopeReady = Boolean(categoryId && brandId && countryId && periodId && liveBrand);
  const activeC = activeCId ? landscapeCById(activeCId) : null;
  const analytic = CATEGORY_ANALYTICS_JOURNEY.find((a) => a.id === analyticId) ?? null;
  const pastScope = scopeReady && step !== 'scope';
  const isPageMode = pastScope && browseMode === 'page';
  const isJourneyMode = !isPageMode;

  function changeBrowseMode(mode: BrowseMode) {
    if (!scopeReady && mode === 'page') return;
    setBrowseMode(mode);
    try {
      sessionStorage.setItem(BROWSE_MODE_KEY, mode);
    } catch {
      /* ignore */
    }
    if (mode === 'page') {
      setActiveCId(null);
      setAnalyticId(null);
      setPageJumpCId(null);
      setStep('landscape');
      window.setTimeout(() => {
        document.getElementById('lj-page-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
      return;
    }
    setPageJumpCId(null);
    setStep('landscape');
  }

  function goLandscape() {
    if (!scopeReady) return;
    setActiveCId(null);
    setAnalyticId(null);
    setStep('landscape');
  }

  function jumpToC(c: LandscapeC) {
    setPageJumpCId(c.id);
    window.setTimeout(() => {
      document.getElementById(PAGE_JUMP_ID[c.id])?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  }

  function openC(c: LandscapeC) {
    if (!c.available) return;
    if (browseMode === 'page') {
      jumpToC(c);
      return;
    }
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
  const showBrandPanel =
    pastScope && (isPageMode || (step !== 'analytic' && step !== 'c-analysis'));

  return (
    <div
      className={`lj${isPageMode ? ' lj--page' : ''}`}
      style={{ ['--lj-accent' as string]: brand.accent, ['--lj-accent-soft' as string]: brand.accentSoft }}
    >
      <div className="lj-topbar" id="lj-page-top">
        <nav className="lj-crumbs" aria-label="Journey">
          <button
            type="button"
            className={step === 'scope' ? 'is-on' : undefined}
            onClick={() => setStep('scope')}
          >
            1 · Scope
          </button>
          <span aria-hidden="true">/</span>
          <button
            type="button"
            className={pastScope && !isPageMode && step === 'landscape' ? 'is-on' : undefined}
            disabled={!scopeReady}
            onClick={() => scopeReady && goLandscape()}
          >
            2 · Landscape 6Cs
          </button>
          {isJourneyMode && activeC ? (
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
          {isJourneyMode && step === 'analytic' && analytic ? (
            <>
              <span aria-hidden="true">/</span>
              <span className="lj-crumbs__now">{analytic.title}</span>
            </>
          ) : null}
          {isPageMode ? (
            <>
              <span aria-hidden="true">/</span>
              <span className="lj-crumbs__now">One page</span>
            </>
          ) : null}
        </nav>
        {pastScope ? (
          <div className="lj-modes" role="group" aria-label="Browse mode">
            <button
              type="button"
              className={`lj-mode${browseMode === 'journey' ? ' is-on' : ''}`}
              aria-pressed={browseMode === 'journey'}
              onClick={() => changeBrowseMode('journey')}
            >
              Journey
            </button>
            <button
              type="button"
              className={`lj-mode${browseMode === 'page' ? ' is-on' : ''}`}
              aria-pressed={browseMode === 'page'}
              onClick={() => changeBrowseMode('page')}
            >
              One page
            </button>
          </div>
        ) : null}
      </div>

      {showBrandPanel ? (
        <section className="lj-brand lj-brand--lines" aria-label="Selected brand">
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
          <ul className="lj-line-packs" aria-label="Iberogast lines">
            {IBEROGAST_LINE_PACKS.map((line) => (
              <li key={line.id} className="lj-line-pack">
                <div className="lj-line-pack__visual" style={{ ['--line-accent' as string]: line.accent }}>
                  <img src={line.image} alt="" width={120} height={120} decoding="async" />
                </div>
                <p className="lj-line-pack__label">{line.label}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {isPageMode ? (
        <nav className="lj-jump" aria-label="Jump to Landscape C">
          <p className="lj-jump__lede">Jump to a C. Full Landscape stays on one scroll.</p>
          <div className="lj-jump__tabs" role="tablist">
            {LANDSCAPE_6CS.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={pageJumpCId === c.id}
                className={`lj-jump__tab${pageJumpCId === c.id ? ' is-active' : ''}${c.status === 'stub' ? ' is-stub' : ''}`}
                onClick={() => jumpToC(c)}
              >
                {c.label}
                <StatusPill status={c.status} />
              </button>
            ))}
          </div>
        </nav>
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
                ? 'Next: Bain 6Cs — Category, Customers, Competition live; Consumers, Convincers & Culture need other data sources.'
                : 'Preview only — switch Brand back to Iberogast to continue with live data.'}
            </p>
          </div>
        </section>
      ) : null}

      {isPageMode ? (
        <div className="lj-page" aria-label="Landscape one page">
          <section className="lj-page__sec" id="lj-jump-category" aria-labelledby="lj-page-cat-title">
            <header className="lj-page__head">
              <p className="lj-eyebrow">Bain Category · live Sirius</p>
              <h2 id="lj-page-cat-title">Category · Segment Share &amp; White Space</h2>
              <p>Kirill pack under Category. Other Discover analytics stay Coming soon.</p>
            </header>
            <div className="lj-analytic-story">
              <M360MarketStoryV5 includeTb4l003 analyticPack="segment-share-white-space" />
            </div>
          </section>

          <section className="lj-page__sec" id="lj-jump-customer" aria-labelledby="lj-page-cust-title">
            <header className="lj-page__head">
              <p className="lj-eyebrow">Bain Customer / Channel · live Sirius</p>
              <h2 id="lj-page-cust-title">Customer / Channel</h2>
              <p>Channel mix, growth drivers, and movers in Pharmacies and E-commerce.</p>
            </header>
            <div className="lj-analytic-story">
              <M360MarketStoryV5 includeTb4l003 focusCId="customers" />
            </div>
          </section>

          <section className="lj-page__sec" id="lj-jump-competitor" aria-labelledby="lj-page-comp-title">
            <header className="lj-page__head">
              <p className="lj-eyebrow">Bain Competition · live Sirius</p>
              <h2 id="lj-page-comp-title">Competition</h2>
              <p>Who leads the set and each need-state, plus Classic vs Advance on IBS.</p>
            </header>
            <div className="lj-analytic-story">
              <M360MarketStoryV5 includeTb4l003 focusCId="competition" />
            </div>
          </section>

          {LANDSCAPE_6CS.filter((c) => c.openAs === 'stub').map((c) => (
            <section
              key={c.id}
              className="lj-page__sec lj-page__sec--stub"
              id={PAGE_JUMP_ID[c.id]}
              aria-labelledby={`lj-page-stub-${c.id}`}
            >
              <header className="lj-page__head">
                <p className="lj-eyebrow">Bain Landscape · {c.label}</p>
                <h2 id={`lj-page-stub-${c.id}`}>{c.label}</h2>
                <p>{c.blurb}</p>
              </header>
              <div className="lj-stub" role="note">
                <p>
                  <strong>Coming soon.</strong> Not in this Sirius sell-out extract — no analysis text until data
                  exists.
                </p>
              </div>
            </section>
          ))}
        </div>
      ) : null}

      {isJourneyMode && step === 'landscape' ? (
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
              Consumers, Convincers, and Culture are coming soon (not in this Sirius extract).
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

      {isJourneyMode && step === 'category' ? (
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
                    <StatusPill status={a.canOpen ? a.status : 'stub'} />
                  </span>
                  {a.canOpen ? (
                    <>
                      <span className="lj-analytic__q">{a.question}</span>
                      <span className="lj-analytic__note">{a.note}</span>
                      <span className="lj-analytic__cta">Open Kirill analysis →</span>
                    </>
                  ) : (
                    <span className="lj-analytic__cta is-muted">Coming soon · not in this Sirius extract</span>
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

      {isJourneyMode && step === 'c-analysis' && activeC?.storyCId ? (
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

      {isJourneyMode && step === 'c-stub' && activeC ? (
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

      {isJourneyMode && step === 'analytic' && analytic ? (
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
