// app/group/[groupId]/page.tsx

"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Receipt,
  Users,
  ArrowLeft,
  Share2,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';
import { formatCurrency } from "@/lib/utils";
import SettleUpDialog from '@/components/settle-up-dialog';
import ExpenseSummary from '@/components/expense-summary';
import { Participant, Group } from "@/types"
import { useSplits } from '@/hooks/useSplits';
import AddExpenseDialog from '@/components/add-expense-dialog';

interface ExpenseFormData {
  description: string;
  amount: string;
  paidBy: string;
  splitBetween: string[];
}

const GroupViewPage = () => {
  const router = useRouter();
  const { groupId } = useParams();
  const { toast } = useToast();
  const { updateLastVisited } = useSplits();

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBalances, setShowBalances] = useState(true);
  const fetchingRef = useRef(false);

  const [, setExpenseForm] = useState<ExpenseFormData>({
    description: '',
    amount: '',
    paidBy: '',
    splitBetween: []
  });

  // Fetch group data with useCallback to prevent recreation on every render
  const fetchGroup = useCallback(async () => {
    if (fetchingRef.current) return;

    try {
      fetchingRef.current = true;
      const response = await axios.get(`/api/groups/${groupId}`);
      setGroup(response.data);

      // Initialize expense form with first participant
      if (response.data.participants.length > 0) {
        setExpenseForm(prev => ({
          ...prev,
          paidBy: response.data.participants[0].id,
          splitBetween: response.data.participants.map((p: Participant) => p.id)
        }));
      }

      // Update last visited
      if (response.data.id) {
        updateLastVisited(response.data.id);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load group data",
        variant: "destructive",
      });
      console.error('Error fetching group data:', error);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [groupId, toast, updateLastVisited]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  // Memoize calculations
  const balances = React.useMemo(() => {
    if (!group) return {};

    const balances: { [key: string]: number } = {};
    group.participants.forEach(p => balances[p.id] = 0);

    group.expenses.forEach(expense => {
      balances[expense.paidBy.id] += expense.amount;
      expense.participants.forEach(({ share, participant }) => {
        balances[participant.id] -= share;
      });
    });

    return balances;
  }, [group]);

  // Memoize expense list component to prevent unnecessary re-renders
  const ExpensesList = React.useMemo(() => {
    if (!group) return null;

    return (
      <div className="space-y-4">
        {group.expenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No expenses yet. Add your first expense!
          </div>
        ) : (
          group.expenses.map(expense => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Receipt className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium">{expense.description}</div>
                  <div className="text-sm text-gray-500">
                    Paid by {expense.paidBy.name}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {formatCurrency(expense.amount, group.currency)}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(expense.date).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }, [group]);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Success",
        description: "Link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
      console.error('Error copying link:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading group data...</span>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">Group not found</h1>
          <Button onClick={() => router.push('/')}>Return Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto max-w-2xl p-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
              <p className="text-sm text-gray-500">{group.description}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <AddExpenseDialog
            participants={group.participants}
            currency={group.currency}
            onAddExpense={async (data) => {
              try {
                const response = await axios.post(`/api/groups/${groupId}/expenses`, data);
                setGroup(prev => prev ? {
                  ...prev,
                  expenses: [...prev.expenses, response.data]
                } : null);

                toast({
                  title: "Success",
                  description: "Expense added successfully",
                });
              } catch (error) {
                toast({
                  title: "Error",
                  description: "Failed to add expense",
                  variant: "destructive",
                });
                console.error('Error adding expense:', error);
              }
            }}
          />

          <SettleUpDialog
            participants={group.participants}
            balances={balances}
            currency={group.currency}
          />

          <ExpenseSummary
            expenses={group.expenses}
            participants={group.participants}
            currency={group.currency}
          />
        </div>

        {/* Balance Overview */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Balances</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBalances(!showBalances)}
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${showBalances ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          {showBalances && (
            <CardContent>
              <div className="space-y-3">
                {group.participants.map(participant => (
                  <div key={participant.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <Users className="w-4 h-4 text-gray-600" />
                      </div>
                      <span>{participant.name}</span>
                    </div>
                    <span className={`font-medium ${balances[participant.id] > 0 ? 'text-green-600' :
                      balances[participant.id] < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                      {formatCurrency(balances[participant.id], group.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Expenses List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[350px] pr-4">
              {ExpensesList}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GroupViewPage;