import { ASSISTANT_NARRATIVE_V2 } from '../config/assistantNarrative';
import {
  CALC_COPA_BRANDS,
  CALC_COPA_BRIDGE,
  CALC_COPA_OBS,
  CALC_COPA_SET,
  type CalcCopaBrand,
} from '../data/copaCharts';
import {
  CALC_CATEGORY,
  CALC_IBEROGAST,
  CALC_SEGMENTS,
  CALC_SUBBRANDS,
  type CalcCategory,
  type CalcSegment,
  type CalcSubBrand,
} from '../data/m360Charts';
import { buildM360Checks, M360_METADATA, type CheckRow } from '../data/m360Retrieval';

function fmtM(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return 'Not available';
  return `EUR ${v.toFixed(1)}m`;
}
function fmtPct(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return 'Not available';
  return `${v > 0 ? '+' : ''}${v.toFixed(1)}%`;
}
function fmtShare(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return 'Not available';
  return `${v.toFixed(1)}%`;
}
function fmtEvi(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return 'Not available';
  return v.toFixed(0);
}
function fmtPp(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return 'Not available';
  return `${v >= 0 ? '+' : ''}${v.toFixed(1)} points`;
}

export type MarketNarrativeProps = {
  cat: CalcCategory;
  ibs: CalcSegment;
  ant: CalcSegment;
  gas: CalcSegment;
  ppi: CalcSegment;
  ibero: CalcSubBrand | undefined;
  iberoRows: CalcSubBrand[];
  classic: CalcSubBrand | undefined;
  advance: CalcSubBrand | undefined;
  gaviscon: CalcSubBrand | undefined;
  talcidMkt: CalcSubBrand | undefined;
  lefaxFin: CalcCopaBrand | undefined;
  rennieFin: CalcCopaBrand | undefined;
  talcidFin: CalcCopaBrand | undefined;
  checks: CheckRow[];
};

export type FinanceNarrativeProps = {
  ibero: CalcCopaBrand;
  set: typeof CALC_COPA_SET;
  lefax: CalcCopaBrand | undefined;
  rennie: CalcCopaBrand | undefined;
  talcid: CalcCopaBrand | undefined;
};

export function AssistantMarketInsights(p: MarketNarrativeProps) {
  return ASSISTANT_NARRATIVE_V2 ? <MarketInsightsV2 {...p} /> : <MarketInsightsV1 {...p} />;
}

export function AssistantMarketActions(p: MarketNarrativeProps) {
  return ASSISTANT_NARRATIVE_V2 ? <MarketActionsV2 {...p} /> : <MarketActionsV1 {...p} />;
}

export function AssistantMarketReadout(
  p: MarketNarrativeProps & { heading?: string; headingLevel?: 2 | 3 },
) {
  return ASSISTANT_NARRATIVE_V2 ? <MarketReadoutV2 {...p} /> : <MarketReadoutV1 {...p} />;
}

export function AssistantFinanceShow(p: FinanceNarrativeProps) {
  return ASSISTANT_NARRATIVE_V2 ? <FinanceShowV2 {...p} /> : <FinanceShowV1 />;
}

export function AssistantFinanceDiscussion(p: FinanceNarrativeProps) {
  return ASSISTANT_NARRATIVE_V2 ? <FinanceDiscussionV2 {...p} /> : <FinanceDiscussionV1 set={p.set} />;
}

