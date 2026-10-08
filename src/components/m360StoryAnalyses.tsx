/**
 * Sirius-only TB4L chart analyses for Market story rail.
 * Structure per chart: facts → insights → hypothesis status → brand implications → opp/risks.
 */
import type { ReactNode } from 'react';
import type { CalcCategory, CalcSegment, CalcSubBrand } from '../data/m360Charts';
import type { ChannelBrandRow, ChannelRow } from '../data/m360ChannelRetrieval';

export type HypStatus = 'confirmed' | 'partial' | 'rejected' | 'new';

export type HypCheck = {
  claim: ReactNode;
  status: HypStatus;
  because: ReactNode;
};

export type ChartAxBody = {
  facts: ReactNode;
  insights: ReactNode;
  hypotheses: HypCheck[];
  brandImplications: ReactNode;
  opportunities: ReactNode;
  risks: ReactNode;
};

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

function tone(v: number | null | undefined, pivot = 0): 'is-up' | 'is-down' | 'is-flat' | '' {
  if (v === null || v === undefined || !Number.isFinite(v)) return '';
  if (v > pivot) return 'is-up';
  if (v < pivot) return 'is-down';
  return 'is-flat';
}

function Num({
  children,
  v,
  pivot = 0,
  kind = 'delta',
}: {
  children: ReactNode;
  v?: number | null;
  pivot?: number;
  kind?: 'delta' | 'evi' | 'key';
}) {
  const cls =
    kind === 'key' || v === null || v === undefined || !Number.isFinite(v)
      ? 'm360-num is-key'
      : `m360-num ${tone(v, kind === 'evi' ? 100 : pivot) || 'is-key'}`;
  return <strong className={cls}>{children}</strong>;
}

export type StoryAxCtx = {
  cat: CalcCategory;
  ibs: CalcSegment;
  ant: CalcSegment;
  gas: CalcSegment;
  ppi: CalcSegment;
  classic: CalcSubBrand | undefined;
  advance: CalcSubBrand | undefined;
  gaviscon: CalcSubBrand | undefined;
  ibero: CalcSubBrand | undefined;
  topIbs: CalcSubBrand[];
  pharma: ChannelRow;
  ecomm: ChannelRow;
  gavisconPharma: ChannelBrandRow | undefined;
  gavisconEcomm: ChannelBrandRow | undefined;
  iberoPharma: ChannelBrandRow | undefined;
  iberoEcomm: ChannelBrandRow | undefined;
  lefaxEcomm: ChannelBrandRow | undefined;
  talcidEcomm: ChannelBrandRow | undefined;
  valuePackGap: number | null;
};

