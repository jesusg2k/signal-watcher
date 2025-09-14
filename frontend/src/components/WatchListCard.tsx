'use client';

import { WatchList } from '@/types';
import { apiClient } from '@/lib/api';
import { Trash2, Eye, EyeOff } from 'lucide-react';

interface WatchListCardProps {
  watchList: WatchList;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export default function WatchListCard({ watchList, isSelected, onSelect, onDelete }: WatchListCardProps) {
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this watch list?')) {
      try {
        await apiClient.deleteWatchList(watchList.id);
        onDelete();
      } catch (error) {
        alert('Failed to delete watch list');
      }
    }
  };

  return (
    <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
      isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1" onClick={onSelect}>
          <h3 className="font-medium">{watchList.name}</h3>
          {watchList.description && (
            <p className="text-sm text-muted-foreground mt-1">{watchList.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>{watchList.terms.length} terms</span>
            <span>{watchList._count?.events || 0} events</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {watchList.terms.slice(0, 3).map((term, index) => (
              <span key={index} className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                {term}
              </span>
            ))}
            {watchList.terms.length > 3 && (
              <span className="text-xs text-muted-foreground">+{watchList.terms.length - 3} more</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={onSelect}
            className="p-1 hover:bg-secondary rounded"
            title={isSelected ? 'Hide events' : 'Show events'}
          >
            {isSelected ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-destructive/10 text-destructive rounded"
            title="Delete watch list"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}