import { UseFormReturn } from 'react-hook-form';
import { FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash } from 'lucide-react';
import { TransactionSection } from '../TransactionSection';
import { AccountSelect } from '../AccountSelect';
import { Receipt, Account, TransactionPosition } from '@/lib/types';
import { TransactionFormData } from '../TransactionForm';
import { useTranslation } from 'react-i18next';

interface BookingSectionProps {
  form: UseFormReturn<TransactionFormData>;
  isOpen: boolean;
  onToggle: () => void;
  receipt: Receipt | null;
  suggestions: {
    debit: Array<{ number: string; confidence: number }>;
    credit: Array<{ number: string; confidence: number }>;
  } | null;
  positions: TransactionPosition[];
  accounts: Account[];
  onUpdatePosition: (id: string, updates: Partial<TransactionPosition>) => void;
  onRemovePosition: (id: string) => void;
  onAddPosition: () => void;
}

export function BookingSection({
  form,
  isOpen,
  onToggle,
  receipt,
  suggestions,
  positions,
  accounts,
  onUpdatePosition,
  onRemovePosition,
  onAddPosition
}: BookingSectionProps) {
  const { t } = useTranslation();
  const totalAmount = positions.reduce((sum, pos) => sum + (pos.amount || 0), 0);

  return (
    <TransactionSection
      title={t('pages.journal.sections.booking.title')}
      isOpen={isOpen}
      onToggle={onToggle}
      status={{
        isComplete: Boolean(
          positions[0]?.debit_account_id && 
          positions[0]?.credit_account_id && 
          positions[0]?.amount > 0
        ),
        isProcessing: receipt?.processing,
        processingText: t('pages.journal.sections.booking.processing'),
        hasAiData: Boolean(suggestions?.debit?.length || suggestions?.credit?.length),
        summary: positions[0]?.debit_account_id && positions[0]?.credit_account_id
          ? `${positions.length} Position${positions.length === 1 ? '' : 'en'} | CHF ${
              totalAmount.toLocaleString('de-CH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            }`
          : t('pages.journal.sections.booking.notRecorded')
      }}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="grid grid-cols-24 gap-4">
          <div className="col-span-7">
            <FormLabel className="text-sm">{t('pages.journal.sections.booking.debitAccount')}</FormLabel>
          </div>
          <div className="col-span-7">
            <FormLabel className="text-sm">{t('pages.journal.sections.booking.creditAccount')}</FormLabel>
          </div>
          <div className="col-span-3">
            <FormLabel className="text-sm">{t('pages.journal.sections.booking.taxRate')}</FormLabel>
          </div>
          <div className="col-span-3">
            <FormLabel className="text-sm">{t('pages.journal.sections.booking.currency')}</FormLabel>
          </div>
          <div className="col-span-3">
            <FormLabel className="text-sm">{t('pages.journal.sections.booking.amount')}</FormLabel>
          </div>
          <div className="col-span-1">
            <FormLabel className="text-sm sr-only">{t('pages.journal.sections.booking.actions')}</FormLabel>
          </div>
        </div>

        <div className="space-y-2">
          {positions.map((position) => (
            <div key={position.id} className="grid grid-cols-24 gap-4">
            {/* Debit Account */}
            <div className="col-span-7">
              <AccountSelect
                accounts={accounts}
                suggestions={suggestions?.debit || []}
                value={position.debit_account_id}
                onChange={(value) => onUpdatePosition(position.id, { debit_account_id: value })}
                size="sm"
                placeholder={t('pages.journal.sections.booking.selectDebitAccount')}
              />
            </div>

            {/* Credit Account */}
            <div className="col-span-7">
              <AccountSelect
                accounts={accounts}
                suggestions={suggestions?.credit || []}
                value={position.credit_account_id}
                onChange={(value) => onUpdatePosition(position.id, { credit_account_id: value })}
                size="sm"
                placeholder={t('pages.journal.sections.booking.selectCreditAccount')}
              />
            </div>

            {/* Tax Rate */}
            <div className="col-span-3">
              <Input
                type="number"
                className="h-8 text-sm px-3"
                value={position.tax_rate ?? ''}
                onChange={(e) => onUpdatePosition(position.id, { 
                  tax_rate: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
                placeholder={t('pages.journal.sections.booking.taxRatePlaceholder')}
              />
            </div>

            {/* Currency */}
            <div className="col-span-3">
              <Select
                value={position.currency || 'CHF'}
                onValueChange={(value) => onUpdatePosition(position.id, { currency: value })}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder={t('pages.journal.sections.booking.currencyPlaceholder')} />
                </SelectTrigger>
                <SelectContent className="text-sm">
                  <SelectItem value="CHF">{t('pages.journal.sections.booking.currencyCHF')}</SelectItem>
                  <SelectItem value="EUR">{t('pages.journal.sections.booking.currencyEUR')}</SelectItem>
                  <SelectItem value="USD">{t('pages.journal.sections.booking.currencyUSD')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="col-span-3">
              <Input
                type="number"
                className="h-8 text-sm px-3"
                value={position.amount || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  onUpdatePosition(position.id, { 
                    amount: value ? parseFloat(value) : 0 
                  });
                  form.setValue('amount', value);
                }}
                placeholder={t('pages.journal.sections.booking.amountPlaceholder')}
              />
            </div>

            {/* Delete Button */}
            <div className="col-span-1 flex items-center justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemovePosition(position.id)}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onAddPosition}
          className="w-full mt-2 border-dashed"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span>{t('pages.journal.sections.booking.addPosition')}</span>
        </Button>
      </div>
    </TransactionSection>
  );
}