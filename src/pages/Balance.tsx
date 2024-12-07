import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
  const datePresets = getBalancePresets();

import { getBalancePresets } from '@/lib/date-presets';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { useDateStore } from '@/stores/date-store';
import { Badge } from '@/components/ui/badge';
import { useBalanceAccounts } from '@/hooks/use-balance-accounts';
import { AccountList } from '@/components/accounts/AccountList';
import { AccountControls } from '@/components/accounts/AccountControls';
import { Account } from '@/lib/types';
import { cn } from '@/lib/utils';

export function Balance() {
  const navigate = useNavigate();
  const { balanceDate, setBalanceDate } = useDateStore();

  // UI State
  const [search, setSearch] = useState('');
  const [showNumbers, setShowNumbers] = useState(false);
  const [allCollapsed, setAllCollapsed] = useState(false);
  const [showZeroBalances, setShowZeroBalances] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => new Set());

  // Data Hooks
  const { accounts, groups, balances, isLoading } = useBalanceAccounts(balanceDate);


  // Filter accounts based on search term
  const filteredAccounts = search 
    ? accounts.filter(account =>
        account.number.toLowerCase().includes(search.toLowerCase()) ||
        account.name.toLowerCase().includes(search.toLowerCase())
      )
    : accounts;

  // Calculate totals
  const totalAssets = filteredAccounts
    .filter(a => a.type === 'Aktiven')
    .reduce((sum, account) => sum + (balances.get(account.id) || 0), 0);

  const totalLiabilities = filteredAccounts
    .filter(a => a.type === 'Passiven')
    .reduce((sum, account) => sum + (balances.get(account.id) || 0), 0);

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
        account.type === 'Aktiven' && 'bg-blue-500/10 text-blue-500',
        account.type === 'Passiven' && 'bg-purple-500/10 text-purple-500'
      )}
    >
      {account.type}
    </Badge>
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Bilanz</h3>
        <p className="text-sm text-muted-foreground">
          Übersicht über Aktiven und Passiven
        </p>
      </div>

      <div className="flex items-center gap-4">
        <DatePicker
          date={balanceDate}
          onSelect={setBalanceDate}
          presets={datePresets}
        />
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setBalanceDate(new Date())}
        >
          Heute
        </Button>
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
              { label: 'Total Aktiven', value: totalAssets },
              { label: 'Total Passiven', value: totalLiabilities }
            ]}
          />
        )}
      </div>
    </div>
  );
}