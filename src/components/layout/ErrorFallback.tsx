export function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-semibold">Etwas ist schiefgelaufen</h2>
      <p className="text-muted-foreground">{error.message}</p>
    </div>
  );
}