import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Users } from "lucide-react";
import { useState } from "react";
import { Participant } from "@/types";

interface AddExpenseDialogProps {
  participants: Participant[];
  currency: string;
  onAddExpense: (data: {
    description: string;
    amount: number;
    paidById: string;
    splitBetween: string[];
  }) => Promise<void>;
}

const AddExpenseDialog = ({ participants, currency, onAddExpense }: AddExpenseDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    paidBy: participants[0]?.id || "",
    splitBetween: participants.map((p) => p.id),
  });

  const handleSubmit = async () => {
    if (!expenseForm.description || !expenseForm.amount || expenseForm.splitBetween.length === 0) {
      return;
    }

    setLoading(true);
    try {
      await onAddExpense({
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        paidById: expenseForm.paidBy,
        splitBetween: expenseForm.splitBetween,
      });

      // Reset form and close dialog
      setExpenseForm({
        description: "",
        amount: "",
        paidBy: participants[0]?.id || "",
        splitBetween: participants.map((p) => p.id),
      });
      setOpen(false);
    } catch (error) {
      console.error("Error adding expense:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Enter the expense details below
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] mt-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Input
                placeholder="e.g., Dinner"
                value={expenseForm.description}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, description: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount ({currency})
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={expenseForm.amount}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, amount: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paid by
              </label>
              <select
                className="w-full h-10 rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={expenseForm.paidBy}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, paidBy: e.target.value })
                }
              >
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Split between
              </label>
              <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
                {participants.map((p) => (
                  <label key={p.id} className="flex items-center gap-3 p-2">
                    <input
                      type="checkbox"
                      checked={expenseForm.splitBetween.includes(p.id)}
                      onChange={(e) => {
                        const newSplit = e.target.checked
                          ? [...expenseForm.splitBetween, p.id]
                          : expenseForm.splitBetween.filter((id) => id !== p.id);
                        setExpenseForm({ ...expenseForm, splitBetween: newSplit });
                      }}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="flex items-center gap-2">
                      <div className="bg-purple-100 p-1.5 rounded-full">
                        <Users className="w-3 h-3 text-purple-600" />
                      </div>
                      {p.name}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <Button
              className="w-full mt-6"
              onClick={handleSubmit}
              disabled={
                loading ||
                !expenseForm.description ||
                !expenseForm.amount ||
                expenseForm.splitBetween.length === 0
              }
            >
              {loading ? "Adding..." : "Add Expense"}
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseDialog;