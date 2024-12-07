import { cn } from "@/lib/utils";

interface AlphaBadgeProps {
  className?: string;
  size?: 'sm' | 'md';
}

export function AlphaBadge({ className, size = 'sm' }: AlphaBadgeProps) {
  return (
    <div className={cn(
      "px-0.5 py-px font-medium rounded-sm",
      size === 'sm' ? "text-[6px]" : "text-[8px]",
      "bg-primary/10 text-primary",
      "uppercase tracking-wider",
      className
    )}>
      Alpha
    </div>
  );
}