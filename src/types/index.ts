export type DocumentCategory =
  | 'Playbooks'
  | 'Templates'
  | 'Training'
  | 'Brand Frames'
  | 'Brand & Strategy'
  | 'Accelerator Outputs'
  | 'Global Best Practices'
  | 'Discover Templates';

export type DocumentType =
  | 'Framework'
  | 'Playbook'
  | 'Template'
  | 'Training Module'
  | 'Report'
  | 'Case Study'
  | 'Plan';

export type FileFormat = 'PDF' | 'PPTX' | 'DOCX' | 'MD';

export interface KnowledgeDocument {
  id: string;
  title: string;
  description: string;
  brand: string;
  market: string;
  category: DocumentCategory;
  year: number;
  documentType: DocumentType;
  fileFormat: FileFormat;
  lastUpdated: string;
  summary: string;
  keyTopics: string[];
  whyRelevant: string;
}

export interface HubFilters {
  brand: string;
  market: string;
  category: string;
  documentType: string;
  year: string;
}

export interface ChatSource {
  id: string;
  title: string;
  kind: 'document' | 'genie' | 'general';
}

export type MessageRole = 'user' | 'assistant' | 'system';

export type FeedbackValue = 'like' | 'dislike' | null;

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  citations?: string[];
  timestamp: number;
  feedback?: FeedbackValue;
  isGenie?: boolean;
  error?: boolean;
}

export type GenieStatus = 'idle' | 'loading' | 'success' | 'error' | 'cancelled';

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  sources: ChatSource[];
  genieEnabled: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface AppState {
  selectedDocumentIds: string[];
  activeSources: ChatSource[];
  chatMessages: ChatMessage[];
  chatSessions: ChatSession[];
  activeSessionId: string;
  filters: HubFilters;
  genieEnabled: boolean;
  genieStatus: GenieStatus;
}
