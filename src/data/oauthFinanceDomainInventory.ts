/**
 * Consumer Health finance-domain inventory for OAuth Server (InsightsNow MCP).
 * No analytics. Catalog only.
 *
 * Live re-check 6 Oct 2026 ~17:20 UTC+2:
 *   ask_insightsnow copa/coom → HTTP 500
 *   ask_scm_insightsnow ph_inv_cov / 4pl → HTTP 500
 *   ask_proc_insightsnow → HTTP 403 (InsightsNow.Proc.User)
 *
 * Field lists below are from the last successful live catalog the same day
 * (financeMcpAudit.ts) plus the successful COPA brand-year P&L extract
 * (copaRetrieval.ts). Sirius / CHDAA is a different MCP and is out of scope.
 */

export type Presence = 'Yes' | 'Partial' | 'No' | 'Unreachable';

export type DatasetInventory = {
  sourceName: string;
  datasetName: string;
  grain: string;
  dimensions: string[];
  measures: string[];
  timeCoverage: string;
  completeness: string;
  exampleValues: string;
  status: Presence;
};

export const OAUTH_DATASETS: DatasetInventory[] = [
  {
    sourceName: 'InsightsNow finance (ask_insightsnow, cube copa)',
    datasetName: 'efdsfinfc_rw.t2d1_copa_slim_rls_enabled_test_view',
    grain:
      'P&L key figure × org (BSV) × brand/material/customer × year/month × version. Not a dedicated SKU or channel cube.',
    dimensions: [
      'year',
      'month',
      'version / value_type (ACT and others)',
      'country / country_text',
      'customer / customer_text',
      'material / material_text',
      'cv_brand / cv_brand_text',
      'cv_brand_family / cv_brand_family_text',
      'product_hierarchy_lvl_1–3',
      'company_code',
      'profitcenter',
      'bsv_lvl_1–10',
      'currency',
      'keyfigure / keyfigure_text',
    ],
    measures: [
      'amount_eur (sign: SUM(−amount_eur) as returned by the agent)',
      'amount_eur_clos',
      'amount_eur_p',
      'amount',
    ],
    timeCoverage:
      'year + month on the view. Proven extract: calendar 2024 and 2025, Germany CH actuals, month 12 complete for 2025. 2021–2023 and YTD 2026 were requested; agent did not return those years for named brands.',
    completeness:
      'P&L labels exist as keyfigure_text. p&i returned no rows in the four-brand extract. sales_quantity_GA is documented but was not a queryable catalog column. No field named GSV, NSV, SKU, channel, volume, or price.',
    exampleValues:
      'Germany CH ACT 2025 Iberogast: Gross Sales EUR 86.3m, Net Sales EUR 68.2m, Gross Profit EUR 55.6m, cCOGS EUR 12.0m, cMarketing EUR 18.4m, cEBIT EUR 37.1m.',
    status: 'Yes',
  },
  {
    sourceName: 'InsightsNow finance (ask_insightsnow, cube coom)',
    datasetName:
      'efdsfinfc_rw.t2d1_coom_slim_rls_enabled_test_view; generaldiscovery_asset_fact_r.fact_coom_npc_rpt_view_001',
    grain: 'Cost / NPC line × cost center / org × date. No brand P&L grain.',
    dimensions: [
      'date',
      'country',
      'company_code',
      'responsible_cost_center',
      'cost_element / cost_element_lvl_1–3',
      'org_lvl_0–5',
      'task / subtask',
      'ch_taxonomy_lvl_1–2',
      'version (ACT, FC1–3, PLAN, PRED)',
    ],
    measures: ['amount_eur', 'amount', 'currency', 'keyfigure (NPC, INTERCOMPANY)'],
    timeCoverage: 'date + version. Full CH brand time series not proven in this repo.',
    completeness: 'No brand, SKU, Net Sales, Gross Profit, channel, or customer on COOM.',
    exampleValues: 'None stored in this prototype (catalog only).',
    status: 'Yes',
  },
  {
    sourceName: 'InsightsNow procurement (ask_proc_insightsnow)',
    datasetName: 'unknown — endpoint refused',
    grain: 'unknown',
    dimensions: [],
    measures: [],
    timeCoverage: 'unknown',
    completeness: 'HTTP 403. Role InsightsNow.Proc.User missing. Nothing catalogued.',
    exampleValues: 'n/a',
    status: 'Unreachable',
  },
  {
    sourceName: 'InsightsNow supply chain (ask_scm_insightsnow, cubes ph_inv_cov and 4pl)',
    datasetName: 'unknown — endpoint failed',
    grain: 'Documented intent only: inventory coverage / 4PL shipment; not finance P&L.',
    dimensions: [],
    measures: [],
    timeCoverage: 'unknown',
    completeness: 'Internal Server Error on live calls. No fields catalogued.',
    exampleValues: 'n/a',
    status: 'Unreachable',
  },
];