export function buildStoryAnalyses(d: StoryAxCtx): Record<string, ChartAxBody> {
  return {
    overview: {
      facts: (
        <>
          <li>
            Category (Iberogast competitive set) sales <Num kind="key">{fmtM(d.cat.valueMatM)}</Num>, growing{' '}
            <Num v={d.cat.growth1yPct}>{fmtPct(d.cat.growth1yPct)}</Num> vs last year.
          </li>
          <li>
            Bayer share of set <Num kind="key">{fmtShare(d.cat.bayerShareMatPct)}</Num>, change{' '}
            <Num v={d.cat.bayerShareChangePp}>{fmtPp(d.cat.bayerShareChangePp)}</Num>; Bayer sales{' '}
            <Num kind="key">{fmtM(d.cat.bayerValueMatM)}</Num>.
          </li>
          <li>
            Packs <Num v={d.cat.unitGrowth1yPct}>{fmtPct(d.cat.unitGrowth1yPct)}</Num> · Iberogast EVI vs IBS{' '}
            <Num v={d.ibero?.evolutionIndex} kind="evi">
              {fmtEvi(d.ibero?.evolutionIndex ?? null)}
            </Num>
            .
          </li>
        </>
      ),
      insights: (
        <>
          <p>
            The set is expanding in euros while Bayer’s share of that set is soft — demand is there, but capture is
            not keeping pace.
          </p>
          <p>
            Iberogast’s relative growth versus IBS is near the line, so the headline tension is portfolio /
            competitive capture, not “Iberogast collapsed in its home need-state.”
          </p>
        </>
      ),
      hypotheses: [
        {
          claim: 'Soft Bayer share means the set itself is shrinking.',
          status: 'rejected',
          because: (
            <>
              Set value is growing <Num v={d.cat.growth1yPct}>{fmtPct(d.cat.growth1yPct)}</Num> — size is not the
              problem.
            </>
          ),
        },
        {
          claim: 'Bayer is losing relative position inside a growing competitive set.',
          status: 'confirmed',
          because: (
            <>
              Share change <Num v={d.cat.bayerShareChangePp}>{fmtPp(d.cat.bayerShareChangePp)}</Num> while set sales
              grow.
            </>
          ),
        },
        {
          claim: 'Two jobs will appear later: defend the pool and fight where growth (and leak) sit.',
          status: 'new',
          because: <>Seeded by set growth vs soft Bayer share; need-state charts must confirm where.</>,
        },
      ],
      brandImplications: (
        <p>
          Iberogast / Bayer cannot brief this as a “category too small” story. The brand agenda must explain how to
          capture a growing set — franchise defend plus competitive fight — not only push more of the same volume.
        </p>
      ),
      opportunities: (
        <>
          <li>Growing set euros ({fmtM(d.cat.valueMatM)}, {fmtPct(d.cat.growth1yPct)}) to capture with clearer jobs.</li>
          <li>Iberogast still near IBS pace (EVI {fmtEvi(d.ibero?.evolutionIndex ?? null)}) — franchise base to protect.</li>
        </>
      ),
      risks: (
        <>
          <li>Continued Bayer share drift ({fmtPp(d.cat.bayerShareChangePp)}) if growth need-states stay uncontested.</li>
          <li>Mixing pool and growth into one brand KPI will hide the leak.</li>
        </>
      ),
    },

    growth: {
      facts: (
        <>
          <li>
            Category value <Num v={d.cat.growth1yPct}>{fmtPct(d.cat.growth1yPct)}</Num> vs packs{' '}
            <Num v={d.cat.unitGrowth1yPct}>{fmtPct(d.cat.unitGrowth1yPct)}</Num>
            {d.valuePackGap != null ? (
              <>
                {' '}
                (gap <Num v={d.valuePackGap}>{fmtPct(d.valuePackGap)}</Num>).
              </>
            ) : null}
          </li>
          <li>
            IBS value <Num v={d.ibs.growth1yPct}>{fmtPct(d.ibs.growth1yPct)}</Num>, packs{' '}
            <Num v={d.ibs.unitGrowth1yPct}>{fmtPct(d.ibs.unitGrowth1yPct)}</Num>.
          </li>
          <li>
            Antacids value <Num v={d.ant.growth1yPct}>{fmtPct(d.ant.growth1yPct)}</Num>, packs{' '}
            <Num v={d.ant.unitGrowth1yPct}>{fmtPct(d.ant.unitGrowth1yPct)}</Num>.
          </li>
          <li>
            Gas value <Num v={d.gas.growth1yPct}>{fmtPct(d.gas.growth1yPct)}</Num> · PPIs{' '}
            <Num v={d.ppi.growth1yPct}>{fmtPct(d.ppi.growth1yPct)}</Num>.
          </li>
        </>
      ),
      insights: (
        <>
          <p>
            Set growth is value/mix-led, not pack-led — euros are rising faster than units. That is a different
            commercial clock than a pure volume race.
          </p>
          <p>
            Antacids is growing about 2× the category on value (
            <Num v={d.ant.growth1yPct}>{fmtPct(d.ant.growth1yPct)}</Num> vs{' '}
            <Num v={d.cat.growth1yPct}>{fmtPct(d.cat.growth1yPct)}</Num>), while IBS packs are soft inside the cash
            pool — demand intensity is shifting toward the faster need-state, not more IBS packs.
          </p>
        </>
      ),
      hypotheses: [
        {
          claim: 'Category growth is mainly more packs everywhere.',
          status: 'rejected',
          because: (
            <>
              Packs <Num v={d.cat.unitGrowth1yPct}>{fmtPct(d.cat.unitGrowth1yPct)}</Num> trail value{' '}
              <Num v={d.cat.growth1yPct}>{fmtPct(d.cat.growth1yPct)}</Num>.
            </>
          ),
        },
        {
          claim: 'Price / mix is carrying set sales; Antacids is the growth engine on this chart.',
          status: 'confirmed',
          because: (
            <>
              Value ahead of packs at set level; Antacids value/packs both lead (
              {fmtPct(d.ant.growth1yPct)} / {fmtPct(d.ant.unitGrowth1yPct)}).
            </>
          ),
        },
        {
          claim: 'A Classic volume-only plan is a weak bet from this chart alone.',
          status: 'partial',
          because: <>IBS packs soft ({fmtPct(d.ibs.unitGrowth1yPct)}); needs brand/channel confirmation next.</>,
        },
      ],
      brandImplications: (
        <p>
          Iberogast’s home pool (IBS) is not where incremental pack demand is showing up. Brand plans that only add
          Classic volume ignore that Antacids is where value and packs are accelerating — and that the set itself is
          mix/price-led.
        </p>
      ),
      opportunities: (
        <>
          <li>Compete where growth is real: Antacids ({fmtPct(d.ant.growth1yPct)} value).</li>
          <li>Lean into value/mix mechanisms (price, pack architecture) rather than pack-count vanity.</li>
        </>
      ),
      risks: (
        <>
          <li>Over-investing in soft IBS packs ({fmtPct(d.ibs.unitGrowth1yPct)}) while rivals scale Antacids.</li>
          <li>Reading category +{fmtPct(d.cat.growth1yPct)} as “volume is fine” when packs lag.</li>
        </>
      ),
    },

    channelDrivers: {
      facts: (
        <>
          <li>
            Pharmacies <Num kind="key">{fmtM(d.pharma.valueEurM)}</Num> (
            <Num kind="key">{fmtShare(d.pharma.shareOfSetPct)}</Num>), value{' '}
            <Num v={d.pharma.valueGrowthPct}>{fmtPct(d.pharma.valueGrowthPct)}</Num>, packs{' '}
            <Num v={d.pharma.unitGrowthPct}>{fmtPct(d.pharma.unitGrowthPct)}</Num>.
          </li>
          <li>
            Pharma price <Num kind="key">{fmtM(d.pharma.priceContribEurM)}</Num> vs volume{' '}
            <Num v={d.pharma.volumeContribEurM}>{fmtM(d.pharma.volumeContribEurM)}</Num>.
          </li>
          <li>
            E-commerce <Num kind="key">{fmtM(d.ecomm.valueEurM)}</Num> (
            <Num kind="key">{fmtShare(d.ecomm.shareOfSetPct)}</Num>), value{' '}
            <Num v={d.ecomm.valueGrowthPct}>{fmtPct(d.ecomm.valueGrowthPct)}</Num>, packs{' '}
            <Num v={d.ecomm.unitGrowthPct}>{fmtPct(d.ecomm.unitGrowthPct)}</Num>.
          </li>
          <li>
            E-comm volume <Num v={d.ecomm.volumeContribEurM}>{fmtM(d.ecomm.volumeContribEurM)}</Num> vs price{' '}
            <Num kind="key">{fmtM(d.ecomm.priceContribEurM)}</Num> —{' '}
            <Num kind="key">{fmtShare(d.ecomm.pctOfSetAbsGrowth)}</Num> of set absolute EUR growth.
          </li>
        </>
      ),
      insights: (
        <>
          <p>
            Digital/mail-order is the growth channel: roughly three-quarters of the set’s absolute EUR lift sits in
            E-commerce while Pharmacies still hold most euros.
          </p>
          <p>
            The two channels run on different engines — Pharmacies price-led with volume drag; E-commerce volume-led —
            so one averaged channel plan will mis-allocate both defend and growth effort.
          </p>
        </>
      ),
      hypotheses: [
        {
          claim: 'Pharmacies and E-commerce can be managed with one growth playbook.',
          status: 'rejected',
          because: <>Opposite driver mix (price vs volume) and growth contribution ({fmtShare(d.ecomm.pctOfSetAbsGrowth)} online).</>,
        },
        {
          claim: 'E-commerce is the growth job; Pharmacies is the euro pool to defend.',
          status: 'confirmed',
          because: (
            <>
              Pharma {fmtShare(d.pharma.shareOfSetPct)} of set; E-comm {fmtShare(d.ecomm.pctOfSetAbsGrowth)} of abs EUR
              growth.
            </>
          ),
        },
      ],
      brandImplications: (
        <p>
          Iberogast needs a dual channel agenda: protect Pharmacy euros (price/promo/listing) and feed E-commerce
          volume where the set’s growth is actually landing — Germany only has these two channels in this view.
        </p>
      ),
      opportunities: (
        <>
          <li>Capture E-commerce volume lift ({fmtM(d.ecomm.volumeContribEurM)}, {fmtPct(d.ecomm.valueGrowthPct)}).</li>
          <li>Defend the Pharmacy pool ({fmtShare(d.pharma.shareOfSetPct)} of set sales).</li>
        </>
      ),
      risks: (
        <>
          <li>Pharmacy volume drag ({fmtM(d.pharma.volumeContribEurM)}) erodes the cash pool.</li>
          <li>Under-funding online while rivals take {fmtShare(d.ecomm.pctOfSetAbsGrowth)} of set EUR growth.</li>
        </>
      ),
    },

    channelPharma: {
      facts: (
        <>
          <li>
            Iberogast Pharmacies: share <Num kind="key">{fmtShare(d.iberoPharma?.shareOfChannelPct ?? null)}</Num>, Δ{' '}
            <Num v={d.iberoPharma?.shareChangePp}>{fmtPp(d.iberoPharma?.shareChangePp ?? null)}</Num>, value{' '}
            <Num v={d.iberoPharma?.valueGrowthPct}>{fmtPct(d.iberoPharma?.valueGrowthPct ?? null)}</Num>.
          </li>
          <li>
            Gaviscon Pharmacies: Δ{' '}
            <Num v={d.gavisconPharma?.shareChangePp}>{fmtPp(d.gavisconPharma?.shareChangePp ?? null)}</Num>, value{' '}
            <Num v={d.gavisconPharma?.valueGrowthPct}>{fmtPct(d.gavisconPharma?.valueGrowthPct ?? null)}</Num>.
          </li>
        </>
      ),
      insights: (
        <p>
          In the largest channel, a competitor (Gaviscon) is the clear share gainer while Iberogast is soft — Pharmacy
          is not a quiet fortress.
        </p>
      ),
      hypotheses: [
        {
          claim: 'Pharmacies are stable for Iberogast; pressure is only online.',
          status: 'rejected',
          because: <>Iberogast Pharmacy share change {fmtPp(d.iberoPharma?.shareChangePp ?? null)} while Gaviscon gains.</>,
        },
        {
          claim: 'Gaviscon is the Pharmacy rival to beat.',
          status: 'confirmed',
          because: <>Top gainer on share change with {fmtPct(d.gavisconPharma?.valueGrowthPct ?? null)} value growth.</>,
        },
      ],
      brandImplications: (
        <p>
          Pharmacy plans for Iberogast must name Gaviscon explicitly (listing, price, promo) — share change already
          shows the competitive move in the euro pool.
        </p>
      ),
      opportunities: (
        <>
          <li>Stabilize Iberogast Pharmacy share ({fmtShare(d.iberoPharma?.shareOfChannelPct ?? null)} of channel).</li>
        </>
      ),
      risks: (
        <>
          <li>Further Gaviscon Pharmacy share gains ({fmtPp(d.gavisconPharma?.shareChangePp ?? null)}).</li>
        </>
      ),
    },

    channelEcomm: {
      facts: (
        <>
          <li>
            Iberogast E-comm: Δ <Num v={d.iberoEcomm?.shareChangePp}>{fmtPp(d.iberoEcomm?.shareChangePp ?? null)}</Num>,
            value <Num v={d.iberoEcomm?.valueGrowthPct}>{fmtPct(d.iberoEcomm?.valueGrowthPct ?? null)}</Num>.
          </li>
          <li>
            Gaviscon E-comm: Δ{' '}
            <Num v={d.gavisconEcomm?.shareChangePp}>{fmtPp(d.gavisconEcomm?.shareChangePp ?? null)}</Num>, value{' '}
            <Num v={d.gavisconEcomm?.valueGrowthPct}>{fmtPct(d.gavisconEcomm?.valueGrowthPct ?? null)}</Num>.
          </li>
          <li>
            Lefax Δ <Num v={d.lefaxEcomm?.shareChangePp}>{fmtPp(d.lefaxEcomm?.shareChangePp ?? null)}</Num> · Talcid Δ{' '}
            <Num v={d.talcidEcomm?.shareChangePp}>{fmtPp(d.talcidEcomm?.shareChangePp ?? null)}</Num>.
          </li>
        </>
      ),
      insights: (
        <p>
          Online is a split screen: Iberogast is ahead on share change, but Gaviscon is still the sharper value gainer,
          and Bayer sister brands (Lefax/Talcid) are losing share in the channel that carries most set growth.
        </p>
      ),
      hypotheses: [
        {
          claim: 'Iberogast online strength means the competitive threat is under control.',
          status: 'partial',
          because: <>Iberogast Δ {fmtPp(d.iberoEcomm?.shareChangePp ?? null)} but Gaviscon value {fmtPct(d.gavisconEcomm?.valueGrowthPct ?? null)}.</>,
        },
        {
          claim: 'Bayer portfolio is leaking share online beyond Iberogast.',
          status: 'confirmed',
          because: <>Lefax/Talcid share changes {fmtPp(d.lefaxEcomm?.shareChangePp ?? null)} / {fmtPp(d.talcidEcomm?.shareChangePp ?? null)}.</>,
        },
      ],
      brandImplications: (
        <p>
          Do not let Iberogast’s online gain justify under-reacting to Gaviscon or to Lefax/Talcid share loss — digital
          is where set euros are accumulating.
        </p>
      ),
      opportunities: (
        <>
          <li>Double down where Iberogast already gains online ({fmtPp(d.iberoEcomm?.shareChangePp ?? null)}).</li>
        </>
      ),
      risks: (
        <>
          <li>Gaviscon acceleration online ({fmtPct(d.gavisconEcomm?.valueGrowthPct ?? null)}).</li>
          <li>Sister-brand share erosion (Lefax/Talcid) in the growth channel.</li>
        </>
      ),
    },

    attract: {
      facts: (
        <>
          <li>
            IBS <Num kind="key">{fmtShare(d.ibs.shareOfCategoryPct)}</Num> of set, growth{' '}
            <Num v={d.ibs.growth1yPct}>{fmtPct(d.ibs.growth1yPct)}</Num>, Bayer share{' '}
            <Num kind="key">{fmtShare(d.ibs.bayerShareMatPct)}</Num> (
            <Num v={d.ibs.bayerShareChangePp}>{fmtPp(d.ibs.bayerShareChangePp)}</Num>).
          </li>
          <li>
            Antacids <Num kind="key">{fmtShare(d.ant.shareOfCategoryPct)}</Num>, growth{' '}
            <Num v={d.ant.growth1yPct}>{fmtPct(d.ant.growth1yPct)}</Num>, Bayer share{' '}
            <Num kind="key">{fmtShare(d.ant.bayerShareMatPct)}</Num> (
            <Num v={d.ant.bayerShareChangePp}>{fmtPp(d.ant.bayerShareChangePp)}</Num>).
          </li>
          <li>
            Gas {fmtShare(d.gas.shareOfCategoryPct)}, {fmtPct(d.gas.growth1yPct)} · PPIs {fmtShare(d.ppi.shareOfCategoryPct)},{' '}
            {fmtPct(d.ppi.growth1yPct)}, Bayer {fmtShare(d.ppi.bayerShareMatPct)}.
          </li>
        </>
      ),
      insights: (
        <p>
          Size and growth diverge: IBS is the pool; Antacids is smaller but much faster and already shows Bayer share
          softness — one category average hides two strategies.
        </p>
      ),
      hypotheses: [
        {
          claim: 'Where Bayer is big (IBS) is also where growth is.',
          status: 'rejected',
          because: <>IBS growth {fmtPct(d.ibs.growth1yPct)} vs Antacids {fmtPct(d.ant.growth1yPct)}.</>,
        },
        {
          claim: 'Play: defend IBS pool; compete in Antacids growth/leak.',
          status: 'confirmed',
          because: <>Pool share {fmtShare(d.ibs.shareOfCategoryPct)}; Antacids Bayer Δ {fmtPp(d.ant.bayerShareChangePp)}.</>,
        },
        {
          claim: 'PPIs are a sized white-space entry from this view.',
          status: 'rejected',
          because: <>Bayer PPI share {fmtShare(d.ppi.bayerShareMatPct)}; not the growth engine vs category.</>,
        },
      ],
      brandImplications: (
        <p>
          Iberogast’s strategic map is two boxes: protect IBS franchise weight, and resource an Antacids competitive
          response. PPIs are not a project this view can size.
        </p>
      ),
      opportunities: (
        <>
          <li>Defend IBS pool ({fmtShare(d.ibs.shareOfCategoryPct)} of set).</li>
          <li>Contest Antacids growth ({fmtPct(d.ant.growth1yPct)}).</li>
        </>
      ),
      risks: (
        <>
          <li>Antacids Bayer share leak ({fmtPp(d.ant.bayerShareChangePp)}) continues.</li>
          <li>Opening PPI work without euro entry size in this extract.</li>
        </>
      ),
    },

    compIbs: {
      facts: (
        <>
          <li>
            Leader {d.topIbs[0]?.label ?? '—'} at <Num kind="key">{fmtShare(d.topIbs[0]?.shareMatPct ?? null)}</Num> of
            IBS, EVI{' '}
            <Num v={d.topIbs[0]?.evolutionIndex} kind="evi">
              {fmtEvi(d.topIbs[0]?.evolutionIndex ?? null)}
            </Num>
            .
          </li>
          <li>
            Classic <Num kind="key">{fmtShare(d.classic?.shareMatPct ?? null)}</Num> · Advance{' '}
            <Num kind="key">{fmtShare(d.advance?.shareMatPct ?? null)}</Num> of IBS.
          </li>
          <li>
            Bayer IBS share <Num kind="key">{fmtShare(d.ibs.bayerShareMatPct)}</Num> (
            <Num v={d.ibs.bayerShareChangePp}>{fmtPp(d.ibs.bayerShareChangePp)}</Num>).
          </li>
        </>
      ),
      insights: (
        <p>
          Iberogast still leads the cash-pool need-state. Leadership here is a defend asset — not proof that set-level
          share softness is solved.
        </p>
      ),
      hypotheses: [
        {
          claim: 'Iberogast has lost IBS leadership.',
          status: 'rejected',
          because: <>Leader share {fmtShare(d.topIbs[0]?.shareMatPct ?? null)} remains Iberogast franchise.</>,
        },
        {
          claim: 'IBS is the franchise to protect, not the growth fight.',
          status: 'confirmed',
          because: <>Bayer IBS share holds ({fmtPp(d.ibs.bayerShareChangePp)}); growth sits elsewhere.</>,
        },
      ],
      brandImplications: (
        <p>
          Keep Classic/Advance as an IBS franchise agenda. Do not spend the IBS leadership story as a substitute for
          an Antacids competitive plan.
        </p>
      ),
      opportunities: (
        <>
          <li>Protect Iberogast IBS leadership ({fmtShare(d.topIbs[0]?.shareMatPct ?? null)}).</li>
        </>
      ),
      risks: (
        <>
          <li>Complacency in IBS while Antacids rivals scale.</li>
        </>
      ),
    },

    compAnt: {
      facts: (
        <>
          <li>
            Gaviscon <Num kind="key">{fmtShare(d.gaviscon?.shareMatPct ?? null)}</Num> of Antacids, EVI{' '}
            <Num v={d.gaviscon?.evolutionIndex} kind="evi">
              {fmtEvi(d.gaviscon?.evolutionIndex ?? null)}
            </Num>
            , sales <Num v={d.gaviscon?.growth1yPct}>{fmtPct(d.gaviscon?.growth1yPct ?? null)}</Num>.
          </li>
          <li>
            Bayer Antacids share <Num kind="key">{fmtShare(d.ant.bayerShareMatPct)}</Num> (
            <Num v={d.ant.bayerShareChangePp}>{fmtPp(d.ant.bayerShareChangePp)}</Num>) while need-state grows{' '}
            <Num v={d.ant.growth1yPct}>{fmtPct(d.ant.growth1yPct)}</Num>.
          </li>
        </>
      ),
      insights: (
        <p>
          Competitors — led by Gaviscon — explain Antacids growth that Bayer is not capturing. This is the competitive
          wound behind soft set share.
        </p>
      ),
      hypotheses: [
        {
          claim: 'Set share softness is mainly an IBS story.',
          status: 'rejected',
          because: <>Antacids Bayer Δ {fmtPp(d.ant.bayerShareChangePp)}; IBS Bayer Δ {fmtPp(d.ibs.bayerShareChangePp)}.</>,
        },
        {
          claim: 'Gaviscon is the reference rival in Antacids.',
          status: 'confirmed',
          because: <>Share {fmtShare(d.gaviscon?.shareMatPct ?? null)} and sales {fmtPct(d.gaviscon?.growth1yPct ?? null)}.</>,
        },
      ],
      brandImplications: (
        <p>
          Build an Antacids vs Gaviscon war-room page (Pharmacy + E-commerce). Iberogast IBS leadership does not close
          this gap.
        </p>
      ),
      opportunities: (
        <>
          <li>Targeted Antacids response against Gaviscon in a {fmtPct(d.ant.growth1yPct)} need-state.</li>
        </>
      ),
      risks: (
        <>
          <li>Further Bayer Antacids share loss ({fmtPp(d.ant.bayerShareChangePp)}).</li>
        </>
      ),
    },

    evi: {
      facts: (
        <>
          <li>
            Advance EVI{' '}
            <Num v={d.advance?.evolutionIndex} kind="evi">
              {fmtEvi(d.advance?.evolutionIndex ?? null)}
            </Num>{' '}
            · Classic EVI{' '}
            <Num v={d.classic?.evolutionIndex} kind="evi">
              {fmtEvi(d.classic?.evolutionIndex ?? null)}
            </Num>{' '}
            vs IBS (100 = in line).
          </li>
          <li>
            Iberogast rolled EVI{' '}
            <Num v={d.ibero?.evolutionIndex} kind="evi">
              {fmtEvi(d.ibero?.evolutionIndex ?? null)}
            </Num>
            .
          </li>
        </>
      ),
      insights: (
        <p>
          Inside IBS, Advance is ahead of the need-state while Classic is near line — relative growth already splits
          the franchise into defend vs grow lines. Antacids Bayer EVI lag belongs to the competitive-wound track.
        </p>
      ),
      hypotheses: [
        {
          claim: 'Classic and Advance should share one growth KPI.',
          status: 'rejected',
          because: <>EVI split {fmtEvi(d.classic?.evolutionIndex ?? null)} vs {fmtEvi(d.advance?.evolutionIndex ?? null)}.</>,
        },
        {
          claim: 'Advance is the relative-growth line; Classic is hold.',
          status: 'confirmed',
          because: <>Advance above 100; Classic near 100 on IBS.</>,
        },
      ],
      brandImplications: (
        <p>
          Separate Iberogast Classic (protect share) from Advance (incremental growth). Do not fold Antacids Bayer EVI
          problems into the same Iberogast line briefing.
        </p>
      ),
      opportunities: (
        <>
          <li>Put incremental plans on Advance (EVI {fmtEvi(d.advance?.evolutionIndex ?? null)}).</li>
        </>
      ),
      risks: (
        <>
          <li>Blended Iberogast volume target blurs the only line ahead of IBS.</li>
        </>
      ),
    },

    iberoPos: {
      facts: (
        <>
          <li>
            Classic {fmtShare(d.classic?.shareMatPct ?? null)} of IBS · EVI {fmtEvi(d.classic?.evolutionIndex ?? null)} ·
            sales {fmtPct(d.classic?.growth1yPct ?? null)} · share Δ {fmtPp(d.classic?.shareChangePp ?? null)}.
          </li>
          <li>
            Advance {fmtShare(d.advance?.shareMatPct ?? null)} of IBS · EVI {fmtEvi(d.advance?.evolutionIndex ?? null)} ·
            sales {fmtPct(d.advance?.growth1yPct ?? null)} · share Δ {fmtPp(d.advance?.shareChangePp ?? null)}.
          </li>
          <li>IBS packs {fmtPct(d.ibs.unitGrowth1yPct)}.</li>
        </>
      ),
      insights: (
        <p>
          Same franchise, two jobs: Classic holds the larger IBS share near pace; Advance is smaller but clearly ahead
          of IBS on relative growth — while IBS packs overall are soft.
        </p>
      ),
      hypotheses: [
        {
          claim: 'More Classic volume is the primary growth lever.',
          status: 'rejected',
          because: <>IBS packs {fmtPct(d.ibs.unitGrowth1yPct)}; Advance EVI {fmtEvi(d.advance?.evolutionIndex ?? null)} leads.</>,
        },
        {
          claim: 'Defend Classic share; grow Advance.',
          status: 'confirmed',
          because: <>Share split {fmtShare(d.classic?.shareMatPct ?? null)} / {fmtShare(d.advance?.shareMatPct ?? null)} with EVI gap.</>,
        },
      ],
      brandImplications: (
        <p>
          Iberogast positioning and investment should split Classic defend vs Advance grow. A single volume target
          underfunds the line that is already outpacing IBS.
        </p>
      ),
      opportunities: (
        <>
          <li>Advance as growth line (EVI {fmtEvi(d.advance?.evolutionIndex ?? null)}).</li>
          <li>Classic share defense ({fmtShare(d.classic?.shareMatPct ?? null)} of IBS).</li>
        </>
      ),
      risks: (
        <>
          <li>Classic volume push into soft IBS packs ({fmtPct(d.ibs.unitGrowth1yPct)}).</li>
        </>
      ),
    },

    share: {
      facts: (
        <>
          <li>
            Set Bayer share {fmtShare(d.cat.bayerShareMatPct)} ({fmtPp(d.cat.bayerShareChangePp)}).
          </li>
          <li>
            Antacids {fmtShare(d.ant.bayerShareYaPct)} → {fmtShare(d.ant.bayerShareMatPct)} (
            <Num v={d.ant.bayerShareChangePp}>{fmtPp(d.ant.bayerShareChangePp)}</Num>).
          </li>
          <li>
            IBS {fmtShare(d.ibs.bayerShareYaPct)} → {fmtShare(d.ibs.bayerShareMatPct)} (
            <Num v={d.ibs.bayerShareChangePp}>{fmtPp(d.ibs.bayerShareChangePp)}</Num>).
          </li>
          <li>
            Gas Δ {fmtPp(d.gas.bayerShareChangePp)} · PPIs Δ {fmtPp(d.ppi.bayerShareChangePp)}.
          </li>
        </>
      ),
      insights: (
        <p>
          Change-first reading: set share softness is an Antacids leak. IBS Bayer share holds — so the portfolio is not
          “weak everywhere”; it is wounded in the fastest need-state.
        </p>
      ),
      hypotheses: [
        {
          claim: 'Bayer is losing share across all need-states.',
          status: 'rejected',
          because: <>IBS Δ {fmtPp(d.ibs.bayerShareChangePp)} vs Antacids {fmtPp(d.ant.bayerShareChangePp)}.</>,
        },
        {
          claim: 'Antacids is the competitive wound; IBS is the strength to protect.',
          status: 'confirmed',
          because: <>Sorted share-change chart worst-first points to Antacids.</>,
        },
      ],
      brandImplications: (
        <p>
          Prioritize Antacids competitive action this month; protect IBS franchise share. Do not explain set softness
          as an Iberogast IBS failure — the share change sits in Antacids, not IBS.
        </p>
      ),
      opportunities: (
        <>
          <li>Protect IBS Bayer share ({fmtShare(d.ibs.bayerShareMatPct)}, {fmtPp(d.ibs.bayerShareChangePp)}).</li>
        </>
      ),
      risks: (
        <>
          <li>Antacids leak deepens ({fmtPp(d.ant.bayerShareChangePp)}).</li>
        </>
      ),
    },
  };
}

