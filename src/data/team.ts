export interface TeamMember {
  id: string;
  name: string;
  role: string;
  focus: string;
  region: string;
  emailLabel: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 't1',
    name: 'Amelia Hart',
    role: 'Global TB4L Lead',
    focus: 'Framework stewardship, Hub curation standards, stakeholder alignment',
    region: 'Global',
    emailLabel: 'tb4l.global@example.com',
  },
  {
    id: 't2',
    name: 'Jonas Keller',
    role: 'Accelerator Programme Lead',
    focus: 'Market Accelerators, output quality, cross-market learning',
    region: 'EMEA',
    emailLabel: 'tb4l.accelerators@example.com',
  },
  {
    id: 't3',
    name: 'Priya Nair',
    role: 'Capability & Training Lead',
    focus: 'Onboarding modules, workshop facilitation, shared language',
    region: 'Global',
    emailLabel: 'tb4l.training@example.com',
  },
  {
    id: 't4',
    name: 'Marcus Oliveira',
    role: 'Insights Partner',
    focus: 'Evidence standards, Discover quality, Deliver outcome indicators',
    region: 'LATAM',
    emailLabel: 'tb4l.insights@example.com',
  },
  {
    id: 't5',
    name: 'Yuki Sato',
    role: 'Market Excellence Partner',
    focus: 'Local adoption, Brand Frame coaching, Hub adoption',
    region: 'APAC',
    emailLabel: 'tb4l.markets@example.com',
  },
  {
    id: 't6',
    name: 'Elena Rossi',
    role: 'Chat & Knowledge Experience',
    focus: 'Contextual Chat sources, Genie guidance, content findability',
    region: 'Global',
    emailLabel: 'tb4l.experience@example.com',
  },
];