export type ChecklistRow = {
  item: string;
  presence: Presence;
  where: string;
};

export const CHECKLIST: Record<string, ChecklistRow[]> = {
  revenue: [
    { item: 'GSV', presence: 'Partial', where: 'COPA keyfigure_text = Gross Sales. No column named GSV.' },
    { item: 'NSV', presence: 'Partial', where: 'COPA keyfigure_text = Net Sales. No column named NSV.' },
    { item: 'Revenue', presence: 'Partial', where: 'No column named Revenue. Use Net Sales (or Gross Sales).' },
    {
      item: 'Sell-in Revenue',
      presence: 'Partial',
      where: 'COPA is internal actuals (sell-in style P&L). Not labelled sell-in.',
    },
    { item: 'Sell-out Revenue', presence: 'No', where: 'Not on OAuth COPA/COOM. (Sirius is a different MCP.)' },
    { item: 'Revenue by Brand', presence: 'Yes', where: 'cv_brand / cv_brand_text + Net Sales / Gross Sales.' },
    {
      item: 'Revenue by SKU',
      presence: 'Partial',
      where: 'No sku column. material / material_text is the SKU-like grain. Live material rows not in snapshot.',
    },
    { item: 'Revenue by Channel', presence: 'No', where: 'No channel column in COPA catalog.' },
    {
      item: 'Revenue by Customer',
      presence: 'Partial',
      where: 'customer / customer_text exist. Not pulled in the four-brand snapshot.',
    },
    { item: 'Revenue by Country', presence: 'Yes', where: 'country / country_text and BSV (e.g. bsv_lvl_4_text = Germany).' },
    { item: 'Revenue by Month', presence: 'Yes', where: 'year + month. Snapshot stored as calendar year totals.' },
  ],
  volume: [
    { item: 'Volume', presence: 'No', where: 'Not a queryable COPA column. sales_quantity_GA documented only.' },
    { item: 'Units', presence: 'No', where: 'Not in COPA catalog.' },
    { item: 'Volume by SKU', presence: 'No', where: 'No quantity × material proven.' },
    { item: 'Volume by Brand', presence: 'No', where: 'No quantity × brand proven.' },
    { item: 'Volume by Channel', presence: 'No', where: 'No volume and no channel.' },
    { item: 'Volume Growth', presence: 'No', where: 'Cannot calculate without quantity.' },
    { item: 'Unit Price', presence: 'No', where: 'No price and no quantity in COPA.' },
  ],
  margin: [
    { item: 'COGS', presence: 'Yes', where: 'keyfigure_text = cCOGS (total).' },
    { item: 'Gross Profit', presence: 'Yes', where: 'keyfigure_text = Gross Profit.' },
    { item: 'Gross Margin %', presence: 'Partial', where: 'Not stored. Calculate Gross Profit / Net Sales.' },
    { item: 'Brand Margin %', presence: 'No', where: 'No brand-margin key figure in catalog or extract.' },
    { item: 'Contribution Margin', presence: 'No', where: 'Catalog search for contribution returned no matches.' },
    { item: 'EBITDA', presence: 'Yes', where: 'keyfigure_text = EBITDA and CLEAN EBITDA.' },
    {
      item: 'Operating Profit',
      presence: 'Partial',
      where: 'cEBIT / EBIT present. Not labelled Operating Profit.',
    },
    { item: 'Cost To Serve', presence: 'No', where: 'Not in COPA catalog. COOM is NPC / cost centers, not CTS.' },
  ],
  pricing: [
    { item: 'List Price', presence: 'No', where: 'No price columns in COPA.' },
    { item: 'Base Price', presence: 'No', where: 'No price columns in COPA.' },
    { item: 'Selling Price', presence: 'No', where: 'No price columns in COPA.' },
    { item: 'Price Per Unit', presence: 'No', where: 'No price or units in COPA.' },
    { item: 'Price Per Pack', presence: 'No', where: 'No pack or price in COPA.' },
    { item: 'Price Per Dose', presence: 'No', where: 'No dose or price in COPA.' },
    { item: 'Competitor Price', presence: 'No', where: 'Internal P&L only.' },
    { item: 'Promotion Price', presence: 'No', where: 'No price columns in COPA.' },
    { item: 'Regular Price', presence: 'No', where: 'No price columns in COPA.' },
  ],
  tradeGtn: [
    { item: 'GSV', presence: 'Partial', where: 'Gross Sales key figure.' },
    { item: 'NSV', presence: 'Partial', where: 'Net Sales key figure.' },
    { item: 'GTN', presence: 'No', where: 'No GTN field. Bridge would have to be inferred from labels.' },
    { item: 'Discounts', presence: 'Partial', where: 'keyfigure_text includes Discounts (and Cash Disc.).' },
    { item: 'Rebates', presence: 'Partial', where: 'keyfigure_text includes Rebates.' },
    { item: 'Accruals', presence: 'No', where: 'Not in catalog.' },
    { item: 'Trade Terms', presence: 'No', where: 'Not in catalog. PROC locked (403).' },
    { item: 'Invoice Values', presence: 'No', where: 'Not in catalog.' },
    { item: 'Customer Discounts', presence: 'Partial', where: 'Discounts exist; not proven as customer-grain discounts.' },
    { item: 'Trade Spend', presence: 'No', where: 'Not a COPA field. PROC locked.' },
  ],
  marketing: [
    { item: 'P&I Spend', presence: 'Partial', where: 'keyfigure_text = p&i. Four-brand Germany extract: no rows.' },
    { item: 'Media Spend', presence: 'No', where: 'Not in COPA catalog.' },
    { item: 'Retail Media Spend', presence: 'No', where: 'Not in COPA catalog.' },
    { item: 'Trade Spend', presence: 'No', where: 'Not in COPA catalog. PROC locked.' },
    { item: 'HCP Spend', presence: 'No', where: 'Not in COPA catalog.' },
    { item: 'Activation Spend', presence: 'No', where: 'Not in COPA catalog.' },
    { item: 'Marketing Spend', presence: 'Yes', where: 'keyfigure_text = cMarketing (example Iberogast 2025 EUR 18.4m).' },
  ],
  customerChannel: [
    { item: 'Revenue by Channel', presence: 'No', where: 'No channel in COPA.' },
    { item: 'Revenue by Retailer', presence: 'No', where: 'No retailer dimension proven.' },
    {
      item: 'Customer Revenue',
      presence: 'Partial',
      where: 'customer / customer_text exist; not in stored snapshot.',
    },
    { item: 'Customer Growth', presence: 'Partial', where: 'Calculable if customer × year Net Sales is pulled.' },
    { item: 'Customer Share', presence: 'Partial', where: 'Calculable from customer vs total; not stored.' },
    { item: 'Channel Profitability', presence: 'No', where: 'No channel, no channel margin.' },
  ],
  portfolioSku: [
    { item: 'Brand', presence: 'Yes', where: 'cv_brand / cv_brand_text.' },
    { item: 'Subbrand', presence: 'Partial', where: 'cv_brand_family exists. No sub_brand column. Product hierarchy 1–3.' },
    { item: 'SKU', presence: 'Partial', where: 'No sku column. Use material / material_text.' },
    { item: 'Pack', presence: 'No', where: 'Not in COPA catalog.' },
    { item: 'Pack Size', presence: 'No', where: 'Not in COPA catalog.' },
    { item: 'Launch Date', presence: 'No', where: 'Not in COPA catalog.' },
    { item: 'Product Status', presence: 'No', where: 'Not in COPA catalog.' },
  ],
};
