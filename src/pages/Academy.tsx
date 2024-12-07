import { Play, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Topic {
  title: string;
  description: string;
  lessons: Array<{
    title: string;
    duration: string;
    isLocked?: boolean;
  }>;
}

const topics: Topic[] = [
  {
    title: "Firmengründung",
    description: "Lernen Sie die wichtigsten Schritte zur Gründung Ihres Unternehmens kennen.",
    lessons: [
      { title: "Rechtsformen im Überblick", duration: "12:30" },
      { title: "Businessplan erstellen", duration: "15:45", isLocked: true },
      { title: "Handelsregister-Eintragung", duration: "08:20", isLocked: true }
    ]
  },
  {
    title: "Verträge",
    description: "Grundlagen des Vertragsrechts und wichtige Vertragsarten für KMU.",
    lessons: [
      { title: "AGB richtig gestalten", duration: "10:15" },
      { title: "Arbeitsverträge", duration: "14:30", isLocked: true },
      { title: "Lizenzverträge", duration: "11:20", isLocked: true }
    ]
  },
  {
    title: "Markenschutz",
    description: "Schützen Sie Ihre Marke und geistiges Eigentum effektiv.",
    lessons: [
      { title: "Markenrecherche", duration: "09:45" },
      { title: "Markenanmeldung", duration: "13:20", isLocked: true },
      { title: "Internationale Registrierung", duration: "16:15", isLocked: true }
    ]
  },
  {
    title: "Datenschutz",
    description: "Datenschutzrichtlinien und deren Umsetzung im Unternehmen.",
    lessons: [
      { title: "DSGVO Grundlagen", duration: "11:30" },
      { title: "Datenschutzerklärung", duration: "08:45", isLocked: true },
      { title: "Mitarbeiterdaten", duration: "12:20", isLocked: true }
    ]
  },
  {
    title: "Buchhaltung",
    description: "Grundlagen der Buchhaltung und wichtige Buchungsfälle.",
    lessons: [
      { title: "Kontenplan KMU", duration: "14:20" },
      { title: "Erfolgsrechnung", duration: "16:30", isLocked: true },
      { title: "Bilanzierung", duration: "13:15", isLocked: true }
    ]
  },
  {
    title: "Steuern",
    description: "Steuerliche Aspekte für Schweizer KMU.",
    lessons: [
      { title: "MWST-Grundlagen", duration: "12:45" },
      { title: "Vorsteuerabzug", duration: "09:30", isLocked: true },
      { title: "Steuererklärung", duration: "15:20", isLocked: true }
    ]
  }
];

export function Academy() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Academy</h3>
        <p className="text-sm text-muted-foreground">
          Lernen Sie die wichtigsten Aspekte der Unternehmensführung kennen
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        {topics.map((topic) => (
          <Card key={topic.title} className="flex flex-col">
            <CardHeader>
              <CardTitle>{topic.title}</CardTitle>
              <CardDescription>{topic.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-4">
                {topic.lessons.map((lesson, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-4 rounded-lg border p-3 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        disabled={lesson.isLocked}
                      >
                        {lesson.isLocked ? (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="space-y-1">
                        <p className="font-medium leading-none">{lesson.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {lesson.duration}
                        </p>
                      </div>
                    </div>
                    {lesson.isLocked && (
                      <Badge variant="secondary" className="shrink-0 text-[10px] px-2 py-0.5">
                        Premium
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}