export function buildMarketNarrativeProps(): MarketNarrativeProps {
  const ibs = CALC_SEGMENTS.find((s) => s.segment.startsWith('IBS'))!;
  const iberoRows = CALC_IBEROGAST;
  const ibero = iberoRows[0];
  return {
    cat: CALC_CATEGORY,
    ibs,
    ant: CALC_SEGMENTS.find((s) => s.segment.startsWith('ANTACID'))!,
    gas: CALC_SEGMENTS.find((s) => s.segment.startsWith('GAS'))!,
    ppi: CALC_SEGMENTS.find((s) => s.segment.startsWith('PPI'))!,
    ibero,
    iberoRows,
    classic: iberoRows.find((r) => r.label.includes('CLASSIC')) ?? ibero,
    advance: iberoRows.find((r) => r.label.includes('ADVANCE')),
    gaviscon: CALC_SUBBRANDS.find((r) => r.subBrand.includes('GAVISCON')),
    talcidMkt: CALC_SUBBRANDS.find((r) => r.subBrand.includes('TALCID')),
    lefaxFin: CALC_COPA_BRANDS.find((b) => b.brand === 'Lefax'),
    rennieFin: CALC_COPA_BRANDS.find((b) => b.brand === 'Rennie'),
    talcidFin: CALC_COPA_BRANDS.find((b) => b.brand === 'Talcid'),
    checks: buildM360Checks().filter((c) => c.status === 'FAIL'),
  };
}

/** Market text after market charts. Finance text lives in CopaReport. */
export function AssistantMarketCopy() {
  const p = buildMarketNarrativeProps();
  return (
    <>
      <AssistantMarketInsights {...p} />
      <AssistantMarketActions {...p} />
      <AssistantMarketReadout {...p} />
    </>
  );
}

function MarketInsightsV1({ cat, ibs, ant, ppi, ibero, iberoRows }: MarketNarrativeProps) {
  return (
    <>
      <h2 className="section-title" id="assistant-mean">What the numbers mean</h2>
      <ul className="m360-rep-ins">
        <li>
          <h3>
            Category sales are {fmtM(cat.valueMatM)}, {fmtPct(cat.growth1yPct)} versus last year
          </h3>
          <p>
            <b>What we see.</b> Four need-states. Packs sold {fmtPct(cat.unitGrowth1yPct)} versus last year.
          </p>
          <p>
            <b>So what?</b> Sales value is growing faster than packs, so price or mix is helping.
          </p>
          <p>
            <b>What to do.</b> Treat Antacids growth ({fmtPct(ant.growth1yPct)}) separately from IBS size (
            {fmtM(ibs.valueMatM)}; packs {fmtPct(ibs.unitGrowth1yPct)}).
          </p>
        </li>
        <li>
          <h3>
            Bayer’s market share is {fmtShare(cat.bayerShareMatPct)}, {fmtPp(cat.bayerShareChangePp)} versus last year
          </h3>
          <p>
            <b>What we see.</b> Antacids share {fmtShare(ant.bayerShareMatPct)}, {fmtPp(ant.bayerShareChangePp)} versus
            last year. PPIs {fmtShare(ppi.bayerShareMatPct)}.
          </p>
          <p>
            <b>So what?</b> Competitive position is different in each need-state, not one category number.
          </p>
          <p>
            <b>What to do.</b> Look at Antacids share loss next to Gaviscon. Bayer has no named brand in PPIs, and that
            segment is not growing faster than the category, so it is not an obvious gap to enter.
          </p>
        </li>
        <li>
          <h3>
            {ibero?.label ?? 'Iberogast'} relative growth is {fmtEvi(ibero?.evolutionIndex ?? null)} versus IBS
          </h3>
          <p>
            <b>What we see.</b> {iberoRows.map((r) => `${r.label} ${fmtEvi(r.evolutionIndex)}`).join('. ')}.
          </p>
          <p>
            <b>So what?</b> A number above 100 means that brand grew faster than its market. Advance is ahead of the IBS
            market; Classic is roughly in line.
          </p>
          <p>
            <b>What to do.</b> Read relative growth together with share: high share and a number near 100 is holding;
            falling share and a number below 100 is lagging.
          </p>
        </li>
      </ul>
    </>
  );
}

