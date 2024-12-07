import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ACCOUNT_TYPES } from '@/lib/constants';
import { startOfMonth, endOfMonth, subMonths, formatISO } from 'date-fns';

interface MonthlyProfit {
  profit: number;
  revenue: number;
  expenses: number;
  change: number;
}

export function useMonthlyProfit(date = new Date()) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);

  // Get previous month dates correctly
  const prevMonth = subMonths(monthStart, 1);
  const prevMonthStart = startOfMonth(prevMonth);
  const prevMonthEnd = endOfMonth(prevMonth);

  return useQuery<MonthlyProfit>({
    queryKey: ['monthly-profit', monthStart.toISOString()],
    queryFn: async () => {
      // Get all revenue and expense accounts
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('id, type')
        .in('type', [ACCOUNT_TYPES.REVENUE, ACCOUNT_TYPES.EXPENSE])
        .order('number');

      if (accountsError) throw accountsError;
      if (!accounts?.length) return { profit: 0, revenue: 0, expenses: 0, change: 0 };

      const accountIds = accounts.map(a => a.id);
      const revenueIds = accounts.filter(a => a.type === ACCOUNT_TYPES.REVENUE).map(a => a.id);
      const expenseIds = accounts.filter(a => a.type === ACCOUNT_TYPES.EXPENSE).map(a => a.id);
      
      // Format dates to YYYY-MM-DD to avoid timezone issues
      const formattedStart = formatISO(monthStart, { representation: 'date' });
      const formattedEnd = formatISO(monthEnd, { representation: 'date' });

      // Get current month transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('date, amount, credit_account_id, debit_account_id')
        .or(`credit_account_id.in.(${accountIds}),debit_account_id.in.(${accountIds})`)
        .gte('date', formattedStart)
        .lte('date', formattedEnd);

      if (transactionsError) throw transactionsError;

      // Calculate current month totals
      const revenue = transactions?.reduce((sum, t) => {
        if (revenueIds.includes(t.credit_account_id)) {
          return sum + t.amount;
        }
        if (revenueIds.includes(t.debit_account_id)) {
          return sum - t.amount;
        }
        return sum;
      }, 0) || 0;

      const expenses = transactions?.reduce((sum, t) => {
        if (expenseIds.includes(t.debit_account_id)) {
          return sum + t.amount;
        }
        if (expenseIds.includes(t.credit_account_id)) {
          return sum - t.amount;
        }
        return sum;
      }, 0) || 0;

      // Format previous month dates
      const formattedPrevStart = formatISO(prevMonthStart, { representation: 'date' });
      const formattedPrevEnd = formatISO(prevMonthEnd, { representation: 'date' });

      // Get previous month transactions
      const { data: prevTransactions, error: prevError } = await supabase
        .from('transactions')
        .select('date, amount, credit_account_id, debit_account_id')
        .or(`credit_account_id.in.(${accountIds}),debit_account_id.in.(${accountIds})`)
        .gte('date', formattedPrevStart)
        .lte('date', formattedPrevEnd);

      if (prevError) throw prevError;

      // Calculate previous month profit
      const prevRevenue = prevTransactions?.reduce((sum, t) => {
        if (revenueIds.includes(t.credit_account_id)) {
          return sum + t.amount;
        }
        if (revenueIds.includes(t.debit_account_id)) {
          return sum - t.amount;
        }
        return sum;
      }, 0) || 0;

      const prevExpenses = prevTransactions?.reduce((sum, t) => {
        if (expenseIds.includes(t.debit_account_id)) {
          return sum + t.amount;
        }
        if (expenseIds.includes(t.credit_account_id)) {
          return sum - t.amount;
        }
        return sum;
      }, 0) || 0;

      const profit = revenue - expenses;
      const prevProfit = prevRevenue - prevExpenses;

      // Calculate percentage change
      const change = prevProfit === 0 
        ? (profit > 0 ? 100 : 0)
        : ((profit - prevProfit) / Math.abs(prevProfit)) * 100;

      return {
        profit,
        revenue,
        expenses,
        change
      };
    }
  });
}