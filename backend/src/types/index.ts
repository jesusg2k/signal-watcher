export interface AIAnalysis {
  summary: string;
  severity: 'LOW' | 'MED' | 'HIGH' | 'CRITICAL';
  suggestedAction: string;
}

export interface EventData {
  type: string;
  domain?: string;
  ip?: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface CreateWatchListRequest {
  name: string;
  description?: string;
  terms: string[];
}

export interface CreateEventRequest {
  watchListId: string;
  eventData: EventData;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  correlationId: string;
}