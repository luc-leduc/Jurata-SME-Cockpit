import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatISO } from 'date-fns';

export function useCreditors(date = new Date()) {
  return useQuery({
    queryKey: ['creditors', formatISO(date, { representation: 'date' })],
    queryFn: async () => {
      // First get the creditors account
      const { data: accounts, error: accountError } = await supabase
        .from('accounts')
        .select('id')
        .eq('number', '2000')
        .single();

      if (accountError) throw accountError;
      if (!accounts) return { balance: 0, count: 0 };

      // Format date to YYYY-MM-DD to avoid timezone issues
      const formattedDate = formatISO(date, { representation: 'date' });

      // Get all transactions up to the current date
      const { data: transactions, error: transactionError } = await supabase
        .from('transactions')
        .select('amount, credit_account_id, debit_account_id')
        .or(`credit_account_id.eq.${accounts.id},debit_account_id.eq.${accounts.id}`)
        .lte('date', formattedDate);

      if (transactionError) throw transactionError;

      // Calculate total balance
      const balance = transactions.reduce((sum, t) => {
        if (t.credit_account_id === accounts.id) {
          return sum + t.amount;
        }
        if (t.debit_account_id === accounts.id) {
          return sum - t.amount;
        }
        return sum;
      }, 0);

      // Count open items (credit entries without matching debit entries)
      const openItems = transactions.filter(t => 
        t.credit_account_id === accounts.id && 
        !transactions.some(t2 =>
          t2.debit_account_id === accounts.id &&
          t2.amount === t.amount &&
          t2.credit_account_id !== accounts.id // Avoid matching contra bookings
        )
      ).length;

      return {
        balance,
        count: openItems
      };
    }
  });
}