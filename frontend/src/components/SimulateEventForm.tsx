'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { EventData } from '@/types';
import { Plus, X } from 'lucide-react';

interface SimulateEventFormProps {
  watchListId: string;
  onSuccess: () => void;
}

const eventTemplates = [
  {
    name: 'Suspicious Domain',
    data: {
      type: 'domain_detection',
      domain: 'suspicious-site.com',
      description: 'New domain registered with suspicious patterns',
      metadata: { registrar: 'Unknown', creation_date: new Date().toISOString() }
    }
  },
  {
    name: 'Malware Detection',
    data: {
      type: 'malware_detection',
      ip: '192.168.1.100',
      description: 'Malware detected on endpoint',
      metadata: { malware_type: 'trojan', severity: 'high' }
    }
  },
  {
    name: 'Phishing Attempt',
    data: {
      type: 'phishing_detection',
      domain: 'fake-bank.com',
      description: 'Phishing site mimicking legitimate banking service',
      metadata: { target_brand: 'Major Bank', confidence: 0.95 }
    }
  }
];

export default function SimulateEventForm({ watchListId, onSuccess }: SimulateEventFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [eventData, setEventData] = useState<EventData>(eventTemplates[0].data);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      await apiClient.createEvent({
        watchListId,
        eventData
      });
      
      setIsOpen(false);
      onSuccess();
    } catch (error) {
      alert('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = (template: typeof eventTemplates[0]) => {
    setEventData({ ...template.data });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded hover:bg-secondary/80"
      >
        <Plus size={16} />
        Simulate Event
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Simulate Event</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-secondary rounded"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Quick Templates</label>
          <div className="flex flex-wrap gap-2">
            {eventTemplates.map((template, index) => (
              <button
                key={index}
                type="button"
                onClick={() => loadTemplate(template)}
                className="text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded"
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Event Type *</label>
            <input
              type="text"
              value={eventData.type}
              onChange={(e) => setEventData({ ...eventData, type: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., domain_detection, malware_alert"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea
              value={eventData.description}
              onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
              className="w-full border rounded px-3 py-2 h-20 resize-none"
              placeholder="Describe the security event..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Domain</label>
              <input
                type="text"
                value={eventData.domain || ''}
                onChange={(e) => setEventData({ ...eventData, domain: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">IP Address</label>
              <input
                type="text"
                value={eventData.ip || ''}
                onChange={(e) => setEventData({ ...eventData, ip: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="192.168.1.1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Metadata (JSON)</label>
            <textarea
              value={JSON.stringify(eventData.metadata || {}, null, 2)}
              onChange={(e) => {
                try {
                  const metadata = JSON.parse(e.target.value);
                  setEventData({ ...eventData, metadata });
                } catch {
                  // Invalid JSON, ignore
                }
              }}
              className="w-full border rounded px-3 py-2 h-24 resize-none font-mono text-sm"
              placeholder='{"key": "value"}'
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 border rounded px-4 py-2 hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground rounded px-4 py-2 hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}