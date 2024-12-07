export async function parseAccountExcel(file: File) {
  const rows = await readXlsx(file);
  
  if (!rows?.length) {
    throw new Error('Die Excel-Datei enthält keine Daten');
  }

  const groups = new Map<string, {
    number: string;
    name: string;
    accounts: Array<{
      number: string;
      name: string;
      type: string;
      systemAccount?: string;
      linkedAccount?: string;
      vatType?: string;
    }>;
    selected: boolean;
    selectedAccounts: Set<string>;
  }>();

  // Skip header row
  for (let i = 1; i < rows.length; i++) {
    try {
      const [number, name, parentGroup, type, systemAccount, linkedAccount, vatType] = rows[i];

      if (!number || !name || !type) {
        continue;
      }

      const accountNumber = String(number).trim();
      const accountName = String(name).trim();
      const accountType = String(type).trim();
      const groupNumber = String(parentGroup || '').trim();

      // Skip empty rows
      if (!accountNumber || !accountName) {
        continue;
      }

      // Handle groups
      if (accountType.toLowerCase() === 'gruppe') {
        if (!groups.has(accountNumber)) {
          groups.set(accountNumber, {
            number: accountNumber,
            name: accountName,
            accounts: [],
            selected: true,
            selectedAccounts: new Set()
          });
        }
      }
      // Handle accounts
      else {
        if (groupNumber && groups.has(groupNumber)) {
          const group = groups.get(groupNumber)!;
          group.accounts.push({
            number: accountNumber,
            name: accountName,
            type: accountType,
            systemAccount: systemAccount ? String(systemAccount) : undefined,
            linkedAccount: linkedAccount ? String(linkedAccount) : undefined,
            vatType: vatType ? String(vatType) : undefined
          });
          group.selectedAccounts.add(accountNumber);
        }
      }
    } catch (error) {
      console.error('Failed to parse row:', error);
    }
  }

  return Array.from(groups.entries()).map(([number, group]) => ({
    ...group,
    accounts: group.accounts.sort((a, b) => a.number.localeCompare(b.number))
  })).sort((a, b) => a.number.localeCompare(b.number));
}

export async function importAccounts(
  groups: Array<{
    number: string;
    name: string;
    accounts: Array<{
      number: string;
      name: string;
      type: string;
      systemAccount?: string;
      linkedAccount?: string;
      vatType?: string;
    }>;
    selected: boolean;
    selectedAccounts: Set<string>;
  }>,
  onProgress?: (processed: number, total: number) => void
) {
  // Get all account numbers that will be imported
  const accountNumbers = groups
    .filter(g => g.selected)
    .flatMap(g => Array.from(g.selectedAccounts));

  const groupNumbers = groups
    .filter(g => g.selected)
    .map(g => g.number);

  // Check for existing accounts and groups
  const existingAccounts = await checkExistingAccounts(accountNumbers);
  const existingGroups = await checkExistingGroups(groupNumbers);

  // Filter out existing accounts and groups
  const filteredGroups = groups.filter(g => g.selected && !existingGroups.has(g.number));
  
  let processed = 0;
  const total = filteredGroups.reduce((sum, g) => 
    sum + Array.from(g.selectedAccounts)
      .filter(n => !existingAccounts.has(n))
      .length, 0
  );

  // First create all groups
  for (const group of filteredGroups) {
    try {
      await createAccountGroup({
        number: group.number,
        name: group.name,
        parent_id: null
      });
    } catch (error) {
      console.error(`Failed to create group ${group.number}:`, error);
      throw error;
    }
  }

  // Then create accounts for each group
  for (const group of filteredGroups) {
    const accounts = group.accounts
      .filter(a => group.selectedAccounts.has(a.number) && !existingAccounts.has(a.number));

    for (const account of accounts) {
      try {
        await createAccount({
          number: account.number,
          name: account.name,
          type: account.type,
          group_id: null, // Will be updated once we have the group ID
          is_system: !!account.systemAccount
        });

        processed++;
        onProgress?.(processed, total);
      } catch (error) {
        console.error(`Failed to create account ${account.number}:`, error);
        throw error;
      }
    }
  }

  return { processed, total };
}
import { nanoid } from 'nanoid';
import { Account } from '../types';
import { createTransaction } from './transactions';
import { addNotification, updateNotification, removeNotification } from '../notifications';
import readXlsx from 'read-excel-file';

// Types
export interface ParsedTransaction {
  date: Date;
  documentRef: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
}

export interface TransactionGroup {
  month: string;
  transactions: ParsedTransaction[];
  selected: boolean;
}

interface ImportProgress {
  id: string;
  total: number;
  processed: number;
  abortController: AbortController;
  onProgress?: (processed: number, total: number) => void;
}

// Import Manager (Singleton)
class ImportManager {
  private static instance: ImportManager;
  private imports: Map<string, ImportProgress>;

  private constructor() {
    this.imports = new Map();
  }

  static getInstance(): ImportManager {
    if (!this.instance) {
      this.instance = new ImportManager();
    }
    return this.instance;
  }

  startImport(total: number, onProgress?: (processed: number, total: number) => void): string {
    const id = nanoid();
    this.imports.set(id, {
      id,
      total,
      processed: 0,
      abortController: new AbortController(),
      onProgress
    });
    return id;
  }

  getImport(id: string): ImportProgress | undefined {
    return this.imports.get(id);
  }

  updateProgress(id: string, processed: number) {
    const importData = this.imports.get(id);
    if (importData) {
      importData.processed = processed;
      importData.onProgress?.(processed, importData.total);
    }
  }

