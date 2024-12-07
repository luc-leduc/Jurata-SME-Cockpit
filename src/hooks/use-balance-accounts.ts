import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Account, Transaction } from '@/lib/types';
import { formatISO } from 'date-fns';
import { ACCOUNT_TYPES } from '@/lib/constants';

export function useBalanceAccounts(date = new Date()) {
  const groupsQuery = useQuery({
    queryKey: ['balance-account-groups', date.toISOString()],
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
    queryKey: ['balance-accounts', date.toISOString()],
    queryFn: async () => {
      const { data: accounts, error } = await supabase
        .from('accounts')
        .select('*')
        .in('type', [ACCOUNT_TYPES.ASSET, ACCOUNT_TYPES.LIABILITY])
        .order('number');

      if (error) throw error;
      return accounts as Account[];
    }
  });

  const transactionsQuery = useQuery({
    queryKey: ['balance-transactions', date.toISOString()],
    queryFn: async () => {
      if (!accountsQuery.data) return [];

      // Format date in local timezone
      const dateString = formatISO(date, { representation: 'date' });
      
      const accountIds = accountsQuery.data.map(a => a.id);

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .or(`debit_account_id.in.(${accountIds}),credit_account_id.in.(${accountIds})`)
        .lte('date', dateString);

      if (error) throw error;
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
        if (account?.type === ACCOUNT_TYPES.ASSET) {
          balances.set(debit_account_id, (balances.get(debit_account_id) || 0) + amount);
        } else {
          balances.set(debit_account_id, (balances.get(debit_account_id) || 0) - amount);
        }
      }

      if (balances.has(credit_account_id)) {
        const account = accountsQuery.data.find(a => a.id === credit_account_id);
        if (account?.type === ACCOUNT_TYPES.LIABILITY) {
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