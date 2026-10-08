/**
 * Iberogast · Germany Digestive Health — AI Assistant content
 * Answers grounded in Sirius / CHDAA (M360) queries, MAT ending Jul 2026.
 * Live MCP cannot be called from the browser; this pack is the Sirius result cache.
 */

export type AssistantKpi = {
  label: string;
  value: string;
  hint?: string;
};

export type AssistantBar = {
  label: string;
  value: number;
  max?: number;
  suffix?: string;
  highlight?: boolean;
};

export type ChartSlice = {
  label: string;
  value: number;
  color?: string;
};

export type ChartPoint = {
  label: string;
  x: number;
  y: number;
  size?: number;
  highlight?: boolean;
};

export type WaterfallStep = {
  label: string;
  value: number;
  kind?: 'total' | 'increase' | 'decrease';
};

export type GroupedBarSeries = {
  label: string;
  values: number[];
  color?: string;
};

export type AssistantChart =
  | {
      id: string;
      type: 'hbar';
      title: string;
      subtitle?: string;
      unit?: string;
      items: AssistantBar[];
    }
  | {
      id: string;
      type: 'column';
      title: string;
      subtitle?: string;
      unit?: string;
      items: AssistantBar[];
    }
  | {
      id: string;
      type: 'donut';
      title: string;
      subtitle?: string;
      unit?: string;
      centerLabel?: string;
      centerValue?: string;
      slices: ChartSlice[];
    }
  | {
      id: string;
      type: 'waterfall';
      title: string;
      subtitle?: string;
      unit?: string;
      steps: WaterfallStep[];
    }
  | {
      id: string;
      type: 'grouped';
      title: string;
      subtitle?: string;
      unit?: string;
      categories: string[];
      series: GroupedBarSeries[];
    }
  | {
      id: string;
      type: 'scatter';
      title: string;
      subtitle?: string;
      xLabel: string;
      yLabel: string;
      points: ChartPoint[];
    };

export type SubQuestion = {
  id: string;
  question: string;
  answer: string;
  takeaways?: string[];
};

export type MainQuestion = {
  id: string;
  question: string;
  answer: string;
  takeaways: string[];
  kpis?: AssistantKpi[];
  bars?: AssistantBar[];
  charts?: AssistantChart[];
  table?: { columns: string[]; rows: string[][] };
  caveats?: string[];
  subQuestions: SubQuestion[];
};

export type AssistantModule = {
  id: 'category' | 'competitor';
  title: string;
  shortTitle: string;
  description: string;
  questions: MainQuestion[];
};

export const ASSISTANT_CONTEXT = {
  brand: 'Iberogast',
  market: 'Germany',
  category: 'Digestive Health',
  period: 'MAT ending Jul 2026',
  competitiveScope: 'GB BAM',
  strategicScope: 'GB SAM',
  source: 'Sirius · CHDAA / M360',
} as const;

