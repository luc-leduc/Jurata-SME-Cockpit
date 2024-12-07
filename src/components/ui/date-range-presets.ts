import { 
  startOfMonth, 
  endOfMonth, 
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subMonths,
  subQuarters,
  subYears
} from 'date-fns';

export const presets = [
  {
    label: 'Aktueller Monat',
    value: {
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date())
    }
  },
  {
    label: 'Letzter Monat',
    value: {
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1))
    }
  },
  {
    label: 'Aktuelles Quartal',
    value: {
      from: startOfQuarter(new Date()),
      to: endOfQuarter(new Date())
    }
  },
  {
    label: 'Letztes Quartal',
    value: {
      from: startOfQuarter(subQuarters(new Date(), 1)),
      to: endOfQuarter(subQuarters(new Date(), 1))
    }
  },
  {
    label: 'Aktuelles Jahr',
    value: {
      from: startOfYear(new Date()),
      to: endOfYear(new Date())
    }
  },
  {
    label: 'Letztes Jahr',
    value: {
      from: startOfYear(subYears(new Date(), 1)),
      to: endOfYear(subYears(new Date(), 1))
    }
  }
];