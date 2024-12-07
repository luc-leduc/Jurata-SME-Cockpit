import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ACCOUNT_TYPES } from '@/lib/constants';
import { startOfMonth, endOfMonth, subMonths, formatISO } from 'date-fns';

interface MonthlyRevenue {
  total: number;
  change: number;
  prevTotal: number;
}

export function useMonthlyRevenue(date = new Date()) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);

  // Get previous month dates correctly
  const prevMonth = subMonths(monthStart, 1);
  const prevMonthStart = startOfMonth(prevMonth);
  const prevMonthEnd = endOfMonth(prevMonth);

  return useQuery<MonthlyRevenue>({
    queryKey: ['monthly-revenue', monthStart.toISOString()],
    queryFn: async () => {
      // Get all revenue accounts
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('id')
        .eq('type', ACCOUNT_TYPES.REVENUE)
        .order('number');

      if (accountsError) throw accountsError;
      if (!accounts?.length) return { total: 0, prevTotal: 0, change: 0 };

      const accountIds = accounts.map(a => a.id);
      
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

      // Calculate current month total using the same logic as useRevenueChart
      const total = transactions?.reduce((sum, t) => {
        if (accountIds.includes(t.credit_account_id)) {
          return sum + t.amount;
        }
        if (accountIds.includes(t.debit_account_id)) {
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

      // Calculate previous month total using the same logic
      const prevTotal = prevTransactions?.reduce((sum, t) => {
        if (accountIds.includes(t.credit_account_id)) {
          return sum + t.amount;
        }
        if (accountIds.includes(t.debit_account_id)) {
          return sum - t.amount;
        }
        return sum;
      }, 0) || 0;

      // Calculate percentage change
      const change = prevTotal === 0 
        ? (total > 0 ? 100 : 0)
        : ((total - prevTotal) / Math.abs(prevTotal)) * 100;

      return {
        total,
        prevTotal,
        change
      };
    }
  });
}