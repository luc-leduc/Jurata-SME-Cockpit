import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

// Components
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { UserSelect } from '@/components/users/UserSelect';

// Icons
import { CalendarIcon, Trash2 } from 'lucide-react';

// Utils & Hooks
import { cn } from '@/lib/utils';
import { useTasks } from '@/hooks/use-tasks';
import { getTask } from '@/lib/services/tasks';
import { supabase } from '@/lib/supabase';

const taskSchema = z.object({
  title: z.string().min(3, { message: 'tasksPage.form.validation.titleRequired' }),
  description: z.string().optional(),
  due_date: z.date().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  area: z.enum(['accounting', 'taxes', 'payroll', 'documents', 'general']),
  status: z.enum(['open', 'in_progress', 'completed', 'cancelled']),
  assignee_id: z.string().optional().nullable(),
});

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Niedrig' },
  { value: 'medium', label: 'Mittel' },
  { value: 'high', label: 'Hoch' },
  { value: 'urgent', label: 'Dringend' },
] as const;

const AREA_OPTIONS = [
  { value: 'accounting', label: 'Buchhaltung' },
  { value: 'taxes', label: 'Steuern' },
  { value: 'payroll', label: 'Lohnbuchhaltung' },
  { value: 'documents', label: 'Dokumente' },
  { value: 'general', label: 'Allgemein' },
] as const;

const STATUS_OPTIONS = [
  { value: 'open', label: 'Offen' },
  { value: 'in_progress', label: 'In Bearbeitung' },
  { value: 'completed', label: 'Abgeschlossen' },
  { value: 'cancelled', label: 'Abgebrochen' },
] as const;

export function EditTask() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { update, delete: deleteTask } = useTasks();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  // Fetch task data
  const { data: task, isLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: () => getTask(id!),
    enabled: !!id,
    staleTime: 0,
    cacheTime: 0,
  });

  // Form setup
  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      due_date: null,
      priority: 'medium',
      area: 'general',
      status: 'open',
      assignee_id: null,
    },
  });

  // Update form when task data is loaded
  React.useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || '',
        due_date: task.due_date ? new Date(task.due_date) : null,
        priority: task.priority,
        area: task.area,
        status: task.status,
        assignee_id: task.assignee_id || null,
      });
    }
  }, [task, form]);

  // Form submission
  const onSubmit = async (data: z.infer<typeof taskSchema>) => {
    if (!id) return;

    try {
      await update({
        id,
        updates: {
          ...data,
          due_date: data.due_date ? data.due_date.toISOString() : null,
        },
      });

      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      await queryClient.invalidateQueries({ queryKey: ['task', id] });

      toast.success(t('tasksPage.messages.updateSuccess'));
      navigate('/tasks');
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error(t('tasksPage.messages.updateError'));
    }
  };

  // Delete task
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      await deleteTask(id);
      
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      toast.success(t('tasksPage.messages.deleteSuccess'));
      navigate('/tasks');
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error(t('tasksPage.messages.deleteError'));
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>{t('tasksPage.loading')}</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-semibold">{t('tasksPage.notFound.title')}</h2>
        <p className="text-muted-foreground">
          {t('tasksPage.notFound.description')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: t('tasksPage.title'), href: "/tasks" },
          { label: task.title, href: `/tasks/${id}` },
        ]}
      />

      <div>
        <h3 className="text-lg font-medium">{t('tasksPage.editTask')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('tasksPage.description')}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('tasksPage.form.title')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('tasksPage.form.titlePlaceholder')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('tasksPage.form.description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t('tasksPage.form.descriptionPlaceholder')}
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('tasksPage.form.dueDate')}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd.MM.yyyy")
                            ) : (
                              <span>{t('tasksPage.form.dueDatePlaceholder')}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('tasksPage.form.priority')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('tasksPage.form.priorityPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {['low', 'medium', 'high', 'urgent'].map((value) => (
                          <SelectItem key={value} value={value}>
                            {t(`tasksPage.priority.${value}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('tasksPage.form.status')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('tasksPage.form.statusPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {['open', 'in_progress', 'completed', 'cancelled'].map((value) => (
                          <SelectItem key={value} value={value}>
                            {t(`tasksPage.status.${value}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="assignee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('tasksPage.form.assignee')}</FormLabel>
                  <FormControl>
                    <UserSelect
                      value={field.value || undefined}
                      onChange={field.onChange}
                      placeholder={t('tasksPage.form.assigneePlaceholder')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t('tasksPage.form.delete')}
            </Button>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/tasks')}
              >
                {t('tasksPage.form.cancel')}
              </Button>
              <Button type="submit">
                {t('tasksPage.form.update')}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('tasksPage.messages.deleteConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('tasksPage.messages.deleteWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('tasksPage.form.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('tasksPage.form.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}