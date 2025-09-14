const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:3001';

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  correlationId: string;
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}/api${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }
      
      return data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Network error');
    }
  }

  // Watch Lists
  async getWatchLists() {
    return this.request('/watch-lists');
  }

  async getWatchList(id: string) {
    return this.request(`/watch-lists/${id}`);
  }

  async createWatchList(data: { name: string; description?: string; terms: string[] }) {
    return this.request('/watch-lists', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteWatchList(id: string) {
    return this.request(`/watch-lists/${id}`, {
      method: 'DELETE',
    });
  }

  // Events
  async getEvents(watchListId?: string) {
    const query = watchListId ? `?watchListId=${watchListId}` : '';
    return this.request(`/events${query}`);
  }

  async getEvent(id: string) {
    return this.request(`/events/${id}`);
  }

  async createEvent(data: { watchListId: string; eventData: any }) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new APIClient(API_BASE_URL);
export type { APIResponse };