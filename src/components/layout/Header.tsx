import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { useTheme } from "@/components/theme-provider";
import { Sun, Moon } from "lucide-react";

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex-1" />
        <div className="flex flex-1 items-center justify-center">
          <Button 
            variant="outline" 
            className="relative w-[500px] justify-start text-sm text-muted-foreground"
            onClick={() => document.getElementById('command-dialog')?.click()}
          >
            <Search className="mr-2 h-4 w-4" />
            Schnellsuche
            <kbd className="pointer-events-none absolute right-2 top-[50%] translate-y-[-50%] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="hover:bg-transparent"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}