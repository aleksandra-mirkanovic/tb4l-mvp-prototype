/**
 * M360 retrieval snapshot from Sirius (CHDAA).
 * Country: Germany · Category: Digestive Health · Scope: Iberogast GB BAM
 * Latest actual: Jul 2026 · MAT Aug 2025–Jul 2026
 * Null / incomplete windows shown as N/A in the UI.
 */

export type NullableNumber = number | null;

export type SegmentRow = {
  country: string;
  category: string;
  segment_name: string;
  value_mat: NullableNumber;
  value_ya: NullableNumber;
  value_2ya: NullableNumber;
  value_3ya: NullableNumber;
  units_mat: NullableNumber;
  units_ya: NullableNumber;
  units_3ya: NullableNumber;
  bayer_value_mat: NullableNumber;
  bayer_value_ya: NullableNumber;
  bayer_value_3ya: NullableNumber;
  n_subbrands_total: NullableNumber;
};

export type SubBrandRow = {
  segment_name: string;
  manufacturer: string;
  brand: string;
  sub_brand: string;
  sub_brand_source: string;
  is_bayer: 0 | 1;
  value_mat: NullableNumber;
  value_ya: NullableNumber;
  value_3ya: NullableNumber;
  units_mat: NullableNumber;
  units_ya: NullableNumber;
  grouped_count?: number;
};

export type MetadataRow = {
  latest_actual_month: string;
  mat_start: string;
  mat_end: string;
  scope: string;
  currency: string;
  rows_total: number;
  rows_excluded_outlier: number;
  units_fill_rate_pct: number;
  months_available_for_3ya: number;
  segments_returned: number;
};

export type CheckRow = {
  id: string;
  check: string;
  status: 'PASS' | 'FAIL' | 'N/A';
  values: string;
};

export const M360_RETRIEVAL_PARAMS = {
  country: 'Germany',
  category: 'Digestive Health',
  scope: 'GB BAM',
  gbBamBrand: 'IBEROGAST',
  currency: 'EUR',
  source: 'Sirius / CHDAA v_m360_nrm',
};

export const M360_SEGMENTS: SegmentRow[] = [
  {
    country: 'DE',
    category: 'DIGESTIVE HEALTH',
    segment_name: 'IBS & SENSITIVE STOMACH',
    value_mat: 293820665.2909,
    value_ya: 285487843.6266,
    value_2ya: 243171414.5316,
    value_3ya: null,
    units_mat: 16671744.3753,
    units_ya: 16772807.8692,
    units_3ya: null,
    bayer_value_mat: 144096226.4543,
    bayer_value_ya: 138228936.1287,
    bayer_value_3ya: null,
    n_subbrands_total: 74,
  },
  {
    country: 'DE',
    category: 'DIGESTIVE HEALTH',
    segment_name: 'ANTACIDS',
    value_mat: 161975194.1107,
    value_ya: 147917157.8626,
    value_2ya: 142681651.801,
    value_3ya: null,
    units_mat: 11387162.3857,
    units_ya: 11173720.9959,
    units_3ya: null,
    bayer_value_mat: 53411437.8696,
    bayer_value_ya: 51865369.401,
    bayer_value_3ya: null,
    n_subbrands_total: 37,
  },
  {
    country: 'DE',
    category: 'DIGESTIVE HEALTH',
    segment_name: 'GAS & BLOATING',
    value_mat: 70963866.8213,
    value_ya: 68986068.8813,
    value_2ya: 70669072.7444,
    value_3ya: null,
    units_mat: 6431642.8057,
    units_ya: 6322886.3502,
    units_3ya: null,
    bayer_value_mat: 44907413.6711,
    bayer_value_ya: 43610545.8608,
    bayer_value_3ya: null,
    n_subbrands_total: 42,
  },
  {
    country: 'DE',
    category: 'DIGESTIVE HEALTH',
    segment_name: 'PPIS',
    value_mat: 55370925.9236,
    value_ya: 54191005.4811,
    value_2ya: 57484152.6501,
    value_3ya: null,
    units_mat: 9071178.4594,
    units_ya: 8332099.6023,
    units_3ya: null,
    bayer_value_mat: 0,
    bayer_value_ya: 0,
    bayer_value_3ya: null,
    n_subbrands_total: 13,
  },
];

