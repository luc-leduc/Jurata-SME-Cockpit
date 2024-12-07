import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { TransactionGroup } from '@/lib/services/excel';
import { useTranslation } from 'react-i18next';

interface MonthGroupProps {
  group: TransactionGroup;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleSelect: (selected: boolean) => void;
  disabled?: boolean;
}

export function MonthGroup({ 
  group, 
  expanded, 
  onToggleExpand, 
  onToggleSelect,
  disabled 
}: MonthGroupProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'de' ? de : enUS;

  return (
    <div className="border-b last:border-0">
      <div className="flex items-center gap-4 p-4">
        <Checkbox
          checked={group.selected}
          onCheckedChange={(checked) => {
            onToggleSelect(checked as boolean);
          }}
          disabled={disabled}
          className="shrink-0"
          onClick={(e) => e.stopPropagation()}
        />
        <div 
          className="flex items-center flex-1 gap-4 cursor-pointer" 
          onClick={onToggleExpand}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggleExpand();
            }
          }}
        > 
          <div className="flex-1 min-w-0">
            <div className="font-medium">
              {format(new Date(group.month), 'MMMM yyyy', { locale })}
            </div>
            <div className="text-sm text-muted-foreground">
              {group.transactions.length} {t('components.excelImport.transactions')}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {group.selected && (
              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
            )}
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>
      {expanded && (
        <div className="border-t bg-muted/50">
          <div className="grid grid-cols-[1fr_2fr_1fr] gap-4 px-4 py-2 text-xs font-medium text-muted-foreground">
            <div>{t('components.excelImport.date')}</div>
            <div>{t('components.excelImport.description')}</div>
            <div className="text-right">{t('components.excelImport.amount')}</div>
          </div>
          {group.transactions.map((transaction, index) => (
            <div
              key={index}
              className="grid grid-cols-[1fr_2fr_1fr] gap-4 px-4 py-2 text-sm hover:bg-muted/50"
            >
              <div>{format(transaction.date, 'dd.MM.yyyy')}</div>
              <div className="truncate">{transaction.description}</div>
              <div className="text-right tabular-nums">
                {transaction.amount.toLocaleString('de-CH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}