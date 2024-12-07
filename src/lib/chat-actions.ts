import { type LucideIcon } from 'lucide-react';

export interface ActionConfig {
  title: string;
  description: string;
  icon?: LucideIcon;
  cta: {
    label: string;
    action: string;
    external?: string;
  };
}

// URL encode function for legal questions
function encodeLegalQuestion(question: string): string {
  // Remove any existing URL parameters to avoid conflicts
  const cleanQuestion = question.split('?')[0];
  // Encode the question for URL usage
  return encodeURIComponent(cleanQuestion.trim());
}

export const ACTION_CONFIGS: Record<string, ActionConfig> = {
  // Firmengründung
  "Gründungspaket allgemein": {
    title: "Firmengründung",
    description: "Lassen Sie sich bei der Wahl der optimalen Rechtsform und dem Gründungsprozess unterstützen.",
    cta: {
      label: "Mehr erfahren",
      action: "/legal/templates",
      external: "https://www.jurata.ch/de/loesungen/unternehmen-gruenden"
    }
  },
  "Gründungspaket Einzelfirma": {
    title: "Einzelfirma gründen",
    description: "Starten Sie Ihre Einzelfirma mit unserer rechtlichen Unterstützung.",
    cta: {
      label: "Mehr erfahren",
      action: "/legal/templates",
      external: "https://www.jurata.ch/de/loesungen/einzelfirma-gruenden"
    }
  },
  "Gründungspaket GmbH": {
    title: "GmbH gründen",
    description: "Gründen Sie Ihre GmbH mit allen notwendigen Dokumenten und rechtlicher Absicherung.",
    cta: {
      label: "Mehr erfahren",
      action: "/legal/templates",
      external: "https://www.jurata.ch/de/loesungen/gmbh-gruenden"
    }
  },
  "Gründungspaket AG": {
    title: "AG gründen",
    description: "Gründen Sie Ihre Aktiengesellschaft mit professioneller Unterstützung.",
    cta: {
      label: "Mehr erfahren",
      action: "/legal/templates",
      external: "https://www.jurata.ch/de/loesungen/ag-gruenden"
    }
  },
  "Markenservice": {
    title: "Markenschutz",
    description: "Schützen Sie Ihre Marke und geistiges Eigentum effektiv und rechtssicher.",
    cta: {
      label: "Mehr erfahren",
      action: "/legal/templates",
      external: "https://www.jurata.ch/de/loesungen/markenschutz"
    }
  },

  // Recht
  "AI Lawyer": {
    title: "Rechtliche Beratung",
    description: "Erhalten Sie eine erste rechtliche Einschätzung von unserem AI Lawyer.",
    cta: {
      label: "Beratung starten",
      action: "/legal/analysis",
      external: (question: string) => 
        `https://www.jurata.ai/app/question?q=${encodeLegalQuestion(question)}&v=1.2`
    }
  },

  // Buchhaltung & Finanzen
  "Dokumentablage": {
    title: "Belege hochladen",
    description: "Laden Sie Ihre Belege hoch und lassen Sie sie automatisch verarbeiten.",
    cta: {
      label: "Beleg hochladen",
      action: "/upload"
    }
  },
  "Journal": {
    title: "Buchungsjournal",
    description: "Erfassen und verwalten Sie Ihre Buchungen im digitalen Journal.",
    cta: {
      label: "Zum Journal",
      action: "/journal"
    }
  },
  "Bilanz": {
    title: "Bilanz",
    description: "Sehen Sie Ihre aktuelle Bilanz mit allen Aktiven und Passiven ein.",
    cta: {
      label: "Bilanz anzeigen",
      action: "/balance"
    }
  },
  "Erfolgsrechnung": {
    title: "Erfolgsrechnung",
    description: "Analysieren Sie Ihre Erträge und Aufwände in der Erfolgsrechnung.",
    cta: {
      label: "Erfolgsrechnung anzeigen",
      action: "/income"
    }
  },
  "Kontenplan": {
    title: "Kontenplan",
    description: "Verwalten Sie Ihren Kontenplan nach KMU-Standard.",
    cta: {
      label: "Kontenplan verwalten",
      action: "/settings/accounts"
    }
  },
  "Lohnbuchhaltung": {
    title: "Lohnbuchhaltung",
    description: "Verwalten Sie Löhne und Sozialversicherungen digital.",
    cta: {
      label: "Zur Lohnbuchhaltung",
      action: "/payroll"
    }
  },
  "Berichte": {
    title: "Finanzberichte",
    description: "Erstellen und analysieren Sie detaillierte Finanzberichte.",
    cta: {
      label: "Berichte anzeigen",
      action: "/reports"
    }
  },

  // Steuern
  "MWST": {
    title: "Mehrwertsteuer",
    description: "Verwalten Sie Ihre MWST-Abrechnungen und -Deklarationen.",
    cta: {
      label: "MWST verwalten",
      action: "/taxes"
    }
  },
  "Steuern": {
    title: "Steuererklärung",
    description: "Erstellen Sie Ihre Steuererklärung mit unserer Unterstützung.",
    cta: {
      label: "Steuern verwalten",
      action: "/taxes"
    }
  },

  // Aufgaben & Organisation
  "Aufgaben": {
    title: "Aufgabenverwaltung",
    description: "Behalten Sie den Überblick über alle anstehenden Aufgaben.",
    cta: {
      label: "Zu den Aufgaben",
      action: "/tasks"
    }
  },
  "Vertragsanalyse": {
    title: "Vertragsanalyse",
    description: "Lassen Sie Ihre Verträge von unserer KI analysieren.",
    cta: {
      label: "Vertrag analysieren",
      action: "/legal/analysis"
    }
  },
  "Vertragsvorlagen": {
    title: "Vertragsvorlagen",
    description: "Nutzen Sie unsere professionellen Vertragsvorlagen.",
    cta: {
      label: "Vorlagen ansehen",
      action: "/legal/templates"
    }
  },
  "Vertragsverwaltung": {
    title: "Vertragsverwaltung",
    description: "Verwalten Sie alle Ihre Verträge digital und sicher.",
    cta: {
      label: "Verträge verwalten",
      action: "/legal/contracts"
    }
  },

  // Lernen & Support
  "Academy": {
    title: "Jurata Academy",
    description: "Lernen Sie die wichtigsten Aspekte der Unternehmensführung kennen.",
    cta: {
      label: "Zur Academy",
      action: "/academy"
    }
  },
  "Marketplace": {
    title: "Marketplace",
    description: "Entdecken Sie exklusive Angebote unserer Partner.",
    cta: {
      label: "Zum Marketplace",
      action: "/marketplace"
    }
  }
};