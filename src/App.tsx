import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { Shell } from "./components/layout/Shell";
import { AuthProvider } from "./components/auth/AuthProvider";
import { ThemeProvider } from "./components/theme-provider";
import { Suspense, useEffect } from "react";
import * as React from "react";
import '@/lib/i18n/config';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Title updater component
function TitleUpdater() {
  const location = useLocation();

  useEffect(() => {
    const getPageTitle = () => {
      const path = location.pathname;
      const titles: Record<string, string> = {
        '/': 'Dashboard',
        '/request': 'Jurata AI',
        '/tasks': 'Aufgaben',
        '/upload': 'Dokumentablage',
        '/legal/analysis': 'Vertragsanalyse',
        '/legal/templates': 'Vertragsvorlagen',
        '/legal/contracts': 'Vertragsverwaltung',
        '/journal': 'Buchungsjournal',
        '/balance': 'Bilanz',
        '/income': 'Erfolgsrechnung',
        '/payroll': 'Lohnbuchhaltung',
        '/reports': 'Berichte',
        '/taxes': 'Steuern',
        '/settings': 'Einstellungen',
        '/academy': 'Academy',
        '/marketplace': 'Marketplace',
        '/account': 'Persönliches Konto',
        '/login': 'Anmelden',
      };

      const title = titles[path] || 'KMU-Cockpit';
      return `Jurata KMU-Cockpit | ${title}`;
    };

    document.title = getPageTitle();
  }, [location]);

  return null;
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="swiss-books-theme">
      <QueryClientProvider client={queryClient}>
        <Router>
          <TitleUpdater />
          <AuthProvider>
            <Shell />
            <Toaster />
            <Suspense>
              <ReactQueryDevtools position="bottom-right" />
            </Suspense>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;