'use client';

import { Event } from '@/types';
import { AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';

interface EventsListProps {
  events: Event[];
}

const severityColors = {
  LOW: 'text-green-600 bg-green-50 border-green-200',
  MED: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  HIGH: 'text-orange-600 bg-orange-50 border-orange-200',
  CRITICAL: 'text-red-600 bg-red-50 border-red-200'
};

const severityIcons = {
  LOW: CheckCircle,
  MED: Clock,
  HIGH: AlertTriangle,
  CRITICAL: XCircle
};

export default function EventsList({ events }: EventsListProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No events found. Create an event to see AI analysis.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const SeverityIcon = event.severity ? severityIcons[event.severity] : Clock;
        const severityClass = event.severity ? severityColors[event.severity] : 'text-gray-600 bg-gray-50 border-gray-200';

        return (
          <div key={event.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">
                    {event.rawData.type || 'Unknown Event'}
                  </span>
                  {event.severity && (
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs border ${severityClass}`}>
                      <SeverityIcon size={12} />
                      {event.severity}
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                    event.processed ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'
                  }`}>
                    {event.processed ? 'Processed' : 'Processing...'}
                  </span>
                </div>

                {event.summary ? (
                  <p className="text-sm mb-2">{event.summary}</p>
                ) : (
                  <p className="text-sm text-muted-foreground mb-2">
                    {event.rawData.description || 'No description available'}
                  </p>
                )}

                {event.suggestedAction && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-2 text-sm">
                    <strong className="text-blue-800">Suggested Action:</strong>
                    <p className="text-blue-700 mt-1">{event.suggestedAction}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="text-xs text-muted-foreground border-t pt-2">
              <div className="flex justify-between">
                <span>Created: {new Date(event.createdAt).toLocaleString()}</span>
                <span>ID: {event.correlationId}</span>
              </div>
            </div>

            {/* Raw Data (collapsible) */}
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                View raw data
              </summary>
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                {JSON.stringify(event.rawData, null, 2)}
              </pre>
            </details>
          </div>
        );
      })}
    </div>
  );
}