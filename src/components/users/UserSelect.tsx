import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ChevronsUpDown, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const ITEM_HEIGHT = 36;
const MAX_ITEMS = 6;

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
}

interface UserSelectProps {
  value?: string;
  onChange: (value: string | null) => void;
  label?: string;
  className?: string;
  size?: 'default' | 'sm';
  allowClear?: boolean;
  placeholder?: string;
}

export function UserSelect({
  value,
  onChange,
  label,
  className,
  size = 'default',
  allowClear,
  placeholder = "Benutzer auswählen"
}: UserSelectProps) {
  // State
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);

  // Fetch users
  const { data: users = [] } = useQuery<UserProfile[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          first_name,
          last_name
        `)
        .order('first_name', { nullsLast: true });

      if (profilesError) throw profilesError;
      console.log('Fetched user profiles:', profiles);
      return profiles || [];
    }
  });

  // Find selected user
  const selectedUser = users.find((user) => user.id === value);

  // Filter users
  const filteredUsers = React.useMemo(() => {
    if (!searchQuery) return users;
    
    const terms = searchQuery.toLowerCase().split(" ");
    return users.filter(user => 
      terms.every(term => 
        (user.first_name?.toLowerCase() || '').includes(term) || 
        (user.last_name?.toLowerCase() || '').includes(term)
      )
    );
  }, [users, searchQuery]);

  // Reset highlight when search changes
  React.useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  // Event handlers
  const handleSelect = React.useCallback((userId: string | null) => {
    onChange(userId);
    setOpen(false);
    setSearchQuery("");
  }, [onChange]);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (!open) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredUsers.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case "Enter":
        e.preventDefault();
        if (filteredUsers[highlightedIndex]) {
          handleSelect(filteredUsers[highlightedIndex].id);
        }
        break;
      case "Escape":
        setOpen(false);
        break;
    }
  }, [open, filteredUsers, highlightedIndex, handleSelect]);

  // Format user display
  const formatUser = (user: UserProfile) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return 'Unbekannter Benutzer';
  };

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
              !selectedUser && "text-muted-foreground"
            )}
          >
            {selectedUser ? (
              <span className="flex items-center gap-2">
                <User className="h-4 w-4 shrink-0 opacity-50" />
                <span className="truncate">{formatUser(selectedUser)}</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <User className="h-4 w-4 shrink-0 opacity-50" />
                {placeholder}
              </span>
            )}
            <div className="flex items-center gap-1">
              {allowClear && selectedUser && (
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
          className="w-[300px] p-0" 
          align="start"
          side="bottom"
          sideOffset={5}
        >
          <div className="flex flex-col">
            <div className="p-2 border-b">
              <Input
                placeholder="Benutzer suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full"
              />
            </div>
            <ScrollArea className="overflow-y-auto" style={{ maxHeight: `${ITEM_HEIGHT * MAX_ITEMS}px` }}>
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  Kein Benutzer gefunden
                </div>
              ) : (
                <div className="py-1">
                  {filteredUsers.map((user, index) => (
                    <div
                      key={user.id}
                      onClick={() => handleSelect(user.id)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={cn(
                        "flex items-center px-4 py-2 text-sm cursor-pointer",
                        user.id === value && "bg-primary/10",
                        index === highlightedIndex && user.id !== value && "bg-accent text-accent-foreground",
                        "hover:bg-accent hover:text-accent-foreground"
                      )}
                      style={{ height: ITEM_HEIGHT }}
                    >
                      <User className="h-4 w-4 shrink-0 opacity-50 mr-2" />
                      <div className="flex flex-col">
                        <span className="font-medium">{formatUser(user)}</span>
                      </div>
                    </div>
                  ))}
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