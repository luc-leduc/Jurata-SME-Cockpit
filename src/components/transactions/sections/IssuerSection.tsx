import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { TransactionSection } from '../TransactionSection';
import { Receipt } from '@/lib/types';
import { TransactionFormData } from '../TransactionForm';
import { useTranslation } from 'react-i18next';

interface IssuerSectionProps {
  form: UseFormReturn<TransactionFormData>;
  isOpen: boolean;
  onToggle: () => void;
  receipt: Receipt | null;
}

export function IssuerSection({ form, isOpen, onToggle, receipt }: IssuerSectionProps) {
  const { t } = useTranslation();

  return (
    <TransactionSection
      title={t('journal.issuer.title')}
      isOpen={isOpen}
      onToggle={onToggle}
      status={{
        isComplete: Boolean(form.watch('issuer_company') && form.watch('issuer_city')),
        isProcessing: receipt?.processing,
        processingText: t('journal.issuer.processing'),
        hasAiData: Boolean(form.watch('issuer_company') || form.watch('issuer_city')),
        summary: form.watch('issuer_company')
          ? `${form.watch('issuer_company')}${form.watch('issuer_city') ? `, ${form.watch('issuer_city')}` : ''}`
          : t('journal.issuer.notRecorded')
      }}
    >
      <div className="grid gap-4">
        <FormField
          control={form.control}
          name="issuer_company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('journal.issuer.company')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('journal.issuer.companyPlaceholder')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="issuer_first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('journal.issuer.firstName')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('journal.issuer.firstNamePlaceholder')} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="issuer_last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('journal.issuer.lastName')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('journal.issuer.lastNamePlaceholder')} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="issuer_street"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('journal.issuer.street')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('journal.issuer.streetPlaceholder')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="issuer_zip"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('journal.issuer.zip')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('journal.issuer.zipPlaceholder')} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="issuer_city"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>{t('journal.issuer.city')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('journal.issuer.cityPlaceholder')} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="issuer_country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('journal.issuer.country')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('journal.issuer.countryPlaceholder')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </TransactionSection>
  );
}