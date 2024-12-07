import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCompany, updateCompany } from '@/lib/services/company';
import { toast } from 'sonner';

export function useCompany() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['company'],
    queryFn: getCompany,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1, // Only retry once if the query fails
  });

  const mutation = useMutation({
    mutationFn: updateCompany,
    onSuccess: (data) => {
      // Immediately update the cache with the new data
      queryClient.setQueryData(['company'], data);
      
      // Also invalidate the query to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['company'] });
      
      toast.success('Unternehmensdaten wurden gespeichert');
    },
    onError: (error) => {
      console.error('Failed to update company:', error);
      toast.error('Fehler beim Speichern der Unternehmensdaten');
    }
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    update: mutation.mutate
  };
}