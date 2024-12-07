import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ACCOUNT_TYPES } from '@/lib/constants';
import { startOfYear, endOfYear, eachMonthOfInterval, format, isSameMonth } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface MonthlyRevenue {
  month: string;
  value: number;
}

export function useRevenueChart(date = new Date()) {
  const { t } = useTranslation();
  const yearStart = startOfYear(date);
  const yearEnd = endOfYear(date);

  return useQuery({
    queryKey: ['revenue-chart', yearStart.getFullYear()],
    queryFn: async () => {
      // Get all revenue accounts
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('id')
        .eq('type', ACCOUNT_TYPES.REVENUE)
        .order('number');

      if (accountsError) throw accountsError;
      if (!accounts?.length) return [];

      const accountIds = accounts.map(a => a.id);
      
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

      // Calculate revenue for each month
      return months.map(month => {
        const monthlyTransactions = transactions?.filter(t => 
          isSameMonth(new Date(t.date), month)
        ) || [];

        const value = monthlyTransactions.reduce((sum, t) => {
          // If revenue account is credited, add to revenue
          if (accountIds.includes(t.credit_account_id)) {
            return sum + t.amount;
          }
          // If revenue account is debited, subtract from revenue (e.g. credit note)
          if (accountIds.includes(t.debit_account_id)) {
            return sum - t.amount;
          }
          return sum;
        }, 0);

        const monthKey = format(month, 'MMM').toLowerCase();
        const monthLabel = t(`months.short.${monthKey}`);

        return {
          month: monthLabel,
          value
        };
      });
    }
  });
}