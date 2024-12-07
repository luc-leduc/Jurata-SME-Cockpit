import { Button } from "@/components/ui/button";
import { 
  CommandDialog, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList,
} from "@/components/ui/command";
import { DialogTitle } from "@/components/ui/dialog";
import { Search as SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "@/hooks/use-chat";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';

const useSearchItems = () => {
  const { t } = useTranslation();
  
  return [
    {
      group: t('search.quickAccess'),
      items: [
        { name: t('navigation.journal.newTransaction'), shortcut: "N", href: "/journal/new" },
        { name: t('navigation.jurataAISection.newRequest'), shortcut: "A", href: "/request/new" },
        { name: t('navigation.tasksSection.newTask'), shortcut: "T", href: "/tasks/new" },
      ],
    },
    {
      group: t('navigation.title'),
      items: [
        { name: t('navigation.dashboard'), shortcut: "D", href: "/" },
        { name: t('navigation.tasks'), shortcut: "T", href: "/tasks" },
        { name: t('navigation.documents'), shortcut: "F", href: "/upload" },
        { name: t('navigation.legal.analysis'), shortcut: "L", href: "/legal/analysis" },
        { name: t('navigation.legal.templates'), shortcut: "V", href: "/legal/templates" },
        { name: t('navigation.legal.management'), shortcut: "W", href: "/legal/contracts" },
        { name: t('navigation.accounting.journal'), shortcut: "J", href: "/journal" },
        { name: t('navigation.accounting.balance'), shortcut: "B", href: "/balance" },
        { name: t('navigation.accounting.income'), shortcut: "E", href: "/income" },
        { name: t('navigation.accounting.payroll'), shortcut: "P", href: "/payroll" },
        { name: t('navigation.accounting.reports'), shortcut: "R", href: "/reports" },
        { name: t('navigation.taxes'), shortcut: "S", href: "/taxes" },
        { name: t('navigation.academy'), shortcut: "C", href: "/academy" },
        { name: t('navigation.marketplace'), shortcut: "M", href: "/marketplace" },
      ],
    },
  ];
};

export function Search() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { createConversation } = useChat();
  const [isCreating, setIsCreating] = useState(false);
  const searchItems = useSearchItems();
  const { t } = useTranslation();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = async (href: string) => {
    // Handle new conversation creation
    if (href === '/request/new') {
      try {
        setIsCreating(true);
        const conversation = await createConversation();
        navigate(`/request/${conversation.id}`);
      } catch (error) {
        console.error('Failed to create conversation:', error);
        toast.error(t('errors.conversationCreation'));
      } finally {
        setIsCreating(false);
      }
    } else {
      navigate(href);
    }
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-[500px] justify-start text-sm text-muted-foreground hover:text-foreground"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="mr-2 h-4 w-4" />
        <span>{t('search.placeholder')}</span>
        <kbd className="pointer-events-none absolute right-2 top-[50%] translate-y-[-50%] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="flex flex-col">
          <div className="border-b px-3 pb-3 pt-4">
            <DialogTitle className="text-lg font-semibold">{t('search.title')}</DialogTitle>
          </div>
          <CommandInput placeholder={t('search.inputPlaceholder')} className="border-0" />
          <CommandList>
            <CommandEmpty>{t('search.noResults')}</CommandEmpty>
            {searchItems.map((group) => (
              <CommandGroup key={group.group} heading={group.group} className="px-2">
                {group.items.map((item) => (
                  <CommandItem
                    key={item.href}
                    onSelect={() => handleSelect(item.href)}
                    className="flex cursor-pointer items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground aria-selected:bg-accent aria-selected:text-accent-foreground"
                  >
                    <span>{item.name}</span>
                    <kbd className="ml-auto pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                      {item.shortcut}
                    </kbd>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </div>
      </CommandDialog>
    </>
  );
}