export const ASSISTANT_MODULES: AssistantModule[] = [
  {
    id: 'category',
    title: 'Category',
    shortTitle: 'Category',
    description:
      'How Digestive Health is structured for Iberogast in Germany — size, growth, and reach proxies from Sirius.',
    questions: [
      {
        id: 'cat-structure',
        question: 'How is the category defined and structured across segments?',
        answer:
          'Iberogast’s strategic view (GB SAM) is one category — Digestive Health — with nine sub-categories and 27 defined segments. The competitive set (GB BAM) is much tighter: five segments (Antacids, Gas & Bloating, H2 Blockers, IBS & Sensitive Stomach, PPIs). In the latest MAT, 19 SAM segments carry sales; H2 Blockers has no Germany rows in BAM.',
        takeaways: [
          'GB SAM is the wide strategic map; GB BAM is the competitive battlefield Iberogast actually tracks.',
          'Top five SAM segments hold ~64% of strategic value; concentration is high.',
          'Iberogast records sales in only two SAM segments today: IBS & Sensitive Stomach and a small General Probiotics presence.',
        ],
        kpis: [
          { label: 'GB SAM segments (with sales)', value: '19', hint: 'of 27 defined' },
          { label: 'GB BAM segments (with sales)', value: '4', hint: 'H2 empty in DE' },
          { label: 'Sub-categories (SAM)', value: '9' },
        ],
        bars: [
          { label: 'IBS & Sensitive Stomach', value: 15.87, suffix: '%', highlight: true },
          { label: 'Osmotic Laxatives', value: 15.5, suffix: '%' },
          { label: 'General Probiotics', value: 13.39, suffix: '%' },
          { label: 'Pancreatic Enzymes', value: 10.28, suffix: '%' },
          { label: 'Antacids', value: 8.75, suffix: '%' },
        ],
        charts: [
          {
            id: 'sam-share-donut',
            type: 'donut',
            title: 'GB SAM value mix — top segments',
            subtitle: 'Germany Digestive Health · MAT Jul 2026',
            unit: '%',
            centerLabel: 'Top 5',
            centerValue: '63.8%',
            slices: [
              { label: 'IBS & Sensitive Stomach', value: 15.87, color: '#d30f4b' },
              { label: 'Osmotic Laxatives', value: 15.5, color: '#00607e' },
              { label: 'General Probiotics', value: 13.39, color: '#286436' },
              { label: 'Pancreatic Enzymes', value: 10.28, color: '#624963' },
              { label: 'Antacids', value: 8.75, color: '#a87b1f' },
              { label: 'Other segments', value: 36.21, color: '#c9d2d8' },
            ],
          },
          {
            id: 'sam-growth-columns',
            type: 'column',
            title: 'Segment YoY growth — top SAM pools',
            subtitle: 'Value RSP growth %',
            unit: '%',
            items: [
              { label: 'Pancreatic Enzymes', value: 19.86, suffix: '%' },
              { label: 'Antacids', value: 9.5, suffix: '%' },
              { label: 'Osmotic Laxatives', value: 8.64, suffix: '%' },
              { label: 'IBS & Sens. Stom.', value: 2.92, suffix: '%', highlight: true },
              { label: 'Gen. Probiotics', value: 1.01, suffix: '%' },
            ],
          },
        ],
        table: {
          columns: ['Segment', 'Sub-category', 'Share of SAM', 'YoY'],
          rows: [
            ['IBS & Sensitive Stomach', 'IBS & Digestive Issues', '15.9%', '+2.9%'],
            ['Osmotic Laxatives', 'Constipation', '15.5%', '+8.6%'],
            ['General Probiotics', 'Digestive Wellness', '13.4%', '+1.0%'],
            ['Pancreatic Enzymes', 'IBS & Digestive Issues', '10.3%', '+19.9%'],
            ['Antacids', 'Heartburn & Overindulgence', '8.8%', '+9.5%'],
          ],
        },
        caveats: [
          'Shares are value-based (SALES_VALUE_PUB_EUR). Unit structure would rank differently.',
          'Scope shown for structure is GB SAM; competitive KPIs below use GB BAM unless noted.',
        ],
        subQuestions: [
          {
            id: 'cat-structure-bam-vs-sam',
            question: 'What is the difference between Iberogast GB BAM and GB SAM in Germany?',
            answer:
              'GB BAM is the competitive addressable set: Antacids, Gas & Bloating, H2 Blockers, IBS & Sensitive Stomach, and PPIs (~€582m). GB SAM is the strategic addressable set — nine digestive sub-categories and 27 segments — roughly 5× wider in segment count. BAM answers “who we fight”; SAM answers “where else value sits.”',
            takeaways: [
              'Use BAM for competitor and share reads.',
              'Use SAM for whitespace and adjacency (e.g. Osmotic Laxatives, Pancreatic Enzymes).',
            ],
          },
          {
            id: 'cat-structure-iberogast-footprint',
            question: 'In which segments does Iberogast currently sell?',
            answer:
              'Inside GB SAM, Iberogast has material value only in IBS & Sensitive Stomach (€141.2m) plus a small General Probiotics line (~€1.6m). Inside GB BAM it appears only in IBS & Sensitive Stomach — zero sales in Antacids, Gas & Bloating, and PPIs.',
            takeaways: [
              'Home turf is IBS & Sensitive Stomach (~48% segment share).',
              'Fastest BAM growth (Antacids) is outside the brand footprint today.',
            ],
          },
          {
            id: 'cat-structure-decliners',
            question: 'Which SAM segments are declining?',
            answer:
              'In the latest MAT, Liver Remedies (−0.4%), Antidiarrheal Probiotics (−0.9%), Other Laxatives (−0.5%), and Abdominal Pain (−9.9%, very small) declined. Every other active SAM segment grew. Growth is uneven even inside Constipation: Osmotic Laxatives +8.6% vs Other Laxatives −0.5%.',
          },
        ],
      },
      {
        id: 'cat-size-growth',
        question: 'What is the category size, growth and drivers of growth?',
        answer:
          'Iberogast’s Germany GB BAM is worth €582.1m (MAT Jul 2026), up +4.59% (+€25.5m) versus the prior MAT. Growth is price-led: base price +€15.3m (~60% of the gain), base units +€7.3m (~29%), with limited innovation (new packs +€2.0m, new products +€1.1m). Antacids is the growth engine (+9.5%, +€14.1m); Iberogast’s home segment IBS & Sensitive Stomach grows only +2.9%.',
        takeaways: [
          'Category growth is mainly value-per-unit, not consumption expansion.',
          'Antacids delivers more than half of absolute BAM growth — and Iberogast has 0% presence there.',
          'Iberogast holds ~24.3% of GB BAM value (€141m) while home-segment growth lags the total market.',
        ],
        kpis: [
          { label: 'GB BAM value', value: '€582m', hint: 'Value RSP' },
          { label: 'YoY growth', value: '+4.6%', hint: '+€25.5m' },
          { label: 'Iberogast share', value: '24.3%', hint: '€141m' },
          { label: 'Price share of growth', value: '~60%', hint: 'of +€25.5m' },
        ],
        bars: [
          { label: 'Antacids', value: 9.5, suffix: '%', highlight: true },
          { label: 'IBS & Sensitive Stomach', value: 2.92, suffix: '%' },
          { label: 'Gas & Bloating', value: 2.87, suffix: '%' },
          { label: 'PPIs', value: 2.18, suffix: '%' },
        ],
        charts: [
          {
            id: 'bam-growth-waterfall',
            type: 'waterfall',
            title: 'Growth drivers bridge — GB BAM',
            subtitle: '€m Value RSP · MAT Jul 2026 vs YA',
            unit: '€m',
            steps: [
              { label: 'Value YA', value: 556.6, kind: 'total' },
              { label: 'Base price', value: 15.3, kind: 'increase' },
              { label: 'Base units', value: 7.3, kind: 'increase' },
              { label: 'New packs', value: 2.0, kind: 'increase' },
              { label: 'New products', value: 1.1, kind: 'increase' },
              { label: 'Intersection', value: -0.2, kind: 'decrease' },
              { label: 'Value now', value: 582.1, kind: 'total' },
            ],
          },
          {
            id: 'bam-segment-growth',
            type: 'grouped',
            title: 'Segment value — current vs year ago',
            subtitle: 'Iberogast GB BAM · €m',
            unit: '€m',
            categories: ['IBS & Sens.', 'Antacids', 'Gas & Bloat.', 'PPIs'],
            series: [
              { label: 'MAT Jul 2026', values: [293.8, 162.0, 71.0, 55.4], color: '#00607e' },
              { label: 'MAT Jul 2025', values: [285.5, 147.9, 69.0, 54.2], color: '#c9d2d8' },
            ],
          },
          {
            id: 'bam-yoy-columns',
            type: 'column',
            title: 'Segment YoY growth %',
            subtitle: 'GB BAM competitive set',
            unit: '%',
            items: [
              { label: 'Antacids', value: 9.5, suffix: '%', highlight: true },
              { label: 'IBS & Sens.', value: 2.92, suffix: '%' },
              { label: 'Gas & Bloat.', value: 2.87, suffix: '%' },
              { label: 'PPIs', value: 2.18, suffix: '%' },
            ],
          },
        ],
        table: {
          columns: ['Driver', '€m contribution', 'Share of growth'],
          rows: [
            ['Base price', '+15.3', '60%'],
            ['Base units', '+7.3', '29%'],
            ['New packs', '+2.0', '8%'],
            ['New products', '+1.1', '4%'],
            ['Intersection', '−0.2', '—'],
          ],
        },
        caveats: [
          'Figures are Value RSP (public price) in EUR for Iberogast GB BAM, Germany.',
          'H2 Blockers is in BAM definition but contributes €0 in this MAT.',
        ],
        subQuestions: [
          {
            id: 'cat-growth-antacids',
            question: 'Why is Antacids the growth engine?',
            answer:
              'Antacids is +9.5% (+€14.1m) — more than half of BAM’s absolute gain — on both price (+€7.6m) and real volume (+€4.7m). It is only ~28% of BAM value but over-indexes on growth. Gaviscon is the main brand story inside that segment.',
            takeaways: [
              'Unlike Gas & Bloating, Antacids growth is not only price.',
              'Whitespace for Iberogast if adjacency strategy is on the table.',
            ],
          },
          {
            id: 'cat-growth-home-segment',
            question: 'How is Iberogast’s home segment performing vs the BAM?',
            answer:
              'IBS & Sensitive Stomach is the largest BAM segment (€293.8m, ~50.5% of BAM) but grows +2.9% versus BAM +4.6%. Iberogast holds ~48% of it. Home-turf momentum is diluting overall category growth relative to Antacids.',
          },
          {
            id: 'cat-growth-innovation',
            question: 'How much of growth comes from innovation?',
            answer:
              'At category level, new packs (+€2.0m) and new products (+€1.1m) are small versus price and volume. Across key brands in this MAT, NEW_PRODUCT_CHANGE is effectively zero — innovation contribution is mostly new packs (notably Gaviscon).',
          },
        ],
      },
      {
        id: 'cat-penetration',
        question: 'What is the category penetration overall and by subsegment?',
        answer:
          'Household penetration is not in the CHDAA warehouse (no buyer/HH panel). Best Sirius proxies: value/unit share, SKU assortment breadth, competing brand density, and price per unit. Across GB BAM, Iberogast holds 24.3% value / 19.3% unit share on 7 SKUs. By segment it is deep in IBS & Sensitive Stomach (48.1% value / 50.5% units) and absent elsewhere.',
        takeaways: [
          'Do not read sell-out share as household penetration — Sirius cannot produce HH % for Germany.',
          'Iberogast’s “penetration” is depth in one segment, not breadth across BAM.',
          '€288m of BAM (Antacids + Gas & Bloating + PPIs) has zero Iberogast SKUs.',
        ],
        kpis: [
          { label: 'Value share (BAM)', value: '24.3%' },
          { label: 'Unit share (BAM)', value: '19.3%' },
          { label: 'IBS value share', value: '48.1%' },
          { label: 'Iberogast SKUs', value: '7', hint: 'of 543 in BAM' },
        ],
        charts: [
          {
            id: 'pen-share-grouped',
            type: 'grouped',
            title: 'Iberogast value vs unit share by segment',
            subtitle: 'Sell-out proxy (not household penetration)',
            unit: '%',
            categories: ['IBS & Sens.', 'Antacids', 'Gas & Bloat.', 'PPIs'],
            series: [
              { label: 'Value share', values: [48.07, 0, 0, 0], color: '#00607e' },
              { label: 'Unit share', values: [50.51, 0, 0, 0], color: '#d30f4b' },
            ],
          },
          {
            id: 'pen-presence-donut',
            type: 'donut',
            title: 'BAM value where Iberogast is present',
            subtitle: 'Share of competitive-set value by footprint',
            centerLabel: 'Present',
            centerValue: '50.5%',
            slices: [
              { label: 'IBS (Iberogast present)', value: 50.5, color: '#d30f4b' },
              { label: 'Whitespace (no Iberogast)', value: 49.5, color: '#c9d2d8' },
            ],
          },
          {
            id: 'pen-sku-hbar',
            type: 'hbar',
            title: 'Assortment breadth — SKUs by segment',
            subtitle: 'Iberogast vs segment total',
            unit: 'SKUs',
            items: [
              { label: 'IBS — Iberogast', value: 7, max: 230, highlight: true },
              { label: 'IBS — Segment', value: 230, max: 230 },
              { label: 'Antacids — Segment', value: 140, max: 230 },
              { label: 'Gas & Bloat. — Segment', value: 112, max: 230 },
              { label: 'PPIs — Segment', value: 61, max: 230 },
            ],
          },
        ],
        table: {
          columns: ['Segment', 'Value', 'Iberogast share', 'Brands', 'SKUs'],
          rows: [
            ['IBS & Sensitive Stomach', '€294m', '48.1%', '77', '230'],
            ['Antacids', '€162m', '0%', '37', '140'],
            ['Gas & Bloating', '€71m', '0%', '41', '112'],
            ['PPIs', '€55m', '0%', '13', '61'],
          ],
        },
        caveats: [
          'Numeric distribution exists only in local SSA sources; Germany is not in-scope for that measure.',
          'True HH penetration would need an external panel (e.g. GfK/Kantar).',
        ],
        subQuestions: [
          {
            id: 'cat-pen-price',
            question: 'How does Iberogast price vs its home segment?',
            answer:
              'In IBS & Sensitive Stomach, Iberogast averages €16.77 per unit versus €17.62 for the segment — a slight discount, not a premium. That helps explain unit share (50.5%) running ahead of value share (48.1%).',
          },
          {
            id: 'cat-pen-assortment',
            question: 'How narrow is Iberogast’s assortment vs the competitive set?',
            answer:
              'Seven Iberogast SKUs versus 543 in GB BAM, and 230 SKUs / 77 brands inside its home segment alone. High share is achieved on a short list — strong concentration, limited shelf breadth.',
          },
          {
            id: 'cat-pen-whitespace',
            question: 'Where is Iberogast not present inside BAM?',
            answer:
              'Zero Iberogast sales and SKUs in Antacids (€162m), Gas & Bloating (€71m), and PPIs (€55m). Combined whitespace inside the competitive set is ~€288m.',
            takeaways: ['Largest whitespace overlaps the fastest-growing BAM segment (Antacids).'],
          },
        ],
      },
    ],
  },
  {
    id: 'competitor',
    title: 'Competitor',
    shortTitle: 'Competitor',
    description:
      'Who is taking growth in Iberogast’s Germany competitive set — strategies and emerging threats from Sirius.',
    questions: [
      {
        id: 'comp-key',
        question: 'Who are the key competitors driving category and segment growth?',
        answer:
          'In GB BAM (+€25.5m), Gaviscon alone delivered +€10.0m (39% of category growth) at +22.8%, lifting share 7.9% → 9.3%. Iberogast added +€6.0m (+4.4%) — second in absolute growth but only market-pace (Value EVI 100), share flat ~24.3%. Kijimea is the third engine (+€3.0m, +7.1%). Buscopan, Lefax, and Talcid add €1.0–1.2m each but lose slight share.',
        takeaways: [
          'Gaviscon is the decisive growth driver; Iberogast defends leadership without gaining ground.',
          'Growth is segment-concentrated: Antacids +€14.1m vs IBS +€8.3m.',
          'Biggest offsets include Omeprazole, Gasteo, Symbioflor, and Innovall.',
        ],
        kpis: [
          { label: 'Gaviscon abs. growth', value: '+€10.0m', hint: '39% of BAM growth' },
          { label: 'Iberogast abs. growth', value: '+€6.0m', hint: 'EVI 100' },
          { label: 'Kijimea abs. growth', value: '+€3.0m', hint: '+7.1%' },
        ],
        bars: [
          { label: 'Gaviscon', value: 10.04, max: 11, suffix: 'm', highlight: true },
          { label: 'Iberogast', value: 6.02, max: 11, suffix: 'm' },
          { label: 'Kijimea', value: 3.04, max: 11, suffix: 'm' },
          { label: 'Buscopan', value: 1.19, max: 11, suffix: 'm' },
          { label: 'Riopan', value: 1.19, max: 11, suffix: 'm' },
          { label: 'Lefax', value: 1.15, max: 11, suffix: 'm' },
        ],
        charts: [
          {
            id: 'comp-abs-growth',
            type: 'hbar',
            title: 'Top brands by absolute value growth',
            subtitle: 'GB BAM · €m MAT Jul 2026 vs YA',
            unit: '€m',
            items: [
              { label: 'Gaviscon', value: 10.04, max: 11, suffix: 'm', highlight: true },
              { label: 'Iberogast', value: 6.02, max: 11, suffix: 'm' },
              { label: 'Kijimea', value: 3.04, max: 11, suffix: 'm' },
              { label: 'Buscopan', value: 1.19, max: 11, suffix: 'm' },
              { label: 'Riopan', value: 1.19, max: 11, suffix: 'm' },
              { label: 'Lefax', value: 1.15, max: 11, suffix: 'm' },
              { label: 'Talcid', value: 1.03, max: 11, suffix: 'm' },
            ],
          },
          {
            id: 'comp-growth-contrib-donut',
            type: 'donut',
            title: 'Share of BAM absolute growth',
            subtitle: 'Contribution to +€25.5m category gain',
            centerLabel: 'BAM Δ',
            centerValue: '+€25.5m',
            slices: [
              { label: 'Gaviscon', value: 39.3, color: '#00607e' },
              { label: 'Iberogast', value: 23.6, color: '#d30f4b' },
              { label: 'Kijimea', value: 11.9, color: '#624963' },
              { label: 'Other / offsets', value: 25.2, color: '#c9d2d8' },
            ],
          },
          {
            id: 'comp-segment-abs',
            type: 'column',
            title: 'Segment absolute growth (€m)',
            subtitle: 'Where category growth lands',
            unit: '€m',
            items: [
              { label: 'Antacids', value: 14.1, suffix: 'm', highlight: true },
              { label: 'IBS & Sens.', value: 8.3, suffix: 'm' },
              { label: 'Gas & Bloat.', value: 2.0, suffix: 'm' },
              { label: 'PPIs', value: 1.2, suffix: 'm' },
            ],
          },
        ],
        table: {
          columns: ['Brand', 'Abs. growth', 'Role'],
          rows: [
            ['Gaviscon', '+€10.0m', 'Outperformer (EVI 117)'],
            ['Iberogast', '+€6.0m', 'Leader, flat share'],
            ['Kijimea', '+€3.0m', 'Premium recruiter'],
            ['Buscopan / Lefax / Talcid', '+€1.0–1.2m', 'Price defence'],
          ],
        },
        subQuestions: [
          {
            id: 'comp-key-gaviscon-segment',
            question: 'Where is Gaviscon winning?',
            answer:
              'Entirely in Antacids: segment share 29.7% → 33.3% while the segment itself grows +9.5%. That single-segment attack explains almost 40% of total BAM growth.',
          },
          {
            id: 'comp-key-iberogast-share',
            question: 'Is Iberogast gaining or losing share?',
            answer:
              'At BAM level, Iberogast share is essentially flat (~24.3%, −0.03pp) with Value EVI 100. Inside IBS & Sensitive Stomach, share edged up ~47.5% → ~48.2%, but that home-segment gain does not offset Gaviscon’s Antacids acceleration at total level.',
          },
          {
            id: 'comp-key-losers',
            question: 'Which brands are the biggest value offsets?',
            answer:
              'Omeprazole (−€0.94m, −6.9%), Gasteo (−€0.89m, −21.8%), Symbioflor (−€0.49m), and Innovall (−€0.39m) — concentrated in PPIs and probiotics.',
          },
        ],
      },
      {
        id: 'comp-strategies',
        question: 'What strategies are competitors using to win?',
        answer:
          'Sirius growth drivers show clear strategy splits. Gaviscon: volume-led expansion (+€6.9m volume) with premium pricing (+6.7%/unit) and the only material new-pack contribution (+€0.9m). Kijimea: recruit at a high price point (~€46/unit) with volume growth and flat price. Buscopan & Lefax: pure price defence against negative/flat volume (EVI 98). Iberogast: balanced volume (+€4.0m) and price (+€2.0m), little pack innovation.',
        takeaways: [
          'Only Gaviscon is truly winning share (EVI 117).',
          'No key brand grew via new products this MAT — pack innovation is the only innovation lever showing up.',
          'Lefax’s small IBS extension is shrinking; its Gas & Bloating fortress (~63% segment share) holds.',
        ],
        kpis: [
          { label: 'Gaviscon EVI', value: '117', hint: 'Outperformer' },
          { label: 'Kijimea EVI', value: '102' },
          { label: 'Iberogast EVI', value: '100', hint: 'Market pace' },
          { label: 'Buscopan / Lefax EVI', value: '98', hint: 'Mild underperform' },
        ],
        charts: [
          {
            id: 'comp-driver-stacked',
            type: 'grouped',
            title: 'Value growth decomposition by brand',
            subtitle: 'Price vs volume vs new pack (€m)',
            unit: '€m',
            categories: ['Iberogast', 'Gaviscon', 'Kijimea', 'Buscopan', 'Lefax'],
            series: [
              { label: 'Base price', values: [2.0, 1.9, 0.1, 1.6, 1.2], color: '#00607e' },
              { label: 'Base volume', values: [4.0, 6.9, 3.0, -0.5, -0.05], color: '#d30f4b' },
              { label: 'New packs', values: [0.06, 0.88, 0, 0.03, 0], color: '#624963' },
            ],
          },
          {
            id: 'comp-strategy-scatter',
            type: 'scatter',
            title: 'Price vs volume strategy map',
            subtitle: 'Bubble size ≈ brand Value RSP',
            xLabel: 'Avg price/unit change %',
            yLabel: 'Unit growth %',
            points: [
              { label: 'Gaviscon', x: 6.73, y: 15.1, size: 54, highlight: true },
              { label: 'Kijimea', x: 0.69, y: 6.33, size: 46 },
              { label: 'Iberogast', x: 3.09, y: 1.31, size: 142 },
              { label: 'Lefax', x: 1.36, y: 1.08, size: 48 },
              { label: 'Buscopan', x: 2.05, y: 0.18, size: 55 },
            ],
          },
          {
            id: 'comp-evi-columns',
            type: 'column',
            title: 'Value EVI vs GB BAM (100 = market pace)',
            subtitle: 'Outperformers above 100',
            unit: 'index',
            items: [
              { label: 'Gaviscon', value: 117, highlight: true },
              { label: 'Kijimea', value: 102 },
              { label: 'Iberogast', value: 100 },
              { label: 'Buscopan', value: 98 },
              { label: 'Lefax', value: 98 },
            ],
          },
        ],
        table: {
          columns: ['Brand', 'Price €m', 'Volume €m', 'New pack €m', 'Unit growth'],
          rows: [
            ['Gaviscon', '+1.9', '+6.9', '+0.9', '+15.1%'],
            ['Iberogast', '+2.0', '+4.0', '+0.1', '+1.3%'],
            ['Kijimea', '+0.1', '+3.0', '0', '+6.3%'],
            ['Buscopan', '+1.6', '−0.5', '~0', '+0.2%'],
            ['Lefax', '+1.2', '~0', '0', '+1.1%'],
          ],
        },
        caveats: [
          'Strategies inferred from sell-out drivers (price, units, new pack/product, EVI) — not from media or retail execution data.',
        ],
        subQuestions: [
          {
            id: 'comp-strat-gaviscon',
            question: 'Deep dive: Gaviscon’s win model',
            answer:
              '€10.0m gain split roughly volume €6.9m / price €1.9m / new packs €0.9m. Average price/unit up +6.7% (steepest in the set) while units grew +15.1%. Antacids share 33.3%. This is simultaneous volume expansion, premiumisation, and pack refresh.',
          },
          {
            id: 'comp-strat-kijimea',
            question: 'Deep dive: Kijimea’s win model',
            answer:
              'Premium value-per-unit (~€45.90): roughly a third of Gaviscon’s units for similar turnover. Growth +7.1% almost entirely volume; price nearly flat (+0.7%). IBS share 15.1% → 15.7%. Strategy = recruit users at an unchanged premium.',
          },
          {
            id: 'comp-strat-iberogast',
            question: 'Deep dive: Iberogast’s own growth mix',
            answer:
              'Balanced but unremarkable: +€4.0m volume, +€2.0m price (+3.1%/unit), new pack only ~€63k. Growing +4.4% vs a +2.9% home segment — enough to nudge IBS share up, not enough to beat Gaviscon’s BAM-level impact.',
          },
        ],
      },
      {
        id: 'comp-emerging',
        question: 'What new & emerging competitors are entering the category?',
        answer:
          'Seven competitor brands qualify as new or accelerating (≥€100k MAT and either zero YA sales or ≥50% growth), adding ~€2.73m incremental value. Largest absolute threat outside core IBS is Pantopraz.ADGC (Zentiva, PPIs, +€0.82m). True new entrants: Gavidarm (Reckitt) into IBS & Sensitive Stomach (€0.59m from zero) and Colocalm (Klosterfrau) into Gas & Bloating (€0.41m from zero). Gastrovegetalin is the fastest herbal analogue in Iberogast’s own segment (+51%).',
        takeaways: [
          'Gavidarm is the only de-novo launch directly into Iberogast’s core IBS segment — and Reckitt-backed.',
          'PPI generics (Pantopraz.ADGC, Panto) are scaling in adjacent acid control.',
          'Doppelherz is the only multi-segment accelerator (Antacids + Gas & Bloating + IBS).',
        ],
        kpis: [
          { label: 'Emerging brands', value: '7', hint: '≥€100k + new/≥50%' },
          { label: 'Incremental value', value: '~€2.7m' },
          { label: 'New in IBS', value: 'Gavidarm', hint: '€0.59m from 0' },
        ],
        bars: [
          { label: 'Pantopraz.ADGC', value: 0.82, max: 1, suffix: 'm' },
          { label: 'Gavidarm', value: 0.59, max: 1, suffix: 'm', highlight: true },
          { label: 'Colocalm', value: 0.41, max: 1, suffix: 'm' },
          { label: 'Doppelherz', value: 0.38, max: 1, suffix: 'm' },
          { label: 'Gastrovegetalin', value: 0.29, max: 1, suffix: 'm' },
        ],
        charts: [
          {
            id: 'emerge-abs-hbar',
            type: 'hbar',
            title: 'Emerging brands — absolute value growth',
            subtitle: 'New entrants or ≥50% growth · €m',
            unit: '€m',
            items: [
              { label: 'Pantopraz.ADGC', value: 0.82, max: 1, suffix: 'm' },
              { label: 'Gavidarm', value: 0.59, max: 1, suffix: 'm', highlight: true },
              { label: 'Colocalm', value: 0.41, max: 1, suffix: 'm', highlight: true },
              { label: 'Doppelherz', value: 0.38, max: 1, suffix: 'm' },
              { label: 'Gastrovegetalin', value: 0.29, max: 1, suffix: 'm' },
              { label: 'Panto', value: 0.17, max: 1, suffix: 'm' },
              { label: 'Ilio', value: 0.06, max: 1, suffix: 'm' },
            ],
          },
          {
            id: 'emerge-type-donut',
            type: 'donut',
            title: 'Emerging set by type',
            subtitle: 'Count of brands in shortlist',
            centerLabel: 'Brands',
            centerValue: '7',
            slices: [
              { label: 'New entrant (no YA)', value: 2, color: '#d30f4b' },
              { label: 'Accelerating 50–100%', value: 5, color: '#00607e' },
            ],
          },
          {
            id: 'emerge-segment-columns',
            type: 'column',
            title: 'Current MAT value of emerging brands',
            subtitle: '€m Value RSP',
            unit: '€m',
            items: [
              { label: 'Pantopraz.', value: 2.4, suffix: 'm' },
              { label: 'Doppelherz', value: 1.08, suffix: 'm' },
              { label: 'Gastroveg.', value: 0.86, suffix: 'm' },
              { label: 'Gavidarm', value: 0.59, suffix: 'm', highlight: true },
              { label: 'Colocalm', value: 0.41, suffix: 'm' },
            ],
          },
        ],
        table: {
          columns: ['Brand', 'Owner', 'Segment(s)', 'Type'],
          rows: [
            ['Pantopraz.ADGC', 'Zentiva', 'PPIs', 'Accelerating +52%'],
            ['Gavidarm', 'Reckitt', 'IBS & Sensitive Stomach', 'New entrant'],
            ['Colocalm', 'Klosterfrau', 'Gas & Bloating', 'New entrant'],
            ['Doppelherz', 'Queisser', 'Antacids | Gas | IBS', 'Portfolio push'],
            ['Gastrovegetalin', 'Verla', 'IBS & Sensitive Stomach', 'Herbal analogue'],
          ],
        },
        caveats: [
          'Zero YA base can reflect reclassification as well as a true launch; PRODUCT_LAUNCH_DATE was not applied in this pass.',
          'Thresholds (≥€100k, ≥50% growth) change the shortlist if adjusted.',
        ],
        subQuestions: [
          {
            id: 'comp-emerge-gavidarm',
            question: 'How serious is Gavidarm for Iberogast?',
            answer:
              'Still small (€0.59m) but strategically sharp: zero-to-one entry into IBS & Sensitive Stomach by Reckitt — the same corporation behind Gaviscon’s Antacids surge. Absolute pressure today is limited; the signal is a second front in Iberogast’s core segment.',
          },
          {
            id: 'comp-emerge-herbal',
            question: 'Which emerging brand is the closest herbal analogue?',
            answer:
              'Gastrovegetalin (Verla) in IBS & Sensitive Stomach: €0.86m, +51.4% YoY — the fastest-growing incumbent herbal play in Iberogast’s home segment among the emerging set.',
          },
          {
            id: 'comp-emerge-ppi',
            question: 'Why watch PPI generics if Iberogast is not in PPIs?',
            answer:
              'Pantopraz.ADGC (+€0.82m) and Panto (+87% to €0.36m) show acid-control generics scaling next to BAM. They do not hit Iberogast’s SKU list today, but they enlarge the adjacent competitive gravity around heartburn / overindulgence where Gaviscon already wins.',
          },
        ],
      },
    ],
  },
];

export function getModule(id: AssistantModule['id']) {
  return ASSISTANT_MODULES.find((m) => m.id === id) ?? ASSISTANT_MODULES[0];
}

export function getQuestion(moduleId: AssistantModule['id'], questionId: string) {
  const mod = getModule(moduleId);
  return mod.questions.find((q) => q.id === questionId) ?? mod.questions[0];
}
