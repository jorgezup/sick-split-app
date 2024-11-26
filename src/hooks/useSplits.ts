// hooks/useSplits.ts

import { useState, useEffect, useCallback } from 'react';
import { StoredSplit } from "@/types"

export function useSplits() {
  const [splits, setSplits] = useState<StoredSplit[]>([]);

  useEffect(() => {
    // Load splits from localStorage on component mount
    const storedSplits = localStorage.getItem('splits');
    if (storedSplits) {
      setSplits(JSON.parse(storedSplits));
    }
  }, []);

  const addSplit = useCallback((split: { id: string; name: string }) => {
    const newSplit: StoredSplit = {
      ...split,
      createdAt: new Date().toISOString(),
      lastVisited: new Date().toISOString(),
    };
  
    setSplits(prev => {
      const updated = [newSplit, ...prev.filter(s => s.id !== split.id)];
      localStorage.setItem('splits', JSON.stringify(updated));
      return updated;
    });
  }, [])

  const updateLastVisited = useCallback((splitId: string) => {
    setSplits(prev => {
      const updated = prev.map(split =>
        split.id === splitId
          ? { ...split, lastVisited: new Date().toISOString() }
          : split
      );
      localStorage.setItem('splits', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeSplit = useCallback((splitId: string) => {
    setSplits(prev => {
      const updated = prev.filter(split => split.id !== splitId);
      localStorage.setItem('splits', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    splits,
    addSplit,
    updateLastVisited,
    removeSplit
  };
}