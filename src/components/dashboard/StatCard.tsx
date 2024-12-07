import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  subValue?: string;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
  trendLabel,
  onClick,
}: StatCardProps) {
  return (
    <Card 
      onClick={onClick}
      className={cn(
        "relative overflow-hidden",
        onClick && "cursor-pointer transition-colors hover:bg-muted/50"
      )}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium">{title}</p>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="text-2xl font-bold">{value}</div>
        {(subValue || typeof trend === 'number') && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            {typeof trend === 'number' && (
              trend >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500" />
              )
            )}
            {subValue || (typeof trend === 'number' ? trendLabel : null)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}