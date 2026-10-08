import { useMemo, useState, type ReactNode } from 'react';
import { CALC_CATEGORY, CALC_SEGMENTS } from '../data/m360Charts';
import {
  buildInteractionCards,
  fmtM,
  fmtPct,
  fmtPp,
  fmtShare,
  INTERACTION_CONTEXT,
  topNamed,
  type InteractionCard,
} from '../data/m360Interaction';
import { SiriusTip } from './SiriusTip';
import './M360Interaction.css';

type Tab = 'cards' | 'brief' | 'canvas' | 'interview' | 'compare';
type YKey = 'share' | 'growth' | 'cagr3y';
type XKey = 'value' | 'units';

const Y_META: Record<
  YKey,
  { label: string; min: number; max: number; pick: (s: (typeof CALC_SEGMENTS)[0]) => number | null }
> = {
  share: { label: 'Bayer share %', min: 0, max: 70, pick: (s) => s.bayerShareMatPct },
  growth: { label: 'Value growth YoY %', min: -2, max: 12, pick: (s) => s.growth1yPct },
  cagr3y: { label: '3y CAGR %', min: -4, max: 12, pick: (s) => s.cagr3yPct },
};

const X_META: Record<
  XKey,
  { label: string; min: number; max: number; pick: (s: (typeof CALC_SEGMENTS)[0]) => number | null }
> = {
  value: { label: 'Value growth YoY %', min: 0, max: 11, pick: (s) => s.growth1yPct },
  units: { label: 'Unit growth YoY %', min: -2, max: 12, pick: (s) => s.unitGrowth1yPct },
};

function pctClass(v: number | null): string {
  if (v === null) return '';
  if (v > 0) return 'is-pos';
  if (v < 0) return 'is-neg';
  return 'is-zero';
}

export function M360Interaction() {
  const [tab, setTab] = useState<Tab>('cards');
  const cards = useMemo(() => buildInteractionCards(), []);
  const ctx = INTERACTION_CONTEXT;

  return (
    <section className="m360-ix" aria-labelledby="m360-ix-heading">
      <header className="m360-ix__intro">
        <h2 id="m360-ix-heading" className="section-title">
          Four ways the insights agent could meet the user
        </h2>
        <p>
          {ctx.source} · {ctx.country} · {ctx.category} · {ctx.scope} · {ctx.brand} · MAT{' '}
          {ctx.month}. Numbers from T1 / T2 / CALC. 3y CAGR is N/A (4 months of history).
        </p>
      </header>
      <div className="m360-ix__tabs" role="tablist">
        {(
          [
            ['cards', '1', 'Scenario cards'],
            ['brief', '2', 'Living briefing'],
            ['canvas', '3', 'Analyst canvas'],
            ['interview', '4', 'Inverted interview'],
            ['compare', '⚖', 'Compare'],
          ] as const
        ).map(([id, n, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? 'is-on' : undefined}
            onClick={() => setTab(id)}
          >
            <span>{n}</span>
            {label}
          </button>
        ))}
      </div>
      {tab === 'cards' ? <ScenarioCards cards={cards} /> : null}
      {tab === 'brief' ? <LivingBriefing /> : null}
      {tab === 'canvas' ? <AnalystCanvas cards={cards} /> : null}
      {tab === 'interview' ? <InvertedInterview /> : null}
      {tab === 'compare' ? <ComparePane /> : null}
    </section>
  );
}

function ScenarioCards({ cards }: { cards: InteractionCard[] }) {
  return (
    <div>
      <p className="m360-ix__lede">
        One card per Sirius segment. S2 / S3 / S4 and the verdict are calculated from T1 share and
        growth. 3y CAGR is N/A because value_3ya is incomplete.
      </p>
      <div className="m360-ix-cards">
        {cards.map((c) => (
          <SegmentCard key={c.segment} card={c} />
        ))}
      </div>
    </div>
  );
}

