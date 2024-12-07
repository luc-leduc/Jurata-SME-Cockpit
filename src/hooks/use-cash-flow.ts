import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { startOfYear, endOfYear, eachMonthOfInterval, format, isSameMonth } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface MonthlyFlow {
  month: string;
  income: number;
  expenses: number;
}

export function useCashFlow(date = new Date()) {
  const { t } = useTranslation();
  const yearStart = startOfYear(date);
  const yearEnd = endOfYear(date);

  return useQuery({
    queryKey: ['cash-flow', yearStart.getFullYear()],
    queryFn: async () => {
      // Get cash accounts (1000 Kasse, 1020 Bank, etc.)
      const { data: cashAccounts, error: accountsError } = await supabase
        .from('accounts')
        .select('id')
        .or('number.eq.1000,number.eq.1020')
        .order('number');

      if (accountsError) throw accountsError;
      if (!cashAccounts?.length) return [];

      const cashAccountIds = cashAccounts.map(a => a.id);
      
      // Format dates to YYYY-MM-DD to avoid timezone issues
      const formattedStart = yearStart.toISOString().split('T')[0];
      const formattedEnd = yearEnd.toISOString().split('T')[0];

      // Get all transactions involving cash accounts
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('date, amount, credit_account_id, debit_account_id')
        .or(
          `credit_account_id.in.(${cashAccountIds}),` +
          `debit_account_id.in.(${cashAccountIds})`
        )
        .gte('date', formattedStart)
        .lte('date', formattedEnd);

      if (transactionsError) throw transactionsError;

      // Create array of all months in year
      const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

      // Calculate inflows and outflows for each month
      return months.map(month => {
        const monthlyTransactions = transactions?.filter(t => 
          isSameMonth(new Date(t.date), month)
        ) || [];

        const { income, expenses } = monthlyTransactions.reduce((acc, t) => {
          const amount = t.amount;
          
          if (cashAccountIds.includes(t.debit_account_id)) {
            // Money coming into cash accounts
            return { ...acc, income: acc.income + amount };
          }
          if (cashAccountIds.includes(t.credit_account_id)) {
            // Money going out of cash accounts
            return { ...acc, expenses: acc.expenses + amount };
          }
          return acc;
        }, { income: 0, expenses: 0 });

        const monthKey = format(month, 'MMM').toLowerCase();
        const monthLabel = t(`months.short.${monthKey}`);

        return {
          month: monthLabel,
          income,
          expenses
        };
      });
    }
  });
}