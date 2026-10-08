/**
 * COPA snapshot from InsightsNow (ask_insightsnow, cube copa).
 * View: efdsfinfc_rw.t2d1_copa_slim_rls_enabled_test_view
 * Scope: Consumer Health · BSV Germany (bsv_lvl_4_text = Germany) · actuals
 * Sign convention: SUM(-amount_eur) as returned by the finance agent.
 * Cost lines (cCOGS, cMarketing) came back negative; CALC stores them as costs (absolute).
 * p&i: no rows returned.
 * 2025 max month = 12 (full calendar year).
 * Retrieved 6 Oct 2026. Do not mix with Sirius MAT Jul 2026.
 * 2021-2023 and YTD 2026 were requested again on 6 Oct 2026; InsightsNow brand lookup
 * did not resolve Iberogast/Lefax/Rennie/Talcid for extra years. Snapshot stays 2024-2025.
 */

export const COPA_RETRIEVAL_PARAMS = {
  source: 'InsightsNow COPA',
  view: 'efdsfinfc_rw.t2d1_copa_slim_rls_enabled_test_view',
  division: 'Consumer Health',
  countryBsv: 'Germany',
  version: 'ACT',
  latestYear: 2025,
  priorYear: 2024,
  latestYearComplete: true,
  latestMonth: 12,
  brandField: 'cv_brand_text',
};

export type CopaKpi =
  | 'Gross Sales'
  | 'Net Sales'
  | 'Gross Profit'
  | 'cCOGS (total)'
  | 'cMarketing'
  | 'cEBIT'
  | 'p&i';

export type CopaBrandYear = {
  brand: string;
  year: number;
  grossSales: number;
  netSales: number;
  grossProfit: number;
  cogs: number;
  marketing: number;
  ebit: number;
  pi: number | null;
};

function cost(signed: number): number {
  return Math.abs(signed);
}

export const COPA_BRAND_YEARS: CopaBrandYear[] = [
  {
    brand: 'Iberogast',
    year: 2024,
    grossSales: 76597271.6,
    netSales: 61301938.05,
    grossProfit: 47547005.38,
    cogs: cost(-13237337.83),
    marketing: cost(-17294105.02),
    ebit: 30252900.36,
    pi: null,
  },
  {
    brand: 'Iberogast',
    year: 2025,
    grossSales: 86337932.65,
    netSales: 68184892.05,
    grossProfit: 55570917.13,
    cogs: cost(-12033123.74),
    marketing: cost(-18427420.76),
    ebit: 37143496.37,
    pi: null,
  },
  {
    brand: 'Lefax',
    year: 2024,
    grossSales: 32162811.03,
    netSales: 25528508.58,
    grossProfit: 18773199.88,
    cogs: cost(-6406278.5),
    marketing: cost(-3825247.73),
    ebit: 14947952.15,
    pi: null,
  },
  {
    brand: 'Lefax',
    year: 2025,
    grossSales: 33205664.5,
    netSales: 26194709.46,
    grossProfit: 19346072.68,
    cogs: cost(-6476221.83),
    marketing: cost(-3825568.21),
    ebit: 15520504.47,
    pi: null,
  },
  {
    brand: 'Rennie',
    year: 2024,
    grossSales: 11715207.02,
    netSales: 9250451.82,
    grossProfit: 8030206.28,
    cogs: cost(-1079220.63),
    marketing: cost(-774325.63),
    ebit: 7255880.65,
    pi: null,
  },
  {
    brand: 'Rennie',
    year: 2025,
    grossSales: 11231384.88,
    netSales: 8791837.6,
    grossProfit: 7705864.01,
    cogs: cost(-991961.24),
    marketing: cost(-896053.25),
    ebit: 6809810.76,
    pi: null,
  },
  {
    brand: 'Talcid',
    year: 2024,
    grossSales: 20470128.83,
    netSales: 16140904.73,
    grossProfit: 13975802.62,
    cogs: cost(-1989662.01),
    marketing: cost(-4404808.76),
    ebit: 9570993.86,
    pi: null,
  },
  {
    brand: 'Talcid',
    year: 2025,
    grossSales: 20961018.25,
    netSales: 16378499.13,
    grossProfit: 14190379.23,
    cogs: cost(-2043982.49),
    marketing: cost(-4062992.25),
    ebit: 10127386.98,
    pi: null,
  },
];

/** Material-level Net Sales. Empty until InsightsNow returns material rows (LIKE on cv_brand_text). */
export type CopaSkuYear = {
  brand: string;
  year: number;
  material: string;
  materialText: string;
  netSales: number;
};

export const COPA_SKU_YEARS: CopaSkuYear[] = [];

export const COPA_SKU_PULL_NOTE =
  'SKU contribution uses material Net Sales / brand Net Sales. The column grain exists (material, material_text). This snapshot has no material rows: InsightsNow would not run the SQL after find_column_matches missed Iberogast.';
