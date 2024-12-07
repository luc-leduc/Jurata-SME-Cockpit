import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { TransactionSection } from '../TransactionSection';
import { Receipt } from '@/lib/types';
import { TransactionFormData } from '../TransactionForm';
import { useTranslation } from 'react-i18next';

interface DocumentSectionProps {
  form: UseFormReturn<TransactionFormData>;
  isOpen: boolean;
  onToggle: () => void;
  receipt: Receipt | null;
}

export function DocumentSection({ form, isOpen, onToggle, receipt }: DocumentSectionProps) {
  const { t } = useTranslation();

  const renderDateField = (name: 'date' | 'due_date' | 'service_period_start' | 'service_period_end', label: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex-1">
          <FormLabel>{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? (
                    format(field.value, "dd.MM.yyyy")
                  ) : (
                    <span>{t('pages.journal.sections.document.selectDate')}</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={(date) =>
                  date < new Date("1900-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <TransactionSection
      title={t('pages.journal.sections.document.title')}
      isOpen={isOpen}
      onToggle={onToggle}
      status={{
        isComplete: Boolean(form.watch('document_ref') && form.watch('description')),
        isProcessing: receipt?.processing,
        processingText: t('pages.journal.sections.document.processing'),
        hasAiData: Boolean(form.watch('document_ref') || form.watch('description')),
        summary: form.watch('document_ref') && form.watch('date')
          ? t('pages.journal.sections.document.summary', {
              ref: form.watch('document_ref'),
              date: format(form.watch('date'), 'dd.MM.yyyy'),
              dueDate: form.watch('due_date') ? format(form.watch('due_date'), 'dd.MM.yyyy') : undefined
            })
          : t('pages.journal.sections.document.notRecorded')
      }}
    >
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          {renderDateField('date', t('pages.journal.sections.document.date'))}
          {renderDateField('due_date', t('pages.journal.sections.document.dueDate'))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {renderDateField('service_period_start', t('pages.journal.sections.document.servicePeriodStart'))}
          {renderDateField('service_period_end', t('pages.journal.sections.document.servicePeriodEnd'))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="document_ref"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('pages.journal.sections.document.reference')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('pages.journal.sections.document.referencePlaceholder')} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('pages.journal.sections.document.description')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('pages.journal.sections.document.descriptionPlaceholder')} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </TransactionSection>
  );
}