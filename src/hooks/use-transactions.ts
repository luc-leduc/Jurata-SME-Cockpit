import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getTransactions, getTransactionCount } from '@/lib/services/transactions';

const PAGE_SIZE = 50;

export function useTransactions() {
  const infiniteQuery = useInfiniteQuery({
    queryKey: ['transactions'],
    queryFn: ({ pageParam = 0 }) => 
      getTransactions(PAGE_SIZE, pageParam * PAGE_SIZE),
    getNextPageParam: (lastPage, allPages) => 
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
    initialPageParam: 0
  });

  const countQuery = useQuery({
    queryKey: ['transactions', 'count'],
    queryFn: getTransactionCount,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2
  });

  return {
    ...infiniteQuery,
    totalCount: countQuery.data || 0,
    isLoadingCount: countQuery.isLoading
  };
}