import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, updateUser, inviteUser } from '@/lib/services/users';
import { toast } from 'sonner';

export function useUsers() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['users'],
    queryFn: getUsers
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, profile }: { id: string; profile: Parameters<typeof updateUser>[1] }) =>
      updateUser(id, profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Benutzer wurde aktualisiert');
    },
    onError: (error) => {
      console.error('Failed to update user:', error);
      toast.error('Fehler beim Aktualisieren des Benutzers');
    }
  });

  const inviteMutation = useMutation({
    mutationFn: inviteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Einladung wurde versendet');
    },
    onError: (error) => {
      console.error('Failed to invite user:', error);
      toast.error('Fehler beim Versenden der Einladung');
    }
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    update: updateMutation.mutate,
    invite: inviteMutation.mutate
  };
}