/** Final synthesis — Key insights + brand implications + prioritized opportunities. */
export function MarketSynthesis({ d }: { d: StoryAxCtx }) {
  return (
    <div className="m360-synthesis">
      <header className="m360-synthesis__head">
        <span className="m360-synthesis__kicker">Summary · synthesis</span>
        <p>
          Close-out: key insights, brand implications, and prioritized opportunities. Key implications (signals)
          continue in this same section below — then recommended actions.
        </p>
      </header>

      <section>
        <h3>Key insights</h3>
        <ul>
          <li>
            Set grows ({fmtPct(d.cat.growth1yPct)}) while Bayer share is soft ({fmtPp(d.cat.bayerShareChangePp)}) —
            capture problem, not a small category.
          </li>
          <li>
            Growth is value/mix-led (value {fmtPct(d.cat.growth1yPct)} vs packs {fmtPct(d.cat.unitGrowth1yPct)});
            Antacids (~{fmtPct(d.ant.growth1yPct)}) is the growth need-state; IBS packs are soft (
            {fmtPct(d.ibs.unitGrowth1yPct)}).
          </li>
          <li>
            Channels split: Pharmacies = euro pool ({fmtShare(d.pharma.shareOfSetPct)}, price-led); E-commerce ={' '}
            {fmtShare(d.ecomm.pctOfSetAbsGrowth)} of absolute EUR growth (volume-led).
          </li>
          <li>
            Gaviscon is the rival in both channels and in Antacids; Iberogast still leads IBS; Advance EVI{' '}
            {fmtEvi(d.advance?.evolutionIndex ?? null)} vs Classic {fmtEvi(d.classic?.evolutionIndex ?? null)}.
          </li>
        </ul>
      </section>

      <section>
        <h3>Implications for the brand</h3>
        <p>
          Iberogast / Bayer must run two jobs, not one Digestive average: defend the IBS franchise (Classic share;
          Advance as growth line) and contest Antacids vs Gaviscon — especially where E-commerce is adding euros and
          Pharmacies still hold the pool. Soft set share is an Antacids story, not an IBS leadership loss.
        </p>
      </section>

      <section>
        <h3>Prioritized opportunities</h3>
        <ol className="m360-synthesis__prio">
          <li>
            <strong>P1 · Antacids vs Gaviscon</strong> — need-state {fmtPct(d.ant.growth1yPct)}, Bayer Δ{' '}
            {fmtPp(d.ant.bayerShareChangePp)}; rival gains in Pharmacies and E-commerce.
          </li>
          <li>
            <strong>P2 · Iberogast Classic defend / Advance grow</strong> — Classic {fmtShare(d.classic?.shareMatPct ?? null)}{' '}
            of IBS (EVI {fmtEvi(d.classic?.evolutionIndex ?? null)}); Advance EVI{' '}
            {fmtEvi(d.advance?.evolutionIndex ?? null)}.
          </li>
          <li>
            <strong>P3 · Channel dual plan</strong> — protect Pharmacies ({fmtShare(d.pharma.shareOfSetPct)}); feed
            E-commerce ({fmtShare(d.ecomm.pctOfSetAbsGrowth)} of EUR growth); watch Lefax/Talcid online share loss.
          </li>
        </ol>
      </section>

      <section>
        <h3>Priority risks</h3>
        <ul>
          <li>Gaviscon acceleration (Antacids + both channels).</li>
          <li>Pharmacy volume drag while price carries a flat large channel.</li>
          <li>Blended Iberogast volume targets that ignore Advance EVI and soft IBS packs.</li>
        </ul>
      </section>
    </div>
  );
}
