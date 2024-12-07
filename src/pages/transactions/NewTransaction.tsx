import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

// Components
import { CustomResizeHandle } from '@/components/ui/custom-resize-handle';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ReceiptUpload } from '@/components/transactions/ReceiptUpload';
import { TransactionForm } from '@/components/transactions/TransactionForm';

// Hooks and Services
import { useAccounts } from '@/hooks/use-accounts';
import { usePositions } from '@/hooks/use-positions';
import { createTransaction } from '@/lib/services/transactions';
import { extractReceiptData } from '@/lib/azure';
import { suggestAccounts } from '@/lib/services/suggestions';

// Types
import { Receipt } from '@/lib/types';

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

export function NewTransaction() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: accounts = [] } = useAccounts();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [suggestions, setSuggestions] = useState<{
    debit: Array<{ number: string; confidence: number }>;
    credit: Array<{ number: string; confidence: number }>;
  } | null>(null);
  const { positions, addPosition, removePosition, updatePosition } = usePositions();
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const { t } = useTranslation();

  // Form setup
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: new Date(),
      description: '',
      amount: '',
      document_ref: '',
      issuer_company: '',
      issuer_first_name: '',
      issuer_last_name: '',
      issuer_street: '',
      issuer_zip: '',
      issuer_city: '',
      issuer_country: '',
      due_date: null,
      service_period_start: null,
      service_period_end: null,
    },
  });

  // Get account suggestions based on description
  const getAccountSuggestions = async (description: string, issuer?: any) => {
    if (!description || !accounts.length) return;

    try {
      const suggestions = await suggestAccounts(description, issuer, accounts);
      setSuggestions(suggestions);

      // Apply suggestions to first position if no accounts are selected
      if (suggestions && positions[0] && !positions[0].debit_account_id && !positions[0].credit_account_id) {
        const debitAccount = accounts.find(a => a.number === suggestions.debit[0]?.number);
        const creditAccount = accounts.find(a => a.number === suggestions.credit[0]?.number);

        if (debitAccount) {
          updatePosition(positions[0].id, { debit_account_id: debitAccount.id });
        }
        if (creditAccount) {
          updatePosition(positions[0].id, { credit_account_id: creditAccount.id });
        }
      }
    } catch (error) {
      console.error('Failed to get account suggestions:', error);
    }
  };

  // Receipt processing
  const handleFile = async (file: File) => {
    try {
      const preview = URL.createObjectURL(file);
      setReceipt({ file, preview, processing: true });

      const data = await extractReceiptData(file);
      const updates: Record<string, any> = {};

      // Update form fields
      if (data?.date) form.setValue('date', new Date(data.date));
      if (data?.description) {
        form.setValue('description', data.description);
        // Get suggestions based on description and issuer
        await getAccountSuggestions(data.description, data.issuer);
      }
      if (data?.documentRef) form.setValue('document_ref', data.documentRef);
      if (data?.dueDate) form.setValue('due_date', new Date(data.dueDate));
      if (data?.servicePeriodStart) form.setValue('service_period_start', new Date(data.servicePeriodStart));
      if (data?.servicePeriodEnd) form.setValue('service_period_end', new Date(data.servicePeriodEnd));

      // Update amount and tax
      if (data?.amount) {
        form.setValue('amount', data.amount.toString());
        updates.amount = data.amount;
      }
      if (data?.taxRate) {
        updates.tax_rate = data.taxRate;
      }
      if (data?.currency) {
        updates.currency = data.currency;
      }

      // Update issuer information
      if (data?.issuer) {
        if (data.issuer.company) form.setValue('issuer_company', data.issuer.company);
        if (data.issuer.firstName) form.setValue('issuer_first_name', data.issuer.firstName);
        if (data.issuer.lastName) form.setValue('issuer_last_name', data.issuer.lastName);
        if (data.issuer.street) form.setValue('issuer_street', data.issuer.street);
        if (data.issuer.zip) form.setValue('issuer_zip', data.issuer.zip);
        if (data.issuer.city) form.setValue('issuer_city', data.issuer.city);
        if (data.issuer.country) form.setValue('issuer_country', data.issuer.country);
      }

      // Apply all updates to first position
      if (positions[0] && Object.keys(updates).length > 0) {
        updatePosition(positions[0].id, updates);
      }

      setReceipt(prev => prev ? {
        ...prev,
        processing: false,
      } : null);

      toast.success(t('pages.journal.messages.receiptProcessed'));
    } catch (error) {
      console.error('Failed to process receipt:', error);
      const errorMessage = error instanceof Error ? error.message : t('pages.journal.messages.receiptProcessingError');
      setReceipt(prev => prev ? {
        ...prev,
        processing: false,
        error: errorMessage,
      } : null);
      toast.error(errorMessage);
    }
  };

  // Form submission
  const handleSubmit = async (data: TransactionFormData) => {
    try {
      if (!positions[0]?.debit_account_id || !positions[0]?.credit_account_id) {
        toast.error(t('pages.journal.messages.selectAccounts'));
        return;
      }

      await createTransaction({
        date: format(data.date, 'yyyy-MM-dd'),
        due_date: data.due_date ? format(data.due_date, 'yyyy-MM-dd') : undefined,
        service_period_start: data.service_period_start ? format(data.service_period_start, 'yyyy-MM-dd') : undefined,
        service_period_end: data.service_period_end ? format(data.service_period_end, 'yyyy-MM-dd') : undefined,
        description: data.description,
        amount: parseFloat(data.amount.replace(/[^0-9.]/g, '')),
        document_ref: data.document_ref,
        debit_account_id: positions[0].debit_account_id,
        credit_account_id: positions[0].credit_account_id,
        receipt_file: receipt?.file,
        issuer_company: data.issuer_company,
        issuer_first_name: data.issuer_first_name,
        issuer_last_name: data.issuer_last_name,
        issuer_street: data.issuer_street,
        issuer_zip: data.issuer_zip,
        issuer_city: data.issuer_city,
        issuer_country: data.issuer_country,
      });
      
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success(t('pages.journal.messages.transactionCreated'));
      navigate('/journal');
    } catch (error) {
      console.error('Failed to create transaction:', error);
      toast.error(t('pages.journal.messages.transactionCreateError'));
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: t('pages.journal.title'), href: "/journal" },
          { label: t('pages.journal.newTransaction'), href: "/journal/new" },
        ]}
      />

      <div>
        <h3 className="text-lg font-medium">{t('pages.journal.newTransaction')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('pages.journal.newTransactionDescription')}
        </p>
      </div>

      <div className="-mx-6 h-[calc(100vh-14rem)]">
        <ResizablePanelGroup direction="horizontal" className="h-full relative">
          <ResizablePanel 
            defaultSize={65} 
            minSize={30}
            maxSize={70}
          >
            <div className="h-full overflow-y-auto p-6">
              <TransactionForm
                form={form}
                onSubmit={handleSubmit}
                receipt={receipt}
                suggestions={suggestions}
                positions={positions}
                accounts={accounts}
                onUpdatePosition={updatePosition}
                onRemovePosition={removePosition}
                onAddPosition={addPosition}
                openSections={openSections}
                onToggleSection={(section) => {
                  setOpenSections(prev => {
                    const next = new Set(prev);
                    if (next.has(section)) {
                      next.delete(section);
                    } else {
                      next.add(section);
                    }
                    return next;
                  });
                }}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle>
            <CustomResizeHandle />
          </ResizableHandle>

          <ResizablePanel defaultSize={35} minSize={30} maxSize={70}>
            <div className="h-full p-6">
              <ReceiptUpload 
                receipt={receipt}
                onUpload={handleFile}
                onRemove={() => {
                  if (receipt?.preview) {
                    URL.revokeObjectURL(receipt.preview);
                  }
                  setReceipt(null);
                }}
                uploadText="Klicken Sie zum Hochladen oder ziehen Sie einen Beleg hierher"
                className="h-full"
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}