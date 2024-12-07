export async function getTransactionCount() {
  console.log('Fetching transaction count...');

  const { count, error } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error fetching transaction count:', error);
    throw error;
  }

  console.log('Transaction count result:', count);
  return Number(count) || 0;
}

import { supabase } from '../supabase';
import { Transaction } from '../types';

async function uploadReceipt(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${user.id}/receipts/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('receipts')
    .upload(filePath, file);

  if (uploadError) {
    throw new Error(`Failed to upload receipt: ${uploadError.message}`);
  }

  return filePath;
}

export async function getTransaction(id: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      debit_account:debit_account_id(number, name),
      credit_account:credit_account_id(number, name)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;

  // Get receipt URL if receipt_path exists
  let receiptUrl = null;
  if (data.receipt_path) {
    try {
      const { data: signedUrl, error: signedUrlError } = await supabase.storage
        .from('receipts')
        .createSignedUrl(data.receipt_path, 3600); // 1 hour expiry

      if (!signedUrlError && signedUrl) {
        receiptUrl = signedUrl.signedUrl;
      }
    } catch (e) {
      console.error('Failed to get signed URL:', e);
    }
  }

  return {
    ...data,
    debit_account_number: data.debit_account.number,
    debit_account_name: data.debit_account.name,
    credit_account_number: data.credit_account.number,
    credit_account_name: data.credit_account.name,
    receipt_url: receiptUrl
  };
}

export async function getTransactions(limit: number, offset: number) {
  const { data, error } = await supabase
    .from('transactions')
    .select(`*,
      debit_account:debit_account_id(number, name),
      credit_account:credit_account_id(number, name)
    `)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return data.map(transaction => ({
    ...transaction,
    debit_account_number: transaction.debit_account.number,
    debit_account_name: transaction.debit_account.name,
    credit_account_number: transaction.credit_account.number,
    credit_account_name: transaction.credit_account.name,
  }));
}

export async function createTransaction(
  transaction: Omit<Transaction, 'id' | 'created_at' | 'user_id'>
) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Upload receipt if provided
  let receipt_path;
  if (transaction.receipt_file) {
    receipt_path = await uploadReceipt(transaction.receipt_file);
  }

  delete transaction.receipt_file;

  // Extract required fields for the transaction
  const { 
    date, 
    description, 
    due_date,
    service_period_start,
    service_period_end,
    amount, 
    document_ref,
    debit_account_id,
    credit_account_id,
    issuer_company,
    issuer_first_name,
    issuer_last_name,
    issuer_street,
    issuer_zip,
    issuer_city,
    issuer_country
  } = transaction;

  // Validate required fields
  if (!debit_account_id || !credit_account_id) {
    throw new Error('Debit and credit accounts are required');
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert([{ 
      date,
      description,
      due_date,
      service_period_start,
      service_period_end,
      amount,
      document_ref,
      debit_account_id,
      credit_account_id,
      issuer_company,
      issuer_first_name,
      issuer_last_name,
      issuer_street,
      issuer_zip,
      issuer_city,
      issuer_country,
      user_id: user.id,
      receipt_path
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}