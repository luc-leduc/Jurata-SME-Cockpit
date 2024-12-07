import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { MonthGroup } from './MonthGroup';
import { ImportProgress } from './ImportProgress';
import { useAccounts } from '@/hooks/use-accounts';
import { parseExcelFile, importTransactions, TransactionGroup } from '@/lib/services/excel';

interface ImportState {
  id: string;
  processed: number;
  total: number;
  status: 'idle' | 'processing' | 'completed' | 'error';
  error?: string;
}

export function ImportDialog() {
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState<TransactionGroup[]>([]);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [importState, setImportState] = useState<ImportState>({
    id: '',
    processed: 0,
    total: 0,
    status: 'idle'
  });
  const [backgroundProcessing, setBackgroundProcessing] = useState(false);

  const { data: accounts } = useAccounts();
  const queryClient = useQueryClient();

  const totalSelected = groups
    .filter(g => g.selected)
    .reduce((sum, g) => sum + g.transactions.length, 0);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !accounts) return;

    try {
      const parsedGroups = await parseExcelFile(file);
      setGroups(parsedGroups);
      setOpen(true);
    } catch (error) {
      console.error('Failed to parse Excel file:', error);
      toast.error(error instanceof Error ? error.message : 'Fehler beim Lesen der Excel-Datei');
    }

    event.target.value = '';
  };

  const toggleMonth = (month: string) => {
    setExpandedMonths(prev => {
      const next = new Set(prev);
      if (next.has(month)) {
        next.delete(month);
      } else {
        next.add(month);
      }
      return next;
    });
  };

  const toggleGroupSelection = (month: string, selected: boolean) => {
    setGroups(prev => prev.map(group => 
      group.month === month ? { ...group, selected } : group
    ));
  };

  const toggleAll = () => {
    const allSelected = groups.every(g => g.selected);
    setGroups(prev => prev.map(group => ({ ...group, selected: !allSelected })));
  };

  const handleClose = () => {
    if (importing && !backgroundProcessing) {
      setBackgroundProcessing(true);
    }
    setOpen(false);
  };

  const startImport = async () => {
    if (!accounts || totalSelected === 0) return;

    try {
      setImporting(true);
      setImportState({
        id: '',
        processed: 0,
        total: totalSelected,
        status: 'processing'
      });

      const importId = await importTransactions(
        groups.filter(g => g.selected), 
        accounts,
        (processed, total) => {
          setImportState(prev => ({
            ...prev,
            id: importId,
            processed,
            total,
            status: 'processing'
          }));
        }
      );

      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      
      setImportState(prev => ({
        ...prev,
        id: importId,
        processed: totalSelected,
        total: totalSelected,
        status: 'completed'
      }));

      if (!backgroundProcessing) {
        setOpen(false);
      }
    } catch (error) {
      setImportState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Import fehlgeschlagen'
      }));

      console.error('Import failed:', error);
      toast.error(error instanceof Error ? error.message : 'Import fehlgeschlagen');
    } finally {
      if (!backgroundProcessing) {
        setImporting(false);
      }
    }
  };

  const handleCancel = () => {
    setImporting(false);
    setImportState(prev => ({ ...prev, status: 'idle' }));
    if (!backgroundProcessing) {
      setOpen(false);
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

      <Dialog 
        open={open} 
        onOpenChange={handleClose}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Excel Import</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {groups.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={groups.every(g => g.selected)}
                  onCheckedChange={toggleAll}
                  id="select-all"
                  disabled={importing}
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Alle Monate auswählen
                </label>
              </div>
            )}

            <ScrollArea className="h-[400px] rounded-md border">
              {groups.map(group => (
                <MonthGroup
                  key={group.month}
                  group={group}
                  expanded={expandedMonths.has(group.month)}
                  onToggleExpand={() => toggleMonth(group.month)}
                  onToggleSelect={(selected) => toggleGroupSelection(group.month, selected)}
                  disabled={importing}
                />
              ))}
            </ScrollArea>

            {importing && (
              <ImportProgress
                processed={importState.processed}
                total={importState.total}
                onCancel={handleCancel}
              />
            )}

            <div className="flex justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {totalSelected > 0 ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {totalSelected} Buchungen ausgewählt
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    Keine Buchungen ausgewählt
                  </>
                )}
              </div>
              <div className="flex gap-2">
                {importing ? (
                  !backgroundProcessing && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setBackgroundProcessing(true);
                        setOpen(false);
                      }}
                    >
                      Im Hintergrund fortsetzen
                    </Button>
                  )
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setOpen(false)}
                    >
                      Abbrechen
                    </Button>
                    <Button
                      onClick={startImport}
                      disabled={totalSelected === 0}
                    >
                      Import starten
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}