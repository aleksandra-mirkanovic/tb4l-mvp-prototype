import type { ReactNode } from 'react';
import './SiriusTip.css';

export type SiriusTable = 'T1' | 'T2' | 'T3' | 'T4' | 'T-ch' | 'T-ch-b' | 'CALC';

const TABLE_LABEL: Record<SiriusTable, string> = {
  T1: 'Table 1 · Segments',
  T2: 'Table 2 · Sub-brands',
  T3: 'Table 3 · Metadata',
  T4: 'Table 4 · Checks',
  'T-ch': 'Table · Channels',
  'T-ch-b': 'Table · Channel brands',
  CALC: 'CALC · derived from T1 / T2 / channels',
};

export function SiriusTip({
  table,
  field,
  children,
  className,
}: {
  table: SiriusTable;
  field: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`sirius-tip${className ? ` ${className}` : ''}`}
      title={`Sirius / CHDAA v_m360_nrm · ${TABLE_LABEL[table]} · ${field}`}
    >
      {children}
      <span className="sirius-tip__box" role="tooltip">
        <strong>Sirius / CHDAA v_m360_nrm</strong>
        <em>{TABLE_LABEL[table]}</em>
        <span>{field}</span>
      </span>
    </span>
  );
}
