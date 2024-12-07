import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ExcelAccountImport } from '@/components/accounts/ExcelAccountImport';
import { AccountDrawer } from '@/components/accounts/AccountDrawer';
import { deleteAllAccounts } from '@/lib/services/accounts';
import { useAccounts } from '@/hooks/use-accounts';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Trash2, Loader2 } from 'lucide-react';

const TYPE_COLORS = {
  'Aktiven': 'bg-blue-500/10 text-blue-500',
  'Passiven': 'bg-purple-500/10 text-purple-500',
  'Aufwand': 'bg-red-500/10 text-red-500',
  'Ertrag': 'bg-green-500/10 text-green-500',
} as const;

export function AccountsTab() {
  const [search, setSearch] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: accounts, isLoading } = useAccounts();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteAllAccounts();
      await queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Kontenplan wurde erfolgreich gelöscht');
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete accounts:', error);
      toast.error('Fehler beim Löschen des Kontenplans');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredAccounts = accounts?.filter((account) => {
    const searchTerm = search.toLowerCase();
    return (
      account.number.includes(searchTerm) ||
      account.name.toLowerCase().includes(searchTerm) ||
      account.type.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Kontenplan</CardTitle>
            <CardDescription>
              Verwalten Sie Ihren Kontenplan nach KMU
            </CardDescription>
          </div>
          <button
            type="button"
            className="text-sm text-destructive hover:text-destructive/90 flex items-center gap-1.5"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Kontenplan löschen
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <ExcelAccountImport />
            <AccountDrawer />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Nummer</TableHead>
                <TableHead>Bezeichnung</TableHead>
                <TableHead className="w-40">Typ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    Lade Konten...
                  </TableCell>
                </TableRow>
              ) : filteredAccounts?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    Keine Konten gefunden
                  </TableCell>
                </TableRow>
              ) : (
                filteredAccounts?.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>
                      {account.number}
                    </TableCell>
                    <TableCell>
                      {account.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={TYPE_COLORS[account.type as keyof typeof TYPE_COLORS]}
                      >
                        {account.type}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kontenplan löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie wirklich den gesamten Kontenplan löschen? Diese Aktion kann nicht
              rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird gelöscht...
                </>
              ) : (
                'Kontenplan löschen'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}