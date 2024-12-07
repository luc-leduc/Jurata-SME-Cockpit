import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { startOfDay, endOfDay, addDays, format } from 'date-fns';

export function useImportantTasks() {
  return useQuery({
    queryKey: ['important-tasks'],
    queryFn: async () => {
      const today = startOfDay(new Date());
      const twoWeeksFromNow = endOfDay(addDays(today, 14));

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          creator:creator_id(id, first_name, last_name),
          assignee:assignee_id(id, first_name, last_name)
        `)
        .lte('due_date', format(twoWeeksFromNow, "yyyy-MM-dd'T'HH:mm:ssXXX"))
        .not('status', 'in', '("completed","cancelled")')
        .order('due_date', { ascending: true })
        .order('priority', { ascending: false });

      if (error) throw error;
      return data;
    }
  });
}