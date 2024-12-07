import { cn } from "@/lib/utils";

export function CustomResizeHandle() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col gap-1.5 cursor-col-resize group">
        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/25 group-hover:bg-muted-foreground/40 transition-colors" />
        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/25 group-hover:bg-muted-foreground/40 transition-colors" />
        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/25 group-hover:bg-muted-foreground/40 transition-colors" />
      </div>
    </div>
  );
}