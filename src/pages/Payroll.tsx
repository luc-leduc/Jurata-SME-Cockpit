import { Users } from "lucide-react";

export function Payroll() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Lohnbuchhaltung</h3>
        <p className="text-sm text-muted-foreground">
          Verwaltung der Löhne und Sozialversicherungen
        </p>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <Users className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">
          Diese Funktion wird in Kürze verfügbar sein
        </p>
      </div>
    </div>
  );
}