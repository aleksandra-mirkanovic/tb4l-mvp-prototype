/**
 * Full playbook for replicating this Market story for another brand / market.
 * Rendered in the Technical appendix and mirrored in replication prompts.
 */

export type ReplicationRuleGroup = {
  id: string;
  title: string;
  intro?: string;
  items: { label: string; rule: string }[];
};

/** Ordered story sections — same as Market V3. */
export const M360_STORY_SECTIONS: { step: number; id: string; title: string; question: string }[] = [
  {
    step: 1,
    id: 'overview',
    title: 'Category overview',
    question:
      'How big is the competitive set, how is the manufacturer doing, and is the focus brand keeping pace with its primary need-state?',
  },
  {
    step: 2,
    id: 'growth',
    title: 'Category growth',
    question: 'Is growth coming from more packs, or from value (price / mix)?',
  },
  {
    step: 3,
    id: 'structure',
    title: 'Where we play · structure',
    question:
      'How big is each need-state, where is Bayer present or absent, and what is the plain job (defend pool / fight growth leak / white space / research only)? (TB4L-003 in story when enabled; S1–S4 codes stay in appendix for replication)',
  },
  {
    step: 4,
    id: 'channel',
    title: 'Channel dynamics',
    question:
      'Where is set growth coming from by channel (price vs volume), and who is gaining or losing share in each channel?',
  },
  {
    step: 5,
    id: 'attract',
    title: 'Segment attractiveness',
    question: 'Where to play — how big is each need-state, and is it growing faster than the category?',
  },
  {
    step: 6,
    id: 'competitive',
    title: 'Competitive landscape',
    question: 'Who holds the cash pool and who is winning the share fight in the growth segment?',
  },
  {
    step: 7,
    id: 'evi',
    title: 'Manufacturer relative growth',
    question: 'Which manufacturer brands outpace or lag their own need-state? (100 = in line; above 100 = faster.)',
  },
  {
    step: 8,
    id: 'brand-pos',
    title: 'Focus brand position',
    question: 'Defend the core line, grow the advance line — or both, with different jobs?',
  },
  {
    step: 9,
    id: 'share',
    title: 'Market share performance',
    question: 'Where is the manufacturer gaining or losing share — change first, not just the level?',
  },
  {
    step: 10,
    id: 'synthesis',
    title: 'Summary · synthesis & key implications',
    question: 'What are the key insights, brand implications, opportunities, risks, and traffic-light signals?',
  },
  {
    step: 11,
    id: 'candidates',
    title: 'Preliminary opportunities · candidates',
    question: 'White space / near-miss / share-loss-in-growth as discussion candidates only? (TB4L-003 when enabled)',
  },
  {
    step: 12,
    id: 'actions',
    title: 'Recommended actions',
    question: 'What to do this month — fix problems first, protect strengths, manage watch items.',
  },
];

