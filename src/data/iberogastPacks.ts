/**
 * Official Iberogast Classic / Advance packshots (public/brands).
 * Used in Landscape journey and Competition Classic vs Advance.
 */
const base = import.meta.env.BASE_URL;

export type IberogastLinePack = {
  id: 'classic' | 'advance';
  label: string;
  short: string;
  image: string;
  accent: string;
};

export const IBEROGAST_LINE_PACKS: IberogastLinePack[] = [
  {
    id: 'classic',
    label: 'Iberogast Classic',
    short: 'Classic',
    image: `${base}brands/iberogast-classic-pack-v2.jpg`,
    accent: '#1f5c3a',
  },
  {
    id: 'advance',
    label: 'Iberogast Advance',
    short: 'Advance',
    image: `${base}brands/iberogast-advance-pack.jpg`,
    accent: '#6b3a8c',
  },
];

export const IBEROGAST_FOCUS_PACK = IBEROGAST_LINE_PACKS[0].image;
