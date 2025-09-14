'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { Plus, X } from 'lucide-react';

interface CreateWatchListFormProps {
  onSuccess: () => void;
}

export default function CreateWatchListForm({ onSuccess }: CreateWatchListFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [terms, setTerms] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);

  const addTerm = () => {
    setTerms([...terms, '']);
  };

  const removeTerm = (index: number) => {
    setTerms(terms.filter((_, i) => i !== index));
  };

  const updateTerm = (index: number, value: string) => {
    const newTerms = [...terms];
    newTerms[index] = value;
    setTerms(newTerms);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validTerms = terms.filter(term => term.trim());
    if (!name.trim() || validTerms.length === 0) {
      alert('Please provide a name and at least one term');
      return;
    }

    setLoading(true);
    try {
      await apiClient.createWatchList({
        name: name.trim(),
        description: description.trim() || undefined,
        terms: validTerms
      });
      
      // Reset form
      setName('');
      setDescription('');
      setTerms(['']);
      setIsOpen(false);
      onSuccess();
    } catch (error) {
      alert('Failed to create watch list');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
      >
        <Plus size={16} />
        New Watch List
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Create Watch List</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-secondary rounded"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., Suspicious Domains"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded px-3 py-2 h-20 resize-none"
              placeholder="Optional description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Watch Terms *</label>
            <div className="space-y-2">
              {terms.map((term, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={term}
                    onChange={(e) => updateTerm(index, e.target.value)}
                    className="flex-1 border rounded px-3 py-2"
                    placeholder="e.g., malware, phishing, suspicious-domain.com"
                  />
                  {terms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTerm(index)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addTerm}
                className="text-sm text-primary hover:underline"
              >
                + Add another term
              </button>
            </div>
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
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}