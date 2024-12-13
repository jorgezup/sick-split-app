// types/index.ts
export interface Participant {
  id: string;
  name: string;
  groupId: string;
}

export interface ExpenseParticipant {
  id: string;
  expenseId: string;
  participantId: string;
  share: number;
  participant: Participant;
}

export interface Expense {
  splitBetween: string[];
  id: string;
  description: string;
  amount: number;
  date: Date;
  paidBy: Participant;
  participants: Array<{
    share: number;
    participant: Participant;
  }>;
  image?: {
    url: string;
    filename: string;
  };
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  currency: string;
  participants: Participant[];
  expenses: Expense[];
}

export interface StoredSplit {
  id: string;
  name: string;
  createdAt: string;
  lastVisited: string;
}

export interface ExpenseFormData {
  description: string;
  amount: string;
  paidBy: string;
  splitBetween: string[];
  image?: {
    url: string;
    filename: string;
  };
}