function SegmentCard({ card }: { card: InteractionCard }) {
  const [open, setOpen] = useState<number | null>(null);
  const [why, setWhy] = useState(false);
  const [whyText, setWhyText] = useState('');
  const [log, setLog] = useState<{ kind: 'ok' | 'rej' | 'defer'; text: string } | null>(null);
  const who = INTERACTION_CONTEXT.user;

  return (
    <article className={`m360-ix-card${log ? ' is-done' : ''}`}>
      <header>
        <div>
          <h3>{card.segment}</h3>
          <p>{card.scenarioLine}</p>
        </div>
        <span className={`m360-ix-scen is-${card.scenario}`}>
          <SiriusTip table="CALC" field="from T1 Bayer share and 1y vs category growth">
            {card.scenario}
          </SiriusTip>
        </span>
      </header>
      <div className="m360-ix-nums">
        <div>
          <strong>
            <SiriusTip table="T1" field={`${card.segment} · value_mat`}>
              {fmtM(card.valueMatM)}
            </SiriusTip>
          </strong>
          <span>segment value</span>
        </div>
        <div>
          <strong className={pctClass(card.growth1yPct)}>
            <SiriusTip table="CALC" field={`${card.segment} · value_mat / value_ya − 1`}>
              {fmtPct(card.growth1yPct)}
            </SiriusTip>
          </strong>
          <span>value YoY</span>
        </div>
        <div>
          <strong className={pctClass(card.unitGrowth1yPct)}>
            <SiriusTip table="CALC" field={`${card.segment} · units_mat / units_ya − 1`}>
              {fmtPct(card.unitGrowth1yPct)}
            </SiriusTip>
          </strong>
          <span>unit YoY</span>
        </div>
        <div>
          <strong className={card.bayerShareMatPct === 0 ? 'is-zero' : undefined}>
            <SiriusTip table="CALC" field={`${card.segment} · bayer_value_mat / value_mat`}>
              {fmtShare(card.bayerShareMatPct)}
            </SiriusTip>
          </strong>
          <span>Bayer share</span>
        </div>
      </div>
      <div className="m360-ix-body">
        <p>
          <b>3y CAGR</b>{' '}
          <SiriusTip table="CALC" field={`${card.segment} · (value_mat / value_3ya)^(1/3) − 1`}>
            {fmtPct(card.cagr3yPct)}
          </SiriusTip>
        </p>
        <p>
          <b>Bayer Δ</b>{' '}
          <SiriusTip table="CALC" field={`${card.segment} · bayer share MAT − YA, pp`}>
            {fmtPp(card.bayerShareChangePp)}
          </SiriusTip>
        </p>
        <p>{card.note}</p>
        <div className="m360-ix-verdict">
          <b>Verdict.</b> {card.verdict}
        </div>
        <p className="m360-ix-caveat">{card.caveat}</p>
        <p className="m360-ix-dh">Drill paths</p>
        {card.drills.map((d, di) => (
          <div key={d.q}>
            <button
              type="button"
              className={`m360-ix-drill${d.blocked ? ' is-blocked' : ''}`}
              onClick={() => setOpen(open === di ? null : di)}
            >
              {d.q}
              <em>{d.tag}</em>
            </button>
            {open === di ? (
              <div className={`m360-ix-dout${d.blocked ? ' is-warn' : ''}`}>{d.answer}</div>
            ) : null}
          </div>
        ))}
      </div>
      <div className="m360-ix-acts">
        <button
          type="button"
          className="is-ag"
          onClick={() => setLog({ kind: 'ok', text: `Agreed — ${who}.` })}
        >
          Agree
        </button>
        <button type="button" className="is-di" onClick={() => setWhy(true)}>
          Disagree
        </button>
        <button
          type="button"
          onClick={() => setLog({ kind: 'defer', text: `Deferred — N/A / insufficient Sirius fields.` })}
        >
          Not enough data
        </button>
      </div>
      {why ? (
        <div className="m360-ix-why">
          <input
            value={whyText}
            onChange={(e) => setWhyText(e.target.value)}
            placeholder="One line: why not?"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setLog({
                  kind: 'rej',
                  text: `Rejected — “${whyText || 'N/A'}” — ${who}.`,
                });
                setWhy(false);
              }
            }}
            aria-label={`Disagree reason for ${card.segment}`}
          />
        </div>
      ) : null}
      {log ? <div className={`m360-ix-log is-${log.kind}`}>{log.text}</div> : null}
    </article>
  );
}

