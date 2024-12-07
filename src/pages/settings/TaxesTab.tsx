import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function TaxesTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Steuern</CardTitle>
        <CardDescription>
          Konfigurieren Sie die Mehrwertsteuer-Einstellungen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Steuerkonfiguration wird in Kürze verfügbar sein.
        </p>
      </CardContent>
    </Card>
  );
}