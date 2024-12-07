import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronRight, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { GroupData } from "./types";

interface AccountGroupRowProps {
  group: GroupData;
  level: number;
  isCollapsed: boolean;
  isSelected: boolean;
  disabled?: boolean;
  onToggleCollapse: () => void;
  onToggleSelect: (selected: boolean) => void;
}

export function AccountGroupRow({
  group,
  level,
  isCollapsed,
  isSelected,
  disabled,
  onToggleCollapse,
  onToggleSelect
}: AccountGroupRowProps) {
  const hasSubgroups = group.subgroups.length > 0;

  return (
    <div 
      className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50"
      onClick={onToggleCollapse}
    >
      <div className="flex items-center gap-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleSelect}
          disabled={disabled}
          className="transition-none"
          onClick={(e) => e.stopPropagation()}
        />
        <div 
          style={{ paddingLeft: `${level * 24}px` }} 
          className="flex items-center gap-4"
        >
          {hasSubgroups && (
            isCollapsed ? 
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" /> : 
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          <div className="font-medium">
            {group.number} - {group.name}
            {group.isKomplett && (
              <span className="ml-2 text-xs text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-full">
                Komplett
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {group.accounts.length} Konten
          </div>
          {isSelected && (
            <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
          )}
        </div>
      </div>
    </div>
  );
}