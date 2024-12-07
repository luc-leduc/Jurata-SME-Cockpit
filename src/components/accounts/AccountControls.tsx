import { Eye, EyeOff, ChevronsDown, ChevronsUp } from 'lucide-react';
import { CircleDot, CircleDotDashed } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AccountControlsProps {
  search: string;
  onSearchChange: (value: string) => void;
  showNumbers: boolean;
  onToggleNumbers: () => void;
  allCollapsed: boolean;
  onToggleAll: () => void;
  showZeroBalances: boolean;
  onToggleZeroBalances: () => void;
}

export function AccountControls({
  search,
  onSearchChange,
  showNumbers,
  onToggleNumbers,
  allCollapsed,
  onToggleAll,
  showZeroBalances,
  onToggleZeroBalances
}: AccountControlsProps) {
  return (
    <div className="space-y-1">
      <div>
        <Input
          placeholder="Suchen..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-[300px]"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          onClick={onToggleAll}
          className="h-8 hover:bg-transparent px-3 flex items-center"
        >
          {allCollapsed ? (
            <ChevronsDown className="h-3.5 w-3.5 mr-1.5" />
          ) : (
            <ChevronsUp className="h-3.5 w-3.5 mr-1.5" />
          )}
          <span className="text-xs">
            {allCollapsed ? "Konten ausklappen" : "Konten einklappen"}
          </span>
        </Button>
        <Button
          variant="ghost"
          onClick={onToggleNumbers}
          className={cn(
            "h-8 hover:bg-transparent px-3",
            !showNumbers && "text-muted-foreground"
          )}          
        >
          {showNumbers ? <EyeOff className="h-3.5 w-3.5 mr-1.5" /> : <Eye className="h-3.5 w-3.5 mr-1.5" />}
          <span className="text-xs">
            {showNumbers ? "Kontonummern ausblenden" : "Kontonummern anzeigen"}
          </span>
        </Button>
        <Button
          variant="ghost"
          onClick={onToggleZeroBalances}
          className={cn(
            "h-8 hover:bg-transparent px-3",
            !showZeroBalances && "text-muted-foreground"
          )}
        >
          {showZeroBalances ? (
            <CircleDot className="h-3.5 w-3.5 mr-1.5" />
          ) : (
            <CircleDotDashed className="h-3.5 w-3.5 mr-1.5" />
          )}
          <span className="text-xs">
            {showZeroBalances ? "0er-Konten ausblenden" : "0er-Konten anzeigen"}
          </span>
        </Button>
      </div>
    </div>
  );
}