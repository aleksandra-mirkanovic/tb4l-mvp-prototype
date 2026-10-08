/**
 * Prompts to replicate the AI Assistant v2 Market story for another brand.
 * Placeholders use {{NAME}} — fill before sending to an LLM or Sirius.
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
    title: '1 · LLM system instructions (market story)',
    purpose:
      'Paste as system / developer instructions. Tells the model how to structure the report, which charts to use, and what not to invent.',
    body: `You are building a brand-manager Market story from Sirius sell-out (CHDAA) only.

SCOPE
- Country: {{COUNTRY}}
- Category: {{CATEGORY}}
- Competitive set / BAM: {{SCOPE}}
- Focus brand: {{BRAND}}
- Manufacturer share: {{MANUFACTURER}}
- Window: latest 12 months (MAT) ending {{MAT_END}}
- Stay inside Sirius sell-out for this Market story — do not bring in other systems or calendars.

HARD RULES
1. Only use metrics that exist in the retrieval + CALC list (segment/sub-brand + channel). If a metric is missing, say N/A — do not invent.
2. One business question per section. End each analytic section with a short Insight (what the numbers mean) and a Then bridge (why dig deeper) — do not name the next section title in the bridge.
3. Highlight numbers sparsely: color only deltas and EVI (vs 100); bold levels/sizes without rainbow text.
4. Prefer 1–2 charts per section. No aquarium of tiny charts.

STORY ORDER (required)
1. Category overview — executive summary + 3 KPIs (set sales, {{MANUFACTURER}} share, {{BRAND}} EVI vs {{PRIMARY_SEGMENT}})
2. Category growth — value growth vs pack growth
3. Channel dynamics — channel price/volume drivers, then who moves share in each channel
4. Segment attractiveness — need-state size × growth (pool vs growth jobs)
5. Competitive landscape — top players in {{PRIMARY_SEGMENT}} and in the growth/leak need-state
6. {{MANUFACTURER}} relative growth — EVI of company brands vs their own segment
7. {{BRAND}} position — compare {{LINES}} on the primary franchise segment
8. Market share performance — {{MANUFACTURER}} share change by need-state (change first)
9. Key implications — signal cards: Problem (red) / Strength (green) / Watch (yellow)
10. Recommended actions — same signal order: fix red, protect green, manage yellow

CHART PLAYBOOK (use these chart types; rename titles for the brand)
| Section | Chart | Reads |
| Category growth | Grouped bars: value % vs pack % by need-state (+ category row) | Is growth packs or value/mix? |
| Channel dynamics | Stacked/paired bars: price vs volume EUR contribution by channel | Where euros come from |
| Channel dynamics | Ranked brand rows per channel: share change + value growth | Who gains/loses in each channel |
| Segment attractiveness | Size bar + growth bar per need-state; flag white-space ({{MANUFACTURER}} share < 3% AND faster than category) | Pool vs growth jobs |
| Competitive landscape | Ranked share bars for top brands in {{PRIMARY_SEGMENT}} and in growth segment | Who holds the pool / the fight |
| Relative growth | EVI stems vs 100 for {{MANUFACTURER}} brands | Ahead / behind own segment |
| Brand position | Two-line compare for {{LINES}}: share of primary segment + EVI | Defend vs grow jobs |
| Share performance | Slope / before→after share by need-state, sorted worst-first | Where share leaks |

OUTPUT STYLE
- Short ledes framed as business questions.
- Insights cite 2–4 key numbers max.
- Implications: title = decision language; why = plain English; evidence = “From the pack” with numbers.
- Actions: concrete this-month asks; no fake precision.`,
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

Also return metadata: latest_actual_month, mat_start, mat_end, scope, currency, months_available_for_3ya, segments_returned.

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

Ensure {{BRAND}} lines ({{LINES}}) appear under {{PRIMARY_SEGMENT}}.
Include the main rival brands in {{PRIMARY_SEGMENT}} and in faster need-states (especially candidates for share leak).`,
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

Category: SUM value/units; value growth 1y; unit growth 1y; {{MANUFACTURER}} share MAT/YA and change pp.

Per segment: share of category; value & unit growth 1y; {{MANUFACTURER}} share MAT/YA/change; white-space flag if {{MANUFACTURER}} share MAT < 3% AND segment growth > category growth.

Per sub-brand: share of its segment; share change pp; growth 1y; EVI = (1 + brand growth) / (1 + segment growth) × 100.

Channels: share of set; % of set absolute EUR growth; label each channel price-led vs volume-led from price vs volume contributions.

Identify:
- POOL segment = largest need-state (expected: {{PRIMARY_SEGMENT}})
- GROWTH / LEAK segment = fastest material need-state where {{MANUFACTURER}} share is soft (discover; seed guess {{GROWTH_SEGMENT}})
- Reference rival in the leak segment = largest non-{{MANUFACTURER}} gainer
- {{BRAND}} lines {{LINES}}: share of POOL + EVI vs POOL

Return a structured CALC object before writing any prose.`,
  },
  {
    id: 'story',
    title: '6 · Build the full Market story (charts + copy)',
    purpose: 'Main replication prompt after CALC exists. Produces the same section flow as AI Assistant v2.',
    body: `Using the CALC object for {{BRAND}} in {{SCOPE}} ({{COUNTRY}}, MAT {{MAT_END}}), write the Market story.

Follow the STORY ORDER and CHART PLAYBOOK from the system instructions.

For each analytic section output:
- title + one-line business-question lede
- chart spec: { type, title, caption, series/encodings } matching the playbook
- Insight paragraph (2–4 numbers)
- Then bridge (logic only)

KPI strip (overview only):
1. Category sales (set EUR m + value growth; mention {{MANUFACTURER}} EUR in set)
2. {{MANUFACTURER}} market share (level + pp change)
3. {{BRAND}} relative growth (EVI vs {{PRIMARY_SEGMENT}}; state 100 = in line)

Executive summary (overview): five short blocks —
Market; {{BRAND}} in that market; What to do next; Working hypothesis not proven; Data care (failed checks / missing 3y).

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
- Do not open projects the pack cannot size (e.g. tiny share need-states without EUR entry size)

Sort: fix bad first, then protect good, then watch.`,
  },
  {
    id: 'one-shot',
    title: '8 · One-shot prompt (retrieve → story)',
    purpose: 'Single paste when the LLM already has Sirius/MCP access. Replace placeholders, then run.',
    body: `Replicate the TB4L AI Assistant v2 Market story for another brand.

Fill:
- Country {{COUNTRY}} · Category {{CATEGORY}} · Scope {{SCOPE}} · Brand {{BRAND}}
- Manufacturer {{MANUFACTURER}} · Primary franchise segment {{PRIMARY_SEGMENT}}
- Growth-segment seed {{GROWTH_SEGMENT}} · Brand lines {{LINES}} · MAT end {{MAT_END}}

Steps:
1) Retrieve Sirius segments, sub-brands, metadata/checks, and channels (totals + top brands per channel).
2) Compute CALC only (category/segment/sub-brand/channel formulas; EVI; white-space; pool vs leak).
3) Build the story in the fixed section order with the chart playbook (value vs packs; channel drivers; channel movers; attractiveness; competitive ranks; EVI; brand lines; share change slopes).
4) Close with traffic-light implications and ordered actions.
5) List gaps as N/A (no 3y, no retailer grain, etc.) — never invent.

Output: executive summary, KPI strip, section-by-section chart specs + insights, implications, actions, and a short data-care note.`,
  },
  {
    id: 'iberogast-example',
    title: '9 · Worked fill — Iberogast (this report)',
    purpose: 'Example of placeholders filled for the current pack — use as a pattern, not as hard-coded truth for other brands.',
    body: `{{COUNTRY}} = Germany
{{CATEGORY}} = Digestive Health
{{BRAND}} = IBEROGAST
{{SCOPE}} = Iberogast GB BAM
{{MANUFACTURER}} = Bayer
{{PRIMARY_SEGMENT}} = IBS & SENSITIVE STOMACH
{{GROWTH_SEGMENT}} = ANTACIDS
{{MAT_END}} = Jul 2026
{{LINES}} = Iberogast Classic, Iberogast Advance

Expected story emphasis (validate from CALC, do not assume for other brands):
- Pool = IBS; growth/leak = Antacids (Gaviscon reference rival)
- Channel: defend Pharmacies (price-led, large); grow E-commerce (volume-led, most absolute EUR lift)
- Brand jobs: defend Classic share; put growth on Advance (EVI vs IBS)
- Do not open a PPI project from this pack`
  },
];
