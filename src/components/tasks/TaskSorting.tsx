import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownNarrowWide, ArrowUpNarrowWide } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export type SortField = 'due_date' | 'priority' | 'created_at' | 'title';
export type SortDirection = 'asc' | 'desc';

interface TaskSortingProps {
  field: SortField;
  direction: SortDirection;
  onSort: (field: SortField, direction: SortDirection) => void;
  className?: string;
}

const SORT_OPTIONS = [
  { value: 'due_date', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'created_at', label: 'Created Date' },
  { value: 'title', label: 'Title' },
] as const;

export function TaskSorting({ field, direction, onSort, className }: TaskSortingProps) {
  const { t } = useTranslation();

  const translatedSortOptions = SORT_OPTIONS.map(option => ({
    value: option.value,
    label: t(`tasks.sorting.${option.value}`),
  }));

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select
        value={field}
        onValueChange={(value) => onSort(value as SortField, direction)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t('tasks.sorting.placeholder', 'Sort by')} />
        </SelectTrigger>
        <SelectContent>
          {translatedSortOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onSort(field, direction === 'asc' ? 'desc' : 'asc')}
        className="h-9 w-9"
      >
        {direction === 'asc' ? (
          <ArrowUpNarrowWide className="h-4 w-4" />
        ) : (
          <ArrowDownNarrowWide className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}