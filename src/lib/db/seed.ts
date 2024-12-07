import { executeQuery } from '../db';
import { ACCOUNT_TYPES } from '../constants';

const INITIAL_ACCOUNTS = [
  // Assets (1000-1999)
  { number: '1000', name: 'Kasse', type: ACCOUNT_TYPES.ASSET },
  { number: '1020', name: 'Bank', type: ACCOUNT_TYPES.ASSET },
  { number: '1100', name: 'Debitoren', type: ACCOUNT_TYPES.ASSET },
  { number: '1170', name: 'Vorsteuer', type: ACCOUNT_TYPES.ASSET },
  
  // Liabilities (2000-2999)
  { number: '2000', name: 'Kreditoren', type: ACCOUNT_TYPES.LIABILITY },
  { number: '2200', name: 'Mehrwertsteuer', type: ACCOUNT_TYPES.LIABILITY },
  
  // Revenue (3000-3999)
  { number: '3000', name: 'Warenertrag', type: ACCOUNT_TYPES.REVENUE },
  { number: '3400', name: 'Dienstleistungsertrag', type: ACCOUNT_TYPES.REVENUE },
  
  // Expenses (4000-4999)
  { number: '4000', name: 'Warenaufwand', type: ACCOUNT_TYPES.EXPENSE },
  { number: '4400', name: 'Büromaterial', type: ACCOUNT_TYPES.EXPENSE },
];

export async function seedDatabase() {
  // First check if we already have data
  const result = await executeQuery<{ count: number }>(
    'SELECT COUNT(*) as count FROM accounts'
  );
  const count = Number(result.rows[0].count);
  if (count > 0) {
    console.log('Database already seeded');
    return;
  }

  // Insert initial accounts
  for (const account of INITIAL_ACCOUNTS) {
    await executeQuery(
      'INSERT INTO accounts (id, number, name, type) VALUES (?, ?, ?, ?)',
      [crypto.randomUUID(), account.number, account.name, account.type]
    );
  }

  console.log('Database seeded successfully');
}