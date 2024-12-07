import { supabase } from '../supabase';
import { UserProfile } from '../types';

export async function getUsers() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as UserProfile[];
}

export async function updateUser(id: string, profile: Partial<UserProfile>) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(profile)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as UserProfile;
}

export async function inviteUser(email: string, role: 'admin' | 'user' = 'user') {
  // First, create the auth user
  const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(email);
  if (authError) throw authError;

  // Then create the user profile
  const { data: profileData, error: profileError } = await supabase
    .from('user_profiles')
    .insert({
      user_id: authData.user.id,
      email,
      role
    })
    .select()
    .single();

  if (profileError) throw profileError;
  return profileData as UserProfile;
}