import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Calculator,
  TrendingUp,
  BarChart3,
  Settings,
  Users,
  ChevronLeft,
  ChevronRight,
  MessageCircleQuestion,
  Sparkles,
  Scale,
  Download,
  Landmark,
  Building2,
  CreditCard,
  GraduationCap,
  ShoppingBag,
  FileText,
  FileSearch,
  FilePlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCompany } from "@/lib/services/company";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from 'react-i18next';

interface NavItem {
  titleKey: string;
  icon: React.ElementType;
  href?: string;
  children?: NavItem[];
  divider?: boolean;
  badge?: React.ReactNode;
}

const navigation: NavItem[] = [
  {
    titleKey: "navigation.dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    titleKey: "navigation.jurataAI",
    icon: Sparkles,
    href: "/request"
  },
  {
    titleKey: "navigation.tasks",
    icon: CheckSquare,
    href: "/tasks"
  },
  {
    titleKey: "navigation.documents",
    icon: Download,
    href: "/upload",
  },
  {
    titleKey: "navigation.legal.title",
    icon: Scale,
    children: [
      {
        titleKey: "navigation.legal.analysis",
        icon: FileSearch,
        href: "/legal/analysis",
      },
      {
        titleKey: "navigation.legal.templates",
        icon: FilePlus,
        href: "/legal/templates",
      },
      {
        titleKey: "navigation.legal.management",
        icon: FileText,
        href: "/legal/contracts",
      },
    ],
    divider: true,
  },
  {
    titleKey: "navigation.accounting.title",
    icon: BookOpen,
    children: [
      {
        titleKey: "navigation.accounting.journal",
        icon: BookOpen,
        href: "/journal",
      },
      {
        titleKey: "navigation.accounting.balance",
        icon: Calculator,
        href: "/balance",
      },
      {
        titleKey: "navigation.accounting.income",
        icon: TrendingUp,
        href: "/income",
      },
      {
        titleKey: "navigation.accounting.payroll",
        icon: Users,
        href: "/payroll",
      },
      {
        titleKey: "navigation.accounting.reports",
        icon: BarChart3,
        href: "/reports",
      },
    ],
  },
  {
    titleKey: "navigation.taxes",
    icon: Landmark,
    href: "/taxes"
  },
  {
    titleKey: "navigation.academy",
    icon: GraduationCap,
    href: "/academy",
    divider: true,
  },
  {
    titleKey: "navigation.marketplace",
    icon: ShoppingBag,
    href: "/marketplace",
  }
];

export function Sidebar() {
  const { pathname } = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const { t } = useTranslation();
  
  const { data: company, isLoading } = useQuery({
    queryKey: ['company'],
    queryFn: getCompany,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Add keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'b' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCollapsed(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const isExpanded = expandedItems.has(item.titleKey);
    const isActive = item.href === pathname;
    const hasChildren = item.children && item.children.length > 0;
    const isChildActive = hasChildren && item.children.some(child => child.href === pathname);

    return (
      <div key={item.titleKey}>
        {item.divider && <div className="my-2 border-t border-border/50" />}
        
        <div
          className={cn(
            "group relative",
            level > 0 && "ml-4"
          )}
        >
          <Link
            to={item.href || "#"}
            onClick={(e) => {
              if (hasChildren) {
                e.preventDefault();
                toggleExpanded(item.titleKey);
              }
            }}
            className={cn(
              "flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium",
              "hover:bg-accent hover:text-accent-foreground",
              (isActive || isChildActive) && "bg-accent text-accent-foreground",
              !item.href && "cursor-pointer",
              isCollapsed && "justify-center px-0"
            )}
          >
            {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
            {!isCollapsed && (
              <>
                <span className="flex-1 flex items-center">
                  {t(item.titleKey)}
                  {item.badge && item.badge}
                </span>
                {hasChildren && (
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform duration-200",
                      isExpanded && "rotate-90"
                    )}
                  />
                )}
              </>
            )}
          </Link>
        </div>

        <AnimatePresence initial={false}>
          {hasChildren && isExpanded && !isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="mt-1 space-y-1">
                {item.children.map(child => renderNavItem(child, level + 1))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.aside
      className={cn(
        "relative border-r bg-background",
        isCollapsed ? "w-[60px]" : "w-[240px]"
      )}
      animate={{ width: isCollapsed ? 60 : 240 }}
      transition={{ duration: 0.2 }}
    >
      <Button
        variant="ghost"
        size="icon"
        className={cn( 
          "absolute -right-3 top-4 z-20 h-6 w-6 rounded-md border bg-background",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:ring-0 focus-visible:ring-offset-0"
        )}
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={`Seitenleiste ${isCollapsed ? 'ausklappen' : 'einklappen'} (⌘B)`}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      <div className="flex flex-col h-full pt-4">
        <ScrollArea className="flex-1 px-4">
          <nav className="grid gap-1">
            {navigation.map(item => renderNavItem(item))}
          </nav>
        </ScrollArea>
        
        <div className="mt-auto p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start gap-2 cursor-pointer focus-visible:ring-0 focus-visible:ring-offset-0",
                  !isCollapsed ? "px-2" : "px-0 justify-center"
                )}
              >
                <Building2 className="h-4 w-4" />
                {!isCollapsed && !isLoading && (
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-muted-foreground">Unternehmen</span>
                    <span className="text-sm font-medium truncate max-w-[160px]">
                      {company?.name || 'Nicht konfiguriert'}
                    </span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Einstellungen
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/billing" className="cursor-pointer">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Abonnement & Rechnung
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.aside>
  );
}