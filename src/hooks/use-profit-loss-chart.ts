import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ACCOUNT_TYPES } from '@/lib/constants';
import { startOfYear, endOfYear, eachMonthOfInterval, format, isSameMonth } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface MonthlyProfitLoss {
  month: string;
  value: number;
  revenue: number;
  expenses: number;
}

export function useProfitLossChart(date = new Date()) {
  const { t } = useTranslation();
  const yearStart = startOfYear(date);
  const yearEnd = endOfYear(date);

  return useQuery({
    queryKey: ['profit-loss-chart', yearStart.getFullYear()],
    queryFn: async () => {
      // Get all revenue and expense accounts
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('id, type')
        .in('type', [ACCOUNT_TYPES.REVENUE, ACCOUNT_TYPES.EXPENSE])
        .order('number');

      if (accountsError) throw accountsError;
      if (!accounts?.length) return [];

      const accountIds = accounts.map(a => a.id);
      const revenueIds = accounts.filter(a => a.type === ACCOUNT_TYPES.REVENUE).map(a => a.id);
      const expenseIds = accounts.filter(a => a.type === ACCOUNT_TYPES.EXPENSE).map(a => a.id);
      
      // Format dates to YYYY-MM-DD to avoid timezone issues
      const formattedStart = yearStart.toISOString().split('T')[0];
      const formattedEnd = yearEnd.toISOString().split('T')[0];

      // Get all transactions for the year
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('date, amount, credit_account_id, debit_account_id')
        .or(`credit_account_id.in.(${accountIds}),debit_account_id.in.(${accountIds})`)
        .gte('date', formattedStart)
        .lte('date', formattedEnd);

      if (transactionsError) throw transactionsError;

      // Create array of all months in year
      const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

      // Calculate profit/loss for each month
      return months.map(month => {
        const monthlyTransactions = transactions?.filter(t => 
          isSameMonth(new Date(t.date), month)
        ) || [];

        // Calculate revenue
        const revenue = monthlyTransactions.reduce((sum, t) => {
          if (revenueIds.includes(t.credit_account_id)) {
            return sum + t.amount;
          }
          if (revenueIds.includes(t.debit_account_id)) {
            return sum - t.amount;
          }
          return sum;
        }, 0);

        // Calculate expenses
        const expenses = monthlyTransactions.reduce((sum, t) => {
          if (expenseIds.includes(t.debit_account_id)) {
            return sum + t.amount;
          }
          if (expenseIds.includes(t.credit_account_id)) {
            return sum - t.amount;
          }
          return sum;
        }, 0);

        const monthKey = format(month, 'MMM').toLowerCase();
        const monthLabel = t(`months.short.${monthKey}`);

        return {
          month: monthLabel,
          value: revenue - expenses,
          revenue,
          expenses
        };
      });
    }
  });
}