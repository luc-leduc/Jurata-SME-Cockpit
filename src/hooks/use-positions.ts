import { useState } from 'react';
import { nanoid } from 'nanoid';
import { TransactionPosition } from '@/lib/types';

const createEmptyPosition = (): TransactionPosition => ({
  id: nanoid(),
  debit_account_id: '',
  credit_account_id: '',
  currency: 'CHF',
  amount: 0,
  tax_rate: undefined,
});

export function usePositions() {
  const [positions, setPositions] = useState<TransactionPosition[]>([{
    ...createEmptyPosition()
  }]);

  const addPosition = () => {
    setPositions(prev => [...prev, createEmptyPosition()]);
  };

  const removePosition = (id: string) => {
    if (positions.length > 1) {
      setPositions(prev => prev.filter(p => p.id !== id));
    }
  };

  const updatePosition = (id: string, updates: Partial<TransactionPosition>) => {
    setPositions(prev => prev.map(position => 
      position.id === id ? { ...position, ...updates } : position
    ));
  };

  return {
    positions,
    addPosition,
    removePosition,
    updatePosition,
  };
}