export const M360_REPLICATION_RULE_GROUPS: ReplicationRuleGroup[] = [
  {
    id: 'scope',
    title: 'Scope & clocks',
    intro: 'Wrong calendar or wrong system = wrong story. Fix this before any chart.',
    items: [
      {
        label: 'Sell-out only',
        rule: 'Market story uses Sirius / CHDAA sell-out only (v_m360_nrm). Do not mix COPA / finance calendars into Market numbers or charts.',
      },
      {
        label: 'MAT window',
        rule: 'Latest 12 months ending {{MAT_END}}. State mat_start → mat_end in plain language (e.g. Aug 2025–Jul 2026). No monthly RSP / share / EVI series unless retrieved.',
      },
      {
        label: 'Competitive set',
        rule: 'All rolls are inside {{SCOPE}} (GB BAM / branded competitive set), not the whole category warehouse unless the user asked for that.',
      },
      {
        label: 'Placeholders',
        rule: 'Replace {{COUNTRY}}, {{CATEGORY}}, {{BRAND}}, {{SCOPE}}, {{MANUFACTURER}}, {{PRIMARY_SEGMENT}}, {{GROWTH_SEGMENT}}, {{MAT_END}}, {{LINES}} before running prompts.',
      },
    ],
  },
  {
    id: 'hard',
    title: 'Hard calculation rules',
    intro: 'Insights and copy may only read CALC. Never invent a metric.',
    items: [
      {
        label: 'CALC only',
        rule: 'Compute only the formulas in CALC (T1/T2) + channel CALC (T-ch / T-ch-b). If a field is missing, write N/A — do not extrapolate.',
      },
      {
        label: 'Growth % vs share Δ',
        rule: 'Sales growth = % YoY (value or packs). Share moves = percentage points (pp), never “% share growth”. Compare like with like.',
      },
      {
        label: 'EVI',
        rule: 'Evolution index = (1 + brand growth) / (1 + segment growth) × 100. Brand KPI for the focus brand = SUM of its sub-brands in the primary segment — not a single line (e.g. not Classic alone).',
      },
      {
        label: 'White-space flag',
        rule: '{{MANUFACTURER}} share MAT < 3% AND segment value growth 1y > category value growth 1y. Flag = candidate for discussion, not a sized recommendation.',
      },
      {
        label: '3y CAGR',
        rule: 'Only if value_3ya is complete. If months_available_for_3ya < 12, mark N/A — do not annualize partial history.',
      },
      {
        label: 'Value vs packs',
        rule: 'Always show both value growth % and unit (pack) growth %. Gap = value % − unit % (illustration of mix/price), not a Sirius field.',
      },
    ],
  },
  {
    id: 'presence',
    title: 'Manufacturer presence & share change',
    items: [
      {
        label: 'No presence',
        rule: 'If manufacturer share MAT and YA are both ~0 (no named brands / no euros), say “no presence” — not “flat” and not “0 pp”.',
      },
      {
        label: 'No Δ without presence',
        rule: 'Never show a share-change number for 0→0. Omit that need-state from the share-change chart.',
      },
      {
        label: 'Stable band',
        rule: '|share Δ| < 0.5 pp → treat as moved less than 0.5 points either way (stable), not a material gain/loss.',
      },
      {
        label: 'Share-change sort',
        rule: 'Bayer / manufacturer share-change chart: worst (largest loss) first. Channel movers: gainers first. Bar length = share Δ pp, zero at center — never absolute share as bar length.',
      },
    ],
  },
  {
    id: 'pool-leak',
    title: 'Pool vs leak logic',
    items: [
      {
        label: 'POOL',
        rule: 'Largest need-state by value (expected {{PRIMARY_SEGMENT}}). Franchise defend / cash pool.',
      },
      {
        label: 'GROWTH / LEAK',
        rule: 'Discover from data: material need-state that is growing and where manufacturer share is soft (seed {{GROWTH_SEGMENT}}). Do not hard-code rival names for other brands.',
      },
      {
        label: 'Reference rival',
        rule: 'Largest non-manufacturer gainer in the leak need-state and/or in the channel where the fight is sharpest.',
      },
      {
        label: 'Tiny / empty need-states',
        rule: 'Do not open a sized entry project from this pack when there is no presence and no EUR entry size (e.g. PPIs in the Iberogast pack).',
      },
    ],
  },
  {
    id: 'channels',
    title: 'Channel rules',
    items: [
      {
        label: 'Use existing grain',
        rule: 'Use CHANNEL_NAME / CHANNEL_GROUP that exist for the country. Germany in this pack = Pharmacies + E-commerce (Mail Order) only — no drugstore/grocery/customer grain.',
      },
      {
        label: 'Drivers',
        rule: 'Price vs volume EUR contribution from Sirius growth-driver fields — not the same as pack growth on the segment chart. Label each channel price-led or volume-led.',
      },
      {
        label: 'Movers',
        rule: 'Top brands per channel: sort by share change pp (gainers first). Show absolute share under the name; encode bar as Δ only.',
      },
      {
        label: '% of set EUR growth',
        rule: 'Channel abs Δ EUR / SUM(channel abs Δ EUR) — which channel contributes most to set euro growth.',
      },
    ],
  },
  {
    id: 'narrative',
    title: 'Narrative & chart-rail structure',
    intro: 'Under each chart (V3 rail) and in the executive readout, keep the same blocks.',
    items: [
      {
        label: 'Per-chart blocks',
        rule: 'Key facts → Key insights → Hypothesis validation → Implications for the brand → Opportunities and risks.',
      },
      {
        label: 'Hypothesis statuses',
        rule: 'confirmed | partial | rejected | new. Label hypotheses as working judgments, not proven facts, unless the pack fully confirms.',
      },
      {
        label: 'Executive readout',
        rule: 'Market; Focus brand in that market; What to do next; Working hypothesis; Data care goes in the footer (failed checks / missing 3y) — do not duplicate scope in the exec summary.',
      },
      {
        label: 'Key facts units',
        rule: 'Comparable % YoY for sales growth; share in level + pp change; packs explicitly labeled as units. Manufacturer sales growth % is not the same as share Δ.',
      },
      {
        label: 'Brand KPI',
        rule: 'Focus-brand relative growth KPI = whole brand EVI vs primary segment, not a single SKU/line.',
      },
      {
        label: 'Top brands early',
        rule: 'Show top-10 brands in the set early (overview) so the cast of rivals is clear before need-state fights.',
      },
      {
        label: 'Signals & actions',
        rule: 'Problem (bad) → Strength (good) → Watch. Actions in the same order. Title = decision language; evidence = “From the pack” with numbers.',
      },
      {
        label: 'Number highlighting',
        rule: 'Color only deltas and EVI (vs 100). Bold levels/sizes without rainbow text on every figure.',
      },
    ],
  },
  {
    id: 'charts',
    title: 'Chart playbook & color rules',
    intro: 'Three color jobs only — so readers do not need the legend after the first screen.',
    items: [
      {
        label: 'Interactive charts (must)',
        rule: 'Every story chart must be interactive for brand managers: hover (or equivalent) shows title + 3–6 key numbers / plain readout. Dim non-focus series on hover. Static images-only are not enough for Market story replication.',
      },
      {
        label: 'Slate = size / share',
        rule: 'Bar length = how big. Same soft slate for all brands. Manufacturer = one step deeper slate + name tag (ownership, not “good”).',
      },
      {
        label: 'Green / amber = change',
        rule: 'Up or down: share Δ, growth pace vs category, EVI vs 100, positive/negative driver bars. Flat = muted.',
      },
      {
        label: 'No need-state rainbow',
        rule: 'Need-state identity lives in labels, not a fourth hue language. Dual measures (value vs packs, price vs volume) use the same slate family + labels; amber if that effect is negative.',
      },
      {
        label: 'Status cards',
        rule: 'Traffic-light green / orange / magenta on implication cards only — never as competitive share-bar fills.',
      },
      {
        label: 'Attractiveness',
        rule: 'Size bar = slate (share of category). Growth bar = green if faster than category, amber if slower. Plain job tags when TB4L-003-in-story is on (not S1–S4 codes).',
      },
      {
        label: 'Growth quality',
        rule: 'Grouped bars: value % and pack % by need-state (+ category). Fill by change sign (green/amber).',
      },
      {
        label: 'Share dumbbell',
        rule: 'Previous → current manufacturer share; link and filled dot follow change color; omit no-presence rows.',
      },
    ],
  },
  {
    id: 'quality',
    title: 'Data quality & gaps',
    items: [
      {
        label: 'Run checks (T4)',
        rule: 'C1 segment Σ T2 ≈ T1; C2 Bayer Σ named ≈ T1 Bayer (may FAIL if Other grouped mixes flags); C3 category total; C4 multi-segment brands; C5 junk SKUs; C6 units fill rate ≥ 95%. Surface FAIL in Data care.',
      },
      {
        label: 'Never invent',
        rule: 'No innovation bubble, perceptual map, HH penetration, retailer grain, or finance P&L inside Market unless those tables were retrieved.',
      },
      {
        label: 'Insights layer',
        rule: 'Rank observations from CALC + failed checks only. White-space = “candidate for discussion — not a recommendation”.',
      },
    ],
  },
  {
    id: 'tb4l003',
    title: 'Structure & scenarios (TB4L-003 building block — replication)',
    intro:
      'Folded into AI Assistant v4 Market story (includeTb4l003). v3 stays pre-Kirill. Same Sirius CALC; Discover growth × presence rules. End-user story shows plain jobs only — S1–S4 / U0 codes are for replication and the TB4L-003 tab, not brand-manager chrome.',
    items: [
      {
        label: 'Scenario codes (appendix / replication only)',
        rule: 'S1 faster+absent · S2 faster+present · S3 slower+absent · S4 slower+present · U0 missing or ±0.5 pp band on either axis. Absent = Bayer share < 3%. Do not put S1–S4 / U0 labels on the end-user Market story; map to plain jobs instead (defend pool, share leak in growth, white-space candidate, research only).',
      },
      {
        label: 'Charts in end-user story',
        rule: 'Mekko (size × Bayer mix) · growth×share bubble · segment scorecard with plain job column · who-wins all need-states (top 7 + EVI). No scenario-code table on the brand-manager page.',
      },
      {
        label: 'Scenario table (replication / TB4L-003 tab)',
        rule: 'Keep S1–S4 / U0 + permitted interpretation for analysts and cross-brand replication. Not required on the end-user Market story.',
      },
      {
        label: 'Data checks (not end-user chrome)',
        rule: 'V1–V10 / T4 FAILs live in Technical appendix and Data care footer — not a badge strip on the brand-manager story. Never hide FAIL from analysts; do not lead the end-user page with check badges.',
      },
      {
        label: 'Candidates vs actions',
        rule: 'White space / near-miss / share-loss-in-growth = “Candidate for discussion — not a recommendation” (no € sizing). Recommended actions stay separate and judgment-based.',
      },
      {
        label: 'Interactive structure charts',
        rule: 'Mekko, growth×share, scorecard, and who-wins must support hover tooltips with plain job + key numbers (same as other Market charts).',
      },
      {
        label: 'CAGR fallback',
        rule: 'If value_3ya incomplete, show 2y CAGR labelled 2y* — never invent 3y.',
      },
      {
        label: 'Guardrails from building block',
        rule: 'No causal “because/driven by” in candidate cards; candidates permit review only — not entry, budget, or delisting.',
      },
    ],
  },
  {
    id: 'workflow',
    title: 'Replication workflow',
    items: [
      {
        label: '1 · Retrieve',
        rule: 'T3 metadata → T1 segments → T2 sub-brands → T4 checks → T-ch channels → T-ch-b top brands per channel.',
      },
      {
        label: '2 · CALC',
        rule: 'Compute category / segment / sub-brand / channel metrics + EVI + white-space + pool/leak/rival. Return structured CALC before prose.',
      },
      {
        label: '3 · Story',
        rule: 'Fixed section order (10 steps). One business question per section. Chart playbook types only. 1–2 charts per section.',
      },
      {
        label: '4 · Signals',
        rule: 'Traffic-light implications + ordered actions. List N/A gaps at the end.',
      },
      {
        label: '5 · Do not',
        rule: 'Do not copy Iberogast rival names, Antacids/Gaviscon, or PPI conclusions into another brand — rediscover from that brand’s CALC.',
      },
    ],
  },
];

