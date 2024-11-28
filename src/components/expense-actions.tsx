import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MoreVertical, Pencil, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { Expense, Participant } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface ExpenseActionsProps {
  expense: Expense;
  participants: Participant[];
  currency: string;
  onEdit: (expenseId: string, data: {
    description: string;
    amount: number;
    paidById: string;
    splitBetween: string[];
  }) => Promise<void>;
  onDelete: (expenseId: string) => Promise<void>;
}

const ExpenseActions = ({
  expense,
  participants,
  currency,
  onEdit,
  onDelete,
}: ExpenseActionsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    description: expense.description,
    amount: expense.amount.toString(),
    paidBy: expense.paidBy.id,
    splitBetween: expense.participants.map(p => p.participant.id),
  });

  const handleEdit = async () => {
    if (!expenseForm.description || !expenseForm.amount || expenseForm.splitBetween.length === 0) {
      return;
    }

    setLoading(true);
    try {
      await onEdit(expense.id, {
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        paidById: expenseForm.paidBy,
        splitBetween: expenseForm.splitBetween,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error editing expense:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(expense.id);
      setIsDeleting(false);
    } catch (error) {
      console.error("Error deleting expense:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleting(true)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>
              Modify the expense details below
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
                onClick={handleEdit}
                disabled={
                  loading ||
                  !expenseForm.description ||
                  !expenseForm.amount ||
                  expenseForm.splitBetween.length === 0
                }
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense?
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="font-medium">{expense.description}</div>
                <div className="text-sm text-gray-500">
                  Amount: {formatCurrency(expense.amount, currency)}
                </div>
                <div className="text-sm text-gray-500">
                  Paid by: {expense.paidBy.name}
                </div>
              </div>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ExpenseActions;