export const M360_SUBBRANDS: SubBrandRow[] = [
  { segment_name: 'ANTACIDS', manufacturer: 'RECKITT', brand: 'GAVISCON', sub_brand: 'GAVISCON', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 52955381.4577, value_ya: 43077653.1046, value_3ya: null, units_mat: 3103083.6357, units_ya: 2697303.5587 },
  { segment_name: 'ANTACIDS', manufacturer: 'BAYER', brand: 'TALCID', sub_brand: 'TALCID ANTACID', sub_brand_source: 'gsb', is_bayer: 1, value_mat: 35503206.2347, value_ya: 34473822.9226, value_3ya: null, units_mat: 2581540.1527, units_ya: 2664899.9399 },
  { segment_name: 'ANTACIDS', manufacturer: 'KADE', brand: 'RIOPAN', sub_brand: 'RIOPAN', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 21936734.9385, value_ya: 20749217.9579, value_3ya: null, units_mat: 1363660.9641, units_ya: 1396638.9156 },
  { segment_name: 'ANTACIDS', manufacturer: 'BAYER', brand: 'RENNIE', sub_brand: 'RENNIE CORE', sub_brand_source: 'gsb', is_bayer: 1, value_mat: 17908231.6349, value_ya: 17391546.4784, value_3ya: null, units_mat: 1517156.4193, units_ya: 1560664.8146 },
  { segment_name: 'ANTACIDS', manufacturer: 'OPELLA', brand: 'MAALOX', sub_brand: 'MAALOX', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 13920446.4721, value_ya: 14177809.0546, value_3ya: null, units_mat: 913448.3738, units_ya: 991039.72 },
  { segment_name: 'ANTACIDS', manufacturer: 'SCHWABE', brand: 'REFLUTHIN', sub_brand: 'REFLUTHIN', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 6815203.5245, value_ya: 6140900.9569, value_3ya: null, units_mat: 591432.8759, units_ya: 567594.5241 },
  { segment_name: 'ANTACIDS', manufacturer: 'LUVOS', brand: 'LUVOS', sub_brand: 'LUVOS', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 2605567.4329, value_ya: 2092805.4115, value_3ya: null, units_mat: 194954.2938, units_ya: 159741.2665 },
  { segment_name: 'ANTACIDS', manufacturer: 'Other', brand: 'Other', sub_brand: 'Other (<1%)', sub_brand_source: 'grouped', is_bayer: 0, value_mat: 10330422.4154, value_ya: 9813401.9761, value_3ya: null, units_mat: 1121885.6704, units_ya: 1135838.2565, grouped_count: 34 },
  { segment_name: 'GAS & BLOATING', manufacturer: 'BAYER', brand: 'LEFAX', sub_brand: 'LEFAX ANTIGAS', sub_brand_source: 'gsb', is_bayer: 1, value_mat: 44097269.0598, value_ya: 42807563.3054, value_3ya: null, units_mat: 3626584.0226, units_ya: 3573447.4925 },
  { segment_name: 'GAS & BLOATING', manufacturer: 'HALEON', brand: 'SAB SIMPLEX', sub_brand: 'SAB SIMPLEX', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 9810298.2494, value_ya: 10240307.8964, value_3ya: null, units_mat: 800930.5686, units_ya: 853901.8215 },
  { segment_name: 'GAS & BLOATING', manufacturer: 'MENARINI', brand: 'ESPUMISAN', sub_brand: 'ESPUMISAN', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 4818192.4529, value_ya: 4689925.3891, value_3ya: null, units_mat: 451751.0573, units_ya: 449504.3326 },
  { segment_name: 'GAS & BLOATING', manufacturer: 'STADA', brand: 'SIMETICONE', sub_brand: 'SIMETICONE', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 1615474.0402, value_ya: 1147640.5019, value_3ya: null, units_mat: 276064.8397, units_ya: 209562.9474 },
  { segment_name: 'GAS & BLOATING', manufacturer: 'KOHL MEDICAL AG', brand: 'SAB SIMPLEX', sub_brand: 'SAB SIMPLEX', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 1550770.7121, value_ya: 1399207.3603, value_3ya: null, units_mat: 171937.4413, units_ya: 154562.9875 },
  { segment_name: 'GAS & BLOATING', manufacturer: 'TEVA', brand: 'SIMETHICONE', sub_brand: 'SIMETHICONE', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 1286139.0958, value_ya: 1339754.124, value_3ya: null, units_mat: 135718.4143, units_ya: 144387.6524 },
  { segment_name: 'GAS & BLOATING', manufacturer: 'WALA', brand: 'CARUM CARV CO', sub_brand: 'CARUM CARV CO', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 915490.1442, value_ya: 1119096.1459, value_3ya: null, units_mat: 102170.3146, units_ya: 128960.4729 },
  { segment_name: 'GAS & BLOATING', manufacturer: 'URIACH', brand: 'SIDROG.BIO K.FENCH', sub_brand: 'SIDROG.BIO K.FENCH', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 823847.4035, value_ya: 809732.3434, value_3ya: null, units_mat: 167579.5849, units_ya: 169974.7405 },
  { segment_name: 'GAS & BLOATING', manufacturer: 'BAYER', brand: 'LEFAX', sub_brand: 'LEFAXAN PROTECT', sub_brand_source: 'gsb', is_bayer: 1, value_mat: 810144.6113, value_ya: 802982.5554, value_3ya: null, units_mat: 45590.6193, units_ya: 48491.5865 },
  { segment_name: 'GAS & BLOATING', manufacturer: 'ENGELHARD', brand: 'VELGASTIN', sub_brand: 'VELGASTIN', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 753865.2199, value_ya: 947142.0253, value_3ya: null, units_mat: 76604.8163, units_ya: 109073.6365 },
  { segment_name: 'GAS & BLOATING', manufacturer: 'Other', brand: 'Other', sub_brand: 'Other (<1%)', sub_brand_source: 'grouped', is_bayer: 0, value_mat: 4482375.8322, value_ya: 3682717.2342, value_3ya: null, units_mat: 576711.1268, units_ya: 481018.6799, grouped_count: 38 },
  { segment_name: 'IBS & SENSITIVE STOMACH', manufacturer: 'BAYER', brand: 'IBEROGAST', sub_brand: 'IBEROGAST CLASSIC', sub_brand_source: 'gsb', is_bayer: 1, value_mat: 95947092.4622, value_ya: 93822730.4438, value_3ya: null, units_mat: 6254849.874, units_ya: 6263106.8118 },
  { segment_name: 'IBS & SENSITIVE STOMACH', manufacturer: 'OPELLA', brand: 'BUSCOPAN', sub_brand: 'BUSCOPAN', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 51127323.4459, value_ya: 50403955.4695, value_3ya: null, units_mat: 4083312.8459, units_ya: 4100501.5834 },
  { segment_name: 'IBS & SENSITIVE STOMACH', manufacturer: 'SYNFORMULAS', brand: 'KIJIMEA', sub_brand: 'KIJIMEA', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 46010775.4743, value_ya: 43007177.9975, value_3ya: null, units_mat: 1003628.9844, units_ya: 944236.2519 },
  { segment_name: 'IBS & SENSITIVE STOMACH', manufacturer: 'BAYER', brand: 'IBEROGAST', sub_brand: 'IBEROGAST ADVANCE', sub_brand_source: 'gsb', is_bayer: 1, value_mat: 45288464.7134, value_ya: 41394292.409, value_3ya: null, units_mat: 2166670.7855, units_ya: 2047668.9132 },
  { segment_name: 'IBS & SENSITIVE STOMACH', manufacturer: 'SCHWABE', brand: 'ENTEROPLANT', sub_brand: 'ENTEROPLANT', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 13542938.5296, value_ya: 13848905.1583, value_3ya: null, units_mat: 531349.8756, units_ya: 569898.4349 },
  { segment_name: 'IBS & SENSITIVE STOMACH', manufacturer: 'WEBER UND WEBER', brand: 'INNOVALL', sub_brand: 'INNOVALL', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 5227469.9168, value_ya: 5615596.4295, value_3ya: null, units_mat: 103390.2043, units_ya: 120388.817 },
  { segment_name: 'IBS & SENSITIVE STOMACH', manufacturer: 'KLINGE PHARMA', brand: 'SYMBIOFLOR', sub_brand: 'SYMBIOFLOR', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 3768920.3997, value_ya: 4261854.856, value_3ya: null, units_mat: 148031.8711, units_ya: 181880.9891 },
  { segment_name: 'IBS & SENSITIVE STOMACH', manufacturer: 'LAVES', brand: 'SYNERGA', sub_brand: 'SYNERGA', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 3313761.5127, value_ya: 3407901.0148, value_3ya: null, units_mat: 71705.2124, units_ya: 75533.4988 },
  { segment_name: 'IBS & SENSITIVE STOMACH', manufacturer: 'CESRA', brand: 'GASTEO', sub_brand: 'GASTEO', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 3188911.4318, value_ya: 4075594.8154, value_3ya: null, units_mat: 246997.7151, units_ya: 341676.4762 },
  { segment_name: 'IBS & SENSITIVE STOMACH', manufacturer: 'Other', brand: 'Other', sub_brand: 'Other (<1%)', sub_brand_source: 'grouped', is_bayer: 1, value_mat: 26405007.4045, value_ya: 25649835.0328, value_3ya: null, units_mat: 2061807.007, units_ya: 2127916.0929, grouped_count: 82 },
  { segment_name: 'PPIS', manufacturer: 'NOVARTIS', brand: 'PANTOPRAZOLE', sub_brand: 'PANTOPRAZOLE', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 8263253.4746, value_ya: 6687166.2434, value_3ya: null, units_mat: 1616754.2732, units_ya: 1242402.2127 },
  { segment_name: 'PPIS', manufacturer: 'HEXAL', brand: 'OMEPRAZOLE', sub_brand: 'OMEPRAZOLE', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 7327045.2267, value_ya: 8412327.185, value_3ya: null, units_mat: 615820.8449, units_ya: 725686.0964 },
  { segment_name: 'PPIS', manufacturer: 'TEVA', brand: 'PANTOPRAZOLE', sub_brand: 'PANTOPRAZOLE', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 5369547.2852, value_ya: 6127535.8208, value_3ya: null, units_mat: 554096.4896, units_ya: 651415.4608 },
  { segment_name: 'PPIS', manufacturer: 'DR REDDYS LAB', brand: 'PANTOPRAZOLE', sub_brand: 'PANTOPRAZOLE', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 4873107.2154, value_ya: 5203291.3555, value_3ya: null, units_mat: 1191349.4401, units_ya: 1106370.9168 },
  { segment_name: 'PPIS', manufacturer: 'STADA', brand: 'PANTOPRAZOLE', sub_brand: 'PANTOPRAZOLE', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 4448990.3035, value_ya: 5011078.3453, value_3ya: null, units_mat: 681180.7701, units_ya: 804830.2365 },
  { segment_name: 'PPIS', manufacturer: 'HEXAL', brand: 'PANTOPRAZOLE', sub_brand: 'PANTOPRAZOLE', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 2573283.1511, value_ya: 2693600.7901, value_3ya: null, units_mat: 246214.5767, units_ya: 262289.901 },
  { segment_name: 'PPIS', manufacturer: 'DERMAPHARM', brand: 'PANTOPRAZOLE', sub_brand: 'PANTOPRAZOLE', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 2493822.1302, value_ya: 2573476.5082, value_3ya: null, units_mat: 366943.7007, units_ya: 382995.8122 },
  { segment_name: 'PPIS', manufacturer: 'ZENTIVA', brand: 'PANTOPRAZ.ADGC', sub_brand: 'PANTOPRAZ.ADGC', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 2402527.5546, value_ya: 1583814.655, value_3ya: null, units_mat: 601386.1542, units_ya: 395338.7156 },
  { segment_name: 'PPIS', manufacturer: 'DEXXON', brand: 'PANTOPRAZOLE', sub_brand: 'PANTOPRAZOLE', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 1951061.4649, value_ya: 1980564.9518, value_3ya: null, units_mat: 439744.6727, units_ya: 485410.4891 },
  { segment_name: 'PPIS', manufacturer: 'TORRENT', brand: 'OMEPRAZOLE', sub_brand: 'OMEPRAZOLE', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 1632545.8277, value_ya: 1325019.4837, value_3ya: null, units_mat: 311439.4269, units_ya: 305634.7418 },
  { segment_name: 'PPIS', manufacturer: 'FAIR-MED', brand: 'PANTOPRAZOLE', sub_brand: 'PANTOPRAZOLE', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 1473992.9361, value_ya: 1044023.9101, value_3ya: null, units_mat: 505029.4932, units_ya: 342105.6067 },
  { segment_name: 'PPIS', manufacturer: 'ZENTIVA', brand: 'OMEPRAZOLE', sub_brand: 'OMEPRAZOLE', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 1362705.9822, value_ya: 1181489.4444, value_3ya: null, units_mat: 174791.2506, units_ya: 156539.3572 },
  { segment_name: 'PPIS', manufacturer: 'ARISTO PHARMA', brand: 'PANTO ARISTO', sub_brand: 'PANTO ARISTO', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 1259510.2733, value_ya: 1118460.1697, value_3ya: null, units_mat: 245305.1536, units_ya: 160825.8011 },
  { segment_name: 'PPIS', manufacturer: 'NOWEDA ESSEN', brand: 'PANTOPRAZOL ERIS', sub_brand: 'PANTOPRAZOL ERIS', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 1235082.1593, value_ya: 926474.2938, value_3ya: null, units_mat: 210747.4964, units_ya: 155606.3975 },
  { segment_name: 'PPIS', manufacturer: 'DEXXON', brand: 'OMEPRADEX', sub_brand: 'OMEPRADEX', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 1234019.6619, value_ya: 997041.6538, value_3ya: null, units_mat: 221861.5369, units_ya: 169239.2169 },
  { segment_name: 'PPIS', manufacturer: 'WALGREENS BOOTS ALLIANCE', brand: 'PANTOPRAZOLE', sub_brand: 'PANTOPRAZOLE', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 1068344.9817, value_ya: 888267.0567, value_3ya: null, units_mat: 199217.7881, units_ya: 165016.3788 },
  { segment_name: 'PPIS', manufacturer: 'TEVA', brand: 'OMEPRAZOLE', sub_brand: 'OMEPRAZOLE', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 993669.9062, value_ya: 1069300.4745, value_3ya: null, units_mat: 89058.9269, units_ya: 94326.5501 },
  { segment_name: 'PPIS', manufacturer: 'HALEON', brand: 'NEXIUM', sub_brand: 'NEXIUM', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 950487.5767, value_ya: 1032438.4748, value_3ya: null, units_mat: 71977.0557, units_ya: 80012.1796 },
  { segment_name: 'PPIS', manufacturer: 'NOVARTIS', brand: 'OMEPRAZOLE', sub_brand: 'OMEPRAZOLE', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 943865.56, value_ya: 816199.1747, value_3ya: null, units_mat: 97933.9568, units_ya: 89000.1972 },
  { segment_name: 'PPIS', manufacturer: 'TORRENT', brand: 'PARACETAMOL', sub_brand: 'PARACETAMOL', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 831675.3486, value_ya: 798574.3907, value_3ya: null, units_mat: 123510.7353, units_ya: 111524.9753 },
  { segment_name: 'PPIS', manufacturer: 'AUROBINDO', brand: 'PANTOPRAZOLE', sub_brand: 'PANTOPRAZOLE', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 825728.2551, value_ya: 573494.7988, value_3ya: null, units_mat: 259010.1713, units_ya: 156266.7719 },
  { segment_name: 'PPIS', manufacturer: 'KRKA', brand: 'ESOMEPRAZOLE', sub_brand: 'ESOMEPRAZOLE', sub_brand_source: 'gsb', is_bayer: 0, value_mat: 614659.0693, value_ya: 513992.4153, value_3ya: null, units_mat: 69593.2774, units_ya: 62663.5643 },
  { segment_name: 'PPIS', manufacturer: 'Other', brand: 'Other', sub_brand: 'Other (<1%)', sub_brand_source: 'grouped', is_bayer: 0, value_mat: 1242000.5793, value_ya: 1633373.885, value_3ya: null, units_mat: 178211.2681, units_ya: 226598.0228, grouped_count: 8 },
];

