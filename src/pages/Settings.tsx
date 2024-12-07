import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { CompanyTab } from './settings/CompanyTab';
import { AccountsTab } from './settings/AccountsTab';
import { UsersTab } from './settings/UsersTab';
import { TaxesTab } from './settings/TaxesTab';

export function Settings() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Einstellungen</h3>
        <p className="text-sm text-muted-foreground">
          Verwalten Sie Ihre Unternehmenseinstellungen
        </p>
      </div>

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company">Unternehmen</TabsTrigger>
          <TabsTrigger value="accounts">Kontenplan</TabsTrigger>
          <TabsTrigger value="users">Benutzer</TabsTrigger>
          <TabsTrigger value="taxes">Steuern</TabsTrigger>
        </TabsList>

        <TabsContent value="company"><CompanyTab /></TabsContent>
        <TabsContent value="accounts"><AccountsTab /></TabsContent>
        <TabsContent value="users"><UsersTab /></TabsContent>
        <TabsContent value="taxes"><TaxesTab /></TabsContent>
      </Tabs>
    </div>
  );
}