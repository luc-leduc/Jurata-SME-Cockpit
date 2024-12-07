  import { useParams } from 'react-router-dom';
import { useTransaction } from '@/hooks/use-transaction';
import { format } from 'date-fns';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Calendar, Receipt, FileText } from 'lucide-react';
import { ReadOnlyReceiptPreview } from '@/components/transactions/ReadOnlyReceiptPreview';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const getIssuerName = (transaction: any) => {
  if (transaction.issuer_company) {
    return transaction.issuer_company;
  }
  if (transaction.issuer_first_name || transaction.issuer_last_name) {
    return [transaction.issuer_first_name, transaction.issuer_last_name]
      .filter(Boolean)
      .join(' ');
  }
  return null;
};

export function TransactionDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: transaction, isLoading } = useTransaction(id!);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: t('pages.journal.title'), href: "/journal" },
            { label: <Skeleton className="h-4 w-32" />, href: `/journal/${id}` },
          ]}
        />
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <Skeleton className="h-[calc(100vh-10rem)] rounded-lg" />
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-semibold">{t('pages.journal.sections.notFound.title')}</h2>
        <p className="text-muted-foreground">
          {t('pages.journal.sections.notFound.description')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: t('pages.journal.title'), href: "/journal" },
          { 
            label: [
              transaction.document_ref || t('pages.journal.sections.fallbackTitle'),
              getIssuerName(transaction)
            ].filter(Boolean).join(" – "),
            href: `/journal/${id}` 
          },
        ]}
      />

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">
              {[
                transaction.document_ref || t('pages.journal.sections.fallbackTitle'),
                getIssuerName(transaction)
              ].filter(Boolean).join(" – ")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {transaction.description}
            </p>
          </div>

          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {t('pages.journal.sections.date.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium">{t('pages.journal.sections.date.documentDate')}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(transaction.date), 'dd.MM.yyyy')}
                    </div>
                  </div>
                  {transaction.due_date && (
                    <div>
                      <div className="text-sm font-medium">{t('pages.journal.sections.date.dueDate')}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(transaction.due_date), 'dd.MM.yyyy')}
                      </div>
                    </div>
                  )}
                </div>
                {(transaction.service_period_start || transaction.service_period_end) && (
                  <div>
                    <div className="text-sm font-medium">{t('pages.journal.sections.date.servicePeriod')}</div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.service_period_start && format(new Date(transaction.service_period_start), 'dd.MM.yyyy')}
                      {' - '}
                      {transaction.service_period_end && format(new Date(transaction.service_period_end), 'dd.MM.yyyy')}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {t('pages.journal.sections.issuer.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transaction.issuer_company ? (
                  <div className="leading-none">
                    <div className="text-sm font-medium mb-2">{transaction.issuer_company}</div>
                    {(transaction.issuer_first_name || transaction.issuer_last_name) && (
                      <div className="text-sm text-muted-foreground mt-0">
                        {transaction.issuer_first_name} {transaction.issuer_last_name}
                      </div>
                    )}
                    {transaction.issuer_street && (
                      <div className="text-sm text-muted-foreground mt-0">
                        {transaction.issuer_street}
                      </div>
                    )}
                    {(transaction.issuer_zip || transaction.issuer_city) && (
                      <div className="text-sm text-muted-foreground mt-0">
                        {transaction.issuer_zip} {transaction.issuer_city}
                      </div>
                    )}
                    {transaction.issuer_country && (
                      <div className="text-sm text-muted-foreground mt-0">
                        {transaction.issuer_country}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {t('pages.journal.sections.issuer.noIssuer')}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {t('pages.journal.sections.transaction.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium">{t('pages.journal.sections.transaction.debit')}</div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.debit_account_number} - {transaction.debit_account_name}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t('pages.journal.sections.transaction.credit')}</div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.credit_account_number} - {transaction.credit_account_name}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t('pages.journal.sections.transaction.amount')}</div>
                    <div className="text-sm">
                      CHF {transaction.amount.toLocaleString('de-CH', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  {t('pages.journal.sections.receipt.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm font-medium">{t('pages.journal.sections.receipt.number')}</div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.document_ref || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t('pages.journal.sections.receipt.status')}</div>
                    <div className="text-sm">
                      {transaction.receipt_path ? (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                          {t('pages.journal.sections.receipt.hasReceipt')}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">
                          {t('pages.journal.sections.receipt.noReceipt')}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="sticky top-8 h-[calc(100vh-10rem)]">
          {transaction.receipt_url ? (
            <ReadOnlyReceiptPreview url={transaction.receipt_url} />
          ) : (
            <div className="rounded-lg border-2 border-dashed p-8 transition-colors h-full border-muted-foreground/25 relative flex flex-col items-center justify-center gap-2 text-center">
              <Receipt className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {t('pages.journal.sections.receipt.noReceiptUpload')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}