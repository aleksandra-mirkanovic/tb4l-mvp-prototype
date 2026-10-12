/**
 * Prompts to replicate the AI Assistant Market story (v3) for another brand.
 * Placeholders use {{NAME}} — fill before sending to an LLM or Sirius.
 * Full rule book: `m360ReplicationRules.ts` (also rendered in the Technical appendix).
 */

export type ReplicationPrompt = {
  id: string;
  title: string;
  purpose: string;
  body: string;
};

export const M360_PROMPT_PLACEHOLDERS = [
  { key: '{{COUNTRY}}', example: 'Germany', meaning: 'Market country' },
  { key: '{{CATEGORY}}', example: 'Digestive Health', meaning: 'Category in Sirius' },
  { key: '{{BRAND}}', example: 'IBEROGAST', meaning: 'Focus brand / GB BAM brand' },
  { key: '{{SCOPE}}', example: 'Iberogast GB BAM', meaning: 'Competitive set / BAM scope label' },
  { key: '{{MANUFACTURER}}', example: 'Bayer', meaning: 'Company whose share is tracked' },
  {
    key: '{{PRIMARY_SEGMENT}}',
    example: 'IBS & SENSITIVE STOMACH',
    meaning: 'Need-state where the brand’s franchise / pool sits',
  },
  {
    key: '{{GROWTH_SEGMENT}}',
    example: 'ANTACIDS',
    meaning: 'Faster need-state to stress-test for share leak (discover from data if unknown)',
  },
  { key: '{{MAT_END}}', example: 'Jul 2026', meaning: 'Latest actual month / MAT end' },
  {
    key: '{{LINES}}',
    example: 'Classic, Advance',
    meaning: 'Key sub-brands / lines of {{BRAND}} to compare on EVI and share',
  },
] as const;

