import { useState } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ImportPreviewProps {
  preview: Record<string, {
    transactions: Array<{
      date: Date;
      documentRef: string;
      description: string;
      debitAccount: string;
      creditAccount: string;
      amount: number;
    }>;
    total: number;
    selected: boolean;
  }>;
  progress?: {
    status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'error';
    processed: number;
    total: number;
    error?: string;
  };
  onSelectionChange: (month: string, selected: boolean) => void;
  onImport: () => void;
  onCancel: () => void;
}

export function ImportPreview({ 
  preview, 
  progress, 
  onSelectionChange,
  onImport,
  onCancel
}: ImportPreviewProps) {
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  const totalSelected = Object.entries(preview)
    .filter(([_, data]) => data.selected)
    .reduce((sum, [_, data]) => sum + data.transactions.length, 0);

  const totalAmount = Object.entries(preview)
    .filter(([_, data]) => data.selected)
    .reduce((sum, [_, data]) => sum + data.total, 0);

  const getStatusIcon = () => {
    if (!progress) return null;
    
    switch (progress.status) {
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    if (!progress) return '';
    
    switch (progress.status) {
      case 'processing':
        return `${progress.processed} von ${progress.total} Buchungen importiert...`;
      case 'completed':
        return `${progress.total} Buchungen erfolgreich importiert`;
      case 'cancelled':
        return 'Import wurde abgebrochen';
      case 'error':
        return progress.error || 'Ein Fehler ist aufgetreten';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Excel Import</h3>
          <p className="text-sm text-muted-foreground">
            {totalSelected} Buchungen ausgewählt | Total CHF {totalAmount.toLocaleString('de-CH', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {progress?.status === 'processing' && (
            <Button variant="outline" onClick={onCancel}>
              Abbrechen
            </Button>
          )}
          {!progress && (
            <Button onClick={onImport} disabled={totalSelected === 0}>
              {totalSelected} Buchungen importieren
            </Button>
          )}
        </div>
      </div>

      {progress && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon()}
              <span className="text-sm font-medium">{getStatusText()}</span>
            </div>
            <Progress 
              value={progress.total > 0 ? (progress.processed / progress.total) * 100 : 0} 
            />
          </CardContent>
        </Card>
      )}

      <ScrollArea className="h-[calc(100vh-16rem)] pr-4">
        <div className="space-y-4">
          {Object.entries(preview)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([month, data]) => (
              <Card key={month}>
                <CardHeader className="py-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={data.selected}
                      onCheckedChange={(checked) => 
                        onSelectionChange(month, checked as boolean)
                      }
                      disabled={!!progress}
                    />
                    <CardTitle 
                      className="text-sm font-medium flex-1 cursor-pointer"
                      onClick={() => setExpandedMonth(
                        expandedMonth === month ? null : month
                      )}
                    >
                      {format(new Date(month), 'MMMM yyyy', { locale: de })}
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">
                      {data.transactions.length} Buchungen |{' '}
                      CHF {data.total.toLocaleString('de-CH', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </CardHeader>
                {expandedMonth === month && (
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Datum</TableHead>
                          <TableHead>Beleg</TableHead>
                          <TableHead>Beschreibung</TableHead>
                          <TableHead>Soll</TableHead>
                          <TableHead>Haben</TableHead>
                          <TableHead className="text-right">Betrag</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.transactions.map((transaction, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {format(transaction.date, 'dd.MM.yyyy')}
                            </TableCell>
                            <TableCell>{transaction.documentRef}</TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell>{transaction.debitAccount}</TableCell>
                            <TableCell>{transaction.creditAccount}</TableCell>
                            <TableCell className="text-right tabular-nums">
                              {transaction.amount.toLocaleString('de-CH', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                )}
              </Card>
            ))}
        </div>
      </ScrollArea>
    </div>
  );
}