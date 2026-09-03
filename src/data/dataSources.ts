export type DataSourceStatus = 'connected' | 'coming_soon' | 'planned' | 'unavailable';

export interface DataSource {
  id: string;
  name: string;
  description: string;
  status: DataSourceStatus;
  availability?: string;
  lastRefresh?: string;
  usage?: string;
}

export const DATA_SOURCE_STATUS_LABEL: Record<DataSourceStatus, string> = {
  connected: 'Connected',
  coming_soon: 'Coming Soon',
  planned: 'Planned',
  unavailable: 'Unavailable',
};

export const DATA_SOURCES: DataSource[] = [
  {
    id: 'm360',
    name: 'M360',
    description:
      'Consumer Health performance data available through direct integration.',
    status: 'connected',
    availability: 'Available in TB4L Chat',
    lastRefresh: '2026-03-28',
    usage: 'Connect explicitly in TB4L Chat before asking data questions. Never auto-triggered.',
  },
  {
    id: 'brand-analytics',
    name: 'Brand Analytics',
    description: 'Marketing performance and KPI datasets.',
    status: 'coming_soon',
    availability: 'Integration in progress',
  },
  {
    id: 'consumer-insights',
    name: 'Consumer Insights',
    description: 'Research, survey, and consumer intelligence data.',
    status: 'coming_soon',
    availability: 'Integration in progress',
  },
  {
    id: 'commercial-performance',
    name: 'Commercial Performance',
    description: 'Sales and retail performance data.',
    status: 'coming_soon',
    availability: 'Integration in progress',
  },
  {
    id: 'bht',
    name: 'BHT',
    description: 'Brand health tracking and consumer perception metrics.',
    status: 'coming_soon',
    availability: 'Integration in progress',
  },
  {
    id: 'sustainability',
    name: 'Sustainability Metrics',
    description: 'ESG and sustainability-related metrics and reporting.',
    status: 'planned',
    availability: 'Roadmap',
  },
  {
    id: 'fico',
    name: 'FICO',
    description: 'Financial and commercial performance indicators.',
    status: 'planned',
    availability: 'Roadmap',
  },
  {
    id: 'mmm',
    name: 'MMM',
    description: 'Marketing mix modeling insights for investment decisions.',
    status: 'planned',
    availability: 'Roadmap',
  },
];
