import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useAccounts } from '@/hooks/use-accounts';
import { usePositions } from '@/hooks/use-positions';
import { useSuggestions } from '@/hooks/use-suggestions';
import { Plus } from 'lucide-react';
import { Receipt } from '@/lib/types';
import { TransactionSection } from './TransactionSection';
import { IssuerSection } from './sections/IssuerSection';
import { DocumentSection } from './sections/DocumentSection';
import { BookingSection } from './sections/BookingSection';
import { useTranslation } from 'react-i18next';

const transactionSchema = z.object({
  date: z.date(),
  due_date: z.date().optional().nullable(),
  service_period_start: z.date().optional().nullable(),
  service_period_end: z.date().optional().nullable(),
  description: z.string().min(3, 'Beschreibung muss mindestens 3 Zeichen lang sein'),
  amount: z.string().min(1, 'Bitte geben Sie einen Betrag ein'),
  document_ref: z.string().min(1, 'Bitte geben Sie eine Beleg-Nr. ein'),
  issuer_company: z.string().optional(),
  issuer_first_name: z.string().optional(),
  issuer_last_name: z.string().optional(),
  issuer_street: z.string().optional(),
  issuer_zip: z.string().optional(),
  issuer_city: z.string().optional(),
  issuer_country: z.string().optional(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  form: UseFormReturn<TransactionFormData>;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  receipt: Receipt | null;
  suggestions: {
    debit: Array<{ number: string; confidence: number }>;
    credit: Array<{ number: string; confidence: number }>;
  } | null;
  positions: any[];
  accounts: any[];
  onUpdatePosition: (id: string, updates: any) => void;
  onRemovePosition: (id: string) => void;
  onAddPosition: () => void;
  openSections: Set<string>;
  onToggleSection: (section: string) => void;
}

export function TransactionForm({ 
  form,
  onSubmit,
  receipt,
  suggestions,
  positions,
  accounts,
  onUpdatePosition,
  onRemovePosition,
  onAddPosition,
  openSections,
  onToggleSection
}: TransactionFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <IssuerSection
            form={form}
            isOpen={openSections.has('issuer')} 
            onToggle={() => onToggleSection('issuer')}
            receipt={receipt}
          />

          <DocumentSection
            form={form}
            isOpen={openSections.has('document')} 
            onToggle={() => onToggleSection('document')}
            receipt={receipt}
          />

          <BookingSection
            form={form}
            isOpen={openSections.has('booking')} 
            onToggle={() => onToggleSection('booking')}
            receipt={receipt}
            suggestions={suggestions}
            positions={positions}
            accounts={accounts}
            onUpdatePosition={onUpdatePosition}
            onRemovePosition={onRemovePosition}
            onAddPosition={onAddPosition}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            {t('components.buttons.cancel')}
          </Button>
          <Button type="submit">{t('components.buttons.save')}</Button>
        </div>
      </form>
    </Form>
  );
}