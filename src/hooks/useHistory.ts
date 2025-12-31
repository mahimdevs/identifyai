import { useState, useEffect, useCallback } from 'react';
import { AnalysisResult } from '@/types/analysis';

const STORAGE_KEY = 'visual-ai-history';
const MAX_HISTORY = 50;

export const useHistory = () => {
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse history:', e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const addToHistory = useCallback((result: AnalysisResult) => {
    setHistory(prev => {
      const newHistory = [result, ...prev.filter(h => h.id !== result.id)];
      return newHistory.slice(0, MAX_HISTORY);
    });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setHistory(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  }, []);

  const deleteItem = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setHistory([]);
  }, []);

  const updateNotes = useCallback((id: string, notes: string) => {
    setHistory(prev =>
      prev.map(item => (item.id === id ? { ...item, notes } : item))
    );
  }, []);

  return {
    history,
    addToHistory,
    toggleFavorite,
    deleteItem,
    clearAll,
    updateNotes,
  };
};
