import { useCallback } from 'react';
import { useNavigate, createSearchParams } from "react-router-dom";
import { format } from 'date-fns';
import { 
  BarChart3,
  Building2,
  TrendingUp,
  Wallet
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMonthlyRevenue } from '@/hooks/use-monthly-revenue';
import { useCreditors } from '@/hooks/use-creditors';
import { useMonthlyProfit } from '@/hooks/use-monthly-profit';
import { useMonthlyTransactions } from '@/hooks/use-monthly-transactions';
import { StatCard } from './StatCard';
import { useTranslation } from 'react-i18next';

export function StatsOverview() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const today = new Date();

  const { data: monthlyRevenue, isLoading: isLoadingRevenue } = useMonthlyRevenue();
  const { data: creditors = { balance: 0, count: 0 }, isLoading: isLoadingCreditors } = useCreditors();
  const { data: monthlyProfit, isLoading: isLoadingProfit } = useMonthlyProfit();
  const { data: monthlyTransactions, isLoading: isLoadingTransactions } = useMonthlyTransactions();

  const handleRevenueClick = useCallback(() => {
    const params = {
      start: format(today, 'yyyy-MM-01'),
      end: format(today, 'yyyy-MM-dd'),
      type: 'revenue'
    };

    navigate({
      pathname: '/journal',
      search: `?${createSearchParams(params)}`
    });
  }, [navigate, today]);

  const handleCreditorsClick = useCallback(() => {
    navigate({
      pathname: '/journal',
      search: `?${createSearchParams({
        credit: '2000'
      })}`
    });
  }, [navigate]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title={t('dashboard.stats.monthlyRevenue')}
        value={isLoadingRevenue ? (
          <Skeleton className="h-9 w-[140px]" />
        ) : (
          `CHF ${monthlyRevenue?.total.toLocaleString('de-CH', { 
            minimumFractionDigits: 2 
          })}`
        )}
        icon={TrendingUp}
        trend={monthlyRevenue?.change}
        trendLabel={monthlyRevenue?.change ? 
          t('dashboard.stats.revenueChange', { value: monthlyRevenue.change.toFixed(1) }) : 
          undefined
        }
        onClick={handleRevenueClick}
      />

      <StatCard
        title={t('dashboard.stats.openCreditorInvoices')}
        value={isLoadingCreditors ? (
          <Skeleton className="h-9 w-[140px]" />
        ) : (
          `CHF ${creditors?.balance.toLocaleString('de-CH', { 
            minimumFractionDigits: 2 
          })}`
        )}
        subValue={creditors?.count > 0 ? 
          t('dashboard.stats.openInvoicesCount', { count: creditors.count }) : 
          t('dashboard.stats.noOpenInvoices')
        }
        icon={Wallet}
        onClick={handleCreditorsClick}
      />

      <StatCard
        title={monthlyProfit?.profit && monthlyProfit.profit >= 0 
          ? t('dashboard.stats.monthlyProfit')
          : t('dashboard.stats.monthlyLoss')
        }
        value={isLoadingProfit ? (
          <Skeleton className="h-9 w-[140px]" />
        ) : (
          <span className={monthlyProfit?.profit && monthlyProfit.profit < 0 ? "text-red-500" : undefined}>
            {`CHF ${Math.abs(monthlyProfit?.profit || 0).toLocaleString('de-CH', {
              minimumFractionDigits: 2
            })}`}
          </span>
        )}
        icon={Building2}
        trend={monthlyProfit?.change}
        trendLabel={monthlyProfit?.change ? 
          t('dashboard.stats.profitChange', { value: monthlyProfit.change.toFixed(1) }) : 
          undefined
        }
      />

      <StatCard
        title={t('dashboard.stats.transactions')}
        value={isLoadingTransactions ? (
          <Skeleton className="h-9 w-[140px]" />
        ) : (
          monthlyTransactions?.currentCount.toLocaleString('de-CH')
        )}
        subValue={monthlyTransactions?.currentCount ? 
          t('dashboard.stats.transactionsCount', { count: monthlyTransactions.currentCount }) : 
          undefined
        }
        icon={BarChart3}
      />
    </div>
  );
}