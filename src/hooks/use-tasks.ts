import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTasks, createTask, updateTask, deleteTask } from '@/lib/services/tasks';
import { toast } from 'sonner';

export function useTasks() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
    onSuccess: (data) => {
      console.log('Tasks loaded:', data);
    },
    onError: (error) => {
      console.error('Error loading tasks:', error);
    }
  });

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Aufgabe wurde erstellt');
    },
    onError: (error) => {
      console.error('Failed to create task:', error);
      toast.error('Fehler beim Erstellen der Aufgabe');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof updateTask>[1] }) =>
      updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Aufgabe wurde aktualisiert');
    },
    onError: (error) => {
      console.error('Failed to update task:', error);
      toast.error('Fehler beim Aktualisieren der Aufgabe');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Aufgabe wurde gelöscht');
    },
    onError: (error) => {
      console.error('Failed to delete task:', error);
      toast.error('Fehler beim Löschen der Aufgabe');
    }
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate
  };
}