import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAccounts } from '@/hooks/use-accounts';
import { parseExcelFile, importTransactions, TransactionGroup } from '@/lib/services/excel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Download, AlertCircle, CheckCircle } from 'lucide-react';
import { MonthGroup } from './MonthGroup';
import { ImportProgress } from './ImportProgress';
import { useTranslation } from 'react-i18next';

interface ImportState {
  processed: number;
  total: number;
  status: 'idle' | 'processing' | 'completed' | 'error' | 'cancelled';
  error?: string;
  notificationId?: string;
}

export function ExcelUploadDialog() {
  // State
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState<TransactionGroup[]>([]);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [importState, setImportState] = useState<ImportState>({
    processed: 0,
    total: 0,
    status: 'idle'
  });
  const [backgroundProcessing, setBackgroundProcessing] = useState(false);

  // Hooks
  const { data: accounts } = useAccounts();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // Computed values
  const totalSelected = groups
    .filter(g => g.selected)
    .reduce((sum, g) => sum + g.transactions.length, 0);

  // Event handlers
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !accounts) return;

    try {
      const parsedGroups = await parseExcelFile(file);
      setGroups(parsedGroups);
      setOpen(true);
    } catch (error) {
      console.error('Failed to parse Excel file:', error);
      toast.error(error instanceof Error ? error.message : t('pages.journal.excel.parseError'));
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
        processed: 0,
        total: totalSelected,
        status: 'processing'
      });

      await importTransactions(
        groups.filter(g => g.selected), 
        accounts,
        (processed, total) => {
          setImportState(prev => ({
            ...prev,
            processed,
            total,
            status: 'processing'
          }));
        }
      );
      
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      
      setImportState(prev => ({
        ...prev,
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


  return (
    <>
      <Button variant="outline" asChild className="cursor-pointer">
        <label>
          <Download className="mr-2 h-4 w-4" />
          {t('pages.journal.excel.importExcel')}
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
            <DialogTitle>{t('components.excelImport.title')}</DialogTitle>
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
                  {t('components.excelImport.selectAllMonths')}
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
              />
            )}

            <div className="flex justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {totalSelected > 0 ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t('components.excelImport.transactionsSelected', { count: totalSelected })}
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    {t('pages.journal.excel.noTransactionsSelected')}
                  </>
                )}
              </div>
              <div className="flex gap-2">
                {importing ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setBackgroundProcessing(true);
                      setOpen(false);
                    }}
                    disabled={backgroundProcessing}
                  >
                    {t('pages.journal.excel.continueInBackground')}
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setOpen(false)}
                    >
                      {t('components.excelImport.cancel')}
                    </Button>
                    <Button
                      onClick={startImport}
                      disabled={totalSelected === 0}
                    >
                      {t('components.excelImport.startImport')}
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