function MarketInsightsV2({
  cat,
  ibs,
  ant,
  gas,
  ppi,
  classic,
  advance,
  gaviscon,
  talcidMkt,
}: MarketNarrativeProps) {
  return (
    <>
      <h2 className="section-title" id="assistant-mean">What the numbers mean</h2>
      <ul className="m360-rep-ins">
        <li>
          <h3>
            The market is growing in value ({fmtM(cat.valueMatM)}, {fmtPct(cat.growth1yPct)}), not in packs (
            {fmtPct(cat.unitGrowth1yPct)})
          </h3>
          <p>
            <b>What we see.</b> Antacids is the growth engine ({fmtPct(ant.growth1yPct)}, {fmtShare(ant.shareOfCategoryPct)}{' '}
            of sales). IBS is the pool ({fmtM(ibs.valueMatM)}, {fmtShare(ibs.shareOfCategoryPct)}) and packs there are{' '}
            {fmtPct(ibs.unitGrowth1yPct)}. Gas is {fmtM(gas.valueMatM)} with Bayer share {fmtShare(gas.bayerShareMatPct)}.
          </p>
          <p>
            <b>So what?</b> One category number hides two jobs: hold a large IBS franchise that is not expanding in
            packs, and compete in a faster Antacids market where Bayer is losing share.
          </p>
          <p className="m360-hyp">
            <b>Hypothesis.</b> Shoppers are paying more per pack, or buying a richer mix, in the category as a whole.
            IBS looks like the opposite mix: value still up ({fmtPct(ibs.growth1yPct)}) while packs are down. That is
            consistent with price or pack mix, not with more people buying. This view has no monthly split to prove it.
          </p>
        </li>
        <li>
          <h3>
            Bayer’s competitive-set share is {fmtShare(cat.bayerShareMatPct)}, {fmtPp(cat.bayerShareChangePp)} — the leak
            is Antacids, not IBS
          </h3>
          <p>
            <b>What we see.</b> IBS Bayer share {fmtShare(ibs.bayerShareMatPct)} ({fmtPp(ibs.bayerShareChangePp)}).
            Antacids {fmtShare(ant.bayerShareMatPct)} ({fmtPp(ant.bayerShareChangePp)}). Gas {fmtShare(gas.bayerShareMatPct)}.
            PPIs {fmtShare(ppi.bayerShareMatPct)}.
            {gaviscon ? ` Gaviscon is ${fmtShare(gaviscon.shareMatPct)} of Antacids.` : ''}
            {talcidMkt ? ` Talcid is ${fmtShare(talcidMkt.shareMatPct)} of Antacids.` : ''}
          </p>
          <p>
            <b>So what?</b> The franchise is still large in IBS and Gas. The share problem to explain is Antacids, where
            the need-state is growing fastest.
          </p>
          <p className="m360-hyp">
            <b>Hypothesis.</b>{' '}
            {gaviscon ? 'Gaviscon is taking the Antacids growth Bayer is not.' : 'A competitor is taking Antacids growth.'}{' '}
            Sit Talcid next to Gaviscon in this same market window — do not fold in company books from a different year.
          </p>
        </li>
        <li>
          <h3>
            Iberogast Classic is holding IBS ({fmtEvi(classic?.evolutionIndex ?? null)}); Advance is the one ahead of
            the market ({fmtEvi(advance?.evolutionIndex ?? null)})
          </h3>
          <p>
            <b>What we see.</b> Classic is {fmtShare(classic?.shareMatPct ?? null)} of IBS. Advance is{' '}
            {fmtShare(advance?.shareMatPct ?? null)}. Bayer has no named brand in PPIs, and PPIs is not growing faster
            than the category ({fmtPct(ppi.growth1yPct)} vs {fmtPct(cat.growth1yPct)}).
          </p>
          <p>
            <b>So what?</b> Classic is the cash pool. Advance is the growth line inside the same brand. PPIs is empty
            for Bayer — that is a fact in this set, not a sized prize.
          </p>
          <p className="m360-hyp">
            <b>Hypothesis.</b> Households that stay with Classic are not leaving in a rush (relative growth near 100,
            high share). Incremental IBS value is more likely to sit in Advance than in a new Classic burst.
          </p>
        </li>
      </ul>
    </>
  );
}

