import { useMemo } from 'react';
import { Transaction, Account } from '@/lib/types';
import { ACCOUNT_TYPES } from '@/lib/constants';

export function useAccountBalances(
  transactions: Transaction[] = [],
  accounts: Account[] = []
) {
  return useMemo(() => {
    // Create lookup maps for better performance
    const accountTypes = new Map(accounts.map(a => [a.id, a.type]));
    const balances = new Map<string, number>();
    
    // Initialize balances
    accounts.forEach(account => {
      balances.set(account.id, 0);
    });

    // Process transactions in bulk
    transactions.forEach(transaction => {
      const { debit_account_id, credit_account_id, amount } = transaction;
      
      const debitType = accountTypes.get(debit_account_id);
      const creditType = accountTypes.get(credit_account_id);
      
      if (!debitType || !creditType) return;

      // Apply debit entry
      if (debitType === ACCOUNT_TYPES.ASSET || debitType === ACCOUNT_TYPES.EXPENSE) {
        balances.set(
          debit_account_id, 
          (balances.get(debit_account_id) || 0) + amount
        );
      } else {
        balances.set(
          debit_account_id, 
          (balances.get(debit_account_id) || 0) - amount
        );
      }
      
      // Apply credit entry
      if (creditType === ACCOUNT_TYPES.LIABILITY || creditType === ACCOUNT_TYPES.REVENUE) {
        balances.set(
          credit_account_id, 
          (balances.get(credit_account_id) || 0) + amount
        );
      } else {
        balances.set(
          credit_account_id, 
          (balances.get(credit_account_id) || 0) - amount
        );
      }
    });
    
    return balances;
  }, [transactions, accounts]);
}