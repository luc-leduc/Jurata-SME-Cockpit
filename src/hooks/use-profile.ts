import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserProfile, updateUserProfile } from '@/lib/services/profile';
import { toast } from 'sonner';

export function useProfile() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['profile'],
    queryFn: getUserProfile
  });

  const mutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profil wurde gespeichert');
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
      toast.error('Fehler beim Speichern des Profils');
    }
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    update: mutation.mutate
  };
}