function MarketActionsV1({ cat, ibs, ant, ppi, ibero }: MarketNarrativeProps) {
  return (
    <>
      <h2 className="section-title" id="assistant-actions">Recommended actions</h2>
      <ol className="m360-rep-act">
        <li>
          Review Antacids: sales are growing but Bayer share is {fmtPp(ant.bayerShareChangePp)} versus last year. Look at
          Gaviscon. Finance impact is not available here.
        </li>
        <li>
          Protect IBS sales ({fmtM(ibs.valueMatM)}). {ibero?.label ?? 'Iberogast'} relative growth is{' '}
          {fmtEvi(ibero?.evolutionIndex ?? null)}; packs sold {fmtPct(ibs.unitGrowth1yPct)} versus last year.
        </li>
        <li>
          Do not treat PPIs as a white-space entry from this view: Bayer share is {fmtShare(ppi.bayerShareMatPct)} and
          the segment is not growing faster than the category ({fmtPct(ppi.growth1yPct)} vs {fmtPct(cat.growth1yPct)}
          ). Opportunity size in euros is not available.
        </li>
      </ol>
    </>
  );
}

function MarketActionsV2({ ant, ibs, ppi, classic, advance }: MarketNarrativeProps) {
  return (
    <>
      <h2 className="section-title" id="assistant-actions">Recommended actions</h2>
      <ol className="m360-rep-act">
        <li>
          <b>Antacids this month.</b> Put Gaviscon, Talcid and Rennie on one page: market share{' '}
          {fmtPp(ant.bayerShareChangePp)} in a need-state growing {fmtPct(ant.growth1yPct)}. Ask what happened in
          listings, price and promotions.
        </li>
        <li>
          <b>Iberogast split the jobs.</b> Defend Classic share in IBS ({fmtShare(classic?.shareMatPct ?? null)} of the
          need-state, relative growth {fmtEvi(classic?.evolutionIndex ?? null)}). Put growth plans on Advance (relative
          growth {fmtEvi(advance?.evolutionIndex ?? null)}). IBS packs are {fmtPct(ibs.unitGrowth1yPct)}; more of the
          same Classic volume is a weak bet from this view.
        </li>
        <li>
          <b>Do not open a PPI project from this pack.</b> Bayer share is {fmtShare(ppi.bayerShareMatPct)} and the
          need-state is not the fastest grower. There is no entry-size in euros here.
        </li>
        <li>
          <b>Keep clocks apart.</b> Do not add company euros to this sell-out view until finance is on the same latest
          12 months.
        </li>
      </ol>
    </>
  );
}

function MarketReadoutV1({ cat, ant, ibero, checks }: MarketNarrativeProps) {
  return (
    <>
      <h2 className="section-title" id="assistant-readout">One-page readout</h2>
      <div className="m360-rep-exec">
        <p>
          <b>Market.</b> Germany Digestive Health, Iberogast competitive set. Sales {fmtM(cat.valueMatM)},{' '}
          {fmtPct(cat.growth1yPct)} versus last year. Bayer share {fmtShare(cat.bayerShareMatPct)}.{' '}
          {ibero?.label ?? 'Iberogast'} relative growth {fmtEvi(ibero?.evolutionIndex ?? null)}.
        </p>
        <p>
          <b>Biggest opportunity in this view.</b> Antacids is the fastest-growing need-state ({fmtPct(ant.growth1yPct)})
          with Bayer share {fmtShare(ant.bayerShareMatPct)}. It is not a white-space entry. Entry size in euros is not
          available.
        </p>
        <p>
          <b>Data care.</b>{' '}
          {checks.some((c) => c.id === 'C2')
            ? 'Bayer sales in the named-brand list do not fully match Bayer sales in the segment totals (the IBS “Other” group mixes Bayer and non-Bayer). '
            : ''}
          {checks.some((c) => c.id === 'C5')
            ? 'One PPI row looks like the wrong product (paracetamol), so that segment should be treated with care. '
            : ''}
          Three-year growth cannot be calculated — this view only has four months of history.
        </p>
      </div>
    </>
  );
}

