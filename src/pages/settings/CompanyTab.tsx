import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useCompany } from '@/hooks/use-company';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';

const companySchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein'),
  uid_number: z.string().optional().nullable(),
  street: z.string().min(2, 'Strasse muss mindestens 2 Zeichen lang sein'),
  street_number: z.string().min(1, 'Hausnummer wird benötigt'),
  zip: z.string().min(4, 'PLZ muss mindestens 4 Zeichen lang sein'),
  city: z.string().min(2, 'Ort muss mindestens 2 Zeichen lang sein'),
  country: z.string().min(2, 'Land muss mindestens 2 Zeichen lang sein'),
});

type CompanyFormData = z.infer<typeof companySchema>;

export function CompanyTab() {
  const { t } = useTranslation();
  const { data: company, isLoading, update } = useCompany();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      uid_number: '',
      street: '',
      street_number: '',
      zip: '',
      city: '',
      country: 'Schweiz',
    }
  });

  useEffect(() => {
    if (company) {
      form.reset({
        name: company.name || '',
        uid_number: company.uid_number || '',
        street: company.street || '',
        street_number: company.street_number || '',
        zip: company.zip || '',
        city: company.city || '',
        country: company.country || 'Schweiz',
      });
    }
  }, [company, form]);

  const onSubmit = async (data: CompanyFormData) => {
    try {
      setIsSaving(true);
      await update({
        ...data,
        uid_number: data.uid_number || null
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unternehmensdaten</CardTitle>
        <CardDescription>
          Grundlegende Informationen zu Ihrem Unternehmen
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <>
            {isEditing ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Firmenname</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Musterfirma GmbH" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="uid_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>UID-Nummer</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="CHE-123.456.789" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name="street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Strasse</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Musterstrasse" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="street_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nr.</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="123" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="zip"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PLZ</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="8000" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ort</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Zürich" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Land</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                    >
                      Abbrechen
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? t('common:status.saving') : t('components.buttons.save')}
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-sm font-medium">Firmenname</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {company?.name || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">UID-Nummer</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {company?.uid_number || '-'}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium">Adresse</div>
                  {company?.street && company?.street_number && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {company.street} {company.street_number}
                    </div>
                  )}
                  {(company?.zip || company?.city) && (
                    <div className="text-sm text-muted-foreground">
                      {company.zip} {company.city}
                    </div>
                  )}
                  {company?.country && (
                    <div className="text-sm text-muted-foreground">
                      {company.country}
                    </div>
                  )}
                  {!company?.street && !company?.city && !company?.country && (
                    <div className="text-sm text-muted-foreground mt-1">-</div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setIsEditing(true)}>
                    Ändern
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}