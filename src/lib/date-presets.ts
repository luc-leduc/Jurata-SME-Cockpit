import { startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export interface DatePreset {
  label: string;
  description?: string;
  date?: Date;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export function getBalancePresets(currentYear = new Date().getFullYear()): DatePreset[] {
  return [
    {
      label: `Provisorische Abschlussbilanz ${currentYear}`,
      description: `per 31. Dezember ${currentYear}`,
      date: endOfYear(new Date(currentYear, 0, 1))
    },
    {
      label: `Eröffnungsbilanz ${currentYear}`,
      description: `per 1. Januar ${currentYear}`,
      date: startOfYear(new Date(currentYear, 0, 1))
    },
    {
      label: `Abschlussbilanz ${currentYear - 1}`,
      description: `per 31. Dezember ${currentYear - 1}`,
      date: endOfYear(new Date(currentYear - 1, 0, 1))
    },
    {
      label: `Eröffnungsbilanz ${currentYear - 1}`,
      description: `per 1. Januar ${currentYear - 1}`,
      date: startOfYear(new Date(currentYear - 1, 0, 1))
    }
  ];
}

export function getIncomePresets(currentYear = new Date().getFullYear()): DatePreset[] {
  return [
    {
      label: 'Aktueller Monat',
      dateRange: {
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date())
      }
    },
    {
      label: `Geschäftsjahr ${currentYear}`,
      dateRange: {
        from: startOfYear(new Date(currentYear, 0, 1)),
        to: endOfYear(new Date(currentYear, 0, 1))
      }
    },
    {
      label: `Geschäftsjahr ${currentYear - 1}`,
      dateRange: {
        from: startOfYear(new Date(currentYear - 1, 0, 1)),
        to: endOfYear(new Date(currentYear - 1, 0, 1))
      }
    }
  ];
}