/* eslint-disable @next/next/no-img-element */
// src/components/add-expense-dialog.tsx

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
import { Camera, PlusCircle, Users, X } from "lucide-react";
import { useRef, useState } from "react";
import { Participant } from "@/types";

interface AddExpenseDialogProps {
  participants: Participant[];
  currency: string;
  onAddExpense: (data: {
    description: string;
    amount: number;
    paidById: string;
    splitBetween: string[];
    image?: {
      url: string;
      filename: string;
    };
  }) => Promise<void>;
}

interface ExpenseFormState {
  description: string;
  amount: string;
  paidBy: string;
  splitBetween: string[];
  image?: {  // Make image optional
    url: string;
    filename: string;
  };
}

const AddExpenseDialog = ({ participants, currency, onAddExpense }: AddExpenseDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [expenseForm, setExpenseForm] = useState<ExpenseFormState>({
    description: "",
    amount: "",
    paidBy: participants[0]?.id || "",
    splitBetween: participants.map((p) => p.id)
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('File size should be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload image
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: file,
        headers: {
          'content-type': file.type,
        },
      });

      const { url, pathname } = await response.json();

      setExpenseForm(prev => ({
        ...prev,
        image: {
          url,
          filename: pathname,
        },
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      setImagePreview(null);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setExpenseForm(prev => ({
      ...prev,
      image: {
        url: "",
        filename: "",
      }
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
        image: expenseForm.image,
      });

      // Reset form and close dialog
      setExpenseForm({
        description: "",
        amount: "",
        paidBy: participants[0]?.id || "",
        splitBetween: participants.map((p) => p.id)
      });
      setImagePreview(null);
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Receipt Image (optional)
              </label>
              <div className="mt-1 flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  {imagePreview ? 'Change Image' : 'Add Image'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                {imagePreview && (
                  <div className="relative">
                    {/* <Image
                      src={imagePreview}
                      alt="Receipt preview"
                      width={64} // width in pixels
                      height={64} // height in pixels
                      className="w-16 h-16 object-cover rounded-md border border-gray-200"
                    /> */}
                    <img
                      src={imagePreview}
                      alt="Receipt preview"
                      className="w-16 h-16 object-cover rounded-md border border-gray-200"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white shadow-sm border"
                      onClick={handleRemoveImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
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