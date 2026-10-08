/**
 * MCP capability audit for TB4L workshop analyses.
 * Catalogued 6 Oct 2026 from live MCP only. No workshop KPIs were calculated.
 *
 * Connected and reachable:
 * - user-oauth-server / ask_insightsnow cube copa
 * - user-oauth-server / ask_insightsnow cube coom
 * - user-Sirius / answer_business_question (CHDAA)
 *
 * Connected but not usable in this session:
 * - ask_proc_insightsnow → HTTP 403 (InsightsNow.Proc.User)
 * - ask_scm_insightsnow cube ph_inv_cov → Internal Server Error
 * - clarify_cube_choice is a prompt, not a dataset
 */

export type AuditVerdict = 'Yes' | 'Partial' | 'No';

export type WorkshopAreaAudit = {
  area: string;
  dataExists: AuditVerdict;
  datasets: string;
  fields: string;
  missing: string;
  produceToday: AuditVerdict;
  autoCharts: AuditVerdict;
  confidence: number;
  note: string;
};

export const MCP_SOURCES_REACHABLE = [
  {
    name: 'InsightsNow finance · COPA',
    tool: 'ask_insightsnow (cube: copa)',
    object: 'efdsfinfc_rw.t2d1_copa_slim_rls_enabled_test_view',
    status: 'Reachable. Metadata catalog returned.',
  },
  {
    name: 'InsightsNow finance · COOM',
    tool: 'ask_insightsnow (cube: coom)',
    object:
      'efdsfinfc_rw.t2d1_coom_slim_rls_enabled_test_view; generaldiscovery_asset_fact_r.fact_coom_npc_rpt_view_001',
    status: 'Reachable. Metadata catalog returned.',
  },
  {
    name: 'Sirius / CHDAA market',
    tool: 'answer_business_question',
    object:
      'chdaa_prd_dp_gma.gma_consume.v_m360_nrm, gma_fact_base, gma_dim_product_base, gma_dim_market_scope, gma_dim_time, gma_dim_country, gm_map_price_factors; local SSA views; Moody macros',
    status: 'Reachable. Live queries and semantic-layer catalog returned.',
  },
] as const;

export const MCP_SOURCES_NOT_USABLE = [
  {
    name: 'InsightsNow procurement',
    tool: 'ask_proc_insightsnow',
    status: 'HTTP 403 — role InsightsNow.Proc.User missing. No fields catalogued.',
  },
  {
    name: 'InsightsNow supply chain',
    tool: 'ask_scm_insightsnow (ph_inv_cov / 4pl)',
    status: 'ph_inv_cov call failed (Internal Server Error). No fields catalogued.',
  },
] as const;

export const COPA_FIELDS = {
  dimensions: [
    'year',
    'month',
    'version',
    'value_type',
    'country',
    'country_text',
    'customer',
    'customer_text',
    'material',
    'material_text',
    'cv_brand',
    'cv_brand_text',
    'cv_brand_family',
    'product_hierarchy_lvl_1–3',
    'company_code',
    'profitcenter',
    'bsv_lvl_1–10',
    'currency',
  ],
  measures: ['amount_eur', 'amount_eur_clos', 'amount_eur_p', 'amount', 'keyfigure', 'keyfigure_text'],
  keyfigureLabels: [
    'Net Sales',
    'Gross Sales',
    'cCOGS (total)',
    'Gross Profit',
    'cMarketing',
    'cR&D',
    'cAdmin',
    'cOther',
    'cEBIT',
    'CLEAN EBITDA',
    'EBITDA',
    'EBIT',
    'Discounts',
    'Rebates',
    'Cash Disc.',
    'Sales Adjustments',
    'p&i',
  ],
  documentedNotCatalogued: ['sales_quantity_GA (documented; not returned as a queryable column in catalog search)'],
};

export const COOM_FIELDS = {
  measures: ['amount_eur', 'amount', 'currency', 'keyfigure (NPC, INTERCOMPANY)', 'version (ACT, FC1–3, PLAN, PRED)'],
  dimensions: [
    'date',
    'country',
    'company_code',
    'responsible_cost_center',
    'cost_element / cost_element_lvl_1–3',
    'org_lvl_0–5',
    'task / subtask',
    'ch_taxonomy_lvl_1–2',
  ],
};

export const SIRIUS_FIELDS_PRESENT = [
  'SALES_VALUE_PUB_EUR / YA / 2YA',
  'SALES_UNIT / SALES_YA_UNIT',
  'SALES_VALUE_MSP_EUR',
  'SALES_VALUE_TRD_EUR',
  'BAYER_FLAG_INT',
  'CATEGORY_NAME',
  'SEGMENT_NAME',
  'BRAND_NAME',
  'SUB_BRAND_NAME',
  'MANUFACTURER_CORPORATION',
  'PRODUCT_ID / PACK_SIZE_*',
  'CHANNEL_NAME / CHANNEL_GROUP (documented on v_m360_nrm)',
  'CHANNEL_ECOMMERCE (documented on gma_fact_base only)',
  'AGG_TYPE (Month, P3M, P6M, YTD, MAT)',
  'TIME_ID, DATE_START',
];

export const WORKSHOP_AREA_AUDIT: WorkshopAreaAudit[] = [
  {
    area: 'Business performance',
    dataExists: 'Partial',
    datasets: 'COPA view (P&L). COOM (NPC cost only). Sirius (sell-out value/units, not internal NSV).',
    fields:
      'COPA: year, month, Net Sales, Gross Sales, cCOGS (total), Gross Profit, EBIT/EBITDA, amount_eur, cv_brand, material. Sirius: SALES_VALUE_PUB_EUR, SALES_UNIT.',
    missing:
      'No field named NSV, GSV, revenue, volume/units in COPA catalog. No contribution margin. Channel not in COPA. COOM has no brand, SKU, NSV, margin.',
    produceToday: 'Partial',
    autoCharts: 'No',
    confidence: 62,
    note: 'Value P&L trends from COPA as tables/text. CAGR can be calculated from year/month, not stored. InsightsNow COPA cannot auto-draw charts. Market sell-out is not internal revenue.',
  },
  {
    area: 'SKU / portfolio economics',
    dataExists: 'Partial',
    datasets: 'COPA (material + P&L labels). Sirius (PRODUCT_ID, pack, competitor SKU sell-out).',
    fields:
      'COPA: material, material_text, cv_brand, Net Sales, Gross Profit, amount_eur. Sirius: PRODUCT_ID, PACK_SIZE_*, IS_ACTIVE_SKU, SALES_VALUE_PUB_EUR.',
    missing:
      'Contribution margin. Optimization constraints. Elasticity. Internal volume at SKU (unconfirmed in COPA).',
    produceToday: 'Partial',
    autoCharts: 'No',
    confidence: 55,
    note: 'SKU rank and mix of Net Sales / Gross Profit possible as tables. Pareto, heatmap and bubble are not produced by the Finance MCP. Portfolio optimization cannot run.',
  },
  {
    area: 'Marketing investment analysis',
    dataExists: 'Partial',
    datasets: 'COPA keyfigure labels only. Procurement MCP not accessible (403).',
    fields: 'COPA: p&i, cMarketing, Discounts, Rebates, year, month, cv_brand, amount_eur.',
    missing:
      'Media spend. Trade spend (as a field). Spend by channel. ROI / incrementality. Impressions. Mix models.',
    produceToday: 'Partial',
    autoCharts: 'No',
    confidence: 28,
    note: 'P&I and cMarketing time series can be queried. Media, trade allocation, ROI scatter and treemap cannot. Do not treat Discounts/Rebates as trade spend.',
  },
  {
    area: 'Pricing and elasticity',
    dataExists: 'Partial',
    datasets: 'Sirius price levels and pack. COPA has no price fields.',
    fields:
      'Sirius: SALES_VALUE_PUB_EUR, SALES_VALUE_MSP_EUR, SALES_VALUE_TRD_EUR, gm_map_price_factors (msp, trd, rsp), PACK_SIZE_*, SALES_UNIT.',
    missing:
      'List price. Net price. Elasticity. Price simulation engine. COPA list/net price. Internal invoice price.',
    produceToday: 'Partial',
    autoCharts: 'No',
    confidence: 32,
    note: 'Sell-out price-per-unit can be derived (value / units) and pack architecture from Sirius. Elasticity model, ladder and simulation cannot.',
  },
  {
    area: 'Market attractiveness',
    dataExists: 'Yes',
    datasets: 'Sirius CHDAA v_m360_nrm + gma_dim_market_scope (GB BAM / SAM).',
    fields:
      'SALES_VALUE_PUB_EUR, SALES_YA / 2YA, SALES_UNIT, BAYER_FLAG_INT, CATEGORY_NAME, SEGMENT_NAME, BRAND_NAME, SUB_BRAND_NAME, MANUFACTURER_CORPORATION.',
    missing:
      'Stored market-share column (must be calculated). Perceptual / brand-strength scores. H2 Blockers has no Germany sales rows in this BAM.',
    produceToday: 'Yes',
    autoCharts: 'Partial',
    confidence: 88,
    note: 'Size, growth, segment, share and competitive set are available now. Sirius MCP auto-returns bar charts and tables, not bubble or attractiveness-matrix marks. This page already charts the competitive set.',
  },
  {
    area: 'Size of prize',
    dataExists: 'Partial',
    datasets: 'Sirius market gaps. COPA Gross Profit / Net Sales (not joined to Sirius in one tool).',
    fields: 'Sirius segment/brand value. COPA Gross Profit, Net Sales. No target or uplift fields.',
    missing:
      'Targets. Profit uplift. Scenario volume. Join key guaranteed across Sirius brand names and COPA cv_brand. Opportunity EUR from finance.',
    produceToday: 'Partial',
    autoCharts: 'No',
    confidence: 34,
    note: 'Market-gap ranking can be sized in sell-out euros. Gap-to-target, profit uplift, tornado and finance waterfall cannot.',
  },
  {
    area: 'Channel economics',
    dataExists: 'Partial',
    datasets: 'Sirius documents CHANNEL_NAME / CHANNEL_GROUP. COPA has no channel. PROC MCP locked.',
    fields: 'Sirius: CHANNEL_NAME, CHANNEL_GROUP, CHANNEL_ECOMMERCE (gma_fact_base), SALES_VALUE_PUB_EUR.',
    missing: 'Channel in COPA. Channel margin. GTN. Channel profitability. Trade spend by channel.',
    produceToday: 'Partial',
    autoCharts: 'No',
    confidence: 30,
    note: 'Sell-out by channel can be queried from Sirius if asked. Internal channel P&L, GTN and profitability matrix cannot.',
  },
];

export const ANALYSES_IMMEDIATE = [
  'Market size, growth and Bayer share by segment (Sirius)',
  'Competitor / sub-brand ranking in a competitive set (Sirius)',
  'Need-state mix and relative growth vs the segment (calculated from Sirius)',
];

export const ANALYSES_PARTIAL = [
  'Internal Net Sales / Gross Sales / Gross Profit trends by brand or SKU (COPA text/tables only)',
  'P&I and cMarketing spend trends (COPA labels; not media ROI)',
  'NPC / manufacturing cost structure (COOM; no brand P&L)',
  'Sell-out price-per-unit and pack architecture (Sirius)',
  'Sell-out by channel (Sirius documented; not on the current snapshot page)',
  'Market gap sizing in sell-out euros (Sirius; no profit)',
];

export const ANALYSES_CANNOT = [
  'Volume trends from COPA (volume/units not in queryable catalog)',
  'Contribution-margin portfolio optimization',
  'Media spend, trade spend, ROI',
  'Price elasticity and price simulation',
  'Gap-to-target and profit uplift',
  'GTN and channel profitability',
  'Market vs finance on one canvas (no joined MCP; COPA charts not auto)',
];

export const CHARTS_TODAY = [
  {
    name: 'Grouped bar (Sirius MCP auto)',
    source: 'Sirius answer_business_question artifacts',
    spec: 'mark: bar · x: share % · y: segment · color: Current MAT 12M vs Previous MAT 12M · data: live SQL on v_m360_nrm',
  },
  {
    name: 'Data table (Sirius MCP auto)',
    source: 'Sirius artifacts kind=table',
    spec: 'columns: SEGMENT_NAME, value MAT/YA, Bayer value MAT/YA, share % · no chart mark',
  },
  {
    name: 'Shared-axis line (this page)',
    source: 'Prototype from Sirius snapshot',
    spec: 'x: 2 years ago / last year / latest · y: EUR m · series: IBS, Antacids, Gas, PPIs',
  },
  {
    name: 'Grouped share columns (this page)',
    source: 'Prototype from Sirius snapshot',
    spec: 'x: need-state · y: Bayer share % · series: Previous MAT 12M, Current MAT 12M',
  },
  {
    name: 'Relative-growth lollipops (this page)',
    source: 'Prototype from Sirius snapshot',
    spec: 'x: evolution index · y: Bayer sub-brand · reference line: 100 = in line with market',
  },
  {
    name: 'IBS rank bars (this page)',
    source: 'Prototype from Sirius snapshot',
    spec: 'x: share of IBS · y: named sub-brand · highlight Bayer',
  },
  {
    name: 'Category mix bar (this page)',
    source: 'Prototype from Sirius snapshot',
    spec: 'stacked width: share of category sales · color: need-state',
  },
];

export const CHARTS_NOT_TODAY = [
  'Waterfall (P&L or opportunity)',
  'Contribution chart',
  'Pareto',
  'Heatmap',
  'Bubble / attractiveness matrix / growth matrix',
  'Treemap',
  'ROI scatterplot',
  'Price ladder',
  'Elasticity scatter',
  'Simulation charts',
  'Tornado',
  'Channel profitability matrix',
  'GTN comparison',
];

export const NEXT_SOURCES = [
  'Expose and wire COPA Net Sales / Gross Profit into this report (cube is reachable; page does not call it yet).',
  'Confirm whether sales_quantity_GA is queryable for volume.',
  'Grant InsightsNow.Proc.User if trade/procurement spend is required.',
  'Add media spend and trade spend datasets (not in COPA catalog, PROC locked).',
  'Add GTN / list / net price, or a pricing elasticity source.',
  'Add brand-level join between Sirius BRAND_NAME and COPA cv_brand, plus targets for size-of-prize.',
  'Query Sirius CHANNEL_NAME live if channel economics are in scope (documented, not on this snapshot).',
];
