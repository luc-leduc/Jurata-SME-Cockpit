export const ACCOUNT_TYPES = {
  ASSET: 'Aktiven',
  LIABILITY: 'Passiven',
  EXPENSE: 'Aufwand',
  REVENUE: 'Ertrag',
} as const;

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', path: '/' },
  { id: 'tasks', label: 'Aufgaben', path: '/tasks' },
  { id: 'journal', label: 'Journal', path: '/journal' },
  { id: 'balance', label: 'Bilanz', path: '/balance' },
  { id: 'reports', label: 'Berichte', path: '/reports' },
  { id: 'settings', label: 'Einstellungen', path: '/settings' },
] as const;