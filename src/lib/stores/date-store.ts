import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { startOfMonth, endOfMonth } from 'date-fns';
import type { DateRange } from 'react-day-picker';

interface DateState {
  // For Erfolgsrechnung
  incomeRange: DateRange;
  // For Bilanz
  balanceDate: Date;
  // Actions
  setIncomeRange: (range: DateRange) => void;
  setBalanceDate: (date: Date) => void;
}

export const useDateStore = create<DateState>()(
  persist(
    (set) => ({
      incomeRange: {
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date())
      },
      balanceDate: new Date(),
      setIncomeRange: (range) => set({ incomeRange: range }),
      setBalanceDate: (date) => set({ balanceDate: date })
    }),
    {
      name: 'jurata-dates',
      // Convert dates to strings for storage and back to Date objects when rehydrating
      partialize: (state) => ({
        incomeRange: {
          from: state.incomeRange.from?.toISOString(),
          to: state.incomeRange.to?.toISOString()
        },
        balanceDate: state.balanceDate.toISOString()
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert stored ISO strings back to Date objects
          state.incomeRange = {
            from: state.incomeRange.from ? new Date(state.incomeRange.from) : undefined,
            to: state.incomeRange.to ? new Date(state.incomeRange.to) : undefined
          };
          state.balanceDate = new Date(state.balanceDate);
        }
      }
    }
  )
);