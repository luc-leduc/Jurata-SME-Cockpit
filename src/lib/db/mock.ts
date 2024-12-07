import { Account, Transaction } from '../types';
import { ACCOUNT_TYPES } from '../constants';

// In-memory storage
const store = {
  accounts: new Map<string, Account>(),
  transactions: new Map<string, Transaction>(),
};

// Mock initial accounts
const INITIAL_ACCOUNTS: Array<Omit<Account, 'id' | 'created_at'>> = [
  { number: '1000', name: 'Kasse', type: ACCOUNT_TYPES.ASSET },
  { number: '1020', name: 'Bank', type: ACCOUNT_TYPES.ASSET },
  { number: '1100', name: 'Debitoren', type: ACCOUNT_TYPES.ASSET },
  { number: '1170', name: 'Vorsteuer', type: ACCOUNT_TYPES.ASSET },
  { number: '2000', name: 'Kreditoren', type: ACCOUNT_TYPES.LIABILITY },
  { number: '2200', name: 'Mehrwertsteuer', type: ACCOUNT_TYPES.LIABILITY },
  { number: '3000', name: 'Warenertrag', type: ACCOUNT_TYPES.REVENUE },
  { number: '3400', name: 'Dienstleistungsertrag', type: ACCOUNT_TYPES.REVENUE },
  { number: '4000', name: 'Warenaufwand', type: ACCOUNT_TYPES.EXPENSE },
  { number: '4400', name: 'Büromaterial', type: ACCOUNT_TYPES.EXPENSE },
];

// Mock transactions
const INITIAL_TRANSACTIONS: Array<Omit<Transaction, 'id' | 'created_at'>> = [
  {
    date: '2024-01-15',
    description: 'Wareneinkauf',
    debit_account_id: '4000',
    credit_account_id: '1020',
    amount: 1500.00,
    document_ref: 'RE2024-001',
  },
  {
    date: '2024-01-20',
    description: 'Warenverkauf',
    debit_account_id: '1020',
    credit_account_id: '3000',
    amount: 2800.00,
    document_ref: 'RE2024-002',
  },
];

// Initialize mock data
function initMockData() {
  // Clear existing data
  store.accounts.clear();
  store.transactions.clear();

  // Add accounts
  INITIAL_ACCOUNTS.forEach((account) => {
    const id = account.number;
    store.accounts.set(id, {
      ...account,
      id,
      created_at: new Date().toISOString(),
    });
  });

  // Add transactions
  INITIAL_TRANSACTIONS.forEach((transaction, index) => {
    const id = `t${index + 1}`;
    store.transactions.set(id, {
      ...transaction,
      id,
      created_at: new Date().toISOString(),
    });
  });
}

// Initialize on module load
initMockData();

// Mock database interface
export const mockDb = {
  async query<T>(sql: string, params?: any[]): Promise<{ rows: T[] }> {
    // Simple mock query parser
    if (sql.toLowerCase().includes('from accounts')) {
      return {
        rows: Array.from(store.accounts.values()) as T[],
      };
    }

    if (sql.toLowerCase().includes('from transactions')) {
      const transactions = Array.from(store.transactions.values());
      const enrichedTransactions = transactions.map(t => ({
        ...t,
        debit_account_number: store.accounts.get(t.debit_account_id)?.number || '',
        debit_account_name: store.accounts.get(t.debit_account_id)?.name || '',
        credit_account_number: store.accounts.get(t.credit_account_id)?.number || '',
        credit_account_name: store.accounts.get(t.credit_account_id)?.name || '',
      }));
      return {
        rows: enrichedTransactions as T[],
      };
    }

    return { rows: [] };
  },
};