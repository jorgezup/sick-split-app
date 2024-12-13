// hooks/useGroup.ts
import { useState } from 'react';
import axios from 'axios';
import { Group } from '@/types';

export function useGroup(groupId?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [group, setGroup] = useState<Group | null>(null);

  const fetchGroup = async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      const response = await axios.get(`/api/groups/${groupId}`);
      setGroup(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch group');
      console.error('Error fetching group:', err);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (data: {
    name: string;
    description: string;
    currency: string;
    participants: { name: string }[];
  }) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/groups', data);
      return response.data;
    } catch (err) {
      setError('Failed to create group');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (data: {
    description: string;
    amount: number;
    paidById: string;
    splitBetween: string[];
  }) => {
    if (!groupId) return;
    setLoading(true);
    try {
      const response = await axios.post(`/api/groups/${groupId}/expenses`, data);
      setGroup(prev => prev ? {
        ...prev,
        expenses: [...prev.expenses, response.data]
      } : null);
      return response.data;
    } catch (err) {
      setError('Failed to add expense');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    group,
    loading,
    error,
    fetchGroup,
    createGroup,
    addExpense
  };
}