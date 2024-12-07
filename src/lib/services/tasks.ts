export async function getTask(id: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select(`*,
      creator:creator_id(
        id,
        first_name,
        last_name
      ),
      assignee:assignee_id(
        id,
        first_name,
        last_name
      )`)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

import { supabase } from '../supabase';
import type { Task } from '../types';

export async function getTasks() {
  console.log('Fetching tasks...');
  
  // First get the current user's company
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (companyError) {
    console.error('Error fetching company:', companyError);
    throw companyError;
  }

  if (!company) throw new Error('No company found');

  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      creator:creator_id(id, first_name, last_name),
      assignee:assignee_id(id, first_name, last_name)
    `)
    .eq('company_id', company.id)
    .order('created_at', { ascending: false });

  console.log('Tasks response:', { data, error });

  if (error) throw error;
  return data as (Task & {
    creator: { first_name: string | null; last_name: string | null };
    assignee: { first_name: string | null; last_name: string | null } | null;
  })[];
}

export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([task])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTask(id: string, updates: Partial<Task>) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTask(id: string) {
  if (!id) throw new Error('Task ID is required');

  // First get the current user's company
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!company) throw new Error('No company found');

  // Delete task only if it belongs to user's company
  const { data, error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('company_id', company.id)
    .select()
    .single();

  if (error) {
    console.error('Delete task error:', error);
    throw new Error('Failed to delete task: ' + error.message);
  }

  if (!data) {
    throw new Error('Task not found or you do not have permission to delete it');
  }

  return data;
}