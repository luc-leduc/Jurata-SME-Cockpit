import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAccounts } from '@/hooks/use-accounts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Upload, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { ACCOUNT_TYPES } from '@/lib/constants';
import readXlsx from 'read-excel-file';
import { createAccountBatch, createAccountGroupBatch } from '@/lib/services/accounts';
import { AccountGroupRow } from './AccountGroupRow';
import { AccountRow } from './AccountRow';
import { GroupData } from './types';
import { cn } from '@/lib/utils';

// Helper functions
const mapAccountType = (type: string): keyof typeof ACCOUNT_TYPES | null => {
  switch (type.toLowerCase()) {
    case 'aktiv': return 'Aktiven';
    case 'passiv': return 'Passiven';
    case 'aufwand': return 'Aufwand';
    case 'ertrag': return 'Ertrag';
    default: return null;
  }
};

const processGroups = (rows: any[], existingAccounts: any[]) => {
  const groups = new Map<string, GroupData>();

  // Map system account types
  const mapSystemAccount = (value: string): string | undefined => {
    const systemMap: Record<string, string> = {
      'PROFIT_AND_LOSS': 'PNL',
      'OPENING_BALANCE_SHEET': 'OBS',
      'CLOSING_BALANCE_SHEET': 'CBS',
      'ANNUAL_PROFIT': 'AP',
      'BALANCE_TAKEOVER': 'BT',
      'ACCOUNTS_CLOSING': 'AC',
      'CURRENCY_EXPENSE': 'FX_EXP',
      'CURRENCY_INCOME': 'FX_INC',
      'EXTRAORDINARY_INCOME': 'EXT_INC',
      'NON_COMPANY_INCOME': 'NC_INC',
      'OUT_OF_PERIOD_INCOME': 'OOP_INC',
      'TAX_ROUNDING_DIFFS': 'TAX_ROUND',
      'CORRECTION': 'CORR'
    };
    return value ? systemMap[value] : undefined;
  };

  // First pass: Create groups
  rows.slice(1).forEach(row => {
    const [number, name, parentGroup, type, systemAccount, kontoart] = row;
    if (!number || !name || !type) return;

    const numberStr = String(number).trim();
    const typeStr = String(type).toLowerCase();
    const parentGroupStr = parentGroup ? String(parentGroup).trim() : '';
    const isKomplett = kontoart === 'Komplett';

    if (typeStr === 'gruppe' && /^\d{1,5}$/.test(numberStr)) {
      let level = 1;
      if (parentGroupStr && groups.has(parentGroupStr)) {
        level = groups.get(parentGroupStr)!.level + 1;
      }

      groups.set(numberStr, {
        number: numberStr,
        name: String(name).trim(),
        level,
        subgroups: [],
        accounts: [],
        systemAccount: mapSystemAccount(systemAccount),
        selected: true,
        selectedAccounts: new Set()
      });

      if (parentGroupStr && groups.has(parentGroupStr)) {
        groups.get(parentGroupStr)!.subgroups.push(groups.get(numberStr)!);
      }
    }
  });

  // Second pass: Add accounts to groups
  rows.slice(1).forEach(row => {
    const [number, name, parentGroup, type, systemAccount, kontoart] = row;
    if (!number || !name) return;
    if (String(type).toLowerCase() === 'gruppe') return;

    const numberStr = String(number).trim();
    const parentGroupStr = parentGroup ? String(parentGroup).trim() : '';
    const isKomplett = kontoart === 'Komplett';
    const typeStr = String(type);
    const mappedType = typeStr === 'Komplett' ? 'Aktiven' : mapAccountType(typeStr);
    
    if (!mappedType) return;
    
    // For Komplett accounts, create a virtual group if needed
    if (isKomplett && (!parentGroupStr || !groups.has(parentGroupStr))) {
      const groupNumber = numberStr.slice(0, -2) + '00';
      if (!groups.has(groupNumber)) {
        groups.set(groupNumber, {
          number: groupNumber,
          name: `Gruppe ${groupNumber}`,
          level: 1,
          subgroups: [],
          accounts: [],
          selected: true,
          selectedAccounts: new Set(),
          isKomplett: true
        });
      }
      const account = {
        number: numberStr,
        name: String(name).trim(),
        type: mappedType,
        systemAccount: mapSystemAccount(systemAccount),
        isKomplett,
        exists: existingAccounts.some(a => a.number === numberStr)
      };
      groups.get(groupNumber)!.accounts.push(account);
      if (!account.exists) {
        groups.get(groupNumber)!.selectedAccounts.add(numberStr);
      }
      return;
    }

    // Regular accounts must have a valid parent group
    if (!parentGroupStr || !groups.has(parentGroupStr)) return;

    const group = groups.get(parentGroupStr)!;
    const account = {
      number: numberStr,
      name: String(name).trim(),
      type: mappedType,
      systemAccount: mapSystemAccount(systemAccount),
      isKomplett,
      exists: existingAccounts.some(a => a.number === numberStr)
    };

    group.accounts.push(account);
    if (!account.exists) {
      group.selectedAccounts.add(numberStr);
    }
  });

  return groups;
};