/** Compact chart playbook for appendix tables. */
export const M360_CHART_PLAYBOOK: { section: string; chart: string; reads: string }[] = [
  {
    section: 'Category overview',
    chart: 'KPI strip + top-10 brand share bars',
    reads: 'Set size, manufacturer share, brand EVI; cast of rivals',
  },
  {
    section: 'Category growth',
    chart: 'Grouped bars: value % vs pack % by need-state (+ category)',
    reads: 'Packs vs value/mix',
  },
  {
    section: 'Channel dynamics',
    chart: 'Price vs volume EUR by channel; movers = share Δ per channel',
    reads: 'Where euros come from; who gains/loses share',
  },
  {
    section: 'Segment attractiveness',
    chart: 'Size bar + growth-vs-category bar; white-space flag',
    reads: 'Pool vs growth jobs',
  },
  {
    section: 'Competitive landscape',
    chart: 'Ranked share bars in primary + growth need-states',
    reads: 'Who holds the pool / the fight',
  },
  {
    section: 'Relative growth',
    chart: 'EVI lollipops vs 100 for manufacturer brands',
    reads: 'Ahead / behind own segment',
  },
  {
    section: 'Brand position',
    chart: 'Lines compare: share of primary segment + EVI',
    reads: 'Defend vs grow jobs',
  },
  {
    section: 'Share performance',
    chart: 'Before→after manufacturer share by need-state, worst first',
    reads: 'Where share leaks',
  },
];
