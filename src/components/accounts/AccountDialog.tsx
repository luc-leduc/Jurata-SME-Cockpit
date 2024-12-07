import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { createAccount } from '@/lib/services/accounts';
import { toast } from 'sonner';
import { ACCOUNT_TYPES } from '@/lib/constants';

const accountSchema = z.object({
  number: z.string()
    .min(1, 'Kontonummer wird benötigt')
    .max(10, 'Kontonummer darf maximal 10 Ziffern haben')
    .regex(/^\d+$/, 'Kontonummer darf nur Ziffern enthalten'),
  name: z.string().min(3, 'Name muss mindestens 3 Zeichen lang sein'),
  type: z.enum(['Aktiven', 'Passiven', 'Aufwand', 'Ertrag'] as const),
});

type AccountFormData = z.infer<typeof accountSchema>;

export function AccountDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      number: '',
      name: '',
      type: 'Aktiven',
    },
  });

  const onSubmit = async (data: AccountFormData) => {
    try {
      await createAccount(data);
      await queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Konto wurde erfolgreich erstellt');
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error('Failed to create account:', error);
      toast.error('Fehler beim Erstellen des Kontos');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Neues Konto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Neues Konto erfassen</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kontonummer</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="z.B. 1000" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bezeichnung</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="z.B. Kasse" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kontoart</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Kontoart wählen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(ACCOUNT_TYPES).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline">{t('components.buttons.cancel')}</Button>
              </DialogClose>
              <Button type="submit">{t('components.buttons.save')}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}