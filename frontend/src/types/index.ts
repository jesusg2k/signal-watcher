export interface WatchList {
  id: string;
  name: string;
  description?: string;
  terms: string[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    events: number;
  };
}

export interface Event {
  id: string;
  watchListId: string;
  watchList?: {
    name: string;
  };
  rawData: any;
  summary?: string;
  severity?: 'LOW' | 'MED' | 'HIGH' | 'CRITICAL';
  suggestedAction?: string;
  processed: boolean;
  correlationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventData {
  type: string;
  domain?: string;
  ip?: string;
  description: string;
  metadata?: Record<string, any>;
}