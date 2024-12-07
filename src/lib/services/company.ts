import { supabase } from '../supabase';
import { Company } from '../types';

export async function getCompany() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Only get company where user is the owner
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No company found for this user
      return null;
    }
    throw error;
  }

  return data as Company;
}

export async function updateCompany(company: Partial<Company>) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Not authenticated');
  }

  // First check if user already has a company
  const { data: existingCompany, error: fetchError } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw fetchError;
  }

  let result;
  
  if (existingCompany) {
    // Update existing company - ensure we only update the user's own company
    const { data, error } = await supabase
      .from('companies')
      .update(company)
      .match({ id: existingCompany.id, user_id: user.id }) // Double check both ID and user_id
      .select()
      .single();

    if (error) throw error;
    result = data;
  } else {
    // Create new company - ensure user_id is set to current user
    const { data, error } = await supabase
      .from('companies')
      .insert([{ 
        ...company, 
        user_id: user.id // Explicitly set user_id to prevent tampering
      }])
      .select()
      .single();

    if (error) throw error;
    result = data;
  }

  return result as Company;
}