function Ev({ children, box }: { children: ReactNode; box: ReactNode }) {
  const [on, setOn] = useState(false);
  return (
    <>
      <button type="button" className="m360-ix-ev" onClick={() => setOn(!on)}>
        {children}
      </button>
      {on ? <div className="m360-ix-evbox">{box}</div> : null}
    </>
  );
}

function LivingBriefing() {
  const ctx = INTERACTION_CONTEXT;
  const [status, setStatus] = useState<string | null>(null);
  const fails = ctx.checks.filter((c) => c.status === 'FAIL');
  return (
    <div>
      <p className="m360-ix__lede">
        Facts from T1 / T2 / CALC. Click a figure for the source row. Fields not in Sirius are N/A.
      </p>
      <article className="m360-ix-brief">
        <header>
          <h3>
            {ctx.country} {ctx.category}
          </h3>
          <p>
            {ctx.source} · MAT {ctx.month} · {ctx.scope} · {ctx.brand}
          </p>
        </header>
        <p>
          Category MAT{' '}
          <Ev
            box={
              <table>
                <tbody>
                  <tr>
                    <td>T1 SUM value_mat</td>
                    <td>{fmtM(ctx.cat.valueMatM)}</td>
                  </tr>
                  <tr>
                    <td>T1 SUM bayer_value_mat</td>
                    <td>{fmtM(ctx.cat.bayerValueMatM)}</td>
                  </tr>
                  <tr>
                    <td>Bayer share</td>
                    <td>{fmtShare(ctx.cat.bayerShareMatPct)}</td>
                  </tr>
                  <tr>
                    <td>Value 1y</td>
                    <td>{fmtPct(ctx.cat.growth1yPct)}</td>
                  </tr>
                  <tr>
                    <td>Units 1y</td>
                    <td>{fmtPct(ctx.cat.unitGrowth1yPct)}</td>
                  </tr>
                  <tr>
                    <td>3y CAGR</td>
                    <td>N/A</td>
                  </tr>
                </tbody>
              </table>
            }
          >
            <SiriusTip table="T1" field="SUM(value_mat)">
              {fmtM(ctx.cat.valueMatM)}
            </SiriusTip>
          </Ev>
          , Bayer share{' '}
          <SiriusTip table="CALC" field="SUM(bayer_value_mat) / SUM(value_mat)">
            {fmtShare(ctx.cat.bayerShareMatPct)}
          </SiriusTip>
          , value 1y{' '}
          <SiriusTip table="CALC" field="SUM(value_mat) / SUM(value_ya) − 1">
            {fmtPct(ctx.cat.growth1yPct)}
          </SiriusTip>
          , units 1y{' '}
          <SiriusTip table="CALC" field="SUM(units_mat) / SUM(units_ya) − 1">
            {fmtPct(ctx.cat.unitGrowth1yPct)}
          </SiriusTip>
          .
        </p>
        {CALC_SEGMENTS.map((s) => {
          const topC = topNamed(s.segment, false);
          const topB = topNamed(s.segment, true);
          return (
            <div key={s.segment}>
              <h4>{s.segment}</h4>
              <p>
                MAT{' '}
                <SiriusTip table="T1" field={`${s.segment} · value_mat`}>
                  {fmtM(s.valueMatM)}
                </SiriusTip>{' '}
                (
                <SiriusTip table="CALC" field={`${s.segment} · value_mat / SUM(value_mat)`}>
                  {fmtShare(s.shareOfCategoryPct)}
                </SiriusTip>{' '}
                of category). Value 1y{' '}
                <SiriusTip table="CALC" field={`${s.segment} · value_mat / value_ya − 1`}>
                  {fmtPct(s.growth1yPct)}
                </SiriusTip>
                . Units 1y{' '}
                <SiriusTip table="CALC" field={`${s.segment} · units_mat / units_ya − 1`}>
                  {fmtPct(s.unitGrowth1yPct)}
                </SiriusTip>
                . Bayer share{' '}
                <SiriusTip table="CALC" field={`${s.segment} · bayer_value_mat / value_mat`}>
                  {fmtShare(s.bayerShareMatPct)}
                </SiriusTip>{' '}
                (
                <SiriusTip table="CALC" field={`${s.segment} · bayer share MAT − YA, pp`}>
                  {fmtPp(s.bayerShareChangePp)}
                </SiriusTip>
                ). 3y CAGR{' '}
                <SiriusTip table="CALC" field={`${s.segment} · (value_mat / value_3ya)^(1/3) − 1`}>
                  {fmtPct(s.cagr3yPct)}
                </SiriusTip>
                . White-space flag {s.whiteSpaceFlag ? 'yes' : 'no'}. Top
                non-Bayer{' '}
                {topC ? (
                  <SiriusTip table="T2" field={`${s.segment} · ${topC.label} · value_mat`}>
                    {`${topC.label} ${fmtShare(topC.shareMatPct)}`}
                  </SiriusTip>
                ) : (
                  'N/A'
                )}
                . Top Bayer{' '}
                {topB ? (
                  <SiriusTip table="T2" field={`${s.segment} · ${topB.label} · value_mat`}>
                    {`${topB.label} ${fmtShare(topB.shareMatPct)}`}
                  </SiriusTip>
                ) : (
                  'N/A'
                )}
                .
              </p>
            </div>
          );
        })}
        <div className="m360-ix-flag">
          <b>T4 FAIL</b>
          {fails.length
            ? fails.map((c) => (
                <p key={c.id}>
                  {c.id}: {c.check}. {c.values}
                </p>
              ))
            : ' N/A'}
        </div>
        <p className="m360-ix-margin">
          Opportunity EUR N/A. Channel N/A. Distribution N/A. NSV N/A. {ctx.cagr3yNote}
        </p>
        <div className="m360-ix-bfoot">
          <button type="button" onClick={() => setStatus(`Accepted — ${ctx.user}.`)}>
            Accept briefing
          </button>
        </div>
        {status ? <p className="m360-ix-log is-ok">{status}</p> : null}
      </article>
    </div>
  );
}

function AnalystCanvas({ cards }: { cards: InteractionCard[] }) {
  const [y, setY] = useState<YKey>('share');
  const [x, setX] = useState<XKey>('value');
  const [sel, setSel] = useState<string | null>(null);
  const ymax = Math.max(...CALC_SEGMENTS.map((s) => s.valueMatM), 1);
  const ym = Y_META[y];
  const xm = X_META[x];
  const yRef =
    y === 'share'
      ? CALC_CATEGORY.bayerShareMatPct
      : y === 'growth'
        ? CALC_CATEGORY.growth1yPct
        : null;
  const xRef = x === 'value' ? CALC_CATEGORY.growth1yPct : CALC_CATEGORY.unitGrowth1yPct;
  const selected = CALC_SEGMENTS.find((s) => s.segment === sel);

  const pctAlong = (v: number, min: number, max: number) =>
    `${((Math.min(max, Math.max(min, v)) - min) / (max - min)) * 100}%`;

  return (
    <div>
      <p className="m360-ix__lede">
        Axes are CALC fields from Sirius. A bubble is omitted if that metric is N/A.
      </p>
      <div className="m360-ix-canvas">
        <div className="m360-ix-ctools">
          <span>Y axis</span>
          {(['share', 'growth', 'cagr3y'] as const).map((k) => (
            <button key={k} type="button" className={y === k ? 'is-on' : undefined} onClick={() => setY(k)}>
              {k === 'share' ? 'Bayer share' : k === 'growth' ? 'Value 1y' : '3y CAGR'}
            </button>
          ))}
          <span>X axis</span>
          {(['value', 'units'] as const).map((k) => (
            <button key={k} type="button" className={x === k ? 'is-on' : undefined} onClick={() => setX(k)}>
              {k === 'value' ? 'Value 1y' : 'Units 1y'}
            </button>
          ))}
        </div>
        <div className="m360-ix-plot">
          <div className="m360-ix-quad">
            {yRef !== null ? (
              <i className="is-h" style={{ bottom: pctAlong(yRef, ym.min, ym.max) }} />
            ) : null}
            {xRef !== null ? (
              <i className="is-v" style={{ left: pctAlong(xRef, xm.min, xm.max) }} />
            ) : null}
            {CALC_SEGMENTS.map((s) => {
              const xv = xm.pick(s);
              const yv = ym.pick(s);
              if (xv === null || yv === null) return null;
              const size = 28 + (s.valueMatM / ymax) * 46;
              return (
                <button
                  key={s.segment}
                  type="button"
                  className={`m360-ix-bub is-core${sel === s.segment ? ' is-sel' : ''}`}
                  style={{
                    left: pctAlong(xv, xm.min, xm.max),
                    bottom: pctAlong(yv, ym.min, ym.max),
                    width: size,
                    height: size,
                  }}
                  onClick={() => setSel(s.segment)}
                >
                  {cards.find((c) => c.segment === s.segment)?.short}
                </button>
              );
            })}
            <span className="m360-ix-ax is-y">{ym.label}</span>
            <span className="m360-ix-ax is-x">{xm.label}</span>
          </div>
        </div>
        <div className="m360-ix-insp">
          {selected ? (
            <>
              <h4>{selected.segment}</h4>
              <dl>
                <div>
                  <dt>Value</dt>
                  <dd>
                    <SiriusTip table="T1" field={`${selected.segment} · value_mat`}>
                      {fmtM(selected.valueMatM)}
                    </SiriusTip>
                  </dd>
                </div>
                <div>
                  <dt>Value YoY</dt>
                  <dd>
                    <SiriusTip table="CALC" field={`${selected.segment} · value_mat / value_ya − 1`}>
                      {fmtPct(selected.growth1yPct)}
                    </SiriusTip>
                  </dd>
                </div>
                <div>
                  <dt>Unit YoY</dt>
                  <dd>
                    <SiriusTip table="CALC" field={`${selected.segment} · units_mat / units_ya − 1`}>
                      {fmtPct(selected.unitGrowth1yPct)}
                    </SiriusTip>
                  </dd>
                </div>
                <div>
                  <dt>3y CAGR</dt>
                  <dd>
                    <SiriusTip table="CALC" field={`${selected.segment} · (value_mat / value_3ya)^(1/3) − 1`}>
                      {fmtPct(selected.cagr3yPct)}
                    </SiriusTip>
                  </dd>
                </div>
                <div>
                  <dt>Bayer share</dt>
                  <dd>
                    <SiriusTip table="CALC" field={`${selected.segment} · bayer_value_mat / value_mat`}>
                      {fmtShare(selected.bayerShareMatPct)}
                    </SiriusTip>
                  </dd>
                </div>
                <div>
                  <dt>White space</dt>
                  <dd>
                    <SiriusTip table="CALC" field="Bayer share MAT < 3% AND 1y growth > category">
                      {selected.whiteSpaceFlag ? 'yes' : 'no'}
                    </SiriusTip>
                  </dd>
                </div>
              </dl>
              <p>{cards.find((c) => c.segment === selected.segment)?.note}</p>
            </>
          ) : (
            <p>Click a segment. Size = T1 value_mat. Crosshair = category CALC average when that metric exists.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function InvertedInterview() {
  const ctx = INTERACTION_CONTEXT;
  const c2 = ctx.checks.find((c) => c.id === 'C2');
  const wsNone = CALC_SEGMENTS.every((s) => !s.whiteSpaceFlag);
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<string[]>([]);
  const largest = [...CALC_SEGMENTS].sort((a, b) => b.valueMat - a.valueMat)[0];
  const fastest = [...CALC_SEGMENTS]
    .filter((s) => s.growth1yPct !== null)
    .sort((a, b) => (b.growth1yPct ?? 0) - (a.growth1yPct ?? 0))[0];

  const questions = [
    {
      lead: `T1 has ${CALC_SEGMENTS.length} segments, category ${fmtM(ctx.cat.valueMatM)}. T4 C2 is ${c2?.status ?? 'N/A'}.`,
      q: c2
        ? `${c2.id} ${c2.status}. ${c2.values.slice(0, 280)}. How should output treat this?`
        : 'N/A',
      opts: [
        'Keep T1 Bayer values and show C2 FAIL on every output',
        'Exclude the failing segment until T2 reconciles',
        'N/A — I will not decide from this extract',
      ],
    },
    {
      lead: `White-space flag in CALC is Bayer share MAT < 3% AND 1y growth > category ${fmtPct(ctx.cat.growth1yPct)}. Candidates: ${wsNone ? 'none' : CALC_SEGMENTS.filter((s) => s.whiteSpaceFlag).map((s) => s.segment).join(', ')}.`,
      q: wsNone
        ? 'No white-space candidates. Record as what?'
        : `Candidates: ${CALC_SEGMENTS.filter((s) => s.whiteSpaceFlag).map((s) => s.segment).join(' · ')}. Record as what?`,
      opts: [
        'Keep as near-miss only — not a candidate',
        'Escalate near-miss list to the category team',
        'N/A — I will not decide from this extract',
      ],
    },
    {
      lead: `Largest segment by T1 value_mat is ${largest?.segment ?? 'N/A'} (${fmtM(largest?.valueMatM ?? null)}). Fastest 1y value growth is ${fastest?.segment ?? 'N/A'} (${fmtPct(fastest?.growth1yPct ?? null)}).`,
      q: 'Which T1 segment should the next output open with?',
      opts: [largest?.segment ?? 'N/A', fastest?.segment ?? 'N/A', 'N/A — no preference'],
    },
  ];

  return (
    <div>
      <p className="m360-ix__lede">
        Questions use T4 and CALC only. Answers are judgement, not Sirius fields.
      </p>
      <div className="m360-ix-chat">
        <div className="m360-ix-chh">
          <strong>
            {ctx.country} {ctx.category} · {ctx.source}
          </strong>
          <span>
            {Math.min(step, 3)} of 3
          </span>
        </div>
        <div className="m360-ix-thread">
          <div className="m360-ix-msg">
            <i>TB</i>
            <div>
              <em>TB4L Analyst Agent</em>
              <p>CALC is loaded from the Sirius snapshot. Three decisions are not in T1–T4.</p>
            </div>
          </div>
          {questions.map((item, qi) =>
            qi <= step ? (
              <div key={qi} className="m360-ix-msg">
                <i>TB</i>
                <div>
                  <em>TB4L Analyst Agent</em>
                  <p>{item.lead}</p>
                  <div className="m360-ix-qbox">
                    <p>{item.q}</p>
                    <div className="m360-ix-opts">
                      {item.opts.map((o) => (
                        <button
                          key={o}
                          type="button"
                          className={picks[qi] === o ? 'is-picked' : undefined}
                          disabled={picks[qi] !== undefined}
                          onClick={() => {
                            setPicks((p) => [...p, o]);
                            setStep((s) => s + 1);
                          }}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null,
          )}
          {step >= 3 ? (
            <div className="m360-ix-msg">
              <i>TB</i>
              <div>
                <em>TB4L Analyst Agent</em>
                <div className="m360-ix-sum">
                  <h4>Logged (not Sirius)</h4>
                  <ul>
                    <li>C2: {picks[0]}</li>
                    <li>White space: {picks[1]}</li>
                    <li>Open with: {picks[2]}</li>
                    <li>Opportunity EUR: N/A</li>
                    <li>3y CAGR: N/A</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ComparePane() {
  return (
    <div>
      <h3 className="m360-ix-cmp-h">How the four compare</h3>
      <p className="m360-ix__lede">This table is interaction design, not Sirius data.</p>
      <div className="m360-ix-cmp">
        <table>
          <thead>
            <tr>
              <th>Model</th>
              <th>Who it fits</th>
              <th>What it optimises for</th>
              <th>Main risk</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1 · Scenario cards</td>
              <td>Brand manager, repeat cycle</td>
              <td>Decision capture</td>
              <td>Rigid when the question is not pre-modelled</td>
            </tr>
            <tr>
              <td>2 · Living briefing</td>
              <td>Senior stakeholders, pre-reads</td>
              <td>Narrative coherence</td>
              <td>Prose can outrun thin evidence</td>
            </tr>
            <tr>
              <td>3 · Analyst canvas</td>
              <td>Analysts, workshops</td>
              <td>Discovery</td>
              <td>No forcing function</td>
            </tr>
            <tr>
              <td>4 · Inverted interview</td>
              <td>First run, threshold setting</td>
              <td>Human judgement before it is assumed</td>
              <td>Slow for routine use</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
