import React, { useState } from 'react';
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
  // Add the calculateSettlements function within the component
  const calculateSettlements = () => {
    const settlements: Settlement[] = [];
    
    // Create arrays of debtors and creditors
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

    // Match debtors with creditors
    while (debtors.length > 0 && creditors.length > 0) {
      const debtor = debtors[0];
      const creditor = creditors[0];
      
      const amount = Math.min(debtor.amount, creditor.amount);
      
      if (amount >= 0.01) { // Only add settlements for non-zero amounts
        settlements.push({
          from: debtor.participant,
          to: creditor.participant,
          amount,
          completed: false
        });
      }

      // Update amounts
      debtor.amount -= amount;
      creditor.amount -= amount;

      // Remove participants with settled debts
      if (debtor.amount < 0.01) debtors.shift();
      if (creditor.amount < 0.01) creditors.shift();
    }

    return settlements;
  };

  const [settlements, setSettlements] = useState<Settlement[]>(calculateSettlements());

  const toggleSettlement = (index: number) => {
    setSettlements(prev => prev.map((s, i) => 
      i === index ? { ...s, completed: !s.completed } : s
    ));
  };

  const exportSettlements = (format: 'csv' | 'pdf') => {
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
    }
  };

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
              {settlements.map((settlement, index) => (
                <Card 
                  key={index} 
                  className={`p-4 transition-colors ${
                    settlement.completed ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={settlement.completed}
                      onCheckedChange={() => toggleSettlement(index)}
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