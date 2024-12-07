import i18next from 'i18next';

export function translateMonth(month: string) {
  // Remove dots from month abbreviations
  const cleanMonth = month.replace(/\./g, '');
  return i18next.t(`months.${cleanMonth}`, cleanMonth);
}
