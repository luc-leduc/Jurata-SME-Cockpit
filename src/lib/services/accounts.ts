import { supabase } from '../supabase';
import type { Account, AccountGroup } from '../types';

/**
 * Get all accounts for the current user
 */
export async function getAccounts() {
  const { data, error } = await supabase
    .from('accounts')
    .select(`
      *,
      group:group_id(*)
    `)
    .order('number');

  if (error) throw error;
  return data.map(account => ({
    ...account,
    group: account.group as AccountGroup
  })) as (Account & { group?: AccountGroup })[];
}

/**
 * Get all account groups for the current user
 */
export async function getAccountGroups() {
  const { data, error } = await supabase
    .from('account_groups')
    .select('*')
    .order('number');

  if (error) throw error;
  return data as AccountGroup[];
}

/**
 * Create a single account
 */
export async function createAccount(account: Omit<Account, 'id' | 'created_at' | 'user_id'>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('accounts')
    .insert([{ ...account, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create multiple accounts in a batch
 */
export async function createAccountBatch(accounts: Array<{
  number: string;
  name: string;
  type: string;
  group_id?: string;
  is_system?: boolean;
}>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('accounts')
    .upsert(
      accounts.map(account => ({
        ...account,
        user_id: user.id
      })),
      { onConflict: 'number,user_id' }
    )
    .select();

  if (error) throw error;
  return data;
}

/**
 * Create a single account group
 */
export async function createAccountGroup(group: Omit<AccountGroup, 'id' | 'created_at' | 'user_id'>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('account_groups')
    .insert([{ ...group, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create multiple account groups in a batch
 */
export async function createAccountGroupBatch(groups: Array<{
  number: string;
  name: string;
  parent_id?: string | null;
  system_account?: string;
}>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('account_groups')
    .upsert(
      groups.map(group => ({
        ...group,
        user_id: user.id
      })),
      { onConflict: 'number,user_id' }
    )
    .select();

  if (error) throw error;
  return data;
}

/**
 * Get the account hierarchy for the current user
 */
export async function getAccountHierarchy() {
  const { data, error } = await supabase
    .rpc('get_account_hierarchy');

  if (error) throw error;
  return data;
}

/**
 * Delete all accounts and account groups for the current user
 */
export async function deleteAllAccounts() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Delete all accounts first since they reference account groups
  const { error: accountsError } = await supabase
    .from('accounts')
    .delete()
    .eq('user_id', user.id);

  if (accountsError) throw accountsError;

  // Then delete all account groups
  const { error: groupsError } = await supabase
    .from('account_groups')
    .delete()
    .eq('user_id', user.id);

  if (groupsError) throw groupsError;
}