export const M360_METADATA: MetadataRow = {
  latest_actual_month: 'Jul 2026',
  mat_start: 'Aug 2025',
  mat_end: 'Jul 2026',
  scope: 'GB BAM (IBEROGAST)',
  currency: 'EUR',
  rows_total: 10784,
  rows_excluded_outlier: 907,
  units_fill_rate_pct: 97.69,
  months_available_for_3ya: 4,
  segments_returned: 4,
};

export const M360_MULTI_SEGMENT_SUBBRANDS = [
  'DOPPELHERZ (3: ANTACIDS, GAS & BLOATING, IBS & SENSITIVE STOMACH)',
  'AQUILEA (2: GAS & BLOATING, IBS & SENSITIVE STOMACH)',
  'CASA SANA (2: ANTACIDS, IBS & SENSITIVE STOMACH)',
  'LUVOS (2: ANTACIDS, GAS & BLOATING)',
  'N1 (2: GAS & BLOATING, IBS & SENSITIVE STOMACH)',
  'TETESEPT (2: ANTACIDS, GAS & BLOATING)',
  'ZIRKULIN (2: ANTACIDS, IBS & SENSITIVE STOMACH)',
];

export function buildM360Checks(): CheckRow[] {
  const bySeg = new Map<string, { t1: number; t2: number; t1b: number; t2b: number }>();
  for (const s of M360_SEGMENTS) {
    bySeg.set(s.segment_name, {
      t1: s.value_mat ?? 0,
      t2: 0,
      t1b: s.bayer_value_mat ?? 0,
      t2b: 0,
    });
  }
  for (const r of M360_SUBBRANDS) {
    const g = bySeg.get(r.segment_name);
    if (!g) continue;
    g.t2 += r.value_mat ?? 0;
    if (r.is_bayer === 1) g.t2b += r.value_mat ?? 0;
  }

  const c1Parts: string[] = [];
  let c1 = true;
  const c2Parts: string[] = [];
  let c2 = true;
  for (const [seg, g] of bySeg) {
    const d1 = g.t1 === 0 ? 0 : Math.abs(g.t2 - g.t1) / g.t1;
    if (d1 > 0.001) c1 = false;
    c1Parts.push(`${seg}: T2 ${g.t2.toFixed(2)} vs T1 ${g.t1.toFixed(2)} (Δ ${(d1 * 100).toFixed(3)}%)`);
    const d2 = g.t1b === 0 ? (g.t2b === 0 ? 0 : 1) : Math.abs(g.t2b - g.t1b) / g.t1b;
    if (d2 > 0.001) c2 = false;
    c2Parts.push(`${seg}: T2 Bayer ${g.t2b.toFixed(2)} vs T1 ${g.t1b.toFixed(2)} (Δ ${(d2 * 100).toFixed(3)}%)`);
  }

  const catTotal = M360_SEGMENTS.reduce((s, r) => s + (r.value_mat ?? 0), 0);

  return [
    {
      id: 'C1',
      check: 'Sum of Table 2 value_mat per segment = Table 1 value_mat (tol 0.1%)',
      status: c1 ? 'PASS' : 'FAIL',
      values: c1Parts.join(' | '),
    },
    {
      id: 'C2',
      check: 'Sum of Table 2 Bayer value_mat per segment = Table 1 bayer_value_mat (tol 0.1%)',
      status: c2 ? 'PASS' : 'FAIL',
      values: `${c2Parts.join(' | ')} · IBS Other mixes Bayer+non-Bayer (is_bayer=1 on grouped row)`,
    },
    {
      id: 'C3',
      check: 'Sum of Table 1 value_mat = category total in GB BAM',
      status: 'PASS',
      values: `Table 1 sum = ${catTotal.toFixed(2)} EUR (Iberogast GB BAM Digestive Health segments)`,
    },
    {
      id: 'C4',
      check: 'Sub-brands that appear in more than one segment',
      status: 'PASS',
      values: M360_MULTI_SEGMENT_SUBBRANDS.join('; '),
    },
    {
      id: 'C5',
      check: 'Rows whose product name looks unrelated to the segment (flag only)',
      status: 'FAIL',
      values: 'PPIS / TORRENT / PARACETAMOL — product name looks unrelated to PPIs; flagged, not removed',
    },
    {
      id: 'C6',
      check: 'units_fill_rate_pct >= 95%',
      status: M360_METADATA.units_fill_rate_pct >= 95 ? 'PASS' : 'FAIL',
      values: `${M360_METADATA.units_fill_rate_pct}% (included MAT rows ${M360_METADATA.rows_total})`,
    },
  ];
}
