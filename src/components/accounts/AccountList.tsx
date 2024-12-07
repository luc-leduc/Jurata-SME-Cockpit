import { Fragment } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useAccountStructure } from '@/hooks/use-account-structure';
import { Account, AccountGroup } from '@/lib/types';

interface AccountListProps {
  accounts: (Account & { group?: AccountGroup })[];
  groups: AccountGroup[];
  balances: Map<string, number>;
  showNumbers: boolean;
  collapsedGroups: Set<string>;
  onToggleGroup: (id: string) => void;
  showZeroBalances: boolean;
  renderBadge?: (account: Account) => React.ReactNode;
  totals?: Array<{
    label: string;
    value: number;
    className?: string;
  }>;
  onAccountClick?: (account: Account) => void;
}

export function AccountList({
  accounts,
  groups,
  balances,
  showNumbers,
  collapsedGroups,
  onToggleGroup,
  showZeroBalances,
  renderBadge,
  totals,
  onAccountClick,
}: AccountListProps) {
  const structure = useAccountStructure(accounts, groups);

  // Filter root nodes to only include relevant groups and accounts
  const filteredRootNodes = structure.rootNodes.filter(node => {
    const isRelevantGroup = (groupNode: typeof node): boolean => {
      if (groupNode.type === 'account') {
        return accounts.some(a => a.id === groupNode.id);
      }
      
      // Check if any child is relevant
      return groupNode.children.some(child => isRelevantGroup(child));
    };
    
    return isRelevantGroup(node);
  });

  const renderNode = (node: ReturnType<typeof useAccountStructure>['rootNodes'][0]) => {
    const total = calculateGroupTotal(node);
    
    // Skip nodes with zero balance if hideZeroBalances is true
    if (!showZeroBalances && total === 0) {
      return null;
    }
    
    const isCollapsibleGroup = node.type === 'group' && (node.number.length === 2 || node.number.length === 3);
    const isCollapsed = collapsedGroups.has(node.id);

    if (node.type === 'group') {
      return (
        <Fragment key={`group-${node.id}`}>
          <TableRow 
            className={cn(
              "bg-muted/50",
              isCollapsibleGroup && "hover:bg-muted/70 cursor-pointer"
            )}
            onClick={() => isCollapsibleGroup && onToggleGroup(node.id)}
          >
            <TableCell className={cn(
              "font-semibold tabular-nums pl-2",
              showNumbers ? "w-32" : "w-0 p-0",
              node.level === 0 && "text-lg",
              node.level === 1 && "text-base",
              node.level >= 2 && "text-sm"
            )}>
              <div className="flex items-center justify-between">
                <span>{showNumbers ? node.number : ''}</span>
                {isCollapsibleGroup && (
                  <span className="text-muted-foreground ml-2">
                    {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell className={cn(
              "font-semibold pl-2",
              node.level === 0 && "text-lg",
              node.level === 1 && "text-base",
              node.level >= 2 && "text-sm"
            )}>
              {node.name}
            </TableCell>
            {renderBadge && <TableCell className="w-40" />}
            <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
              {total.toLocaleString('de-CH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </TableCell>
          </TableRow>
          {!isCollapsed && node.children.map((child, index) => (
            <Fragment key={`child-${child.id}-${index}`}>
              {renderNode(child)}
            </Fragment>
          ))}
        </Fragment>
      );
    }

    return (
      <TableRow 
        key={node.id} 
        className={cn(
          onAccountClick && node.account && "cursor-pointer hover:bg-muted/50"
        )}
        onClick={() => node.account && onAccountClick?.(node.account)}
      >
        <TableCell className="font-medium pl-2">
          <span className="text-sm">
            {showNumbers ? node.number : ''}
          </span>
        </TableCell>
        <TableCell className="pl-2 text-sm">{node.name}</TableCell>
        {renderBadge && (
          <TableCell>
            {node.account && renderBadge(node.account)}
          </TableCell>
        )}
        <TableCell className="text-right tabular-nums">
          {(balances.get(node.id) || 0).toLocaleString('de-CH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </TableCell>
      </TableRow>
    );
  };

  const calculateGroupTotal = (node: ReturnType<typeof useAccountStructure>['rootNodes'][0]): number => {
    if (node.type === 'account') {
      return balances.get(node.id) || 0;
    }
    return node.children.reduce((sum, child) => sum + calculateGroupTotal(child), 0);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className={cn(showNumbers ? "w-32" : "w-0 p-0")}>
            {showNumbers && "Nummer"}
          </TableHead>
          <TableHead>Bezeichnung</TableHead>
          {renderBadge && <TableHead className="w-40">Typ</TableHead>}
          <TableHead className="text-right w-32">Saldo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredRootNodes.map((node, index) => (
          <Fragment key={`root-${node.id}-${index}`}>
            {renderNode(node)}
          </Fragment>
        ))}
        {totals && totals.map((total, index) => (
          <TableRow key={index} className={cn(
            "font-medium bg-muted/30",
            total.className
          )}>
            <TableCell colSpan={renderBadge ? 3 : 2} className="py-4">
              {total.label}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {total.value.toLocaleString('de-CH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}