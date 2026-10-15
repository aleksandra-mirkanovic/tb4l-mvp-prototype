/**
 * AI Assistant v6 — Landscape Assessment journey.
 * Bain 6Cs outside; Kirill SSWS nested under Category Discover analytics.
 */
import iberogastPack from '../assets/brands/iberogast-classic-pack.jpg';
import { M360_CATEGORY_ANALYTICS } from './m360ReplicationRules';
import { M360_METADATA, M360_RETRIEVAL_PARAMS } from './m360Retrieval';

export type JourneyStep = 'scope' | 'landscape' | 'category' | 'c-analysis' | 'analytic' | 'c-stub';

export type FilterOption = {
  id: string;
  label: string;
  available: boolean;
  hint?: string;
};

export type BrandOption = FilterOption & {
  manufacturer: string;
  packImage?: string;
  accent: string;
  accentSoft: string;
  tagline: string;
};

export type LandscapeCStatus = 'live' | 'partial' | 'stub';

export type LandscapeC = {
  id: string;
  label: string;
  short: string;
  /** Can the user open this C? */
  available: boolean;
  status: LandscapeCStatus;
  blurb: string;
  icon: 'category' | 'competitor' | 'consumer' | 'convincer' | 'customer' | 'culture';
  /** Matching M360MarketStoryV5 section id (showC). */
  storyCId?: 'category' | 'customers' | 'competition' | 'consumers' | 'convincers' | 'culture';
  /** What happens when opened. */
  openAs: 'category-analytics' | 'story-c' | 'stub';
};

export const LANDSCAPE_CATEGORIES: FilterOption[] = [
  {
    id: 'digestive-health',
    label: M360_RETRIEVAL_PARAMS.category,
    available: true,
    hint: 'Live Sirius extract',
  },
  { id: 'cough-cold', label: 'Cough & Cold', available: false, hint: 'Coming soon' },
  { id: 'allergy', label: 'Allergy', available: false, hint: 'Coming soon' },
];

export const LANDSCAPE_BRANDS: BrandOption[] = [
  {
    id: 'iberogast',
    label: 'Iberogast',
    manufacturer: 'Bayer',
    available: true,
    hint: 'GB BAM focus brand',
    packImage: iberogastPack,
    accent: '#1f5c3a',
    accentSoft: '#e8f2ec',
    tagline: 'Digestive herbal drops · competitive set',
  },
  {
    id: 'bepanthen',
    label: 'Bepanthen',
    manufacturer: 'Bayer',
    available: false,
    hint: 'Coming soon',
    accent: '#0b6e99',
    accentSoft: '#e6f4f8',
    tagline: 'Example brand · not in this extract',
  },
  {
    id: 'afrin',
    label: 'Afrin',
    manufacturer: 'Bayer',
    available: false,
    hint: 'Coming soon',
    accent: '#8a3d1b',
    accentSoft: '#f7ebe4',
    tagline: 'Example brand · not in this extract',
  },
];

export const LANDSCAPE_COUNTRIES: FilterOption[] = [
  { id: 'germany', label: M360_RETRIEVAL_PARAMS.country, available: true, hint: 'Live case' },
  { id: 'france', label: 'France', available: false, hint: 'Coming soon' },
  { id: 'uk', label: 'United Kingdom', available: false, hint: 'Coming soon' },
];

export const LANDSCAPE_PERIODS: FilterOption[] = [
  {
    id: 'mat-jul-2026',
    label: `MAT ${M360_METADATA.mat_start} – ${M360_METADATA.mat_end}`,
    available: true,
    hint: `Latest actual ${M360_METADATA.latest_actual_month}`,
  },
  { id: 'mat-prior', label: 'Prior MAT (YA)', available: false, hint: 'Coming soon' },
  { id: 'ytd', label: 'Calendar YTD', available: false, hint: 'Coming soon' },
];

/**
 * Bain Landscape 6Cs (deck order adapted for UI).
 * Bain outside; Category Discover analytics (incl. Kirill SSWS) nest under Category.
 */
export const LANDSCAPE_6CS: LandscapeC[] = [
  {
    id: 'category',
    label: 'Category',
    short: 'Structure & Discover analytics',
    available: true,
    status: 'live',
    blurb: 'Category size, structure, and Discover building blocks (Segment Share & White Space lives here).',
    icon: 'category',
    storyCId: 'category',
    openAs: 'category-analytics',
  },
  {
    id: 'customer',
    label: 'Customer / Channel',
    short: 'Trade & channel',
    available: true,
    status: 'live',
    blurb: 'Which channels make up the set, growth drivers, and who is moving in Pharmacies and E-commerce.',
    icon: 'customer',
    storyCId: 'customers',
    openAs: 'story-c',
  },
  {
    id: 'competitor',
    label: 'Competition',
    short: 'Who wins where',
    available: true,
    status: 'live',
    blurb: 'Top brands, who holds each need-state, Bayer pace (EVI), and Classic vs Advance.',
    icon: 'competitor',
    storyCId: 'competition',
    openAs: 'story-c',
  },
  {
    id: 'consumer',
    label: 'Consumers',
    short: 'Whitespace · POS proxy',
    available: true,
    status: 'partial',
    blurb: 'Bain Consumer needs panel / demand space. Here: sell-out white-space candidates only (POS proxy).',
    icon: 'consumer',
    storyCId: 'consumers',
    openAs: 'story-c',
  },
  {
    id: 'convincer',
    label: 'Convincers',
    short: 'Who shapes choice',
    available: true,
    status: 'stub',
    blurb: 'HCPs, KOLs, influencers, authorities — recommendation drivers. Needs HCP survey / social listening.',
    icon: 'convincer',
    storyCId: 'convincers',
    openAs: 'stub',
  },
  {
    id: 'culture',
    label: 'Culture & Country',
    short: 'Context',
    available: true,
    status: 'stub',
    blurb: 'Cultural, societal, and regulatory dynamics. Needs secondary research / Euromonitor-style inputs.',
    icon: 'culture',
    storyCId: 'culture',
    openAs: 'stub',
  },
];

/** Empty until the user picks filters; live case ids stay available in the lists. */
export const LANDSCAPE_DEFAULTS = {
  categoryId: '',
  brandId: '',
  countryId: '',
  periodId: '',
} as const;

export const LANDSCAPE_LIVE_CASE = {
  categoryId: 'digestive-health',
  brandId: 'iberogast',
  countryId: 'germany',
  periodId: 'mat-jul-2026',
} as const;

export const LANDSCAPE_BRAND_PLACEHOLDER: BrandOption = {
  id: '',
  label: 'Choose brand',
  manufacturer: '—',
  available: false,
  accent: '#5a6a72',
  accentSoft: '#eef1f3',
  tagline: '',
};

export const CATEGORY_ANALYTICS_JOURNEY = M360_CATEGORY_ANALYTICS.map((a) => ({
  ...a,
  /** Only Segment Share & White Space is a full clickable Kirill pack in this prototype. */
  canOpen: a.id === 'segment-share-white-space',
}));

export function brandById(id: string): BrandOption {
  if (!id) return LANDSCAPE_BRAND_PLACEHOLDER;
  return LANDSCAPE_BRANDS.find((b) => b.id === id) ?? LANDSCAPE_BRAND_PLACEHOLDER;
}

export function optionLabel(list: FilterOption[], id: string): string {
  if (!id) return '—';
  return list.find((o) => o.id === id)?.label ?? id;
}

export function landscapeCById(id: string): LandscapeC | undefined {
  return LANDSCAPE_6CS.find((c) => c.id === id);
}
