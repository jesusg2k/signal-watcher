'use client';

import { useState, useEffect } from 'react';
import { WatchList, Event } from '@/types';
import { apiClient } from '@/lib/api';
import WatchListCard from '@/components/WatchListCard';
import CreateWatchListForm from '@/components/CreateWatchListForm';
import EventsList from '@/components/EventsList';
import SimulateEventForm from '@/components/SimulateEventForm';

export default function HomePage() {
  const [watchLists, setWatchLists] = useState<WatchList[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedWatchList, setSelectedWatchList] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWatchLists = async () => {
    try {
      const response = await apiClient.getWatchLists();
      setWatchLists(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load watch lists');
    }
  };

  const loadEvents = async () => {
    try {
      const response = await apiClient.getEvents(selectedWatchList || undefined);
      setEvents(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadWatchLists(), loadEvents()]);
      setLoading(false);
    };
    loadData();
  }, [selectedWatchList]);

  const handleWatchListCreated = () => {
    loadWatchLists();
  };

  const handleEventCreated = () => {
    loadEvents();
  };

  const handleWatchListDeleted = (id: string) => {
    setWatchLists(prev => prev.filter(wl => wl.id !== id));
    if (selectedWatchList === id) {
      setSelectedWatchList(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Watch Lists Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Watch Lists</h2>
            <CreateWatchListForm onSuccess={handleWatchListCreated} />
          </div>
          
          <div className="space-y-4">
            {watchLists.length === 0 ? (
              <p className="text-muted-foreground">No watch lists created yet.</p>
            ) : (
              watchLists.map((watchList) => (
                <WatchListCard
                  key={watchList.id}
                  watchList={watchList}
                  isSelected={selectedWatchList === watchList.id}
                  onSelect={() => setSelectedWatchList(
                    selectedWatchList === watchList.id ? null : watchList.id
                  )}
                  onDelete={() => handleWatchListDeleted(watchList.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Events Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Events {selectedWatchList && `(${watchLists.find(wl => wl.id === selectedWatchList)?.name})`}
            </h2>
            {selectedWatchList && (
              <SimulateEventForm 
                watchListId={selectedWatchList} 
                onSuccess={handleEventCreated} 
              />
            )}
          </div>

          {!selectedWatchList ? (
            <p className="text-muted-foreground">Select a watch list to view events.</p>
          ) : (
            <EventsList events={events} />
          )}
        </div>
      </div>
    </div>
  );
}