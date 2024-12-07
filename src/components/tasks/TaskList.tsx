import { useState } from 'react';
import { format, differenceInDays, isToday, isTomorrow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from "@/lib/utils";
import { Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const STATUS_STYLES = {
  open: 'bg-blue-500/10 text-blue-500 border-0',
  in_progress: 'bg-yellow-500/10 text-yellow-500 border-0',
  completed: 'bg-green-500/10 text-green-500 border-0',
  cancelled: 'bg-red-500/10 text-red-500 border-0',
} as const;

const PRIORITY_STYLES = {
  low: 'bg-gray-500/10 text-gray-500 border-0',
  medium: 'bg-blue-500/10 text-blue-500 border-0',
  high: 'bg-orange-500/10 text-orange-500 border-0',
  urgent: 'bg-red-500/10 text-red-500 border-0',
} as const;

interface TaskListProps {
  tasks: any[];
  isLoading?: boolean;
  showFilters?: boolean;
  compact?: boolean;
  onTaskClick?: (id: string) => void;
}

export function TaskList({ 
  tasks, 
  isLoading, 
  showFilters = false, 
  compact = false, 
  onTaskClick 
}: TaskListProps) {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);

  const STATUS_LABELS = {
    open: t('tasksPage.status.open'),
    in_progress: t('tasksPage.status.inProgress'),
    completed: t('tasksPage.status.completed'),
    cancelled: t('tasksPage.status.cancelled'),
  } as const;

  const PRIORITY_LABELS = {
    low: t('tasksPage.priority.low'),
    medium: t('tasksPage.priority.medium'),
    high: t('tasksPage.priority.high'),
    urgent: t('tasksPage.priority.urgent'),
  } as const;

  const filteredTasks = tasks.filter(task => {
    if (statusFilter.length > 0 && !statusFilter.includes(task.status)) {
      return false;
    }
    if (priorityFilter.length > 0 && !priorityFilter.includes(task.priority)) {
      return false;
    }
    return true;
  });

  const getDueLabel = (dueDate: string) => {
    const date = new Date(dueDate);
    if (isToday(date)) return t('tasksPage.dueDate.today');
    if (isTomorrow(date)) return t('tasksPage.dueDate.tomorrow');
    
    const days = differenceInDays(date, new Date());
    if (days < 0) return (
      <span className="text-red-500">
        {t('tasksPage.dueDate.overdue', { 
          days: Math.abs(days), 
          dayText: Math.abs(days) === 1 ? t('tasksPage.dueDate.day') : t('tasksPage.dueDate.days')
        })}
      </span>
    );
    return t('tasksPage.dueDate.dueIn', { 
      days, 
      dayText: days === 1 ? t('tasksPage.dueDate.day') : t('tasksPage.dueDate.days')
    });
  };

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex flex-wrap gap-6 p-3 rounded-lg border">
          <div className="flex items-center">
            <Filter className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-1.5">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {t('tasksPage.filters.status')}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <Badge
                  key={key}
                  variant="secondary"
                  className={cn(
                    'cursor-pointer transition-colors text-xs hover:bg-muted/80',
                    statusFilter.includes(key) ? STATUS_STYLES[key as keyof typeof STATUS_STYLES] : 'opacity-50'
                  )}
                  onClick={() => {
                    setStatusFilter(prev =>
                      prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]
                    );
                  }}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {t('tasksPage.filters.priority')}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                <Badge
                  key={key}
                  variant="secondary"
                  className={cn(
                    'cursor-pointer transition-colors text-xs hover:bg-muted/80',
                    priorityFilter.includes(key) ? PRIORITY_STYLES[key as keyof typeof PRIORITY_STYLES] : 'opacity-50'
                  )}
                  onClick={() => {
                    setPriorityFilter(prev =>
                      prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
                    );
                  }}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="text-center text-muted-foreground">
          {t('tasksPage.loading')}
        </div>
      )}

      {!isLoading && tasks.length === 0 && (
        <div className="text-center text-muted-foreground">
          {t('tasksPage.noTasks')}
        </div>
      )}

      <div className={cn('space-y-2', { 'max-h-[400px] overflow-y-auto': !compact })}>
        {filteredTasks.map((task) => (
          <Card 
            key={task.id} 
            className={cn(
              'p-4 cursor-pointer hover:bg-muted/50 transition-colors',
              { 'opacity-50': task.status === 'completed' }
            )}
            onClick={() => onTaskClick && onTaskClick(task.id)}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{task.title}</h3>
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      'text-xs',
                      STATUS_STYLES[task.status as keyof typeof STATUS_STYLES]
                    )}
                  >
                    {STATUS_LABELS[task.status as keyof typeof STATUS_LABELS]}
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      'text-xs',
                      PRIORITY_STYLES[task.priority as keyof typeof PRIORITY_STYLES]
                    )}
                  >
                    {PRIORITY_LABELS[task.priority as keyof typeof PRIORITY_LABELS]}
                  </Badge>
                </div>
                {task.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {task.description}
                  </p>
                )}
              </div>
              <div className="text-right">
                {task.due_date && (
                  <div className="text-sm text-muted-foreground">
                    {getDueLabel(task.due_date)}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}