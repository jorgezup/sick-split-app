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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PieChart, Receipt, User } from "lucide-react";
import {Expense, Participant} from "@/types";


interface ExpenseSummaryProps {
  expenses: Expense[];
  participants: Participant[];
  currency: string;
}

const ExpenseSummary = ({ expenses, participants, currency }: ExpenseSummaryProps) => {
  // Group expenses by payer
  const expensesByPayer = participants.map(participant => {
    const participantExpenses = expenses.filter(
      expense => expense.paidBy.id === participant.id
    );
    
    const totalPaid = participantExpenses.reduce(
      (sum, expense) => sum + expense.amount, 
      0
    );

    return {
      participant,
      expenses: participantExpenses,
      total: totalPaid
    };
  }).filter(group => group.expenses.length > 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <PieChart className="w-4 h-4 mr-2" />
          Expense Summary
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Expense Summary</DialogTitle>
          <DialogDescription>
            Detailed breakdown of all expenses by participant
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] mt-4">
          <div className="space-y-4">
            {expensesByPayer.map(({ participant, expenses, total }) => (
              <Card key={participant.id} className="p-4">
                <Accordion type="single" collapsible>
                  <AccordionItem value="expenses">
                    <AccordionTrigger>
                      <div className="flex items-center gap-4">
                        <div className="bg-purple-100 p-2 rounded-full">
                          <User className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium">{participant.name}</div>
                          <div className="text-sm text-gray-500">
                            {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="text-right font-medium text-purple-600">
                          {formatCurrency(total)}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 mt-2">
                        {expenses.map(expense => (
                          <div 
                            key={expense.id}
                            className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                          >
                            <Receipt className="w-4 h-4 text-gray-400" />
                            <div className="flex-1">
                              <div className="font-medium">{expense.description}</div>
                              <div className="text-sm text-gray-500">
                                Split between: {expense.participants.map(
                                  p => p.participant.name
                                ).join(', ')}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                {formatCurrency(expense.amount)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(expense.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Total Expenses:</span>
            <span className="font-bold text-lg text-purple-600">
              {formatCurrency(
                expenses.reduce((sum, expense) => sum + expense.amount, 0)
              )}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseSummary;