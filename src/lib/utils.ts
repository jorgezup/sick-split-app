import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatLastVisited = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const visitDate = new Date(date);
  today.setHours(0, 0, 0, 0);
  visitDate.setHours(0, 0, 0, 0);

  // Calculate days difference
  const days = Math.floor((today.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(dateString).toLocaleDateString();
};