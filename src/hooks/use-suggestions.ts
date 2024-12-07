import { toast } from 'sonner';

import { useCallback, useRef } from 'react';
import { useAccounts } from './use-accounts';
import { suggestAccounts } from '@/lib/services/suggestions';

interface UseSuggestionsOptions {
  onSuggestion?: (debitId: string, creditId: string) => void;
}

export function useSuggestions(options?: UseSuggestionsOptions) {
  const { data: accounts = [] } = useAccounts();
  const onSuggestionRef = useRef(options?.onSuggestion);

  // Update ref when callback changes
  onSuggestionRef.current = options?.onSuggestion;

  const getSuggestion = useCallback(async (description: string, issuer?: string) => {
    if (!description) return null;
    
    const issuerString = issuer ? 
      Object.entries(issuer)
        .filter(([_, value]) => value)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ') 
      : undefined;
    
    try {
      const suggestions = await suggestAccounts(
        description,
        issuerString,
        accounts
      );
      
      // Log suggestions with account names
      const suggestionsWithNames = {
        debit: suggestions.debit.map(d => ({
          ...d,
          name: accounts.find(a => a.number === d.number)?.name || 'Unknown'
        })),
        credit: suggestions.credit.map(c => ({
          ...c,
          name: accounts.find(a => a.number === c.number)?.name || 'Unknown'
        }))
      };
      console.log('Account suggestions:', suggestionsWithNames);

      // Only proceed if we have valid suggestion numbers
      if (!suggestions?.debit?.[0]?.number || !suggestions?.credit?.[0]?.number) {
        console.log('No valid suggestions found');
        return null;
      }
      
      if (suggestions && onSuggestionRef.current) {
        const debitAccount = accounts.find(a => a.number === suggestions.debit[0].number);
        const creditAccount = accounts.find(a => a.number === suggestions.credit[0].number);
        
        console.log('Found accounts for suggestions:', { debitAccount, creditAccount });
        
        if (debitAccount && creditAccount) {
          onSuggestionRef.current(
            debitAccount.id,
            creditAccount.id
          );
        }
      }
      
      return suggestions;
    } catch (error) {
      console.error('Failed to get account suggestions:', error);
      toast.error('Kontierungsvorschlag konnte nicht erstellt werden');
      return null;
    }
  }, [accounts]);

  return { getSuggestion };
}