const sortGroups = (group: GroupData): GroupData => ({
  ...group,
  subgroups: group.subgroups
    .sort((a, b) => a.number.localeCompare(b.number))
    .map(sortGroups)
});

export function ExcelAccountImport() {
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);

  const { data: existingAccounts } = useAccounts();
  const queryClient = useQueryClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !existingAccounts) return;

    try {
      const rows = await readXlsx(file);
      if (!rows?.length) throw new Error('Die Excel-Datei enthält keine Daten');

      const groupsMap = processGroups(rows, existingAccounts);

      // Get and sort top-level groups
      const topLevelGroups = Array.from(groupsMap.values())
        .filter(group => !Array.from(groupsMap.values()).some(g => 
          g.subgroups.some(sub => sub.number === group.number)
        ))
        .sort((a, b) => a.number.localeCompare(b.number))
        .map(sortGroups);

      setGroups(topLevelGroups);
      setOpen(true);
    } catch (error) {
      console.error('Failed to parse Excel file:', error);
      toast.error('Fehler beim Lesen der Excel-Datei');
    }

    event.target.value = '';
  };

  const toggleCollapse = (groupNumber: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupNumber)) {
        next.delete(groupNumber);
      } else {
        next.add(groupNumber);
      }
      return next;
    });
  };

  const updateGroupSelection = (group: GroupData, selected: boolean): GroupData => ({
    ...group,
    selected,
    selectedAccounts: selected 
      ? new Set(group.accounts.filter(a => !a.exists).map(a => a.number))
      : new Set(),
    subgroups: group.subgroups.map(sub => updateGroupSelection(sub, selected))
  });

  const toggleGroupSelection = (groupNumber: string, selected: boolean) => {
    setGroups(prev => prev.map(group => {
      if (group.number === groupNumber) {
        return updateGroupSelection(group, selected);
      }
      
      const updateSubgroups = (g: GroupData): GroupData => ({
        ...g,
        subgroups: g.subgroups.map(sub => 
          sub.number === groupNumber 
            ? updateGroupSelection(sub, selected)
            : updateSubgroups(sub)
        )
      });
      
      return updateSubgroups(group);
    }));
  };

  const toggleAccountSelection = (groupNumber: string, accountNumber: string, selected: boolean) => {
    const updateGroup = (group: GroupData): GroupData => {
      if (group.number === groupNumber) {
        const newSelectedAccounts = new Set(group.selectedAccounts);
        if (selected) {
          newSelectedAccounts.add(accountNumber);
        } else {
          newSelectedAccounts.delete(accountNumber);
        }
        
        return {
          ...group,
          selected: newSelectedAccounts.size > 0,
          selectedAccounts: newSelectedAccounts
        };
      }
      
      return {
        ...group,
        subgroups: group.subgroups.map(updateGroup)
      };
    };

    setGroups(prev => prev.map(updateGroup));
  };

  const toggleAll = () => {
    const allSelected = groups.every(g => g.selected);
    setGroups(prev => prev.map(group => updateGroupSelection(group, !allSelected)));
  };

  const countSelectedAccounts = (groups: GroupData[]): number => {
    return groups.reduce((sum, group) => {
      const selectedInGroup = group.selectedAccounts.size;
      const selectedInSubgroups = countSelectedAccounts(group.subgroups);
      return sum + selectedInGroup + selectedInSubgroups;
    }, 0);
  };

  const renderGroupRecursive = (group: GroupData) => {
    const isCollapsed = collapsedGroups.has(group.number);

    return (
      <div key={group.number} className="border-b last:border-0">
        <AccountGroupRow
          group={group}
          level={group.level - 1}
          isCollapsed={isCollapsed}
          isSelected={group.selected}
          disabled={importing}
          onToggleCollapse={() => toggleCollapse(group.number)}
          onToggleSelect={(selected) => toggleGroupSelection(group.number, selected)}
        />

        <div className={cn("border-t bg-muted/50", isCollapsed && "hidden")}>
          {group.accounts.length > 0 && (
            <>
              <div className="grid grid-cols-[auto_1fr_2fr_1fr_1fr] gap-4 px-4 py-2 text-xs font-medium text-muted-foreground">
                <div></div>
                <div>Nummer</div>
                <div>Bezeichnung</div>
                <div>Typ</div>
                <div>Status</div>
              </div>
              {group.accounts.map((account) => (
                <AccountRow
                  key={account.number}
                  account={account}
                  level={group.level}
                  isSelected={group.selectedAccounts.has(account.number)}
                  disabled={importing}
                  onToggleSelect={(selected) => 
                    toggleAccountSelection(group.number, account.number, selected)
                  }
                />
              ))}
            </>
          )}
          {group.subgroups.map(renderGroupRecursive)}
        </div>
      </div>
    );
  };

  const startImport = async () => {
    const collectGroups = (groups: GroupData[], parentGroup?: string): Array<{
      number: string; 
      name: string;
      system_account?: string;
      parent_group?: string;
    }> => {
      return groups.flatMap(group => {
        // Get all subgroups recursively with current group as parent
        const subgroups = collectGroups(group.subgroups, group.number);
        
        // Return current group with its parent and all subgroups
        return [
          {
            number: group.number,
            name: group.name,
            system_account: group.systemAccount,
            parent_group: parentGroup // Use passed parent group
          },
          ...subgroups
        ];
      });
    };

    const collectAccounts = (group: GroupData, groupIdMap: Map<string, string>) => {
      const accounts = group.accounts
        .filter(a => group.selectedAccounts.has(a.number) && !a.exists)
        .map(a => ({
          number: a.number,
          name: a.name,
          type: a.type,
          group_id: groupIdMap.get(group.number),
          is_system: a.systemAccount === 'true' || a.systemAccount === 'JA'
        }));

      return [...accounts, ...group.subgroups.flatMap(g => collectAccounts(g, groupIdMap))];
    };

    const groupsToCreate = collectGroups(groups);
    if (groupsToCreate.length === 0) {
      toast.error('Keine Konten zum Importieren ausgewählt');
      return;
    }

    try {
      setImporting(true);

      // Create all groups first without parent references
      const sortedGroups = collectGroups(groups)
        .sort((a, b) => a.number.length - b.number.length);

      const createdGroups = await createAccountGroupBatch(
        sortedGroups.map(group => ({
          number: group.number,
          name: group.name,
          system_account: group.system_account,
          parent_id: null // Initially create without parent references
        }))
      );

      // Create mapping from group number to ID
      const groupIdMap = new Map(createdGroups.map(g => [g.number, g.id]));

      // Update groups with parent references
      const groupUpdates = sortedGroups
        .filter(g => g.parent_group)
        .map(group => ({
          number: group.number,
          name: group.name,
          system_account: group.system_account,
          parent_id: groupIdMap.get(group.parent_group)
        }));

      // Update all groups with their parent references
      if (groupUpdates.length > 0) {
        await createAccountGroupBatch(groupUpdates);
      }

      // Create accounts with correct group references
      const accountsToCreate = groups.flatMap(g => collectAccounts(g, groupIdMap));
      for (let i = 0; i < accountsToCreate.length; i += 100) {
        const chunk = accountsToCreate.slice(i, i + 100);
        await createAccountBatch(chunk);
      }

      await queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success(
        `${groupsToCreate.length} Kontengruppen und ${accountsToCreate.length} Konten erfolgreich importiert`
      );

      setGroups([]);
      setCollapsedGroups(new Set());
      setOpen(false);
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Fehler beim Importieren der Konten');
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <Button variant="outline" asChild className="cursor-pointer">
        <label>
          <Upload className="mr-2 h-4 w-4" />
          Excel importieren
          <input
            type="file"
            className="hidden"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
          />
        </label>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kontenplan importieren</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={groups.every(g => g.selected)}
                onCheckedChange={toggleAll}
                id="select-all"
                disabled={importing}
                className="transition-none"
              />
              <label
                htmlFor="select-all"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Alle Konten auswählen
              </label>
            </div>

            <ScrollArea className="h-[400px] rounded-md border">
              {groups.map(renderGroupRecursive)}
            </ScrollArea>

            <div className="flex justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {countSelectedAccounts(groups) > 0 ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {countSelectedAccounts(groups)} Konten ausgewählt
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    Keine Konten ausgewählt
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!importing) {
                      setOpen(false);
                      setGroups([]);
                      setCollapsedGroups(new Set());
                    }
                  }}
                  disabled={importing}
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={startImport}
                  disabled={countSelectedAccounts(groups) === 0 || importing}
                  className="min-w-[120px]"
                >
                  {importing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importiere...
                    </>
                  ) : (
                    'Import starten'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}