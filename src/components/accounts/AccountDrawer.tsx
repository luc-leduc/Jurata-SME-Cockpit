import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { createAccount } from '@/lib/services/accounts';
import { toast } from 'sonner';
import { ACCOUNT_TYPES } from '@/lib/constants';
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerTrigger,
  DrawerFooter,
  DrawerClose
} from '@/components/ui/drawer';
import { useTranslation } from 'react-i18next';

const accountSchema = z.object({
  number: z.string()
    .min(1, 'Kontonummer wird benötigt')
    .max(10, 'Kontonummer darf maximal 10 Ziffern haben')
    .regex(/^\d+$/, 'Kontonummer darf nur Ziffern enthalten'),
  name: z.string().min(3, 'Name muss mindestens 3 Zeichen lang sein'),
  type: z.enum(['Aktiven', 'Passiven', 'Aufwand', 'Ertrag'] as const),
});

type AccountFormData = z.infer<typeof accountSchema>;

export function AccountDrawer() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  
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
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Neues Konto
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Neues Konto erfassen</DrawerTitle>
        </DrawerHeader>
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

            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">{t('components.buttons.cancel')}</Button>
              </DrawerClose>
              <Button type="submit">{t('components.buttons.save')}</Button>
            </DrawerFooter>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  );
}