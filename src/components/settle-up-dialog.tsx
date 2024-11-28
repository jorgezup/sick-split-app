import React, { useCallback, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Wallet,
  ArrowRight,
  Download,
  FileDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from '@/lib/utils';

interface Settlement {
  from: Participant;
  to: Participant;
  amount: number;
  completed?: boolean;
}

interface Participant {
  id: string;
  name: string;
}

interface SettleUpDialogProps {
  participants: Participant[];
  balances: { [key: string]: number };
  currency: string;
}

const SettleUpDialog = ({ participants, balances, currency }: SettleUpDialogProps) => {
  // Calculate settlements using useCallback
  const calculateSettlements = useCallback(() => {
    const settlements: Settlement[] = [];

    // Filter and map participants with non-zero balances
    const debtors = participants
      .filter(p => balances[p.id] < 0)
      .map(p => ({
        participant: p,
        amount: Math.abs(balances[p.id])
      }))
      .sort((a, b) => b.amount - a.amount);

    const creditors = participants
      .filter(p => balances[p.id] > 0)
      .map(p => ({
        participant: p,
        amount: balances[p.id]
      }))
      .sort((a, b) => b.amount - a.amount);

    // Match debtors with creditors and calculate settlements
    while (debtors.length > 0 && creditors.length > 0) {
      const debtor = debtors[0];
      const creditor = creditors[0];

      const amount = Math.min(debtor.amount, creditor.amount);

      // Only create settlement for non-trivial amounts
      if (amount >= 0.01) {
        settlements.push({
          from: debtor.participant,
          to: creditor.participant,
          amount
        });
      }

      // Update remaining amounts
      debtor.amount -= amount;
      creditor.amount -= amount;

      // Remove settled participants
      if (debtor.amount < 0.01) debtors.shift();
      if (creditor.amount < 0.01) creditors.shift();
    }

    return settlements;
  }, [participants, balances]);

  // Use useMemo to store and recalculate settlements when dependencies change
  const currentSettlements = useMemo(() => calculateSettlements(), [calculateSettlements]);

  // Store completion status separately using a Set
  const [completedSettlementKeys, setCompletedSettlementKeys] = useState<Set<string>>(new Set());

  // Generate a unique key for each settlement
  const getSettlementKey = useCallback((settlement: Settlement) => {
    return `${settlement.from.id}-${settlement.to.id}-${settlement.amount.toFixed(2)}`;
  }, []);

  // Toggle settlement completion status
  const toggleSettlement = useCallback((settlement: Settlement) => {
    setCompletedSettlementKeys(prev => {
      const key = getSettlementKey(settlement);
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, [getSettlementKey]);

  // Combine current settlements with completion status
  const settlements = useMemo(() => {
    return currentSettlements.map(settlement => ({
      ...settlement,
      completed: completedSettlementKeys.has(getSettlementKey(settlement))
    }));
  }, [currentSettlements, completedSettlementKeys, getSettlementKey]);

  // Export settlements to CSV
  const exportSettlements = useCallback((format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      const headers = "From,To,Amount,Status\n";
      const csvContent = settlements.reduce((acc, settlement) => {
        return acc + `${settlement.from.name},${settlement.to.name},${formatCurrency(settlement.amount, currency)},${settlement.completed ? 'Completed' : 'Pending'}\n`;
      }, headers);

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `settlements-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, [settlements, currency]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Wallet className="w-4 h-4 mr-2" />
          Settle Up
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Settle Up</DialogTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="mr-4">
                  <FileDown className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => exportSettlements('csv')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <DialogDescription>
            Heres the most efficient way to settle all debts
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] mt-4">
          {settlements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              All settled! No payments needed.
            </div>
          ) : (
            <div className="space-y-3">
              {settlements.map((settlement) => (
                <Card
                  key={getSettlementKey(settlement)}
                  className={`p-4 transition-colors ${
                    settlement.completed ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={settlement.completed}
                      onCheckedChange={() => toggleSettlement(settlement)}
                    />
                    <div className="flex-1 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{settlement.from.name}</span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{settlement.to.name}</span>
                      </div>
                      <span className={`font-bold ${
                        settlement.completed ? 'text-green-600' : 'text-purple-600'
                      }`}>
                        {formatCurrency(settlement.amount, currency)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="mt-4 space-y-2">
          <div className="text-sm text-gray-500">
            Mark settlements as complete when payments are made.
          </div>
          <div className="flex justify-between text-sm">
            <span>Completed:</span>
            <span className="font-medium">
              {settlements.filter(s => s.completed).length} of {settlements.length}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettleUpDialog;