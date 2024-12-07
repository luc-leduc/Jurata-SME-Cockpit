export function downloadCsv(data: string, filename: string) {
  const blob = new Blob(['\ufeff' + data], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatCsvValue(value: any): string {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  
  // Check if value needs to be quoted
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    // Escape quotes and wrap in quotes
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

export function createCsvContent(headers: string[], rows: any[][]): string {
  const headerRow = headers.map(formatCsvValue).join(',');
  const dataRows = rows.map(row => row.map(formatCsvValue).join(','));
  return [headerRow, ...dataRows].join('\n');
}