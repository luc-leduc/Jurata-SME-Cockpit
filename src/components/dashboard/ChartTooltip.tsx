import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  coordinate?: { x: number; y: number };
  className?: string;
}

export function ChartTooltip({ 
  active, 
  payload, 
  label, 
  coordinate,
  className 
}: ChartTooltipProps) {
  const { t } = useTranslation();
  if (!active || !payload?.length || !coordinate) return null;

  return (
    <div 
      className={cn(
        "absolute rounded-lg border bg-background p-3 shadow-lg",
        "animate-in fade-in duration-500",
        "pointer-events-none select-none",
        className
      )}
      style={{ 
        left: `${coordinate.x}px`,
        top: `${coordinate.y - 16}px`,
        transform: 'translate(-50%, -100%)',
        minWidth: '220px'
      }}
    >
      <div className="grid gap-4">
        <div>
          <div className="text-[0.70rem] uppercase text-muted-foreground">
            {t('charts.month')}
          </div>
          <div className="font-medium">
            {label}
          </div>
        </div>
        <div>
          <div className="text-[0.70rem] uppercase text-muted-foreground">
            {t('charts.revenue.short')}
          </div>
          <div className="font-medium tabular-nums">
            {payload[0].value.toLocaleString('de-CH', {
              style: 'currency',
              currency: 'CHF'
            })}
          </div>
        </div>
      </div>
    </div>
  );
}