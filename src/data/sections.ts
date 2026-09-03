import type { DocumentCategory } from '../types';

export type HubSectionSlug =
  | 'playbooks'
  | 'templates'
  | 'tb4l-training'
  | 'accelerator-outputs'
  | 'tb4l-glossary'
  | 'brand-frames';

export type HubSectionKind = 'documents' | 'glossary';

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
    tagline: 'Approved TB4L methodologies, frameworks, and best-practice guides.',
    description:
      'Approved TB4L methodologies, frameworks, and best-practice guides for brand planning and activation.',
    ctaLabel: 'Open Playbooks',
    accent: 'teal',
  },
  {
    slug: 'templates',
    title: 'Templates',
    kind: 'documents',
    category: 'Templates',
    eyebrow: 'Ready to use',
    tagline: 'Reusable TB4L templates, workshop materials, and planning assets.',
    description:
      'Reusable TB4L templates, workshop materials, and planning assets that keep markets aligned.',
    ctaLabel: 'Open Templates',
    accent: 'blue',
  },
  {
    slug: 'tb4l-training',
    title: 'Training',
    kind: 'documents',
    category: 'Training',
    eyebrow: 'Build capability',
    tagline: 'Learning materials, onboarding resources, and recorded sessions.',
    description:
      'Learning materials, onboarding resources, educational content, and recorded sessions.',
    ctaLabel: 'Open Training',
    accent: 'purple',
  },
  {
    slug: 'accelerator-outputs',
    title: 'Accelerators',
    kind: 'documents',
    category: 'Accelerator Outputs',
    eyebrow: 'Move faster',
    tagline: 'Ready-to-use tools, frameworks, and assets that help teams move faster.',
    description:
      'Ready-to-use tools, frameworks, and assets that help teams move faster in priority markets.',
    ctaLabel: 'Open Accelerators',
    accent: 'green',
  },
  {
    slug: 'brand-frames',
    title: 'Brand Frames',
    kind: 'documents',
    category: 'Brand Frames',
    eyebrow: 'Brand DNA',
    tagline: 'Brand strategy assets, positioning frameworks, and planning resources.',
    description:
      'Brand strategy assets, positioning frameworks, and planning resources across the six principles.',
    ctaLabel: 'Open Brand Frames',
    accent: 'blue',
  },
  {
    slug: 'tb4l-glossary',
    title: 'Glossary',
    kind: 'glossary',
    eyebrow: 'Shared language',
    tagline: 'Common TB4L terminology, definitions, and shared language.',
    description:
      'Common TB4L terminology, definitions, and shared language across Brand, Medical, Insights, and Agency partners.',
    ctaLabel: 'Open Glossary',
    accent: 'teal',
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
