import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIncomePresets } from '@/lib/date-presets';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useDateStore } from '@/stores/date-store';
import type { DateRange } from 'react-day-picker';
import { Badge } from '@/components/ui/badge';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { AccountList } from '@/components/accounts/AccountList';
import { AccountControls } from '@/components/accounts/AccountControls';
import { Account } from '@/lib/types';
import { useIncomeAccounts } from '@/hooks/use-income-accounts';

export function Income() {
  const navigate = useNavigate();

  // UI State
  const [search, setSearch] = useState('');
  const [showNumbers, setShowNumbers] = useState(false);
  const [allCollapsed, setAllCollapsed] = useState(false);
  const [showZeroBalances, setShowZeroBalances] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => new Set());

  // Date Range State
  const { incomeRange, setIncomeRange } = useDateStore();

  // Data Hooks
  const { accounts, groups, balances, isLoading } = useIncomeAccounts(
    incomeRange.from,
    incomeRange.to
  );

  // Filter accounts based on search term
  const filteredAccounts = search 
    ? accounts.filter(account =>
        account.number.toLowerCase().includes(search.toLowerCase()) ||
        account.name.toLowerCase().includes(search.toLowerCase())
      )
    : accounts;

  // Calculate totals
  const totalRevenue = filteredAccounts
    .filter(a => a.type === 'Ertrag')
    .reduce((sum, account) => sum + (balances.get(account.id) || 0), 0);

  const totalExpenses = filteredAccounts
    .filter(a => a.type === 'Aufwand')
    .reduce((sum, account) => sum + (balances.get(account.id) || 0), 0);

  const profit = totalRevenue - totalExpenses;

  // Event Handlers
  const handleToggleGroup = (id: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleAll = () => {
    setAllCollapsed(prev => {
      const newState = !prev;
      if (newState) {
        setCollapsedGroups(new Set(groups
          .filter(g => g.number.length === 2 || g.number.length === 3)
          .map(g => g.id)));
      } else {
        setCollapsedGroups(new Set());
      }
      return newState;
    });
  };

  const handleAccountClick = (account: Account) => {
    const params = new URLSearchParams();
    params.set('debit', account.number);
    params.set('credit', account.number);
    navigate(`/journal?${params.toString()}`);
  };

  // Badge renderer for account types
  const renderBadge = (account: Account) => (
    <Badge
      variant="secondary"
      className={cn(
        account.type === 'Ertrag' && 'bg-green-500/10 text-green-500',
        account.type === 'Aufwand' && 'bg-red-500/10 text-red-500'
      )}
    >
      {account.type}
    </Badge>
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Erfolgsrechnung</h3>
        <p className="text-sm text-muted-foreground">
          Übersicht über Aufwände und Erträge
        </p>
      </div>

      <div className="flex items-center gap-4">
        <DateRangePicker
          date={incomeRange}
          onSelect={setIncomeRange}
        />
      </div>

      <AccountControls
        search={search}
        onSearchChange={setSearch}
        showNumbers={showNumbers}
        onToggleNumbers={() => setShowNumbers(!showNumbers)}
        allCollapsed={allCollapsed}
        onToggleAll={handleToggleAll}
        showZeroBalances={showZeroBalances}
        onToggleZeroBalances={() => setShowZeroBalances(!showZeroBalances)}
      />

      <div className="rounded-md border">
        {isLoading ? (
          <div className="text-center py-4">Lade Konten...</div>
        ) : filteredAccounts.length === 0 ? (
          <div className="text-center py-4">Keine Konten gefunden</div>
        ) : (
          <AccountList
            accounts={filteredAccounts}
            groups={groups}
            balances={balances}
            showNumbers={showNumbers}
            collapsedGroups={collapsedGroups}
            onToggleGroup={handleToggleGroup}
            showZeroBalances={showZeroBalances}
            renderBadge={renderBadge}
            onAccountClick={handleAccountClick}
            totals={[
              { label: 'Total Ertrag', value: totalRevenue },
              { label: 'Total Aufwand', value: totalExpenses },
              { 
                label: 'Gewinn/Verlust',
                value: profit,
                className: cn(
                  'font-medium text-lg',
                  profit >= 0 ? 'text-green-600' : 'text-red-600'
                )
              }
            ]}
          />
        )}
      </div>
    </div>
  );
}