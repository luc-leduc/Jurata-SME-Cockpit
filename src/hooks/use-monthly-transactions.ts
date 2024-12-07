import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { startOfMonth, endOfMonth, subMonths, formatISO } from 'date-fns';

interface MonthlyTransactions {
  currentCount: number;
  previousCount: number;
  change: number;
}

export function useMonthlyTransactions(date = new Date()) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);

  // Get previous month dates correctly
  const prevMonth = subMonths(monthStart, 1);
  const prevMonthStart = startOfMonth(prevMonth);
  const prevMonthEnd = endOfMonth(prevMonth);

  return useQuery<MonthlyTransactions>({
    queryKey: ['monthly-transactions', monthStart.toISOString()],
    queryFn: async () => {
      // Format dates for current month
      const formattedStart = formatISO(monthStart, { representation: 'date' });
      const formattedEnd = formatISO(monthEnd, { representation: 'date' });

      // Get current month count
      const { count: currentCount, error: currentError } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .gte('date', formattedStart)
        .lte('date', formattedEnd);

      if (currentError) throw currentError;

      // Format previous month dates
      const formattedPrevStart = formatISO(prevMonthStart, { representation: 'date' });
      const formattedPrevEnd = formatISO(prevMonthEnd, { representation: 'date' });

      // Get previous month count
      const { count: previousCount, error: prevError } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .gte('date', formattedPrevStart)
        .lte('date', formattedPrevEnd);

      if (prevError) throw prevError;

      // Calculate change
      const change = previousCount === 0 
        ? (currentCount > 0 ? 100 : 0)
        : ((currentCount - previousCount) / Math.abs(previousCount)) * 100;

      return {
        currentCount: Number(currentCount) || 0,
        previousCount: Number(previousCount) || 0,
        change
      };
    }
  });
}