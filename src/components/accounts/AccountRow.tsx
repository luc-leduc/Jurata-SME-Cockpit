import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, CheckCircle } from "lucide-react";
import { AccountData } from "./types";

interface AccountRowProps {
  account: AccountData;
  level: number;
  isSelected: boolean;
  disabled?: boolean;
  onToggleSelect: (selected: boolean) => void;
}

export function AccountRow({
  account,
  level,
  isSelected,
  disabled,
  onToggleSelect
}: AccountRowProps) {
  return (
    <div className="grid grid-cols-[auto_1fr_2fr_1fr_1fr] gap-4 px-4 py-2 text-sm hover:bg-muted/50">
      <div>
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleSelect}
          disabled={disabled || account.exists}
          className="transition-none"
        />
      </div>
      <div style={{ paddingLeft: `${level * 24}px` }} className="flex items-center">
        {account.number}
      </div>
      <div className="truncate">{account.name}</div>
      <div>{account.type}</div>
      <div>
        {account.systemAccount && (
          <span className="text-xs text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full mr-2">
            System
          </span>
        )}
        {account.isKomplett && (
          <span className="text-xs text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-full mr-2">
            Komplett
          </span>
        )}
        {account.exists ? (
          <span className="text-yellow-500 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            Existiert bereits
          </span>
        ) : (
          <span className="text-green-500 flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            Neu
          </span>
        )}
      </div>
    </div>
  );
}