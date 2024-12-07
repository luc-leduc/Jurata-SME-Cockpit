import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, startOfDay } from 'date-fns';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTasks } from '@/hooks/use-tasks';
import { useCompany } from '@/hooks/use-company';
import { UserSelect } from '@/components/users/UserSelect';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const taskSchema = z.object({
  title: z.string().min(3, { message: 'tasksPage.form.validation.titleRequired' }),
  description: z.string().optional(),
  due_date: z.date().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  area: z.enum(['accounting', 'taxes', 'payroll', 'documents', 'general']),
  assignee_id: z.string().optional().nullable(),
});

type TaskFormData = z.infer<typeof taskSchema>;

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

export function NewTask() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { create } = useTasks();
  const { data: company } = useCompany();

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      due_date: null,
      priority: 'medium',
      area: 'general',
      assignee_id: null,
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    if (!company) return;

    try {
      // Get current user's profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .single();

      if (profileError || !profile) {
        console.error('Failed to get user profile:', profileError);
        return;
      }

      await create({
        ...data,
        company_id: company.id,
        creator_id: profile.id,
        status: 'open',
        source: 'user',
      });

      toast.success(t('tasksPage.messages.createSuccess'));
      navigate('/tasks');
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error(t('tasksPage.messages.createError'));
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: t('tasksPage.title'), href: "/tasks" },
          { label: t('tasksPage.newTask'), href: "/tasks/new" },
        ]}
      />

      <div>
        <h3 className="text-lg font-medium">{t('tasksPage.newTask')}</h3>
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
                          disabled={(date) =>
                            date < startOfDay(new Date())
                          }
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
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('tasksPage.form.area')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('tasksPage.form.areaPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {['accounting', 'taxes', 'payroll', 'documents', 'general'].map((value) => (
                          <SelectItem key={value} value={value}>
                            {t(`tasksPage.area.${value}`)}
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
                name="assignee_id"
                render={({ field }) => {
                  const { data: currentUser } = useQuery({ 
                    queryKey: ['currentUser'],
                    queryFn: async () => {
                      const { data: { user } } = await supabase.auth.getUser();
                      if (!user) throw new Error('Not authenticated');
                      
                      const { data: profile, error } = await supabase
                        .from('user_profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();
                        
                      if (error) throw error;
                      return profile;
                    }
                  });
                  
                  return (
                    <FormItem>
                      <FormLabel>{t('tasksPage.form.assignee')}</FormLabel>
                      <div className="flex gap-4">
                        <UserSelect
                          value={field.value || undefined}
                          onChange={field.onChange}
                          placeholder={t('tasksPage.form.assigneePlaceholder')}
                          className="w-1/2"
                        />
                        <Button 
                          type="button"
                          variant="outline"
                          disabled={field.value === currentUser?.id}
                          onClick={() => field.onChange(currentUser?.id)}
                        >
                          {t('tasksPage.form.assignToMe')}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/tasks')}
            >
              {t('tasksPage.form.cancel')}
            </Button>
            <Button type="submit">
              {t('tasksPage.form.submit')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}