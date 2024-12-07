import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Account, Transaction } from '@/lib/types';
import { startOfMonth, endOfMonth, formatISO } from 'date-fns';
import { ACCOUNT_TYPES } from '@/lib/constants';

export function useIncomeAccounts(
  startDate = startOfMonth(new Date()),
  endDate = endOfMonth(new Date())
) {
  // Log incoming dates
  console.log('Income Accounts - Raw Input:', {
    startDate,
    endDate,
    startType: startDate?.constructor.name,
    endType: endDate?.constructor.name
  });

  // Format dates in local timezone
  const startString = formatISO(startDate, { representation: 'date' });
  const endString = formatISO(endDate, { representation: 'date' });

  const groupsQuery = useQuery({
    queryKey: ['income-account-groups', startString, endString],
    queryFn: async () => {
      const { data: groups, error } = await supabase
        .from('account_groups')
        .select('*')
        .order('number');

      if (error) throw error;
      return groups;
    }
  });

  const accountsQuery = useQuery({
    queryKey: ['income-accounts', startString, endString],
    queryFn: async () => {
      const { data: accounts, error } = await supabase
        .from('accounts')
        .select('*')
        .in('type', [ACCOUNT_TYPES.EXPENSE, ACCOUNT_TYPES.REVENUE])
        .order('number');

      if (error) throw error;
      return accounts as Account[];
    }
  });

  const transactionsQuery = useQuery({
    queryKey: ['income-transactions', startString, endString],
    queryFn: async () => {
      if (!accountsQuery.data) return [];

      const accountIds = accountsQuery.data.map(a => a.id);
      
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .or(`debit_account_id.in.(${accountIds}),credit_account_id.in.(${accountIds})`)
        .gte('date', startString)
        .lte('date', endString);

      if (error) throw error;
      
      // Log transactions query
      console.log('Income Accounts - Found Transactions:', 
        transactions?.map(t => ({
          id: t.id,
          date: t.date,
          amount: t.amount,
          description: t.description
        }))
      );
      
      return transactions as Transaction[];
    },
    enabled: !!accountsQuery.data?.length
  });

  const balances = new Map<string, number>();
  
  if (accountsQuery.data && transactionsQuery.data) {
    // Initialize balances
    accountsQuery.data.forEach(account => {
      balances.set(account.id, 0);
    });

    // Calculate balances
    transactionsQuery.data.forEach(transaction => {
      const { debit_account_id, credit_account_id, amount } = transaction;
      
      if (balances.has(debit_account_id)) {
        const account = accountsQuery.data.find(a => a.id === debit_account_id);
        if (account?.type === ACCOUNT_TYPES.EXPENSE) {
          balances.set(debit_account_id, (balances.get(debit_account_id) || 0) + amount);
        } else {
          balances.set(debit_account_id, (balances.get(debit_account_id) || 0) - amount);
        }
      }

      if (balances.has(credit_account_id)) {
        const account = accountsQuery.data.find(a => a.id === credit_account_id);
        if (account?.type === ACCOUNT_TYPES.REVENUE) {
          balances.set(credit_account_id, (balances.get(credit_account_id) || 0) + amount);
        } else {
          balances.set(credit_account_id, (balances.get(credit_account_id) || 0) - amount);
        }
      }
    });
  }

  return {
    accounts: accountsQuery.data || [],
    groups: groupsQuery.data || [],
    balances,
    isLoading: accountsQuery.isLoading || transactionsQuery.isLoading || groupsQuery.isLoading,
    error: accountsQuery.error || transactionsQuery.error || groupsQuery.error
  };
}