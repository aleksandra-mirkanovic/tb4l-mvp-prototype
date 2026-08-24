import type { DocumentCategory } from '../types';

export type HubSectionSlug =
  | 'playbooks'
  | 'templates'
  | 'tb4l-training'
  | 'accelerator-outputs'
  | 'tb4l-glossary'
  | 'team';

export type HubSectionKind = 'documents' | 'glossary' | 'team';

export interface HubSection {
  slug: HubSectionSlug;
  title: string;
  kind: HubSectionKind;
  category?: DocumentCategory;
  eyebrow: string;
  tagline: string;
  description: string;
  ctaLabel: string;
  accent: 'teal' | 'blue' | 'purple' | 'green';
}

export const HUB_SECTIONS: HubSection[] = [
  {
    slug: 'playbooks',
    title: 'Playbooks',
    kind: 'documents',
    category: 'Playbooks',
    eyebrow: 'How we work',
    tagline: 'Proven steps for brand planning and activation',
    description:
      'Actionable playbooks that turn Trusted Brands for Life principles into workshops, checklists, and day-to-day rituals across Discover, Define, Design, and Deliver.',
    ctaLabel: 'Browse playbooks',
    accent: 'teal',
  },
  {
    slug: 'templates',
    title: 'Templates',
    kind: 'documents',
    category: 'Templates',
    eyebrow: 'Ready to use',
    tagline: 'Start faster with curated TB4L artefacts',
    description:
      'Brand Frames and Discover worksheets that keep markets aligned on brand DNA and growth opportunities—without starting from a blank page.',
    ctaLabel: 'Browse templates',
    accent: 'blue',
  },
  {
    slug: 'tb4l-training',
    title: 'TB4L Training',
    kind: 'documents',
    category: 'TB4L Training',
    eyebrow: 'Build capability',
    tagline: 'Build capability through learning-by-doing',
    description:
      'Foundational modules and facilitation guides so teams share TB4L language—stages, Brand Frames, and Road to Billions expectations—supported by Accelerators and peer-led development.',
    ctaLabel: 'Browse training',
    accent: 'purple',
  },
  {
    slug: 'accelerator-outputs',
    title: 'Accelerator Outputs',
    kind: 'documents',
    category: 'Accelerator Outputs',
    eyebrow: 'Market proof',
    tagline: 'Learn from markets that have already accelerated',
    description:
      'Real Accelerator deliverables from priority markets—ambition, journeys, activation roadmaps, and learning agendas you can adapt locally.',
    ctaLabel: 'Browse outputs',
    accent: 'green',
  },
  {
    slug: 'tb4l-glossary',
    title: 'TB4L Glossary',
    kind: 'glossary',
    eyebrow: 'Shared language',
    tagline: 'Clear definitions for every TB4L term',
    description:
      'A curated glossary so Brand, Medical, Insights, and Agency partners mean the same thing when they say Discover, Define, Design, Deliver, or Brand Frames.',
    ctaLabel: 'Open glossary',
    accent: 'teal',
  },
  {
    slug: 'team',
    title: 'Team',
    kind: 'team',
    eyebrow: 'People behind TB4L',
    tagline: 'Meet the teams enabling brand excellence',
    description:
      'Connect with the global TB4L enablement, insights, and market excellence partners who support Hub content, Chat guidance, and Accelerator programmes.',
    ctaLabel: 'Meet the team',
    accent: 'purple',
  },
];

export function getHubSectionBySlug(slug: string): HubSection | undefined {
  return HUB_SECTIONS.find((s) => s.slug === slug);
}

export function matchesHubCategory(docCategory: string, sectionCategory: string) {
  if (sectionCategory === 'Templates') {
    return docCategory === 'Templates' || docCategory === 'Discover Templates';
  }
  return docCategory === sectionCategory;
}
