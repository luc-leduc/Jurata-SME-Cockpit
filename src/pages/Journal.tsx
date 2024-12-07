import { startOfMonth, endOfMonth, format } from 'date-fns';
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useTransactions } from '@/hooks/use-transactions';
import { useAccounts } from '@/hooks/use-accounts';
import { AccountSelect } from '@/components/transactions/AccountSelect';
import { useTranslation } from 'react-i18next';

// Components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { ExcelUploadDialog } from '@/components/transactions/ExcelUploadDialog';

// Icons
import { Plus, Download, Upload, Loader2 } from "lucide-react";

// Utils
import { createCsvContent, downloadCsv } from '@/lib/utils/csv';

export function Journal() {
  // Routing & State
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: accounts = [] } = useAccounts();
  const { t } = useTranslation();

  // Search parameters
  const search = searchParams.get('search') || '';
  const debitFilter = searchParams.get('debit') || 'all';
  const creditFilter = searchParams.get('credit') || 'all';
  const startDate = searchParams.get('start') || startOfMonth(new Date()).toISOString().split('T')[0];
  const endDate = searchParams.get('end') || endOfMonth(new Date()).toISOString().split('T')[0];
  const type = searchParams.get('type');
  const isAccountView = debitFilter === creditFilter && debitFilter !== 'all';
  const isRevenueView = type === 'revenue';

  // Data fetching
  const {
    data,
    isLoading,
    totalCount,
    isLoadingCount,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = useTransactions();

  // Infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Process transactions
  const transactions = data?.pages?.flatMap(page => page) ?? [];
  
  // Get account name for account view
  const accountName = isAccountView && (
    accounts.find(a => a.number === debitFilter)?.name
  );

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const searchTerm = search.toLowerCase();
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm) ||
      transaction.document_ref?.toLowerCase().includes(searchTerm) ||
      transaction.debit_account_number.toLowerCase().includes(searchTerm) ||
      transaction.credit_account_number.toLowerCase().includes(searchTerm);

    const matchesDateRange = 
      transaction.date >= startDate && 
      transaction.date <= endDate;

    const matchesType = !type || (
      type === 'revenue' && 
      transaction.credit_account_number.startsWith('3')
    );

    if (isAccountView) {
      return matchesSearch && (
        transaction.debit_account_number === debitFilter ||
        transaction.credit_account_number === debitFilter
      ) && matchesDateRange && matchesType;
    }

    const matchesDebit = debitFilter === 'all' || 
      transaction.debit_account_number.startsWith(debitFilter);
    const matchesCredit = creditFilter === 'all' || 
      transaction.credit_account_number.startsWith(creditFilter);

    return matchesSearch && matchesDebit && matchesCredit && 
           matchesDateRange && matchesType;
  });

  // Event handlers
  const handleRowClick = (id: string) => {
    navigate(`/journal/${id}`);
  };

  const handleSearchChange = (value: string) => {
    setSearchParams(prev => {
      prev.set('search', value);
      return prev;
    });
  };

  const handleDebitFilterChange = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    setSearchParams(prev => {
      prev.set('debit', account ? account.number : 'all');
      return prev;
    });
  };

  const handleCreditFilterChange = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    setSearchParams(prev => {
      prev.set('credit', account ? account.number : 'all');
      return prev;
    });
  };

  const handleExportCsv = () => {
    const headers = [
      t('pages.journal.csv.date'),
      t('pages.journal.csv.documentRef'),
      t('pages.journal.csv.description'),
      t('pages.journal.csv.debitAccount'),
      t('pages.journal.csv.debitAccountName'),
      t('pages.journal.csv.creditAccount'),
      t('pages.journal.csv.creditAccountName'),
      t('pages.journal.csv.amount'),
      t('pages.journal.csv.dueDate'),
      t('pages.journal.csv.servicePeriodStart'),
      t('pages.journal.csv.servicePeriodEnd'),
      t('pages.journal.csv.issuer'),
      t('pages.journal.csv.street'),
      t('pages.journal.csv.zip'),
      t('pages.journal.csv.city'),
      t('pages.journal.csv.country')
    ];

    const rows = filteredTransactions.map(t => [
      format(new Date(t.date), 'dd.MM.yyyy'),
      t.document_ref || '',
      t.description,
      t.debit_account_number,
      t.debit_account_name,
      t.credit_account_number,
      t.credit_account_name,
      t.amount.toLocaleString('de-CH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: false
      }),
      t.due_date ? format(new Date(t.due_date), 'dd.MM.yyyy') : '',
      t.service_period_start ? format(new Date(t.service_period_start), 'dd.MM.yyyy') : '',
      t.service_period_end ? format(new Date(t.service_period_end), 'dd.MM.yyyy') : '',
      t.issuer_company || [t.issuer_first_name, t.issuer_last_name].filter(Boolean).join(' '),
      t.issuer_street || '',
      t.issuer_zip || '',
      t.issuer_city || '',
      t.issuer_country || ''
    ]);

    const csvContent = createCsvContent(headers, rows);
    const filename = `buchungen_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
    downloadCsv(csvContent, filename);
  };

  return (
    <div className="space-y-4">
      {isAccountView ? (
        <Breadcrumb
          items={[
            { label: t('pages.journal.title'), href: "/journal" },
            { label: t('pages.journal.accountTransactions', {
              account: `${debitFilter} - ${accountName}`
            }), href: `/journal?debit=${debitFilter}&credit=${debitFilter}` },
          ]}
        />
      ) : null}

      <div className="flex justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">{t('pages.journal.title')}</h3>
          {isAccountView ? (
            <p className="text-sm text-muted-foreground">
              {t('pages.journal.accountTransactions', {
                count: filteredTransactions.length,
                account: `${debitFilter} - ${accountName}`
              })}
            </p>
          ) : isLoadingCount ? (
            <Skeleton className="h-5 w-48" />
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('pages.journal.totalTransactions', {
                count: totalCount.toLocaleString('de-CH').replace(/'/g, "'")
              })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={handleExportCsv}
            disabled={filteredTransactions.length === 0}
          >
            <Upload className="mr-2 h-4 w-4" />
            {t('pages.journal.exportCsv')}
          </Button>
          <ExcelUploadDialog />
          <Button asChild>
            <Link to="/journal/new">
              <Plus className="mr-2 h-4 w-4" />
              {t('pages.journal.newTransaction')}
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder={t('pages.journal.searchPlaceholder')}
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-sm"
        />
        
        {!isAccountView && (
          <>
            <AccountSelect
              accounts={accounts}
              value={accounts.find(a => a.number === debitFilter)?.id}
              onChange={handleDebitFilterChange}
              className="w-[220px]"
              allowClear
              placeholder={t('pages.journal.allDebitAccounts')}
            />

            <AccountSelect
              accounts={accounts}
              value={accounts.find(a => a.number === creditFilter)?.id}
              onChange={handleCreditFilterChange}
              className="w-[220px]"
              allowClear
              placeholder={t('pages.journal.allCreditAccounts')}
            />
          </>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('pages.journal.table.date')}</TableHead>
              <TableHead>{t('pages.journal.table.documentRef')}</TableHead>
              <TableHead>{t('pages.journal.table.description')}</TableHead>
              <TableHead>{t('pages.journal.table.debit')}</TableHead>
              <TableHead>{t('pages.journal.table.credit')}</TableHead>
              <TableHead className="text-right">{t('pages.journal.table.amount')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  {t('pages.journal.loading')}
                </TableCell>
              </TableRow>
            ) : filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  {t('pages.journal.noTransactions')}
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <TableRow 
                  key={transaction.id}
                  onClick={() => handleRowClick(transaction.id)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell>{format(new Date(transaction.date), 'dd.MM.yyyy')}</TableCell>
                  <TableCell>{transaction.document_ref || '-'}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    <span className="whitespace-nowrap">
                      {transaction.debit_account_number} - {transaction.debit_account_name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="whitespace-nowrap">
                      {transaction.credit_account_number} - {transaction.credit_account_name}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {transaction.amount.toLocaleString('de-CH', { 
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {filteredTransactions.length > 0 && hasNextPage && (
          <div 
            ref={loadMoreRef}
            className="py-4 flex justify-center"
          >
            {isFetchingNextPage && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('pages.journal.loadingMore')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}