  cancelImport(id: string) {
    const importData = this.imports.get(id);
    if (importData) {
      importData.abortController.abort();
      this.imports.delete(id);
    }
  }

  removeImport(id: string) {
    this.imports.delete(id);
  }
}

// Parse Excel file and return preview
export async function parseExcelFile(file: File): Promise<TransactionGroup[]> {
  const rows = await readXlsx(file);
  
  if (!rows?.length) {
    throw new Error('Die Excel-Datei enthält keine Daten');
  }
  
  const transactions = new Map<string, ParsedTransaction[]>();
  let validTransactions = 0;
  let invalidRows = 0;

  // Skip header row
  for (let i = 1; i < rows.length; i++) {
    try {
      const [, dateValue, documentRef, debitAccount, creditAccount, description, amountValue] = rows[i];

      const date = parseDateValue(dateValue);
      if (!date || !validateDate(date)) {
        invalidRows++;
        continue;
      }

      const amount = parseAmount(amountValue);
      if (amount === null) {
        invalidRows++;
        continue;
      }

      const debitAccountNumber = parseAccountNumber(debitAccount);
      const creditAccountNumber = parseAccountNumber(creditAccount);
      
      if (!debitAccountNumber || !creditAccountNumber) {
        invalidRows++;
        continue;
      }

      const transaction: ParsedTransaction = {
        date,
        documentRef: String(documentRef || ''),
        description: String(description || ''),
        debitAccount: debitAccountNumber,
        creditAccount: creditAccountNumber,
        amount
      };

      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!transactions.has(monthKey)) {
        transactions.set(monthKey, []);
      }
      transactions.get(monthKey)!.push(transaction);
      validTransactions++;
    } catch (error) {
      invalidRows++;
    }
  }

  return Array.from(transactions.entries())
    .map(([month, monthTransactions]) => ({
      month,
      transactions: monthTransactions,
      selected: true
    }))
    .sort((a, b) => b.month.localeCompare(a.month));
}

// Import transactions with progress tracking
export async function importTransactions(
  groups: TransactionGroup[],
  accounts: Account[],
  onProgress?: (processed: number, total: number) => void
): Promise<string> {
  const selectedTransactions = groups
    .filter(g => g.selected)
    .flatMap(g => g.transactions);

  if (selectedTransactions.length === 0) {
    throw new Error('Keine Buchungen zum Importieren ausgewählt');
  }

  const importManager = ImportManager.getInstance();
  const importId = importManager.startImport(selectedTransactions.length, onProgress);

  const notificationId = addNotification({
    title: 'Excel Import läuft...',
    message: 'Import wird gestartet...',
    type: 'progress',
    progress: 0,
    actions: [{
      label: 'Abbrechen',
      variant: 'destructive',
      onClick: () => importManager.cancelImport(importId)
    }]
  });

  try {
    let processed = 0;
    const total = selectedTransactions.length;

    for (const transaction of selectedTransactions) {
      const importData = importManager.getImport(importId);
      if (!importData || importData.abortController.signal.aborted) {
        throw new Error('Import wurde abgebrochen');
      }

      const debitAccount = accounts.find(a => a.number === transaction.debitAccount);
      const creditAccount = accounts.find(a => a.number === transaction.creditAccount);

      if (!debitAccount || !creditAccount) {
        throw new Error(
          `Konto nicht gefunden: ${!debitAccount ? transaction.debitAccount : transaction.creditAccount}`
        );
      }

      await createTransaction({
        date: transaction.date.toISOString().split('T')[0],
        description: transaction.description,
        document_ref: transaction.documentRef,
        amount: transaction.amount,
        debit_account_id: debitAccount.id,
        credit_account_id: creditAccount.id
      });

      processed++;
      const progress = Math.round((processed / total) * 100);

      // Update both import manager and notification
      importManager.updateProgress(importId, processed);
      updateNotification(notificationId, {
        message: `${processed} von ${total} Buchungen importiert...`,
        progress
      });
    }

    removeNotification(notificationId);
    addNotification({
      title: 'Excel Import abgeschlossen',
      message: `${total} Buchungen erfolgreich importiert`,
      type: 'success'
    });

    return importId;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    removeNotification(notificationId);
    addNotification({
      title: 'Excel Import fehlgeschlagen',
      message: errorMessage,
      type: 'error'
    });

    throw error;
  } finally {
    importManager.removeImport(importId);
  }
}

// Helper functions
function parseDateValue(value: any): Date | null {
  if (typeof value === 'string') {
    const parts = value.split('.');
    if (parts.length === 3) {
      // Create date in local timezone to avoid UTC conversion
      const date = new Date(
        parseInt(parts[2]), // year
        parseInt(parts[1]) - 1, // month
        parseInt(parts[0]) // day
      );
      // Set time to noon to avoid any timezone issues
      date.setHours(12, 0, 0, 0);
      return date;
    }
  } else if (value instanceof Date) {
    // Clone date and set to noon local time
    const date = new Date(value);
    date.setHours(12, 0, 0, 0);
    return date;
  }
  return null;
}

function validateDate(date: Date | null): boolean {
  if (!date || isNaN(date.getTime())) return false;
  const year = date.getFullYear();
  return year >= 2000 && year <= 2100;
}

function parseAmount(value: any): number | null {
  if (typeof value === 'number') return value;
  
  const cleaned = String(value)
    .replace(/[^0-9.-]/g, '')
    .replace(',', '.');
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

function parseAccountNumber(value: any): string | null {
  if (!value) return null;
  const number = String(value).split(' ')[0].trim();
  return number || null;
}