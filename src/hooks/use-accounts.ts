import { useQuery } from '@tanstack/react-query';
import { getAccounts, getAccountGroups } from '@/lib/services/accounts';

export function useAccounts() {
  const accounts = useQuery({
    queryKey: ['accounts'],
    queryFn: getAccounts,
  });

  const groups = useQuery({
    queryKey: ['account_groups'],
    queryFn: getAccountGroups,
  });

  return {
    data: accounts.data,
    groups: groups.data,
    isLoading: accounts.isLoading || groups.isLoading,
    error: accounts.error || groups.error
  };
}