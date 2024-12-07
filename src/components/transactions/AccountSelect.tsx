import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ChevronsUpDown, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Account } from "@/lib/types";

const ITEM_HEIGHT = 36;
const MAX_ITEMS = 6;

interface AccountSelectProps {
  accounts: Account[];
  value?: string;
  onChange: (value: string) => void;
  suggestions?: Array<{ number: string; confidence: number }>;
  label?: string;
  className?: string;
  size?: 'default' | 'sm';
  allowClear?: boolean;
  placeholder?: string;
}

export function AccountSelect({
  accounts,
  value,
  onChange,
  suggestions = [],
  label,
  className,
  size = 'default',
  allowClear,
  placeholder = "Konto wählen"
}: AccountSelectProps) {
  // State
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const [hasInteracted, setHasInteracted] = React.useState(false);

  // Find selected account
  const selectedAccount = accounts.find((account) => account.id === value);

  // Process suggestions
  const suggestedAccounts = React.useMemo(() => {
    const sorted = suggestions
      .map(suggestion => ({
        account: accounts.find(a => a.number === suggestion.number),
        confidence: suggestion.confidence
      }))
      .filter((item): item is { account: Account; confidence: number } => 
        item.account !== undefined
      )
      .sort((a, b) => b.confidence - a.confidence);

    // Mark first suggestion if no account is selected and user hasn't interacted
    if (sorted.length > 0 && !value && !hasInteracted) {
      sorted[0].isFirstSuggestion = true;
    }

    return sorted;
  }, [accounts, suggestions, value, hasInteracted]);

  // Filter accounts
  const filteredAccounts = React.useMemo(() => {
    if (!searchQuery) return accounts;
    
    const terms = searchQuery.toLowerCase().split(" ");
    return accounts.filter(account => 
      terms.every(term => 
        account.number.toLowerCase().includes(term) || 
        account.name.toLowerCase().includes(term)
      )
    );
  }, [accounts, searchQuery]);

  // Split into suggested and remaining accounts
  const filteredSuggestions = React.useMemo(() => {
    if (!searchQuery) return suggestedAccounts;
    return suggestedAccounts.filter(({ account }) => 
      filteredAccounts.some(a => a.id === account.id)
    );
  }, [suggestedAccounts, filteredAccounts, searchQuery]);

  const filteredRemaining = React.useMemo(() => {
    return filteredAccounts.filter(account =>
      !suggestedAccounts.some(s => s.account.id === account.id)
    );
  }, [filteredAccounts, suggestedAccounts]);

  // Reset highlight when search changes
  React.useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  // Event handlers
  const handleSelect = React.useCallback((accountId: string | null) => {
    setHasInteracted(true);
    onChange(accountId || '');
    setOpen(false);
    setSearchQuery("");
  }, [onChange]);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (!open) return;

    const totalItems = filteredSuggestions.length + filteredRemaining.length;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < totalItems - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case "Enter":
        e.preventDefault();
        const allAccounts = [
          ...filteredSuggestions.map(s => s.account),
          ...filteredRemaining
        ];
        if (allAccounts[highlightedIndex]) {
          handleSelect(allAccounts[highlightedIndex].id);
        }
        break;
      case "Escape":
        setOpen(false);
        break;
    }
  }, [open, filteredSuggestions, filteredRemaining, highlightedIndex, handleSelect]);

  // Render account item
  const renderAccount = React.useCallback((
    account: Account,
    index: number,
    suggestion?: { confidence: number; isFirstSuggestion?: boolean }
  ) => (
    <div
      key={account.id}
      onClick={() => handleSelect(account.id)}
      onMouseEnter={() => setHighlightedIndex(index)}
      className={cn(
        "flex items-center px-4 py-2 text-sm font-normal cursor-pointer",
        account.id === value && "bg-primary/10",
        index === highlightedIndex && account.id !== value && "bg-accent text-accent-foreground",
        suggestion?.isFirstSuggestion && !value && !hasInteracted && "bg-primary/10",
        "hover:bg-accent hover:text-accent-foreground"
      )}
      style={{ height: ITEM_HEIGHT }}
    >
      <span className="mr-2">{account.number}</span>
      <span className="flex-1">{account.name}</span>
      {suggestion?.confidence !== undefined && (
        <span className="text-xs text-muted-foreground ml-2">
          {Math.round(suggestion.confidence * 100)}%
        </span>
      )}
    </div>
  ), [value, highlightedIndex, hasInteracted, handleSelect]);

  // Use div as wrapper when not in a form context
  const formContext = useFormContext?.();
  const Wrapper = formContext ? FormItem : 'div';
  const buttonClassName = cn(
    "w-full justify-between font-normal",
    size === 'sm' ? "h-8 text-sm" : "h-9"
  );

  return (
    <Wrapper className={className}>
      {label && <FormLabel>{label}</FormLabel>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              buttonClassName,
              !selectedAccount && "text-muted-foreground"
            )}
          >
            {selectedAccount ? (
              <span className="truncate">
                {selectedAccount.number} - {selectedAccount.name}
              </span>
            ) : (
              <span>{placeholder}</span>
            )}
            <div className="flex items-center gap-1">
              {allowClear && selectedAccount && (
                <X
                  className="h-4 w-4 opacity-50 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(null);
                  }}
                />
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[400px] p-0" 
          align="start"
          side="bottom"
          sideOffset={5}
        >
          <div className="flex flex-col">
            <div className="p-2 border-b">
              <Input
                placeholder="Konto suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full"
              />
            </div>
            <ScrollArea className="overflow-y-auto" style={{ maxHeight: `${ITEM_HEIGHT * MAX_ITEMS}px` }}>
              {filteredAccounts.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  Kein Konto gefunden
                </div>
              ) : (
                <div className="py-1">
                  {filteredSuggestions.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground flex items-center">
                        <Sparkles className="mr-1 h-3 w-3" />
                        AI-Vorschläge
                      </div>
                      {filteredSuggestions.map((item, index) => 
                        renderAccount(item.account, index, item)
                      )}
                      <div className="mx-2 my-1 border-t" />
                    </>
                  )}
                  <div>
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                      {filteredSuggestions.length > 0 ? 'Übrige Konten' : 'Alle Konten'}
                    </div>
                    {filteredRemaining.map((account, index) => 
                      renderAccount(account, index + filteredSuggestions.length)
                    )}
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
      {formContext && <FormMessage />}
    </Wrapper>
  );
}