function MarketReadoutV2({
  cat,
  classic,
  advance,
  checks,
  heading = 'One-page readout',
  headingLevel = 2,
}: MarketNarrativeProps & { heading?: string; headingLevel?: 2 | 3 }) {
  const m = M360_METADATA;
  const HeadingTag = headingLevel === 3 ? 'h3' : 'h2';
  return (
    <>
      <HeadingTag
        className={headingLevel === 3 ? 'm360-story-subhead' : 'section-title'}
        id="assistant-readout"
      >
        {heading}
      </HeadingTag>
      <div className="m360-rep-exec">
        <p>
          <b>Market, latest 12 months to {m.latest_actual_month}.</b> Germany Digestive Health, Iberogast competitive
          set: {fmtM(cat.valueMatM)}, {fmtPct(cat.growth1yPct)}. Packs {fmtPct(cat.unitGrowth1yPct)}. Bayer share{' '}
          {fmtShare(cat.bayerShareMatPct)} ({fmtPp(cat.bayerShareChangePp)}). IBS is the pool; Antacids is the growth and
          the share leak.
        </p>
        <p>
          <b>Iberogast in that market.</b> Classic holds IBS ({fmtShare(classic?.shareMatPct ?? null)}, relative growth{' '}
          {fmtEvi(classic?.evolutionIndex ?? null)}). Advance is ahead of IBS ({fmtEvi(advance?.evolutionIndex ?? null)}).
        </p>
        <p>
          <b>What to do next.</b> Antacids vs Gaviscon. Split Classic defend / Advance grow. Leave PPIs. Do not add
          company euros to this market view.
        </p>
        <p className="m360-hyp">
          <b>Working hypothesis, not proven.</b> Category value is running ahead of packs (price or mix). Iberogast is
          still the IBS leader; Bayer’s competitive wound in this set is Antacids, not IBS.
        </p>
        <p>
          <b>Data care.</b>{' '}
          {checks.some((c) => c.id === 'C2')
            ? 'Named-brand Bayer sales do not fully match segment Bayer totals (IBS “Other” mixes Bayer and not). '
            : ''}
          {checks.some((c) => c.id === 'C5') ? 'One PPI row looks like the wrong product (paracetamol). ' : ''}
          Three-year market growth is not available (four months of history).
        </p>
      </div>
    </>
  );
}

