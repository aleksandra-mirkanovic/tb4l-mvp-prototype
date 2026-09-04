export type TeamSide = 'core' | 'it';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  focus: string;
  region: string;
  emailLabel: string;
  /** TB4L Core Team vs IT product/engineering */
  side: TeamSide;
}

function emailFromName(name: string): string {
  return `${name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\s-]/g, '')
    .trim()
    .replace(/\s+/g, '.')}@example.com`;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 't-core-1',
    name: 'Douglas Stewart',
    role: 'Sr Mgr Strategic Initiatives & Op Ex',
    focus: 'Strategic initiatives, operational excellence, and TB4L programme coordination',
    region: 'Global',
    emailLabel: emailFromName('Douglas Stewart'),
    side: 'core',
  },
  {
    id: 't-core-2',
    name: 'Christoph Bremen',
    role: 'Commercial Acceleration',
    focus: 'Commercial acceleration and market execution support',
    region: 'Global',
    emailLabel: emailFromName('Christoph Bremen'),
    side: 'core',
  },
  {
    id: 't-core-3',
    name: 'Tetiana Ohnieva',
    role: 'Multi-Media & Events',
    focus: 'Multi-media, events, and enablement moments across TB4L',
    region: 'Global',
    emailLabel: emailFromName('Tetiana Ohnieva'),
    side: 'core',
  },
  {
    id: 't-core-4',
    name: 'Marcela Lopez',
    role: 'Head of Portfolio Growth CH APAC & LATAM',
    focus: 'Portfolio growth leadership across Consumer Health APAC and LATAM',
    region: 'APAC & LATAM',
    emailLabel: emailFromName('Marcela Lopez'),
    side: 'core',
  },
  {
    id: 't-core-5',
    name: 'Juan Carlos Zea',
    role: 'LatAm Strategic Marketing Head',
    focus: 'LATAM strategic marketing and brand growth priorities',
    region: 'LATAM',
    emailLabel: emailFromName('Juan Carlos Zea'),
    side: 'core',
  },
  {
    id: 't-core-6',
    name: 'Christina Caruso Nevoso',
    role: 'Dir Mktg Excellence',
    focus: 'Marketing excellence standards, capability, and best-practice sharing',
    region: 'Global',
    emailLabel: emailFromName('Christina Caruso Nevoso'),
    side: 'core',
  },
  {
    id: 't-core-7',
    name: 'Deniz Can',
    role: 'Capability Director DBA',
    focus: 'DBA capability building and team enablement',
    region: 'Global',
    emailLabel: emailFromName('Deniz Can'),
    side: 'core',
  },
  {
    id: 't-core-8',
    name: 'Kam Bhangoe-Young',
    role: 'Capability Director Category & Customer',
    focus: 'Category and customer capability programmes',
    region: 'Global',
    emailLabel: emailFromName('Kam Bhangoe-Young'),
    side: 'core',
  },
  {
    id: 't-it-1',
    name: 'Aleksandra Mirkanovic',
    role: 'Product Manager',
    focus: 'TB4L product direction, Hub & Chat MVP, stakeholder alignment',
    region: 'IT',
    emailLabel: emailFromName('Aleksandra Mirkanovic'),
    side: 'it',
  },
  {
    id: 't-it-2',
    name: 'Blazej Wiorek',
    role: 'Tech Lead',
    focus: 'Architecture, delivery quality, Hub & Chat technical direction',
    region: 'IT',
    emailLabel: emailFromName('Blazej Wiorek'),
    side: 'it',
  },
];

export const CORE_TEAM_MEMBERS = TEAM_MEMBERS.filter((m) => m.side === 'core');
export const IT_TEAM_MEMBERS = TEAM_MEMBERS.filter((m) => m.side === 'it');

/** @deprecated Use CORE_TEAM_MEMBERS */
export const BUSINESS_TEAM_MEMBERS = CORE_TEAM_MEMBERS;

export function getTeamInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