export const M360_REPLICATION_PROMPTS: ReplicationPrompt[] = [
  {
    id: 'system',
    title: '1 · LLM system instructions (market story v3)',
    purpose:
      'Paste as system / developer instructions. Full rule book for structure, CALC, presence, colors, and narrative. Pair with the Technical appendix rule groups.',
    body: `You are building a brand-manager Market story from Sirius sell-out (CHDAA) only — same analytics as TB4L AI Assistant Market v3.

SCOPE
- Country: {{COUNTRY}}
- Category: {{CATEGORY}}
- Competitive set / BAM: {{SCOPE}}
- Focus brand: {{BRAND}}
- Manufacturer share: {{MANUFACTURER}}
- Window: latest 12 months (MAT) ending {{MAT_END}}
- Stay inside Sirius sell-out for this Market story — do not bring in finance/COPA or other calendars.

HARD RULES
1. Only use metrics in the CALC list (segment/sub-brand + channel). Missing → N/A. Never invent.
2. Sales growth = % YoY. Share moves = percentage points (pp). Never call share Δ “% growth”.
3. EVI = (1 + brand growth) / (1 + segment growth) × 100. Focus-brand KPI EVI = SUM of brand lines in {{PRIMARY_SEGMENT}}, not one SKU.
4. White-space = {{MANUFACTURER}} share MAT < 3% AND segment growth > category growth — candidate only, not a sized project.
5. No manufacturer share Δ when there is no presence (0→0). Say “no presence”; omit from share-change chart.
6. |share Δ| < 0.5 pp → stable (moved less than 0.5 points either way).
7. 3y CAGR only if value_3ya is complete; else N/A.
8. One business question per section. End analytic sections with Insight + Then bridge (do not name the next section title).
9. Highlight numbers sparsely: color only deltas and EVI (vs 100).
10. Prefer 1–2 charts per section.

POOL / LEAK (discover from CALC — do not copy Iberogast rivals blindly)
- POOL = largest need-state (seed {{PRIMARY_SEGMENT}})
- GROWTH/LEAK = growing need-state where {{MANUFACTURER}} share is soft (seed {{GROWTH_SEGMENT}})
- Reference rival = largest non-{{MANUFACTURER}} gainer in that fight
- Do not open entry projects the pack cannot size (tiny / no-presence need-states)

STORY ORDER (required — 10 steps)
1. Category overview — exec summary + 3 KPIs (set sales, {{MANUFACTURER}} share, {{BRAND}} EVI vs {{PRIMARY_SEGMENT}}) + top-10 brands in set
2. Category growth — value % vs pack % by need-state
3. Channel dynamics — price/volume EUR drivers, then share-Δ movers per channel (gainers first)
4. Segment attractiveness — size × growth vs category; white-space flags
5. Competitive landscape — top players in {{PRIMARY_SEGMENT}} and growth/leak need-state
6. {{MANUFACTURER}} relative growth — EVI of company brands vs own segment
7. {{BRAND}} position — compare {{LINES}} on the primary franchise segment
8. Market share performance — {{MANUFACTURER}} share change by need-state (worst first; omit no-presence)
9. Summary · synthesis & key implications — key insights, brand implications, opportunities, risks, then Problem / Strength / Watch cards
10. Recommended actions — same signal order: fix red, protect green, manage yellow

UNDER EACH CHART (analysis rail)
Key facts → Key insights → Hypothesis validation (confirmed|partial|rejected|new) → Implications for the brand → Opportunities and risks.

CHART COLORS (three rules only)
- Slate = size/share (how big). Same for every brand.
- Deeper slate + “{{MANUFACTURER}}” tag = ownership, not performance.
- Green / amber = up / down (share Δ, pace vs category, EVI vs 100). No per–need-state rainbow.

CHART PLAYBOOK
| Section | Chart | Reads |
| Overview | KPI strip + top-10 share bars | Cast + headlines |
| Category growth | Grouped bars: value % vs pack % (+ category) | Packs or value/mix? |
| Channel dynamics | Price vs volume EUR by channel | Where euros come from |
| Channel dynamics | Brand rows: share Δ (pp) + value growth % | Who gains/loses |
| Attractiveness | Size slate + growth green/amber vs category | Pool vs growth jobs |
| Competitive | Ranked share bars (slate; manufacturer deeper) | Who holds pool / fight |
| Relative growth | EVI lollipops vs 100 | Ahead / behind segment |
| Brand position | Lines: share + EVI on primary segment | Defend vs grow |
| Share performance | Before→after share, worst first | Where share leaks |

OUTPUT STYLE
- Short ledes as business questions.
- Insights cite 2–4 key numbers max.
- Implications: decision-language title; plain why; “From the pack” evidence.
- Actions: concrete this-month asks; no fake precision.
- Data care (failed T4 checks, missing 3y) in footer — do not duplicate scope in the exec summary.`,
  },
  {
    id: 'retrieve-segments',
    title: '2 · Sirius retrieval — segments (T1)',
    purpose: 'Ask the warehouse / Sirius for need-state totals before any story writing.',
    body: `For {{COUNTRY}} {{CATEGORY}}, competitive set {{SCOPE}}, MAT ending {{MAT_END}}:

Return one row per need-state / segment with:
- value_mat, value_ya, value_2ya, value_3ya (EUR)
- units_mat, units_ya, units_3ya
- bayer_value_mat, bayer_value_ya, bayer_value_3ya (or {{MANUFACTURER}} value if labelled differently)
- n_subbrands_total

Also return metadata (T3): latest_actual_month, mat_start, mat_end, scope, currency, months_available_for_3ya, segments_returned, units_fill_rate_pct.

If value_3ya is incomplete, mark 3y CAGR as N/A — do not extrapolate.`,
  },
  {
    id: 'retrieve-subbrands',
    title: '3 · Sirius retrieval — sub-brands (T2)',
    purpose: 'Brand / line grain for competitive landscape, EVI, and {{BRAND}} position.',
    body: `For the same {{SCOPE}} MAT {{MAT_END}}:

Return sub-brand rows with:
- segment_name, manufacturer, brand, sub_brand, is_bayer (or is_{{MANUFACTURER}})
- value_mat, value_ya, value_3ya
- units_mat, units_ya
- sub_brand_source if available (named vs grouped)

Ensure {{BRAND}} lines ({{LINES}}) appear under {{PRIMARY_SEGMENT}}.
Include the main rival brands in {{PRIMARY_SEGMENT}} and in faster need-states (especially candidates for share leak).
Exclude or flag junk rows (unrelated SKUs in a need-state) in checks.`,
  },
  {
    id: 'retrieve-channels',
    title: '4 · Sirius retrieval — channels (T-ch / T-ch-b)',
    purpose: 'Channel drivers and top-brand dynamics used in Channel dynamics.',
    body: `For {{COUNTRY}} {{CATEGORY}}, {{SCOPE}}, MAT {{MAT_END}}, channel grain:

1) Channel totals (e.g. Pharmacies / E-commerce — use whatever CHANNEL_NAME exists for this country):
- value EUR, share of set, value growth %, unit growth %
- price contribution EUR, volume contribution EUR
- absolute EUR change and each channel’s % of the set’s absolute EUR growth
- new pack / new product / intersection if available

2) Top 8 brands by value in each channel:
- brand, value, share of channel, share change pp, value growth %, unit growth %, is {{MANUFACTURER}}

If a channel type does not exist for this country, say which channels exist — do not invent drugstore/grocery.`,
  },
  {
    id: 'calc',
    title: '5 · CALC layer — compute before narrative',
    purpose: 'Force the model to compute the same metrics the report uses.',
    body: `Using only the Sirius tables just retrieved, compute CALC (no extra invented metrics):

Category:
- SUM value/units MAT & YA
- value growth 1y %; unit growth 1y %; value−pack gap (pp illustration)
- {{MANUFACTURER}} sales growth 1y % = SUM(mfr_value_mat)/SUM(mfr_value_ya)−1
- {{MANUFACTURER}} share MAT/YA and change pp

Per segment:
- share of category; value & unit growth 1y
- {{MANUFACTURER}} share MAT/YA/change pp (if both shares ~0 → no presence, no Δ)
- white-space flag if share MAT < 3% AND segment growth > category growth
- 3y CAGR only if value_3ya present

Per sub-brand / brand:
- share of its segment; share change pp; growth 1y
- EVI = (1 + growth) / (1 + segment growth) × 100
- Brand EVI for {{BRAND}} = sum of its lines in {{PRIMARY_SEGMENT}}

Channels:
- share of set; % of set absolute EUR growth
- price-led vs volume-led from price vs volume contributions
- brand share of channel + share change pp; sort movers gainers-first

Identify:
- POOL segment = largest need-state (expected: {{PRIMARY_SEGMENT}})
- GROWTH / LEAK segment = fastest material need-state where {{MANUFACTURER}} share is soft (discover; seed {{GROWTH_SEGMENT}})
- Reference rival in the leak segment = largest non-{{MANUFACTURER}} gainer
- {{BRAND}} lines {{LINES}}: share of POOL + EVI vs POOL
- Top 10 brands in set by value (share of set %)

Also run checks analogous to T4 (segment Σ, manufacturer Σ, junk SKUs, units fill).

Return a structured CALC object before writing any prose.`,
  },
  {
    id: 'story',
    title: '6 · Build the full Market story (charts + copy)',
    purpose: 'Main replication prompt after CALC exists. Same section flow as AI Assistant Market v3.',
    body: `Using the CALC object for {{BRAND}} in {{SCOPE}} ({{COUNTRY}}, MAT {{MAT_END}}), write the Market story.

Follow the STORY ORDER and CHART PLAYBOOK from the system instructions (v3).

For each analytic section output:
- title + one-line business-question lede
- chart spec: { type, title, caption, encodings } matching the playbook and three color rules
- Under-chart rail: Key facts → Key insights → Hypothesis validation → Implications → Opportunities and risks
- Then bridge (logic only)

KPI strip (overview only):
1. Category sales (set EUR m + value growth %; mention {{MANUFACTURER}} EUR in set)
2. {{MANUFACTURER}} market share (level + pp change)
3. {{BRAND}} relative growth (whole-brand EVI vs {{PRIMARY_SEGMENT}}; 100 = in line)

Executive summary (overview): Market; {{BRAND}} in that market; What to do next; Working hypothesis (not proven). Put Data care (failed checks / missing 3y) in the footer — do not duplicate MAT/scope there.

If channel data is missing, keep the section but mark charts N/A and say what grain is unavailable.`,
  },
  {
    id: 'signals',
    title: '7 · Implications + actions (traffic-light)',
    purpose: 'Replicate Key implications and Recommended actions with Problem / Strength / Watch.',
    body: `From the finished CALC + story for {{BRAND}}, produce:

A) Key implications — 4–6 signal cards:
- tone: bad | good | watch
- label: Problem | Strength | Watch
- title: decision language (not a restated metric)
- why: one plain sentence
- evidence: “From the pack” with the supporting numbers

Required themes if the data supports them:
- Competitive wound / share leak (usually growth segment + rival)
- Franchise strength on {{PRIMARY_SEGMENT}} / {{LINES}} jobs
- Channel jobs (defend large channel vs feed growth channel)
- Value/mix vs packs

B) Recommended actions — 3–5 items, same signal order:
- step number, tone, title, body with concrete this-month ask
- Do not open projects the pack cannot size (e.g. no-presence need-states without EUR entry size)

Sort: fix bad first, then protect good, then watch.`,
  },
  {
    id: 'one-shot',
    title: '8 · One-shot prompt (retrieve → story)',
    purpose: 'Single paste when the LLM already has Sirius/MCP access. Replace placeholders, then run.',
    body: `Replicate the TB4L AI Assistant Market v3 story for another brand.

Fill:
- Country {{COUNTRY}} · Category {{CATEGORY}} · Scope {{SCOPE}} · Brand {{BRAND}}
- Manufacturer {{MANUFACTURER}} · Primary franchise segment {{PRIMARY_SEGMENT}}
- Growth-segment seed {{GROWTH_SEGMENT}} · Brand lines {{LINES}} · MAT end {{MAT_END}}

Steps:
1) Retrieve Sirius T3 metadata, T1 segments, T2 sub-brands, T4 checks, T-ch channels, T-ch-b top brands.
2) Compute CALC only (category/segment/sub-brand/channel; EVI; white-space; presence rules; pool vs leak; top-10).
3) Build the 10-step story with chart playbook + three color rules + under-chart analysis rail.
4) Close with synthesis, traffic-light implications, ordered actions, and data-care footer.
5) List gaps as N/A (no 3y, no retailer grain, etc.) — never invent. Do not copy Iberogast-specific rivals or conclusions.

Output: executive summary, KPI strip, section-by-section chart specs + analysis blocks, implications, actions, data care.`,
  },
  {
    id: 'iberogast-example',
    title: '9 · Worked fill — Iberogast (this report)',
    purpose:
      'Example of placeholders filled for the current pack — pattern only. Rediscover pool/leak/rival from CALC for other brands.',
    body: `{{COUNTRY}} = Germany
{{CATEGORY}} = Digestive Health
{{BRAND}} = IBEROGAST
{{SCOPE}} = Iberogast GB BAM
{{MANUFACTURER}} = Bayer
{{PRIMARY_SEGMENT}} = IBS & SENSITIVE STOMACH
{{GROWTH_SEGMENT}} = ANTACIDS
{{MAT_END}} = Jul 2026
{{LINES}} = Iberogast Classic, Iberogast Advance

Expected story emphasis for THIS pack only (validate from CALC; do not assume for other brands):
- Pool = IBS; growth/leak = Antacids (Gaviscon reference rival)
- Channel: defend Pharmacies (price-led, large); grow E-commerce (volume-led, most absolute EUR lift)
- Brand jobs: defend Classic share; put growth on Advance (EVI vs IBS); brand KPI = whole Iberogast EVI not Classic alone
- PPIs: no Bayer presence → no share Δ, no sized entry project
- Colors: slate size, Bayer deeper + tag, green/amber change only
- T4: surface FAIL checks (e.g. C2 Bayer Other mix, C5 junk SKU) in Data care`,
  },
];