function FinanceShowV1() {
  return (
    <>
      <h3 className="section-title" id="assistant-finance-show">What the numbers show</h3>
      <ul className="m360-rep-ins">
        {CALC_COPA_OBS.map((o) => (
          <li key={o.headline}>
            <h3>
              <span className={`copa-imp copa-imp--${o.importance.toLowerCase()}`}>{o.importance}</span> {o.headline}
            </h3>
            <p>{o.detail}</p>
            <p className="copa-obs-chart">{o.chart}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

function FinanceShowV2({ ibero, set, lefax, rennie, talcid }: FinanceNarrativeProps) {
  return (
    <>
      <h3 className="section-title" id="assistant-finance-show">What the numbers show</h3>
      <ul className="m360-rep-ins">
        <li>
          <h3>
            Iberogast carried this four-brand set in 2025: {fmtM(ibero.netSalesM)}, {fmtPct(ibero.growth1yPct)}, and a
            richer gross profit ({fmtShare(ibero.gpPct)}, {fmtPp(ibero.gpChangePp)})
          </h3>
          <p>
            The set is {fmtM(set.netSalesM)}, {fmtPct(set.growth1yPct)}. Iberogast is {fmtShare(ibero.shareOfSetPct)} of
            that net sales and {fmtPp(ibero.contribNsPp)} of the set’s net-sales change. Mix of brands barely moved
            gross-profit % ({fmtPp(CALC_COPA_BRIDGE.mixSumPp)}); the lift is inside brands (
            {fmtPp(CALC_COPA_BRIDGE.rateSumPp)}), and Iberogast’s own rate is the main piece.
          </p>
          <p className="m360-hyp">
            <b>Hypothesis.</b> 2025 was a better year for Iberogast profit quality, not only for size. Marketing spend is
            still {fmtM(ibero.marketingM)} ({fmtShare(ibero.mktPct)} of net sales), so this is not a story of starving
            the brand to make the percentage look good. Cost of goods is {fmtM(ibero.cogs / 1_000_000)} — smaller than
            marketing in this extract. We cannot see promotions as a separate line.
          </p>
        </li>
        <li>
          <h3>Lefax is the dilutive name; Rennie is the one going backwards in net sales</h3>
          <p>
            Lefax net sales {fmtPct(lefax?.growth1yPct ?? null)} versus the set {fmtPct(set.growth1yPct)}, gross profit{' '}
            {fmtShare(lefax?.gpPct ?? null)} of net sales versus the set {fmtShare(set.gpPct)}. Rennie net sales{' '}
            {fmtPct(rennie?.growth1yPct ?? null)} with a high gross-profit % ({fmtShare(rennie?.gpPct ?? null)}). Talcid
            is slow ({fmtPct(talcid?.growth1yPct ?? null)}) with a high gross-profit %.
          </p>
          <p className="m360-hyp">
            <b>Hypothesis.</b> Lefax may be a volume-heavy Gas franchise that grows less easily in euros and keeps less
            of each euro. Rennie may be giving up net sales while remaining rich on the euros that remain. Neither
            hypothesis has volume, so do not treat them as proven price or mix stories.
          </p>
        </li>
      </ul>
    </>
  );
}

function FinanceDiscussionV1({ set }: { set: typeof CALC_COPA_SET }) {
  const dilutive = CALC_COPA_BRANDS.filter((b) => b.quadrant.includes('dilutive'));
  return (
    <>
      <h3 className="section-title" id="assistant-discuss">For discussion — not a recommendation</h3>
      {dilutive.length === 0 ? (
        <p className="m360-rep__lede">
          No brand in this four-brand set is both slower than the set and below the set’s gross-profit %.
        </p>
      ) : (
        <ul className="m360-rep-ins">
          {dilutive.map((b) => (
            <li key={b.brand}>
              <h3>
                {b.brand}: {b.quadrant}
              </h3>
              <p>
                Net sales growth {fmtPct(b.growth1yPct)} versus the set {fmtPct(set.growth1yPct)}. Gross profit{' '}
                {fmtShare(b.gpPct)} of net sales versus the set {fmtShare(set.gpPct)}.
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function FinanceDiscussionV2({ set, lefax, rennie }: FinanceNarrativeProps) {
  return (
    <>
      <h3 className="section-title" id="assistant-discuss">For discussion — not a recommendation</h3>
      <ul className="m360-rep-ins">
        <li>
          <h3>Lefax: slower than the set and thinner gross profit</h3>
          <p>
            {fmtPct(lefax?.growth1yPct ?? null)} net sales growth versus {fmtPct(set.growth1yPct)} for the set. Gross
            profit {fmtShare(lefax?.gpPct ?? null)} of net sales versus {fmtShare(set.gpPct)}.
          </p>
          <p className="m360-hyp">
            <b>Hypothesis to test.</b> Is Gas being bought on deal or smaller packs in a way that shows up as a weaker
            gross-profit % in the books? We do not have trade spend or pack mix here. In the market view Gas still has
            high Bayer share — so this is a quality-of-growth question, not a “Bayer is absent” question.
          </p>
        </li>
        <li>
          <h3>Rennie: net sales down, gross-profit % still high</h3>
          <p>
            Net sales {fmtPct(rennie?.growth1yPct ?? null)}. Gross profit {fmtShare(rennie?.gpPct ?? null)} of net sales.
          </p>
          <p className="m360-hyp">
            <b>Hypothesis to test.</b> Rennie may be losing top-line while keeping a rich mix of what is left — or simply
            shipping less. The Antacids market share leak in the other clock (latest 12 months) is the place to sit this
            brand next to Talcid and Gaviscon, without adding the euros together.
          </p>
        </li>
        <li>
          <h3>Do not force market and books into one story yet</h3>
          <p>
            Sell-out is the latest 12 months to July 2026. These books are calendar 2025. Iberogast can look “fine” in
            2025 net sales and still have an Antacids problem in the later market window.
          </p>
          <p className="m360-hyp">
            <b>Hypothesis to test.</b> The healthy Iberogast P&amp;L is the IBS job succeeding. The Antacids job is the
            one that is not. Next data drop should be company actuals on the same latest 12 months as the market view.
          </p>
        </li>
      </ul>
    </>
  );
}
